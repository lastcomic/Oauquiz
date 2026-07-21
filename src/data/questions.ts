import type { Question } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// THE PLACEMENT EXAM — 15 QUESTIONS
//
// Edit prompts, choices, and `weights` freely. Weights are added
// to the student's category vector when a choice is selected.
// Category ids: creativity | purpose | adventure | community |
//               income | learning | restoration | practical
//
// Question kinds:
//   "single" — one choice (scored)
//   "multi"  — several choices (scored, each selection adds weights)
//   "scale"  — one choice on a labelled scale (scored)
//   "open"   — free text. CAPTURED but NOT scored in Phase One.
//
// The FIRST question (q01) is the student's name and is required.
// ─────────────────────────────────────────────────────────────

export const NAME_QUESTION_ID = "q01_name";
export const AGE_QUESTION_ID = "q01b_age";

export const QUESTIONS: Question[] = [
  {
    id: NAME_QUESTION_ID,
    kind: "open",
    section: "Enrollment",
    prompt: "Full name, as you'd like it to appear on your student file.",
    help: "Required. Nicknames accepted. Diplomas are non-binding.",
    placeholder: "e.g. Margaret \"Peg\" Ellison",
  },
  {
    id: AGE_QUESTION_ID,
    kind: "open",
    section: "Enrollment",
    prompt: "Age (optional).",
    help: "Not scored, and never required. It only helps your counselor read the file.",
    placeholder: "e.g. 54",
  },
  {
    id: "q02_more",
    kind: "single",
    section: "Intake",
    prompt: "In this next chapter, you'd like noticeably MORE of —",
    choices: [
      { id: "make", label: "Making things with my hands or my imagination", weights: { creativity: 3, practical: 1 } },
      { id: "meaning", label: "Work that clearly matters to someone", weights: { purpose: 3, community: 1 } },
      { id: "motion", label: "New places, new problems, motion", weights: { adventure: 3, learning: 1 } },
      { id: "money", label: "Steadier money and less worry about it", weights: { income: 3, practical: 1 } },
      { id: "quiet", label: "Rest, space, and quiet on my terms", weights: { restoration: 3, purpose: 1 } },
    ],
  },
  {
    id: "q03_less",
    kind: "single",
    section: "Intake",
    prompt: "And you are ready for noticeably LESS of —",
    choices: [
      { id: "hustle", label: "Optimizing, hustling, and proving myself", weights: { restoration: 3, purpose: 1 } },
      { id: "sameness", label: "The same room, the same week, on repeat", weights: { adventure: 3, creativity: 1 } },
      { id: "isolation", label: "Doing everything alone", weights: { community: 3, purpose: 1 } },
      { id: "busywork", label: "Work that produces nothing I can point to", weights: { practical: 2, creativity: 2 } },
      { id: "instability", label: "Financial guesswork", weights: { income: 3, practical: 1 } },
    ],
  },
  {
    id: "q04_curiosity",
    kind: "single",
    section: "Curiosity",
    prompt: "Lately you keep drifting toward —",
    help: "The tab you leave open. The aisle you slow down in.",
    choices: [
      { id: "craft", label: "Workshops, kits, how-things-are-made", weights: { creativity: 2, practical: 2 } },
      { id: "ideas", label: "Long reads, courses, documentaries", weights: { learning: 3, purpose: 1 } },
      { id: "places", label: "Maps, trails, tickets somewhere", weights: { adventure: 3 } },
      { id: "people", label: "Groups, clubs, causes, gatherings", weights: { community: 3 } },
      { id: "systems", label: "Money, tools, fixing what's broken", weights: { practical: 2, income: 2 } },
    ],
  },
  {
    id: "q05_finished",
    kind: "single",
    section: "Curiosity",
    prompt: "One thing you are genuinely FINISHED with —",
    choices: [
      { id: "titles", label: "Chasing titles and other people's scoreboards", weights: { purpose: 2, restoration: 2 } },
      { id: "waiting", label: "Waiting for permission or the 'right time'", weights: { adventure: 2, creativity: 2 } },
      { id: "shrinking", label: "Making myself smaller to fit a room", weights: { creativity: 2, community: 2 } },
      { id: "grinding", label: "Grinding with nothing left over for me", weights: { restoration: 3, purpose: 1 } },
      { id: "guessing", label: "Guessing about money", weights: { income: 3 } },
    ],
  },
  {
    id: "q06_someday",
    kind: "open",
    section: "The Someday File",
    prompt: "The 'someday' you've quietly carried. Name it here.",
    help: "Not scored yet — but your Guidance Counselor reads every one. Optional.",
    placeholder: "e.g. Someday I'd learn to build furniture that outlives me.",
  },
  {
    id: "q07_skills",
    kind: "multi",
    section: "Prior Credits",
    prompt: "Skills you already have (select all that apply) —",
    help: "You are not starting over. This is your transfer credit.",
    maxSelections: 6,
    choices: [
      { id: "build", label: "Building / repairing / making", weights: { practical: 2, creativity: 1 } },
      { id: "teach", label: "Teaching, explaining, mentoring", weights: { community: 2, purpose: 1 } },
      { id: "organize", label: "Organizing people or projects", weights: { practical: 1, community: 1, purpose: 1 } },
      { id: "create", label: "Writing, art, music, design", weights: { creativity: 3 } },
      { id: "money_skill", label: "Numbers, money, operations", weights: { income: 2, practical: 1 } },
      { id: "care", label: "Caring for people, hosting, healing", weights: { community: 2, restoration: 1 } },
      { id: "sell", label: "Selling, persuading, connecting", weights: { income: 2, community: 1 } },
    ],
  },
  {
    id: "q08_time",
    kind: "scale",
    section: "Registrar",
    prompt: "Realistic hours per week you can give this —",
    choices: [
      { id: "t1", label: "An hour here and there", weights: { restoration: 2 } },
      { id: "t2", label: "A few evenings", weights: { learning: 1, creativity: 1 } },
      { id: "t3", label: "Most weekends", weights: { adventure: 1, practical: 1 } },
      { id: "t4", label: "Serious time — this is a priority", weights: { purpose: 2, income: 1 } },
    ],
  },
  {
    id: "q09_budget",
    kind: "scale",
    section: "Registrar",
    prompt: "What you're able to invest to get started —",
    help: "Tuition is metaphorical. Materials are not.",
    choices: [
      { id: "b1", label: "Basically nothing right now", weights: { restoration: 1, community: 1 } },
      { id: "b2", label: "A modest hobby budget", weights: { creativity: 1, learning: 1 } },
      { id: "b3", label: "A real budget for the right thing", weights: { practical: 1, adventure: 1 } },
      { id: "b4", label: "I want this to eventually pay for itself", weights: { income: 3 } },
    ],
  },
  {
    id: "q10_energy",
    kind: "scale",
    section: "Health Services",
    prompt: "Your honest energy these days —",
    choices: [
      { id: "e1", label: "Running low; I need to refill first", weights: { restoration: 3 } },
      { id: "e2", label: "Steady, if I pace myself", weights: { restoration: 1, learning: 1 } },
      { id: "e3", label: "Good — ready to dig in", weights: { purpose: 1, practical: 1 } },
      { id: "e4", label: "Frankly, restless; point me somewhere", weights: { adventure: 2, creativity: 1 } },
    ],
  },
  {
    id: "q11_social",
    kind: "single",
    section: "Student Life",
    prompt: "The social setting that sounds right —",
    choices: [
      { id: "solo", label: "Mostly solo, on my own schedule", weights: { restoration: 2, creativity: 1 } },
      { id: "duo", label: "One or two good collaborators", weights: { creativity: 1, purpose: 1 } },
      { id: "small", label: "A small, regular group", weights: { community: 2, learning: 1 } },
      { id: "crowd", label: "A whole scene — the more the better", weights: { community: 3 } },
    ],
  },
  {
    id: "q12_setting",
    kind: "single",
    section: "Student Life",
    prompt: "Where you'd rather spend the hours —",
    choices: [
      { id: "indoors", label: "Indoors — a bench, a desk, a studio", weights: { creativity: 2, learning: 1 } },
      { id: "outdoors", label: "Outdoors — weather and dirt included", weights: { adventure: 2, restoration: 1 } },
      { id: "mixed", label: "A bit of both, by mood", weights: { adventure: 1, creativity: 1 } },
      { id: "anywhere", label: "Wherever the useful work is", weights: { practical: 2, purpose: 1 } },
    ],
  },
  {
    id: "q13_pull",
    kind: "multi",
    section: "Declaration of Interest",
    prompt: "Which of these does your chest respond to? (choose up to three)",
    help: "First instinct. Don't overthink the registrar's form.",
    maxSelections: 3,
    choices: [
      { id: "p_create", label: "Create", weights: { creativity: 3 } },
      { id: "p_purpose", label: "Matter", weights: { purpose: 3 } },
      { id: "p_adventure", label: "Explore", weights: { adventure: 3 } },
      { id: "p_community", label: "Belong", weights: { community: 3 } },
      { id: "p_income", label: "Earn", weights: { income: 3 } },
      { id: "p_learning", label: "Learn", weights: { learning: 3 } },
      { id: "p_restore", label: "Restore", weights: { restoration: 3 } },
      { id: "p_practical", label: "Be Useful", weights: { practical: 3 } },
    ],
  },
  {
    id: "q14_future",
    kind: "single",
    section: "Declaration of Interest",
    prompt: "The version of you five years out is, above all —",
    choices: [
      { id: "maker", label: "Someone who finally made the thing", weights: { creativity: 3 } },
      { id: "guide", label: "Someone others rely on", weights: { community: 2, purpose: 1 } },
      { id: "explorer", label: "Someone with better stories", weights: { adventure: 3 } },
      { id: "steady", label: "Someone unbothered about money", weights: { income: 3 } },
      { id: "student", label: "Someone who kept learning", weights: { learning: 3 } },
      { id: "whole", label: "Someone rested and whole", weights: { restoration: 3 } },
    ],
  },
  {
    id: "q15_note",
    kind: "open",
    section: "For the Office",
    prompt: "Anything the Office of Guidance should know before placement?",
    help: "Not scored yet. Read by a human. Optional.",
    placeholder: "e.g. I only look intimidating. I'm actually terrified and thrilled.",
  },
];

/** Only the questions that contribute to scoring. */
export const SCORED_QUESTIONS = QUESTIONS.filter((q) => q.kind !== "open");

/** Free-text questions (captured, not scored in Phase One). */
export const OPEN_QUESTIONS = QUESTIONS.filter((q) => q.kind === "open");
