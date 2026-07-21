import type { Category, CategoryId } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// SCORING CATEGORIES
// Edit labels/blurbs freely. Do not rename the `id` fields unless
// you also update every weight reference in questions.ts and the
// signatures in studentTypes.ts / majors / minors / electives.
// ─────────────────────────────────────────────────────────────

export const CATEGORIES: Category[] = [
  {
    id: "creativity",
    label: "Creativity",
    blurb: "Making things. The pull to produce something that did not exist before.",
  },
  {
    id: "purpose",
    label: "Purpose",
    blurb: "Work that means something. A reason that outlasts the paycheck.",
  },
  {
    id: "adventure",
    label: "Adventure",
    blurb: "Novelty, motion, the unfamiliar. Wanting the map to still have edges.",
  },
  {
    id: "community",
    label: "Community",
    blurb: "People, belonging, being counted on. The room, not the spotlight.",
  },
  {
    id: "income",
    label: "Income",
    blurb: "Money that matters. Practical returns, not vibes.",
  },
  {
    id: "learning",
    label: "Learning",
    blurb: "Studying for its own sake. The student who never actually graduated.",
  },
  {
    id: "restoration",
    label: "Restoration",
    blurb: "Rest, repair, and putting yourself back in working order.",
  },
  {
    id: "practical",
    label: "Practical Usefulness",
    blurb: "Being genuinely handy. Skills the neighborhood asks for by name.",
  },
];

export const CATEGORY_IDS: CategoryId[] = CATEGORIES.map((c) => c.id);

export const CATEGORY_BY_ID: Record<CategoryId, Category> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<CategoryId, Category>,
);

/** A zeroed category vector. */
export function emptyScores(): Record<CategoryId, number> {
  return CATEGORY_IDS.reduce(
    (acc, id) => {
      acc[id] = 0;
      return acc;
    },
    {} as Record<CategoryId, number>,
  );
}
