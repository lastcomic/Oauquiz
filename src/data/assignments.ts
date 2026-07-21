import type { Assignment, CategoryId } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// SEVEN-DAY ASSIGNMENTS — approved list, one per category.
// Each must be doable in a week, cost little, take under two hours,
// and give the student a clear way to know they finished.
// Courses reference these by id via `firstAssignment`.
// ─────────────────────────────────────────────────────────────

export const ASSIGNMENTS: Assignment[] = [
  {
    id: "asg_creativity",
    code: "ASG-CR",
    title: "The Standing Appointment",
    category: "creativity",
    days: [
      "Day 1 — Clear one square foot of surface and call it your studio.",
      "Day 2 — Find or buy the single tool you keep meaning to.",
      "Day 3 — Make one small, ugly, finished thing.",
      "Day 4 — Show it to exactly one person.",
      "Day 5 — Make a second thing, slightly less ugly.",
      "Day 6 — Put a repeating weekly making-hour on the calendar.",
      "Day 7 — Rest, and notice you already started.",
    ],
    successMeasure:
      "You have two finished objects and a recurring hour on your calendar.",
  },
  {
    id: "asg_purpose",
    code: "ASG-PU",
    title: "Two Hours That Matter",
    category: "purpose",
    days: [
      "Day 1 — Name one problem in the world that genuinely bothers you.",
      "Day 2 — Find one local group already working on it.",
      "Day 3 — Email them and ask how to help for two hours.",
      "Day 4 — Put the two hours on the calendar.",
      "Day 5 — Show up, or confirm the date.",
      "Day 6 — Write down which part felt like it mattered.",
      "Day 7 — Rest, and let it be enough for now.",
    ],
    successMeasure:
      "You have contacted one group and scheduled (or done) two hours of help.",
  },
  {
    id: "asg_adventure",
    code: "ASG-AD",
    title: "The Deliberate Departure",
    category: "adventure",
    days: [
      "Day 1 — Pick a place within an hour you've never been.",
      "Day 2 — Put the trip on the calendar, out loud.",
      "Day 3 — Prepare exactly one thing for it.",
      "Day 4 — Go. Leave the schedule loose.",
      "Day 5 — Write down the best three minutes.",
      "Day 6 — Choose the next, slightly bigger, place.",
      "Day 7 — Rest, and notice the map got bigger.",
    ],
    successMeasure: "You went somewhere new and chose the next destination.",
  },
  {
    id: "asg_community",
    code: "ASG-CO",
    title: "Set One Table",
    category: "community",
    days: [
      "Day 1 — List five people you'd like to see more of.",
      "Day 2 — Pick a day and a table that seats them.",
      "Day 3 — Invite three of them to something small.",
      "Day 4 — Plan one thing to feed or do together.",
      "Day 5 — Host it, imperfectly.",
      "Day 6 — Ask if they'd do it again. They will.",
      "Day 7 — Rest, and set the next date.",
    ],
    successMeasure: "You hosted (or scheduled) one small gathering.",
  },
  {
    id: "asg_income",
    code: "ASG-IN",
    title: "Your First Paying Customer",
    category: "income",
    days: [
      "Day 1 — Name one skill people already ask you for.",
      "Day 2 — Decide what one hour of it is worth.",
      "Day 3 — Tell three people it's available.",
      "Day 4 — Do it once, for real money.",
      "Day 5 — Write down what you'd change.",
      "Day 6 — Raise the number slightly.",
      "Day 7 — Rest, and count your first customer.",
    ],
    successMeasure: "You have earned money once for a named skill.",
  },
  {
    id: "asg_learning",
    code: "ASG-LE",
    title: "Twenty Honest Minutes",
    category: "learning",
    days: [
      "Day 1 — Choose the subject you were too intimidated to study.",
      "Day 2 — Find one free lesson or one good book.",
      "Day 3 — Spend twenty honest minutes on it.",
      "Day 4 — Take one page of messy notes.",
      "Day 5 — Explain one idea to someone out loud.",
      "Day 6 — Put the same twenty minutes on repeat, weekly.",
      "Day 7 — Rest, and notice you understood something new.",
    ],
    successMeasure:
      "You studied something new and explained one idea to another person.",
  },
  {
    id: "asg_restoration",
    code: "ASG-RE",
    title: "Refill First",
    category: "restoration",
    days: [
      "Day 1 — Go to bed thirty minutes earlier. That's the whole assignment.",
      "Day 2 — Take a walk with no destination.",
      "Day 3 — Say no to one thing you'd normally absorb.",
      "Day 4 — Do something slow with your hands.",
      "Day 5 — Sit outside for ten minutes, doing nothing.",
      "Day 6 — Notice what refilled and what didn't.",
      "Day 7 — Rest — on purpose, without apologizing.",
    ],
    successMeasure:
      "You protected rest on at least five of the seven days.",
  },
  {
    id: "asg_practical",
    code: "ASG-PR",
    title: "Fix One Real Thing",
    category: "practical",
    days: [
      "Day 1 — Pick one small broken thing in your home.",
      "Day 2 — Learn the one skill needed to fix it.",
      "Day 3 — Gather the parts or tools.",
      "Day 4 — Fix it. Badly counts.",
      "Day 5 — Fix a second thing, faster.",
      "Day 6 — Offer the skill to one neighbor.",
      "Day 7 — Rest, and admire something that now works.",
    ],
    successMeasure: "Two things that were broken now work.",
  },
];

export const ASSIGNMENT_BY_ID: Record<string, Assignment> = ASSIGNMENTS.reduce(
  (acc, a) => {
    acc[a.id] = a;
    return acc;
  },
  {} as Record<string, Assignment>,
);

export const ASSIGNMENT_BY_CATEGORY: Record<CategoryId, Assignment> =
  ASSIGNMENTS.reduce(
    (acc, a) => {
      acc[a.category] = a;
      return acc;
    },
    {} as Record<CategoryId, Assignment>,
  );
