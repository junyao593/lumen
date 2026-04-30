"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProfile, type OnboardingState } from "@/lib/storage";

const options: { value: OnboardingState; label: string }[] = [
  { value: "finding-direction", label: "在寻找方向" },
  { value: "processing", label: "在消化某件事" },
  { value: "wanting-change", label: "想要一些不一样的" },
  { value: "getting-better", label: "慢慢变好中" },
];

export default function OnboardingPage() {
  const [selected, setSelected] = useState<OnboardingState | null>(null);
  const router = useRouter();

  function handleStart() {
    if (!selected) return;
    const opt = options.find((o) => o.value === selected)!;
    saveProfile({
      onboardingState: selected,
      onboardingLabel: opt.label,
      createdAt: new Date().toISOString(),
    });
    router.replace("/");
  }

  return (
    <div
      className="flex flex-col justify-between min-h-dvh px-6 py-12"
      style={{ background: "var(--bg)" }}
    >
      {/* Header */}
      <div className="flex flex-col gap-2 mt-8">
        <div
          className="text-3xl font-semibold tracking-tight"
          style={{ color: "var(--accent)" }}
        >
          Lumen
        </div>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          帮助你每天更清楚地看见自己一点
        </p>
      </div>

      {/* Question */}
      <div className="flex flex-col gap-5">
        <h2
          className="text-xl font-medium leading-snug"
          style={{ color: "var(--text)" }}
        >
          你现在更像哪种状态？
        </h2>
        <div className="flex flex-col gap-3">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className="text-left px-5 py-4 rounded-2xl text-base transition-all"
              style={{
                background:
                  selected === opt.value ? "var(--accent-soft)" : "var(--surface)",
                border: `1.5px solid ${
                  selected === opt.value ? "var(--accent)" : "var(--border)"
                }`,
                color: selected === opt.value ? "var(--accent)" : "var(--text)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleStart}
        disabled={!selected}
        className="w-full py-4 rounded-2xl text-base font-medium transition-opacity"
        style={{
          background: "var(--accent)",
          color: "#0f0f0f",
          opacity: selected ? 1 : 0.3,
        }}
      >
        开始
      </button>
    </div>
  );
}
