"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile, getEntries, type UserProfile } from "@/lib/storage";

const STATE_DESCRIPTIONS: Record<string, string> = {
  "finding-direction": "你正处于一个探索阶段，在寻找方向和意义。",
  "processing": "你正在消化某些经历或情绪，给自己时间和空间。",
  "wanting-change": "你感受到了变化的冲动，想要一些不一样的东西。",
  "getting-better": "你正在慢慢变好，一步一步地靠近想成为的自己。",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entryCount, setEntryCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const p = getProfile();
    if (!p) {
      router.replace("/onboarding");
      return;
    }
    setProfile(p);
    setEntryCount(getEntries().length);
  }, [router]);

  function handleReset() {
    if (typeof window === "undefined") return;
    if (confirm("确定要重置吗？所有数据将被清除。")) {
      localStorage.clear();
      router.replace("/onboarding");
    }
  }

  if (!profile) return null;

  const daysSince = Math.floor(
    (Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-8">
      <h1 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
        我
      </h1>

      {/* Identity card */}
      <div className="card px-5 py-5 flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
          Current Self
        </span>
        <p className="text-base font-medium" style={{ color: "var(--text)" }}>
          {profile.onboardingLabel}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {STATE_DESCRIPTIONS[profile.onboardingState]}
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        <div className="card flex-1 px-4 py-4 flex flex-col items-center gap-1">
          <span className="text-2xl font-semibold" style={{ color: "var(--accent)" }}>
            {entryCount}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            次记录
          </span>
        </div>
        <div className="card flex-1 px-4 py-4 flex flex-col items-center gap-1">
          <span className="text-2xl font-semibold" style={{ color: "var(--accent)" }}>
            {daysSince}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            天
          </span>
        </div>
      </div>

      {/* North star */}
      <div className="card px-5 py-4 flex flex-col gap-2">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          North Star
        </span>
        <p className="text-sm" style={{ color: "var(--text)" }}>
          帮助你每天更清楚地看见自己一点。
        </p>
      </div>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="text-xs py-3 rounded-xl text-center"
        style={{ color: "var(--text-muted)", background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        重置所有数据
      </button>
    </div>
  );
}
