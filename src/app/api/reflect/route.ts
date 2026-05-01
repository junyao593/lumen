import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

// Step 1: Generate reflection + themes only
async function generateReflection(input: string, questionText: string | undefined, onboardingLabel: string) {
  const systemPrompt = `你是 Lumen，一个陪伴用户自我发现的 companion。语气：70% 真诚细腻、20% 轻松有点 witty、10% 有洞察。不说教，不分析，不给建议。更像一个聪明温柔的朋友。
用户当前状态：${onboardingLabel}。

根据用户的输入，完成两件事：

1. 提取 1-3 个核心内在主题词（中文，2-4字，触及心理层面，如「责任感」「被看见」「掌控感」）

2. 围绕这些主题写 reflection：
- mirror：直接回应用户的具体内容，让他们感到被精准看见。1-2句，提到他们用的具体词或情境
- meaning：点出一个 surprising 但真实的洞察。1-2句，有点颠覆但不刻意
- expand：一个让用户想继续深挖的问题。1句，用「你」开头

只输出纯 JSON，直接以 { 开头，字符串值内如需引用某词用「」而非""：
{"mirror":"...","meaning":"...","expand":"...","themes":["主题1","主题2"]}`;

  const userMessage = questionText
    ? `今日问题：${questionText}\n\n我的回答/想法：${input}`
    : input;

  const message = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const match = raw.match(/\{[\s\S]*\}/);
  return JSON.parse(match ? match[0] : raw);
}

// Step 2: Find relevant quotes based on themes + input
async function findQuotes(input: string, themes: string[]) {
  const systemPrompt = `你是一个博览群书、熟悉当代文化的内容顾问。你的任务是根据用户说的话和核心主题，召回最贴切的内容片段。

**来源范围（优先近年内容）：**
- 书籍（心理学、哲学、个人成长、文学）
- 近年文章、杂志专栏（2015年后为佳）
- 访谈、演讲、播客中的精彩段落
- 知名人物的社交媒体/公开发言
- 中英文皆可

**召回 5 条内容，要求：**
- 每条核心句必须与用户说的具体词或情境直接呼应
- 来源多样：不要全是同一类型
- type：mirror（温柔共鸣）、stretch（挑战视角）、playful（轻松幽默）—— 分布均衡
- source_type：book / article / interview / speech / other
- book 字段：书名或文章名，无则 null
- connection：1-2句，直接引用用户原话，说明为何今天相关，自然温柔
- url：来源链接（文章给原文链接，访谈给视频或页面链接，书籍给 Goodreads 页面，播客给集数页面）。只在非常确定链接真实有效时填写，不确定则 null

只输出纯 JSON，直接以 { 开头，字符串值内如需引用某词用「」而非""：
{"quotes":[{"text":"...","author":"...","book":"书名/文章名或null","source_type":"book","type":"mirror","connection":"...","url":"https://...或null"},{"text":"...","author":"...","book":null,"source_type":"article","type":"stretch","connection":"...","url":"https://...或null"},{"text":"...","author":"...","book":null,"source_type":"interview","type":"playful","connection":"...","url":"https://...或null"},{"text":"...","author":"...","book":null,"source_type":"book","type":"mirror","connection":"...","url":"https://...或null"},{"text":"...","author":"...","book":null,"source_type":"other","type":"stretch","connection":"...","url":"https://...或null"}]}`;

  const userMessage = `用户说：「${input}」\n核心主题：${themes.join("、")}`;

  const message = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const match = raw.match(/\{[\s\S]*\}/);
  const result = JSON.parse(match ? match[0] : raw);
  return result.quotes ?? [];
}

export async function POST(req: NextRequest) {
  const { input, questionText, onboardingLabel } = await req.json();

  try {
    // Step 1: reflection
    const reflection = await generateReflection(input, questionText, onboardingLabel);

    // Step 2: quotes (uses themes from step 1)
    const selectedQuotes = await findQuotes(input, reflection.themes ?? []);

    return NextResponse.json({ ...reflection, selectedQuotes });
  } catch (e) {
    console.error("reflect error:", e);
    return NextResponse.json({
      mirror: "你说的这些，我都听到了。",
      meaning: "有时候，把它说出来，本身就是一件有意义的事。",
      expand: "如果可以的话，再多告诉我一点？",
      themes: [],
      selectedQuotes: [],
    });
  }
}
