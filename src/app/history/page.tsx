"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEntries, type DailyEntry } from "@/lib/storage";

export default function HistoryPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const router = useRouter();

  useEffect(() => {
    setEntries(getEntries());
  }, []);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-8">
      <h1 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
        历史
      </h1>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16" style={{ color: "var(--text-muted)" }}>
          <p className="text-sm">还没有记录</p>
          <p className="text-xs opacity-60">每天写一点，这里就会慢慢有东西</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => router.push(`/result?id=${entry.id}`)}
              className="card px-4 py-4 flex flex-col gap-2 text-left w-full"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {new Date(entry.date).toLocaleDateString("zh-CN", {
                    month: "long",
                    day: "numeric",
                    weekday: "short",
                  })}
                </span>
                {entry.themes && entry.themes.length > 0 && (
                  <div className="flex gap-1">
                    {entry.themes.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {entry.freeInput && (
                <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--text)" }}>
                  {entry.freeInput}
                </p>
              )}
              {entry.reflection && (
                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-muted)" }}>
                  {entry.reflection.mirror}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
