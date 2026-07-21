import type { Placement, Submission } from "@/lib/types";

/**
 * The placement actually shown to the student — the engine result with any
 * admin overrides merged on top. The engine result itself is never mutated.
 */
export function effectivePlacement(sub: Submission): Placement {
  if (!sub.overrides) return sub.placement;
  return { ...sub.placement, ...sub.overrides };
}

/** True if an admin has changed anything from the engine's original result. */
export function hasOverrides(sub: Submission): boolean {
  return !!sub.overrides && Object.keys(sub.overrides).length > 0;
}
