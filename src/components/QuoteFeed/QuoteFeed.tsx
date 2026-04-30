"use client";
import { useEffect, useRef, useState } from "react";
import allPassages from "@/data/passages.json";

const TYPE_LABEL: Record<string, string> = {
  mirror: "Mirror",
  stretch: "Stretch",
  playful: "Playful",
};
const TYPE_COLOR: Record<string, string> = {
  mirror: "#8bb4a8",
  stretch: "#a08bb4",
  playful: "#b4a08b",
};

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Guarantee at least 1 playful per 4 cards
function buildPage(passages: typeof allPassages, pageIndex: number, count = 4) {
  const seed = pageIndex * 137 + new Date().getDate();
  const shuffled = seededShuffle(passages, seed);
  const serious = shuffled.filter((p) => p.type !== "playful");
  const playful = shuffled.filter((p) => p.type === "playful");

  const result: typeof allPassages = [];
  let si = 0;
  let pi = 0;
  for (let i = 0; i < count; i++) {
    // Insert playful every 3rd card
    if ((i + 1) % 3 === 0 && pi < playful.length) {
      result.push(playful[pi++ % playful.length]);
    } else if (si < serious.length) {
      result.push(serious[si++ % serious.length]);
    } else {
      result.push(playful[pi++ % playful.length]);
    }
  }
  return result;
}

export default function QuoteFeed() {
  const [pages, setPages] = useState<number[]>([0]);
  const [allCards, setAllCards] = useState<typeof allPassages>([]);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAllCards(buildPage(allPassages, 0, 4));
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPages((prev) => {
            const nextPage = prev[prev.length - 1] + 1;
            const newCards = buildPage(allPassages, nextPage, 4);
            setAllCards((c) => [...c, ...newCards]);
            return [...prev, nextPage];
          });
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [allCards]);

  return (
    <div className="flex flex-col gap-3 px-4 pb-8">
      <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
        今日内容
      </span>

      {allCards.map((p, idx) => (
        <div key={`${p.id}-${idx}`} className="card px-5 py-5 flex flex-col gap-3">
          <span
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: TYPE_COLOR[p.type] }}
          >
            {TYPE_LABEL[p.type]}
          </span>

          <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
            &ldquo;{p.text}&rdquo;
          </p>

          <div
            className="flex flex-col gap-0.5 pt-3"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {p.book ? (
              <>
                <span className="text-xs font-medium" style={{ color: "var(--text)" }}>
                  {p.book}
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {p.author}{p.chapter ? ` · ${p.chapter}` : ""}
                </span>
              </>
            ) : (
              <span className="text-xs italic" style={{ color: "var(--text-muted)" }}>
                {p.author}
              </span>
            )}
          </div>
        </div>
      ))}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />
    </div>
  );
}
