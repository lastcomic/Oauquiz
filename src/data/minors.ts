import type { Minor } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// MINORS — the secondary recommendation.
// The scorer picks a minor aligned to the student's SECOND-tier
// categories, distinct from the chosen major. Edit freely.
// ─────────────────────────────────────────────────────────────

export const MINORS: Minor[] = [
  {
    id: "creative_writing",
    name: "Creative Writing & Memoir",
    categories: ["creativity", "purpose"],
    description: "Getting your version on the page while you still have all the details.",
  },
  {
    id: "handcraft",
    name: "Handcraft",
    categories: ["practical", "creativity"],
    description: "Wood, clay, fiber, food — something real at the end of the day.",
  },
  {
    id: "local_history",
    name: "Local Knowledge",
    categories: ["learning", "community"],
    description: "Becoming the person who actually knows your place and its people.",
  },
  {
    id: "outdoor_skills",
    name: "Outdoor Skills",
    categories: ["adventure", "restoration"],
    description: "Trails, water, weather — competence outside the walls.",
  },
  {
    id: "mentoring",
    name: "Mentoring & Teaching",
    categories: ["community", "purpose"],
    description: "Handing down what took you decades to learn.",
  },
  {
    id: "money_craft",
    name: "Money Craft",
    categories: ["income", "practical"],
    description: "The unglamorous mechanics of making a small thing pay.",
  },
  {
    id: "wellbeing",
    name: "Wellbeing & Recovery",
    categories: ["restoration", "learning"],
    description: "Sleep, movement, attention — the maintenance nobody taught you.",
  },
];

export const MINOR_BY_ID: Record<string, Minor> = MINORS.reduce(
  (acc, m) => {
    acc[m.id] = m;
    return acc;
  },
  {} as Record<string, Minor>,
);
