import type { AudioLesson, CategoryId } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// AUDIO LESSONS — approved list. One assigned per placement.
// Courses reference these by id via `relatedAudioLesson`.
// (Audio files are not produced in Phase 2A — these are the
// catalog entries the engine assigns and the letter references.)
// ─────────────────────────────────────────────────────────────

export const AUDIO_LESSONS: AudioLesson[] = [
  {
    id: "aud_making",
    code: "AUD-01",
    title: "Permission to Make Badly",
    minutes: 11,
    category: "creativity",
    description:
      "On starting before you're ready, and why the first ugly thing is the whole point.",
    recommendedStudentTypes: ["dormant_creative", "experienced_explorer"],
  },
  {
    id: "aud_purpose",
    code: "AUD-02",
    title: "Useful Is Not a Consolation Prize",
    minutes: 12,
    category: "purpose",
    description:
      "On work that means something without requiring you to save the world by Friday.",
    recommendedStudentTypes: ["applied_reinvention", "community_builder"],
  },
  {
    id: "aud_adventure",
    code: "AUD-03",
    title: "The Map Still Has Edges",
    minutes: 10,
    category: "adventure",
    description:
      "On novelty with judgment — how to be surprised on purpose at this age.",
    recommendedStudentTypes: ["experienced_explorer"],
  },
  {
    id: "aud_community",
    code: "AUD-04",
    title: "How a Table Sets Itself",
    minutes: 13,
    category: "community",
    description:
      "On building the room where people belong, one small recurring reason at a time.",
    recommendedStudentTypes: ["community_builder"],
  },
  {
    id: "aud_income",
    code: "AUD-05",
    title: "Naming a Number Out Loud",
    minutes: 12,
    category: "income",
    description:
      "On charging for what you already know without apologizing for it.",
    recommendedStudentTypes: ["useful_expert", "applied_reinvention"],
  },
  {
    id: "aud_learning",
    code: "AUD-06",
    title: "The Class You Skipped at Twenty",
    minutes: 11,
    category: "learning",
    description:
      "On studying a subject for its own sake, with no exam at the end.",
    recommendedStudentTypes: ["experienced_explorer", "recovering_optimizer"],
  },
  {
    id: "aud_restoration",
    code: "AUD-07",
    title: "Doing Slightly Less, On Purpose",
    minutes: 14,
    category: "restoration",
    description:
      "On refilling first — and why rest is a prerequisite, not a reward.",
    recommendedStudentTypes: ["recovering_optimizer"],
  },
  {
    id: "aud_practical",
    code: "AUD-08",
    title: "The Drawer That Could Rebuild Civilization",
    minutes: 10,
    category: "practical",
    description:
      "On the quiet pleasure of competence, and putting it to work for your street.",
    recommendedStudentTypes: ["useful_expert"],
  },
];

export const AUDIO_BY_ID: Record<string, AudioLesson> = AUDIO_LESSONS.reduce(
  (acc, a) => {
    acc[a.id] = a;
    return acc;
  },
  {} as Record<string, AudioLesson>,
);

export const AUDIO_BY_CATEGORY: Record<CategoryId, AudioLesson> =
  AUDIO_LESSONS.reduce(
    (acc, a) => {
      acc[a.category] = a;
      return acc;
    },
    {} as Record<CategoryId, AudioLesson>,
  );
