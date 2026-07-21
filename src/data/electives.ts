import type { Elective } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// ELECTIVES — three are recommended on the result page.
// The scorer fills electives across the student's top categories
// for a well-rounded first term. Add as many as you like.
// ─────────────────────────────────────────────────────────────

export const ELECTIVES: Elective[] = [
  // creativity
  { id: "el_sketch", name: "Intro to Making Something Weekly", categories: ["creativity"], description: "One finished small thing every seven days. No masterpieces required." },
  { id: "el_photo", name: "Seeing Again: Photography", categories: ["creativity", "adventure"], description: "Relearning how to look at an ordinary street." },
  // purpose
  { id: "el_volunteer", name: "Purpose Fieldwork", categories: ["purpose", "community"], description: "Two hours a week where your presence is the point." },
  { id: "el_legacy", name: "Legacy & Letters", categories: ["purpose", "creativity"], description: "Writing the things people will be glad you wrote down." },
  // adventure
  { id: "el_daytrip", name: "The Deliberate Day Trip", categories: ["adventure", "restoration"], description: "Structured novelty within a tank of gas." },
  { id: "el_language", name: "A New Language, Slowly", categories: ["adventure", "learning"], description: "Fifteen minutes a day toward a door you can't currently open." },
  // community
  { id: "el_host", name: "The Art of Hosting", categories: ["community"], description: "Setting a table people don't want to leave." },
  { id: "el_club", name: "Start a Small Club", categories: ["community", "purpose"], description: "Five people, one recurring reason to show up." },
  // income
  { id: "el_sidebench", name: "The Right-Sized Side Bench", categories: ["income", "practical"], description: "Turning one skill into its first paying customer." },
  { id: "el_pricing", name: "Pricing Without Apologizing", categories: ["income"], description: "Naming a number and letting it sit there." },
  // learning
  { id: "el_survey", name: "Survey of a Subject You Avoided", categories: ["learning"], description: "The class you were too intimidated to take at twenty." },
  { id: "el_read", name: "The Serious Reading List", categories: ["learning", "restoration"], description: "Twelve books you actually mean to finish." },
  // restoration
  { id: "el_walk", name: "Restorative Walking", categories: ["restoration"], description: "A daily loop with no productivity attached." },
  { id: "el_sleep", name: "Sleep & Attention Repair", categories: ["restoration", "learning"], description: "Reclaiming the two things everything else depends on." },
  // practical
  { id: "el_fix", name: "Fix-It Fundamentals", categories: ["practical"], description: "Home, tools, small engines — competence you can feel." },
  { id: "el_garden", name: "Grow Something You Eat", categories: ["practical", "restoration"], description: "Dirt, patience, and a genuinely useful result." },
];

export const ELECTIVE_BY_ID: Record<string, Elective> = ELECTIVES.reduce(
  (acc, e) => {
    acc[e.id] = e;
    return acc;
  },
  {} as Record<string, Elective>,
);
