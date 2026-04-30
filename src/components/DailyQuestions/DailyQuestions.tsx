"use client";
import { useEffect, useRef, useState } from "react";
import questions from "@/data/questions.json";
import {
  getDailyQuestionIds,
  saveDailyQuestionIds,
  getTodayAnsweredQuestionId,
} from "@/lib/storage";

interface Props {
  onAnswer: (questionId: number, questionText: string) => void;
}

function getRandomIds(count: number): number[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((q) => q.id);
}

export default function DailyQuestions({ onAnswer }: Props) {
  const [ids, setIds] = useState<number[]>([]);
  const [answeredId, setAnsweredId] = useState<number | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let stored = getDailyQuestionIds();
    if (stored.length === 0) {
      stored = getRandomIds(5);
      saveDailyQuestionIds(stored);
    }
    setIds(stored);
    setAnsweredId(getTodayAnsweredQuestionId());
  }, []);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.offsetWidth);
    setActiveIdx(idx);
  }

  function handleSelect(id: number, text: string) {
    if (answeredId !== null) return;
    setAnsweredId(id);
    onAnswer(id, text);
  }

  const questionList = ids.map((id) => questions.find((q) => q.id === id)!).filter(Boolean);
  const isLocked = answeredId !== null;

  return (
    <div className="flex flex-col gap-3 px-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          今日一问
        </span>
        {isLocked && (
          <span className="text-xs" style={{ color: "var(--accent)" }}>
            今日已回答
          </span>
        )}
      </div>

      {/* Scrollable cards */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", paddingBottom: 4 }}
      >
        {questionList.map((q) => {
          const isAnswered = answeredId === q.id;
          const isLockedOut = isLocked && !isAnswered;
          return (
            <div
              key={q.id}
              onClick={() => !isLockedOut && handleSelect(q.id, q.text)}
              className={`swipe-card snap-start ${isAnswered ? "selected" : ""} ${isLockedOut ? "locked" : ""}`}
              style={{ minWidth: "calc(100% - 0px)" }}
            >
              <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                {q.text}
              </p>
              {isAnswered && (
                <p className="text-xs mt-3" style={{ color: "var(--accent)" }}>
                  已选择，今日 reflection 将包含这个问题
                </p>
              )}
              {!isLocked && (
                <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
                  点击选择这个问题
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5">
        {questionList.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === activeIdx ? 16 : 6,
              height: 6,
              borderRadius: 3,
              background: i === activeIdx ? "var(--accent)" : "var(--border)",
              transition: "width 0.2s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
