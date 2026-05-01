export interface ReflectionResult {
  mirror: string;
  meaning: string;
  expand: string;
  themes: string[];
  selectedQuotes?: { text: string; author: string; book?: string | null; type: string; connection: string; url?: string | null }[];
}

export interface ExpandQuote {
  text: string;
  author: string;
  book?: string | null;
  type: string;
  connection: string;
  url?: string | null;
}

export interface ExpandResult {
  message: string;
  quote: ExpandQuote | null;
}

export async function generateReflection(
  input: string,
  questionText: string | undefined,
  onboardingLabel: string
): Promise<ReflectionResult> {
  const response = await fetch("/api/reflect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input, questionText, onboardingLabel }),
  });
  if (!response.ok) throw new Error("Reflection generation failed");
  return response.json();
}

export async function continueExpand(
  messages: { role: "user" | "assistant"; content: string }[],
  originalInput: string
): Promise<ExpandResult> {
  const response = await fetch("/api/expand", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, originalInput }),
  });
  if (!response.ok) throw new Error("Expand generation failed");
  return response.json();
}
