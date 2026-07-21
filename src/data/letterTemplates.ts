import type { CategoryId } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// GUIDANCE COUNSELOR LETTER + MESSAGE TEMPLATES
//
// All copy the Office of Guidance & Placement produces. Tokens
// available in template strings:
//   {name}  {type}  {major}  {minor}
// Edit freely. Keep the voice: calm, observant, lightly funny,
// recognition rather than instruction.
// ─────────────────────────────────────────────────────────────

export const OFFICE_NAME = "Office of Guidance & Placement";
export const UNIVERSITY_NAME = "Old Age University";
export const CORE_LINE =
  "You are not starting over. You are starting from the most informed position of your life.";

/** Short counselor message shown on the RESULT page, keyed by student type id. */
export const COUNSELOR_MESSAGES: Record<string, string> = {
  dormant_creative:
    "{name}, your file suggests a maker who has been productively distracted for about twenty years. We are not concerned. The instinct is intact; it simply needs a standing appointment. Report to the studio.",
  experienced_explorer:
    "{name}, you did not come to us to settle down. Good. Your placement assumes you still have more country to cover — and, for once, the judgment to enjoy the drive.",
  useful_expert:
    "{name}, you are the person other people call when something breaks. We are formalizing what your neighborhood already knew. Being useful is not a hobby; it's a calling with a waitlist.",
  applied_reinvention:
    "{name}, you are changing lanes with your signal on. We admire that. This placement is meaningful and load-bearing — a new direction that will still hold your weight.",
  community_builder:
    "{name}, your talent is the room, not the spotlight. We are placing you at the center of something shared, because a table doesn't set itself and yours is the one people remember.",
  recovering_optimizer:
    "{name}, your transcript shows decades of excellent, exhausting productivity. Your first assignment is to do slightly less, on purpose. We will not be grading you on hustle.",
};

/** Full printable LETTER body, keyed by student type id. Tokens allowed. */
export const LETTER_BODIES: Record<string, string> = {
  dormant_creative:
    "It is the finding of this Office that you have been carrying an unspent creative account for some time, accruing interest but no output. We are pleased to reactivate it. Your major in {major}, supported by a minor in {minor}, is designed to give the instinct somewhere reliable to go.",
  experienced_explorer:
    "This Office has reviewed your intake and concluded, without reservation, that you are not finished being surprised. Your placement in {major}, with a minor in {minor}, treats curiosity as a credential rather than a distraction.",
  useful_expert:
    "The record is clear: you are good at real things, and being useful pleases you. Your major in {major}, with a minor in {minor}, points that competence at the people already looking for it.",
  applied_reinvention:
    "You have declared a change of direction and, notably, done the homework. This Office endorses it. Your major in {major}, anchored by a minor in {minor}, is built to be both meaningful and structurally sound.",
  community_builder:
    "Our assessment finds you are wired for belonging — the gathering, the network, the set table. Your major in {major}, with a minor in {minor}, places you where a community will actually form around you.",
  recovering_optimizer:
    "After a long and distinguished career of optimizing, you have been referred to this Office for recalibration. Your major in {major}, with a minor in {minor}, prioritizes restoration first and meaning second, in that deliberate order.",
};

/**
 * A single humorous-but-kind OBSERVATION, keyed by the student's
 * strongest category. Used in the letter.
 */
export const HUMOROUS_OBSERVATIONS: Record<CategoryId, string> = {
  creativity:
    "The Office notes that you own more unopened supplies than a small craft store, and considers this a sign of intent rather than a problem.",
  purpose:
    "You appear constitutionally unable to enjoy a task that helps no one. We have stopped trying to fix this in students and started scheduling around it.",
  adventure:
    "Your intake form had the faint smell of a full gas tank. We took this as a declaration.",
  community:
    "You are the reason group texts survive. This is a rarer administrative skill than it sounds.",
  income:
    "You used the word 'sustainable' about a hobby, which tells this Office you were always going to charge for it eventually.",
  learning:
    "You have started, and not finished, an impressive number of courses. We prefer to read this as breadth.",
  restoration:
    "You listed 'a nap' among your ambitions with a straight face. The Office respects unusual honesty.",
  practical:
    "Somewhere in your home is a drawer that could rebuild civilization. We would like it added to your transcript.",
};

/**
 * The seven-day FIRST ASSIGNMENT, keyed by the student's strongest
 * category. Each is a 7-item list, one per day.
 */
export const SEVEN_DAY_ASSIGNMENTS: Record<CategoryId, string[]> = {
  creativity: [
    "Day 1 — Clear one square foot of surface and call it your studio.",
    "Day 2 — Buy or find the single tool you keep meaning to.",
    "Day 3 — Make one small, ugly, finished thing.",
    "Day 4 — Show it to exactly one person.",
    "Day 5 — Make a second thing, slightly less ugly.",
    "Day 6 — Schedule a repeating weekly making-hour.",
    "Day 7 — Rest, and notice you already started.",
  ],
  purpose: [
    "Day 1 — Name one problem in the world that genuinely bothers you.",
    "Day 2 — Find one local group already working on it.",
    "Day 3 — Email them and ask how to help for two hours.",
    "Day 4 — Show up, or put it on the calendar.",
    "Day 5 — Notice which part felt like it mattered.",
    "Day 6 — Write down what you'd want more of.",
    "Day 7 — Rest, and let it be enough for now.",
  ],
  adventure: [
    "Day 1 — Pick a place within an hour you've never been.",
    "Day 2 — Put the trip on the calendar, out loud.",
    "Day 3 — Prepare exactly one thing for it.",
    "Day 4 — Go. Leave the schedule loose.",
    "Day 5 — Write down the best three minutes.",
    "Day 6 — Choose the next, slightly bigger, place.",
    "Day 7 — Rest, and notice the map got bigger.",
  ],
  community: [
    "Day 1 — List five people you'd like to see more of.",
    "Day 2 — Pick a day and a table that seats them.",
    "Day 3 — Invite three of them to something small.",
    "Day 4 — Plan one thing to feed or do together.",
    "Day 5 — Host it, imperfectly.",
    "Day 6 — Ask if they'd do it again. They will.",
    "Day 7 — Rest, and set the next date.",
  ],
  income: [
    "Day 1 — Name one skill people already ask you for.",
    "Day 2 — Decide what one hour of it is worth.",
    "Day 3 — Tell three people it's available.",
    "Day 4 — Do it once, for real money.",
    "Day 5 — Write down what you'd change.",
    "Day 6 — Raise the number slightly.",
    "Day 7 — Rest, and count your first customer.",
  ],
  learning: [
    "Day 1 — Choose the subject you were too intimidated to study.",
    "Day 2 — Find one free lesson or one good book.",
    "Day 3 — Spend twenty honest minutes on it.",
    "Day 4 — Take one page of messy notes.",
    "Day 5 — Explain one idea to someone out loud.",
    "Day 6 — Schedule the same twenty minutes weekly.",
    "Day 7 — Rest, and notice you understood something new.",
  ],
  restoration: [
    "Day 1 — Go to bed thirty minutes earlier. That's the whole assignment.",
    "Day 2 — Take a walk with no destination.",
    "Day 3 — Say no to one thing you'd normally absorb.",
    "Day 4 — Do something slow with your hands.",
    "Day 5 — Sit outside for ten minutes, doing nothing.",
    "Day 6 — Notice what refilled and what didn't.",
    "Day 7 — Rest — on purpose, without apologizing.",
  ],
  practical: [
    "Day 1 — Pick one small broken thing in your home.",
    "Day 2 — Learn the one skill needed to fix it.",
    "Day 3 — Gather the parts or tools.",
    "Day 4 — Fix it. Badly counts.",
    "Day 5 — Fix a second thing, faster.",
    "Day 6 — Offer the skill to one neighbor.",
    "Day 7 — Rest, and admire something that now works.",
  ],
};

/** Replace {name} {type} {major} {minor} tokens in a template string. */
export function fillTemplate(
  template: string,
  tokens: { name?: string; type?: string; major?: string; minor?: string },
): string {
  return template
    .replace(/\{name\}/g, tokens.name ?? "Student")
    .replace(/\{type\}/g, tokens.type ?? "")
    .replace(/\{major\}/g, tokens.major ?? "")
    .replace(/\{minor\}/g, tokens.minor ?? "");
}
