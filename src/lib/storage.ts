import type { Submission } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// localStorage persistence. No backend.
//   CURRENT_KEY — the most recent submission (drives /result & /letter)
//   ALL_KEY     — array of every submission (drives /admin)
// ─────────────────────────────────────────────────────────────

const CURRENT_KEY = "oau:current-submission";
const ALL_KEY = "oau:all-submissions";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function saveSubmission(sub: Submission): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(CURRENT_KEY, JSON.stringify(sub));
  const all = getAllSubmissions();
  all.unshift(sub);
  window.localStorage.setItem(ALL_KEY, JSON.stringify(all));
}

export function getCurrentSubmission(): Submission | null {
  if (!isBrowser()) return null;
  return safeParse<Submission | null>(
    window.localStorage.getItem(CURRENT_KEY),
    null,
  );
}

export function getAllSubmissions(): Submission[] {
  if (!isBrowser()) return [];
  return safeParse<Submission[]>(window.localStorage.getItem(ALL_KEY), []);
}

export function clearCurrentSubmission(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(CURRENT_KEY);
}

export function clearAllSubmissions(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ALL_KEY);
  window.localStorage.removeItem(CURRENT_KEY);
}

/** Generate a reasonably unique id without external deps. */
export function makeId(): string {
  const rand = Math.floor(Math.random() * 1e9).toString(36);
  return `sub_${Date.now().toString(36)}_${rand}`;
}
