import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getAnthropicKey } from "@/lib/env";

export async function POST(req: NextRequest) {
  const client = new Anthropic({ apiKey: getAnthropicKey() });
  const { messages, originalInput } = await req.json();

  const systemPrompt = `你是 Lumen，一个陪伴用户自我发现的 companion。语气：真诚细腻、偶尔有点 witty、有洞察但不说教。
用户正在和你进行一段关于自我的对话，最初的话题是：${originalInput}

**回应规则（每次只选一种节奏，不要每次都问问题）：**
- 如果用户说了某件具体的事 → 先反映它，让他们感到被听见，再可以轻轻点出一个角度
- 如果用户只是短短回应（"嗯"、"是的"、"会的"）→ 给一个有点深度的回应或洞察，不要急着追问
- 如果用户在探索某个想法 → 可以追问，但要是真的好奇、有目的的问题，不是为了问而问
- 整体节奏：不要连续两次都以问题结尾

回应长度：2-4句话。

**判断是否召回一条相关内容：**
标准非常严格：只有当你能想到一条书籍/哲学/心理学中的名句或段落，其核心与用户**这条消息里的具体词或情境**高度吻合时，才推荐。
- 「高度吻合」= 能用用户的原话自然引入这条内容
- 用户短短回应（"嗯"/"是的"/"比较确定"）→ 不推荐，quote 设为 null
- 宁可不推荐，也不要推一条牵强的
- 如果推荐：给出原文、作者、书名（无具体书名则 null）、type（mirror/stretch/playful）、connection（1句，引用用户原话）、url（来源链接：文章给原文链接，书籍给 Goodreads 页面，访谈给视频链接；只在非常确定时填写，否则 null）

**只输出纯 JSON，直接以 { 开头。字符串值内部如需引用某个词，用「」而非""：**
有推荐时：{"message":"...","quote":{"text":"...","author":"...","book":"书名或null","type":"mirror","connection":"...","url":"https://...或null"}}
无推荐时：{"message":"...","quote":null}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 700,
    system: systemPrompt,
    messages,
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const text = jsonMatch ? jsonMatch[0] : raw;

  try {
    const result = JSON.parse(text);
    return NextResponse.json({
      message: result.message ?? raw,
      quote: result.quote ?? null,
    });
  } catch {
    return NextResponse.json({ message: raw, quote: null });
  }
}
