import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getAnthropicKey } from "@/lib/env";

const client = new Anthropic({ apiKey: getAnthropicKey() });

export async function POST(req: NextRequest) {
  const { entries } = await req.json();

  if (!entries || entries.length < 2) {
    return NextResponse.json({ patterns: [] });
  }

  // Build a compact summary of each entry for the prompt
  const entrySummaries = entries
    .slice(0, 20) // cap at 20 entries to stay within token limits
    .map((e: { date: string; freeInput?: string; themes?: string[]; reflection?: { mirror?: string; meaning?: string } }, i: number) => {
      const parts = [`[${i + 1}] ${e.date}`];
      if (e.freeInput) parts.push(`用户写道：${e.freeInput}`);
      if (e.themes?.length) parts.push(`提取主题：${e.themes.join("、")}`);
      if (e.reflection?.mirror) parts.push(`Lumen回应：${e.reflection.mirror}`);
      return parts.join("\n");
    })
    .join("\n\n---\n\n");

  const systemPrompt = `你是一个有洞察力的心理观察者，擅长从一个人的日常记录中发现行为和情绪模式。

你会收到用户多条日记记录，需要从中提取 2-4 个真实、有深度的内在模式。

**什么是好的模式：**
- 不是单纯的词语重复，而是一种反复出现的行为倾向、情绪结构或心理动力
- 有具体的证据支撑（可以从记录中找到）
- 有洞察价值——帮用户看见自己平时没意识到的东西
- 例如：「在付出关系中难以设立边界」「用忙碌回避内心的不确定感」「对自我表现有高标准但难以自我认可」

**每个模式包含：**
- name：模式名称，8-16字，动词短语，描述一种倾向，如「在关系中持续付出却难以开口索取」
- frequency：这个模式在几条记录里出现过（数字）
- summary：2-3句，描述这个模式的具体表现，引用用户原话中的具体词
- insight：1-2句，更深的洞察——这个模式背后可能的心理动力或需求，有点颠覆但真实
- evidence：2-3条支撑证据，每条包含 date 和 snippet（用户原话或主题的简短引用，20字以内）
- tracking：一个后续追踪问题，帮用户在接下来几天里留意这个模式，用「你」开头，1句

只输出纯 JSON，直接以 { 开头，字符串值内如需引用某词用「」而非""：
{"patterns":[{"name":"...","frequency":3,"summary":"...","insight":"...","evidence":[{"date":"...","snippet":"..."},{"date":"...","snippet":"..."}],"tracking":"..."}]}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: `以下是用户的 ${entries.length} 条记录：\n\n${entrySummaries}` }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const match = raw.match(/\{[\s\S]*\}/);
    const result = JSON.parse(match ? match[0] : raw);
    return NextResponse.json({ patterns: result.patterns ?? [] });
  } catch (e) {
    console.error("pattern analysis error:", e);
    return NextResponse.json({ patterns: [] });
  }
}
