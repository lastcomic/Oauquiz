import type { StudentType } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// STUDENT TYPES (placeholders — easy to edit)
//
// `signature` is the category profile each type leans toward.
// Scoring matches a student's category vector to the closest
// signature (cosine similarity). Values are relative, 0–3.
// ─────────────────────────────────────────────────────────────

export const STUDENT_TYPES: StudentType[] = [
  {
    id: "dormant_creative",
    name: "Dormant Creative",
    tagline: "The maker who got busy.",
    description:
      "You have an unspent creative account. Somewhere along the way the making got crowded out by the managing. The instinct never left — it just went quiet. Your placement is about turning it back on, at a scale that fits your actual life.",
    signature: { creativity: 3, learning: 1, restoration: 1 },
  },
  {
    id: "experienced_explorer",
    name: "Experienced Explorer",
    tagline: "Still wants the map to have edges.",
    description:
      "You are not done being surprised. You have earned the right to a little more motion, novelty, and unfamiliar ground — this time with the judgment to enjoy it. Your placement points you outward, on purpose.",
    signature: { adventure: 3, learning: 1, creativity: 1 },
  },
  {
    id: "useful_expert",
    name: "Useful Expert",
    tagline: "The one the neighborhood asks for by name.",
    description:
      "You are genuinely good at real things, and being useful is not a consolation prize to you — it's a pleasure. Your placement sharpens what you already do well and points it at people who need it.",
    signature: { practical: 3, income: 1, community: 1 },
  },
  {
    id: "applied_reinvention",
    name: "Applied Reinvention Student",
    tagline: "Rebuilding on a very good foundation.",
    description:
      "You are changing direction, but you are not naive about it. You want the new chapter to be meaningful and to hold up practically. Your placement blends purpose with a plan you can actually execute.",
    signature: { purpose: 3, practical: 1, learning: 1, income: 1 },
  },
  {
    id: "community_builder",
    name: "Community Builder",
    tagline: "The room, not the spotlight.",
    description:
      "You are wired for people and belonging. What lights you up is a group that works, a table that's set, a network that holds. Your placement puts you at the center of something shared.",
    signature: { community: 3, purpose: 1, restoration: 1 },
  },
  {
    id: "recovering_optimizer",
    name: "Recovering Optimizer",
    tagline: "Finished proving. Ready to live.",
    description:
      "You spent a long time being efficient, productive, and slightly exhausted. You're not lazy — you're recalibrating. Your placement is about restoration first, then meaning that doesn't cost you everything.",
    signature: { restoration: 3, purpose: 1, learning: 1 },
  },
];

export const STUDENT_TYPE_BY_ID: Record<string, StudentType> =
  STUDENT_TYPES.reduce(
    (acc, t) => {
      acc[t.id] = t;
      return acc;
    },
    {} as Record<string, StudentType>,
  );
