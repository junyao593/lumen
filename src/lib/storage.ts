export type OnboardingState = "finding-direction" | "processing" | "wanting-change" | "getting-better";

export interface DailyEntry {
  id: string;
  date: string;
  freeInput?: string;
  questionId?: number;
  questionText?: string;
  questionAnswer?: string;
  reflection?: {
    mirror: string;
    meaning: string;
    expand: string;
  };
  themes?: string[];
  selectedQuotes?: { text: string; author: string; book?: string | null; type: string; connection: string; url?: string | null }[];
  expandMessages?: { role: "user" | "assistant"; content: string; quote?: unknown }[];
}

export interface UserProfile {
  onboardingState: OnboardingState;
  onboardingLabel: string;
  createdAt: string;
}

export interface PatternTheme {
  name: string;
  count: number;
  lastSeen: string;
  entryIds: string[];
}

export interface PatternAnalysis {
  name: string;
  frequency: number;
  summary: string;
  insight: string;
  evidence: { date: string; snippet: string }[];
  tracking: string;
}

export interface PatternAnalysisCache {
  entryCount: number;
  generatedAt: string;
  patterns: PatternAnalysis[];
}

const KEYS = {
  profile: "lumen_profile",
  entries: "lumen_entries",
  themes: "lumen_themes",
  dailyQuestions: "lumen_daily_questions",
  patternAnalysis: "lumen_pattern_analysis",
};

export function getProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEYS.profile);
  return raw ? JSON.parse(raw) : null;
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(KEYS.profile, JSON.stringify(profile));
}

export function getEntries(): DailyEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEYS.entries);
  return raw ? JSON.parse(raw) : [];
}

export function saveEntry(entry: DailyEntry): void {
  const entries = getEntries();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.unshift(entry);
  }
  localStorage.setItem(KEYS.entries, JSON.stringify(entries));
}

export function getTodayEntry(): DailyEntry | null {
  const today = new Date().toISOString().split("T")[0];
  return getEntries().find((e) => e.date === today) ?? null;
}

export function getThemes(): PatternTheme[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEYS.themes);
  return raw ? JSON.parse(raw) : [];
}

export function upsertTheme(name: string, entryId: string): void {
  const themes = getThemes();
  const today = new Date().toISOString().split("T")[0];
  const existing = themes.find((t) => t.name === name);
  if (existing) {
    existing.count += 1;
    existing.lastSeen = today;
    if (!existing.entryIds.includes(entryId)) existing.entryIds.push(entryId);
  } else {
    themes.push({ name, count: 1, lastSeen: today, entryIds: [entryId] });
  }
  localStorage.setItem(KEYS.themes, JSON.stringify(themes));
}

export function getDailyQuestionIds(): number[] {
  if (typeof window === "undefined") return [];
  const today = new Date().toISOString().split("T")[0];
  const raw = localStorage.getItem(KEYS.dailyQuestions);
  if (!raw) return [];
  const data = JSON.parse(raw);
  return data.date === today ? data.ids : [];
}

export function saveDailyQuestionIds(ids: number[]): void {
  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem(KEYS.dailyQuestions, JSON.stringify({ date: today, ids }));
}

export function getTodayAnsweredQuestionId(): number | null {
  const today = new Date().toISOString().split("T")[0];
  const entry = getEntries().find((e) => e.date === today);
  return entry?.questionId ?? null;
}

export function getPatternAnalysisCache(): PatternAnalysisCache | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEYS.patternAnalysis);
  return raw ? JSON.parse(raw) : null;
}

export function savePatternAnalysisCache(cache: PatternAnalysisCache): void {
  localStorage.setItem(KEYS.patternAnalysis, JSON.stringify(cache));
}
