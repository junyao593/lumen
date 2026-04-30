"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getEntries,
  getPatternAnalysisCache,
  savePatternAnalysisCache,
  type PatternAnalysis,
} from "@/lib/storage";

function PatternCard({ p, index }: { p: PatternAnalysis; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <div className="card flex flex-col overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-start justify-between gap-3 px-5 py-4 w-full text-left"
      >
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="text-sm font-semibold leading-snug" style={{ color: "var(--text)" }}>
            {p.name}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            出现在 {p.frequency} 条记录中
          </span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0 mt-0.5 transition-transform"
          style={{
            color: "var(--text-muted)",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="flex flex-col gap-4 px-5 pb-5" style={{ borderTop: "1px solid var(--border)" }}>
          {/* Summary + insight */}
          <div className="flex flex-col gap-2 pt-4">
            <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
              {p.summary}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {p.insight}
            </p>
          </div>

          {/* Evidence */}
          {p.evidence?.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                来源记录
              </span>
              <div className="flex flex-col gap-1.5">
                {p.evidence.map((ev, i) => (
                  <div
                    key={i}
                    className="flex gap-2.5 items-start px-3 py-2.5 rounded-xl text-xs leading-relaxed"
                    style={{ background: "var(--surface2)" }}
                  >
                    <span className="flex-shrink-0 mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {new Date(ev.date).toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}
                    </span>
                    <span style={{ color: "var(--text)" }}>「{ev.snippet}」</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tracking question */}
          {p.tracking && (
            <div
              className="flex gap-2.5 items-start rounded-xl px-4 py-3 text-sm leading-relaxed"
              style={{ background: "var(--accent-soft)" }}
            >
              <span style={{ color: "var(--accent)" }}>🔍</span>
              <p style={{ color: "var(--accent)" }}>{p.tracking}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PatternPage() {
  const [patterns, setPatterns] = useState<PatternAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [entryCount, setEntryCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const entries = getEntries();
    setEntryCount(entries.length);
    if (entries.length < 2) return;

    // Check cache — only regenerate if entry count changed
    const cache = getPatternAnalysisCache();
    if (cache && cache.entryCount === entries.length && cache.patterns.length > 0) {
      setPatterns(cache.patterns);
      return;
    }

    // Generate new analysis
    setLoading(true);
    const payload = entries.map((e) => ({
      date: e.date,
      freeInput: e.freeInput,
      themes: e.themes,
      reflection: e.reflection
        ? { mirror: e.reflection.mirror, meaning: e.reflection.meaning }
        : undefined,
    }));

    fetch("/api/pattern", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries: payload }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.patterns?.length > 0) {
          setPatterns(data.patterns);
          savePatternAnalysisCache({
            entryCount: entries.length,
            generatedAt: new Date().toISOString(),
            patterns: data.patterns,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleRefresh() {
    const entries = getEntries();
    if (entries.length < 2) return;
    setLoading(true);
    setPatterns([]);

    const payload = entries.map((e) => ({
      date: e.date,
      freeInput: e.freeInput,
      themes: e.themes,
      reflection: e.reflection
        ? { mirror: e.reflection.mirror, meaning: e.reflection.meaning }
        : undefined,
    }));

    fetch("/api/pattern", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries: payload }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.patterns?.length > 0) {
          setPatterns(data.patterns);
          savePatternAnalysisCache({
            entryCount: entries.length,
            generatedAt: new Date().toISOString(),
            patterns: data.patterns,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
            脉络
          </h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            从你的记录中浮现的内在模式
          </p>
        </div>
        {patterns.length > 0 && !loading && (
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
            style={{ background: "var(--surface2)", color: "var(--text-muted)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            重新分析
          </button>
        )}
      </div>

      {/* Empty state — not enough entries */}
      {entryCount < 2 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="text-3xl">🌱</div>
          <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
            还需要更多记录
          </p>
          <p className="text-xs leading-relaxed max-w-[220px]" style={{ color: "var(--text-muted)" }}>
            写满 2 天后，Lumen 就能开始发现你的模式
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-2 text-xs px-4 py-2 rounded-full"
            style={{ background: "var(--accent)", color: "#0f0f0f" }}
          >
            去写今天
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="flex gap-1.5 items-center">
            {[0, 150, 300].map((d) => (
              <span
                key={d}
                style={{
                  display: "inline-block",
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  animation: "bounce 0.9s infinite",
                  animationDelay: `${d}ms`,
                }}
              />
            ))}
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            正在分析你的 {entryCount} 条记录…
          </p>
        </div>
      )}

      {/* Pattern cards */}
      {!loading && patterns.length > 0 && (
        <div className="flex flex-col gap-3">
          {patterns.map((p, i) => (
            <PatternCard key={i} p={p} index={i} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
