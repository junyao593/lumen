"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getProfile, saveEntry, upsertTheme, type DailyEntry } from "@/lib/storage";
import { generateReflection } from "@/lib/claude";
import CatCompanion from "@/components/Cat/CatCompanion";
import DailyQuestions from "@/components/DailyQuestions/DailyQuestions";
import QuoteFeed from "@/components/QuoteFeed/QuoteFeed";

const GREETINGS = [
  "Hey～今天有什么想说的吗？",
  "今天怎么样？有什么碎片想留下来？",
  "在想什么？随便说说也行。",
  "今天的你，是什么感觉？",
];

function WeekStrip() {
  const today = new Date();
  const days = ["日", "一", "二", "三", "四", "五", "六"];
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    return d;
  });
  return (
    <div className="flex justify-center gap-2 px-4 pt-4 pb-2">
      {week.map((d, i) => {
        const isToday = d.toDateString() === today.toDateString();
        return (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {days[d.getDay()]}
            </span>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
              style={{
                background: isToday ? "var(--accent)" : "transparent",
                color: isToday ? "#0f0f0f" : "var(--text-muted)",
              }}
            >
              {d.getDate()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [greeting, setGreeting] = useState(GREETINGS[0]);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<{ id: number; text: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const profile = getProfile();
    if (!profile) {
      router.replace("/onboarding");
      return;
    }
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
    setReady(true);
  }, [router]);

  function handleQuestionSelect(id: number, text: string) {
    setPendingQuestion({ id, text });
    textareaRef.current?.focus();
  }

  async function handleSubmit() {
    if (!input.trim() || submitting) return;
    setSubmitting(true);

    const profile = getProfile()!;
    const today = new Date().toISOString().split("T")[0];
    const entryId = `entry_${Date.now()}`;

    const entry: DailyEntry = {
      id: entryId,
      date: today,
      freeInput: input.trim(),
      questionId: pendingQuestion?.id,
      questionText: pendingQuestion?.text,
    };
    saveEntry(entry);

    try {
      const result = await generateReflection(
        input.trim(),
        pendingQuestion?.text,
        profile.onboardingLabel
      );
      entry.reflection = {
        mirror: result.mirror,
        meaning: result.meaning,
        expand: result.expand,
      };
      entry.themes = result.themes;
      entry.selectedQuotes = result.selectedQuotes;
      saveEntry(entry);
      result.themes?.forEach((t: string) => upsertTheme(t, entryId));
    } catch {
      entry.reflection = {
        mirror: "你说的这些，我都听到了。",
        meaning: "有时候，把它说出来，本身就是一件有意义的事。",
        expand: "如果可以的话，再多告诉我一点？",
      };
      saveEntry(entry);
    }

    router.push(`/result?id=${entryId}`);
  }

  if (!ready) return null;

  return (
    <div className="flex flex-col gap-4 pb-4">
      <WeekStrip />
      <CatCompanion message={greeting} thinking={submitting} />

      {/* Input area */}
      <div className="px-4">
        <div className="card px-4 py-3 flex flex-col gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="随便说说…"
            rows={3}
            className="w-full bg-transparent text-sm resize-none outline-none leading-relaxed placeholder:opacity-40"
            style={{ color: "var(--text)" }}
          />
          {pendingQuestion && (
            <div
              className="text-xs px-3 py-2 rounded-xl"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              关联问题：{pendingQuestion.text.slice(0, 30)}…
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "var(--surface2)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.8">
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10a7 7 0 0014 0M12 19v3M8 22h8" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || submitting}
              className="px-5 py-2 rounded-xl text-sm font-medium transition-opacity"
              style={{
                background: "var(--accent)",
                color: "#0f0f0f",
                opacity: input.trim() && !submitting ? 1 : 0.3,
              }}
            >
              {submitting ? "生成中…" : "发送"}
            </button>
          </div>
        </div>
      </div>

      <DailyQuestions onAnswer={handleQuestionSelect} />

      <div className="h-px mx-4" style={{ background: "var(--border)" }} />

      <QuoteFeed />
    </div>
  );
}
