"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getEntries, saveEntry, type DailyEntry } from "@/lib/storage";
import { continueExpand, type ExpandQuote } from "@/lib/claude";

const TYPE_COLOR: Record<string, string> = {
  mirror: "#8bb4a8",
  stretch: "#a08bb4",
  playful: "#b4a08b",
};
const TYPE_LABEL: Record<string, string> = {
  mirror: "Mirror",
  stretch: "Stretch",
  playful: "Playful",
};

type DynamicQuote = {
  text: string;
  author: string;
  book?: string | null;
  type: string;
  connection: string;
  url?: string | null;
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  quote?: ExpandQuote | null;
}

function QuoteCard({ q }: { q: DynamicQuote }) {
  return (
    <div className="card px-5 py-5 flex flex-col gap-3">
      <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: TYPE_COLOR[q.type] ?? "#8bb4a8" }}>
        {TYPE_LABEL[q.type] ?? q.type}
      </span>
      <p className="text-base leading-relaxed font-medium" style={{ color: "var(--text)" }}>
        &ldquo;{q.text}&rdquo;
      </p>
      <div className="flex items-start justify-between gap-2" style={{ borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
        <div className="flex flex-col gap-0.5">
          {q.book ? (
            <>
              <span className="text-xs font-medium" style={{ color: "var(--text)" }}>{q.book}</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{q.author}</span>
            </>
          ) : (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>— {q.author}</span>
          )}
        </div>
        {q.url && (
          <a href={q.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-opacity hover:opacity-70" style={{ background: "var(--surface2)", color: "var(--text-muted)" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
            </svg>
            原文
          </a>
        )}
      </div>
      {q.connection && (
        <div className="flex gap-2 items-start rounded-xl px-3 py-3 text-xs leading-relaxed" style={{ background: "var(--accent-soft)" }}>
          <span style={{ color: "var(--accent)" }}>💡</span>
          <p style={{ color: "var(--accent)" }}>{q.connection}</p>
        </div>
      )}
    </div>
  );
}

function ChatQuoteCard({ q }: { q: DynamicQuote }) {
  return (
    <div className="card px-4 py-4 flex flex-col gap-2" style={{ maxWidth: "85%" }}>
      <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: TYPE_COLOR[q.type] ?? "#8bb4a8" }}>
        {TYPE_LABEL[q.type] ?? q.type}
      </span>
      <p className="text-sm leading-relaxed font-medium" style={{ color: "var(--text)" }}>
        &ldquo;{q.text}&rdquo;
      </p>
      <div className="flex items-center justify-between gap-2" style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
        <div>
          {q.book ? (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{q.book} · {q.author}</span>
          ) : (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>— {q.author}</span>
          )}
        </div>
        {q.url && (
          <a href={q.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-opacity hover:opacity-70" style={{ background: "var(--surface2)", color: "var(--text-muted)" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
            </svg>
            原文
          </a>
        )}
      </div>
      {q.connection && (
        <div className="flex gap-2 items-start rounded-xl px-3 py-2 text-xs leading-relaxed" style={{ background: "var(--accent-soft)" }}>
          <span style={{ color: "var(--accent)" }}>💡</span>
          <p style={{ color: "var(--accent)" }}>{q.connection}</p>
        </div>
      )}
    </div>
  );
}

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [expandInput, setExpandInput] = useState("");
  const [expandLoading, setExpandLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const found = getEntries().find((e) => e.id === id);
    if (!found) return;
    setEntry(found);

    if (found.expandMessages) {
      setChatMessages(found.expandMessages as ChatMessage[]);
    } else if (found.reflection?.expand) {
      setChatMessages([{ role: "assistant", content: found.reflection.expand }]);
    }
  }, [id]);

  async function handleExpandSend() {
    if (!expandInput.trim() || expandLoading || !entry) return;
    const userMsg: ChatMessage = { role: "user", content: expandInput.trim() };
    const newChat = [...chatMessages, userMsg];
    setChatMessages(newChat);
    setExpandInput("");
    setExpandLoading(true);

    const apiMessages = newChat.map((m) => ({ role: m.role, content: m.content }));

    try {
      const result = await continueExpand(apiMessages, entry.freeInput ?? "");
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: result.message,
        quote: result.quote ?? null,
      };
      const finalChat = [...newChat, assistantMsg];
      setChatMessages(finalChat);
      const updated = { ...entry, expandMessages: finalChat };
      saveEntry(updated);
      setEntry(updated);
    } catch {
      const errMsg: ChatMessage = { role: "assistant", content: "嗯，我还在想……你刚才说的这些，让我有点沉默。" };
      setChatMessages([...newChat, errMsg]);
    } finally {
      setExpandLoading(false);
    }
  }

  if (!entry) return null;

  const reflection = entry.reflection;
  const selectedQuotes = (entry.selectedQuotes ?? []) as DynamicQuote[];

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 flex-shrink-0">
        <button onClick={() => router.push("/")} style={{ color: "var(--text-muted)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {new Date(entry.date).toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}
        </span>
      </div>

      <div className="flex flex-col gap-5 px-4 pb-8">
        {/* Reflection card */}
        {reflection && (
          <div className="card px-5 py-5 flex flex-col gap-4">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--accent)" }}>
              Today&apos;s reflection
            </span>
            <div className="text-xs px-3 py-2 rounded-xl italic" style={{ background: "var(--surface2)", color: "var(--text-muted)" }}>
              {entry.freeInput}
              {entry.questionText && (
                <div className="mt-1 opacity-60 not-italic">问：{entry.questionText.slice(0, 40)}…</div>
              )}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{reflection.mirror}</p>
            {reflection.meaning && (
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{reflection.meaning}</p>
            )}
            {entry.themes && entry.themes.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {entry.themes.map((t) => (
                  <span key={t} className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dynamic quote cards */}
        {selectedQuotes.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>你可能会感兴趣</span>
            {selectedQuotes.map((q, i) => (
              <QuoteCard key={i} q={q} />
            ))}
          </div>
        )}

        {/* Expand chat */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>继续聊聊</span>
          <div className="flex flex-col gap-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`flex gap-2 w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                      L
                    </div>
                  )}
                  <div
                    className="max-w-[80%] px-4 py-3 text-sm leading-relaxed"
                    style={{
                      background: msg.role === "user" ? "var(--accent)" : "var(--surface)",
                      color: msg.role === "user" ? "#0f0f0f" : "var(--text)",
                      borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                      border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
                {msg.role === "assistant" && msg.quote && (
                  <div className="pl-9">
                    <ChatQuoteCard q={msg.quote as DynamicQuote} />
                  </div>
                )}
              </div>
            ))}
            {expandLoading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>L</div>
                <div className="px-4 py-3 card">
                  <span className="flex gap-1 items-center h-5">
                    {[0, 150, 300].map((d) => (
                      <span key={d} style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--text-muted)", animation: "bounce 0.9s infinite", animationDelay: `${d}ms` }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="card px-4 py-3 flex gap-3 items-end">
            <textarea
              value={expandInput}
              onChange={(e) => setExpandInput(e.target.value)}
              placeholder="继续说点什么…"
              rows={2}
              className="flex-1 bg-transparent text-sm resize-none outline-none leading-relaxed placeholder:opacity-40"
              style={{ color: "var(--text)" }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleExpandSend();
                }
              }}
            />
            <button
              onClick={handleExpandSend}
              disabled={!expandInput.trim() || expandLoading}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity"
              style={{ background: "var(--accent)", opacity: expandInput.trim() && !expandLoading ? 1 : 0.3 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f0f0f" strokeWidth="2.5">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense>
      <ResultContent />
    </Suspense>
  );
}
