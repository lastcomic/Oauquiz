import type {
  AnswerMap,
  CategoryId,
  CategoryScores,
  Course,
  Placement,
  PlacementRationale,
  TimeLevel,
  CostLevel,
  EnergyLevel,
  SocialLevel,
  Setting,
} from "@/lib/types";
import { CATEGORY_IDS, emptyScores, CATEGORY_BY_ID } from "@/data/categories";
import { QUESTIONS, NAME_QUESTION_ID, AGE_QUESTION_ID } from "@/data/questions";
import { STUDENT_TYPES, STUDENT_TYPE_BY_ID } from "@/data/studentTypes";
import { MAJORS, MAJOR_BY_ID } from "@/data/majors";
import { MINORS } from "@/data/minors";
import {
  REQUIRED_COURSES,
  ELECTIVE_COURSES,
  courseCategoryVector,
  COURSE_BY_ID,
} from "@/data/courses";
import { AUDIO_BY_ID, AUDIO_BY_CATEGORY } from "@/data/audioLessons";
import { ASSIGNMENT_BY_ID, ASSIGNMENT_BY_CATEGORY } from "@/data/assignments";

// ─────────────────────────────────────────────────────────────
// RULE-BASED RECOMMENDATION ENGINE (deterministic; no AI).
//
//   1. Sum answer weights into a category vector.
//   2. Match vector to the closest student-type signature.
//   3. Derive major / minor from the ranked categories.
//   4. Select ONE required Freshman course + THREE electives from
//      the catalog using category fit AND practical constraints
//      (time, budget, energy, social, indoor/outdoor, student-type
//      fit). Electives are balanced: strongest desire · existing
//      skill · manageable novelty.
//   5. Assign the required course's linked audio lesson + 7-day
//      assignment.
//
// Open-response answers (name, age, "someday", note) are captured
// but NOT scored. The AI only explains these selections; it never
// changes them.
// ─────────────────────────────────────────────────────────────

const Q_SKILLS = "q07_skills";
const Q_TIME = "q08_time";
const Q_BUDGET = "q09_budget";
const Q_ENERGY = "q10_energy";
const Q_SOCIAL = "q11_social";
const Q_SETTING = "q12_setting";

export function computeScores(answers: AnswerMap): CategoryScores {
  const scores = emptyScores();
  for (const q of QUESTIONS) {
    if (q.kind === "open" || !q.choices) continue;
    const raw = answers[q.id];
    if (!raw) continue;
    const ids = Array.isArray(raw) ? raw : [raw];
    for (const cid of ids) {
      const choice = q.choices.find((c) => c.id === cid);
      if (!choice?.weights) continue;
      for (const k of CATEGORY_IDS) {
        const w = choice.weights[k];
        if (w) scores[k] += w;
      }
    }
  }
  return scores;
}

function magnitude(v: Partial<CategoryScores>): number {
  let sum = 0;
  for (const id of CATEGORY_IDS) sum += (v[id] ?? 0) ** 2;
  return Math.sqrt(sum);
}
function cosine(a: Partial<CategoryScores>, b: Partial<CategoryScores>): number {
  let dot = 0;
  for (const id of CATEGORY_IDS) dot += (a[id] ?? 0) * (b[id] ?? 0);
  const d = magnitude(a) * magnitude(b);
  return d === 0 ? 0 : dot / d;
}

export function rankCategories(scores: CategoryScores): CategoryId[] {
  return [...CATEGORY_IDS].sort((a, b) => {
    const diff = scores[b] - scores[a];
    if (diff !== 0) return diff;
    return CATEGORY_IDS.indexOf(a) - CATEGORY_IDS.indexOf(b);
  });
}

export function pickStudentType(scores: CategoryScores): string {
  let bestId = STUDENT_TYPES[0].id;
  let best = -Infinity;
  for (const t of STUDENT_TYPES) {
    const sim = cosine(scores, t.signature);
    if (sim > best) {
      best = sim;
      bestId = t.id;
    }
  }
  return bestId;
}

function categoryFit(ranked: CategoryId[], categories: CategoryId[]): number {
  let score = 0;
  categories.forEach((cat, idx) => {
    const rp = ranked.indexOf(cat);
    if (rp === -1) return;
    score += (ranked.length - rp) * (categories.length - idx);
  });
  return score;
}

export function pickMajor(ranked: CategoryId[], studentTypeId: string): string {
  const affinity = STUDENT_TYPE_BY_ID[studentTypeId]?.affinityMajors ?? [];
  let bestId = MAJORS[0].id;
  let best = -Infinity;
  MAJORS.forEach((m, idx) => {
    let s = categoryFit(ranked, m.categories) - idx * 0.001;
    if (affinity.includes(m.id)) s += 1.5; // gentle nudge, not a veto
    if (s > best) {
      best = s;
      bestId = m.id;
    }
  });
  return bestId;
}

export function pickMinor(ranked: CategoryId[], majorId: string): string {
  const majorLead = MAJOR_BY_ID[majorId]?.categories[0];
  let bestId = MINORS[0].id;
  let best = -Infinity;
  MINORS.forEach((m, idx) => {
    let s = categoryFit(ranked, m.categories) - idx * 0.001;
    if (m.categories[0] === majorLead) s -= 100; // don't echo the major
    if (s > best) {
      best = s;
      bestId = m.id;
    }
  });
  return bestId;
}

// ── Practical constraints extracted from the student's answers ──

interface Constraints {
  time: TimeLevel;
  cost: CostLevel;
  energy: EnergyLevel;
  social: SocialLevel;
  setting: Setting;
  skillCategories: Set<CategoryId>;
}

const SCALE_INDEX: Record<string, number> = {
  t1: 0, t2: 1, t3: 2, t4: 3,
  b1: 0, b2: 1, b3: 2, b4: 3,
  e1: 0, e2: 1, e3: 2, e4: 3,
};

function readConstraints(answers: AnswerMap): Constraints {
  const time = (SCALE_INDEX[answers[Q_TIME] as string] ?? 2) as TimeLevel;
  const cost = (SCALE_INDEX[answers[Q_BUDGET] as string] ?? 1) as CostLevel;
  const energy = (SCALE_INDEX[answers[Q_ENERGY] as string] ?? 2) as EnergyLevel;

  const socialMap: Record<string, SocialLevel> = {
    solo: "solo", duo: "pair", small: "small_group", crowd: "crowd",
  };
  const social = socialMap[answers[Q_SOCIAL] as string] ?? "small_group";

  const settingMap: Record<string, Setting> = {
    indoors: "indoor", outdoors: "outdoor", mixed: "mixed", anywhere: "mixed",
  };
  const setting = settingMap[answers[Q_SETTING] as string] ?? "mixed";

  // Which categories the student ALREADY has skills in (from q07 weights).
  const skillCategories = new Set<CategoryId>();
  const skills = answers[Q_SKILLS];
  const skillIds = Array.isArray(skills) ? skills : skills ? [skills] : [];
  const skillsQ = QUESTIONS.find((q) => q.id === Q_SKILLS);
  for (const sid of skillIds) {
    const choice = skillsQ?.choices?.find((c) => c.id === sid);
    if (!choice?.weights) continue;
    for (const k of CATEGORY_IDS) {
      if ((choice.weights[k] ?? 0) > 0) skillCategories.add(k);
    }
  }
  return { time, cost, energy, social, setting, skillCategories };
}

const SOCIAL_ORDER: SocialLevel[] = ["solo", "pair", "small_group", "crowd"];

/** Feasibility-aware fit score for one course, for this student. */
function courseScore(
  course: Course,
  scores: CategoryScores,
  ranked: CategoryId[],
  studentTypeId: string,
  c: Constraints,
): number {
  const vec = courseCategoryVector(course);
  // Base: category alignment (0..1) scaled up, plus leading-category fit.
  let s = cosine(scores, vec) * 10 + categoryFit(ranked, [course.category]) * 0.4;

  // Student-type fit.
  if (course.recommendedStudentTypes.includes(studentTypeId)) s += 3;
  if (course.poorFitStudentTypes.includes(studentTypeId)) s -= 6;

  // Time / budget / energy: over-asking is penalized; comfortable fit rewarded.
  if (course.timeLevel > c.time) s -= (course.timeLevel - c.time) * 1.6;
  if (course.costLevel > c.cost) s -= (course.costLevel - c.cost) * 1.8;
  if (course.energyRequired > c.energy) s -= (course.energyRequired - c.energy) * 1.5;

  // Low energy → reward beginner-friendliness.
  if (c.energy <= 1) s += course.beginnerFriendliness * 0.4;

  // Setting preference (soft).
  if (c.setting !== "mixed" && course.setting !== "mixed" && course.setting !== c.setting) {
    s -= 0.8;
  }
  // Social preference (soft, by distance on the scale).
  const dist = Math.abs(
    SOCIAL_ORDER.indexOf(course.socialLevel) - SOCIAL_ORDER.indexOf(c.social),
  );
  s -= dist * 0.4;

  return s;
}

export function pickRequiredCourse(
  scores: CategoryScores,
  ranked: CategoryId[],
  studentTypeId: string,
  c: Constraints,
): string {
  let bestId = REQUIRED_COURSES[0].id;
  let best = -Infinity;
  REQUIRED_COURSES.forEach((course, idx) => {
    const s = courseScore(course, scores, ranked, studentTypeId, c) - idx * 0.001;
    if (s > best) {
      best = s;
      bestId = course.id;
    }
  });
  return bestId;
}

/**
 * Three balanced electives:
 *   A — strongest desire (top category)
 *   B — uses an existing skill (a category the student already has)
 *   C — manageable novelty (a beginner-friendly course outside the top categories)
 * Falls back gracefully and never repeats a course. Avoids three of one category.
 */
export function pickElectives(
  scores: CategoryScores,
  ranked: CategoryId[],
  studentTypeId: string,
  c: Constraints,
): string[] {
  const used = new Set<string>();
  const chosen: string[] = [];
  const rank = (list: Course[]) =>
    [...list].sort(
      (a, b) =>
        courseScore(b, scores, ranked, studentTypeId, c) -
        courseScore(a, scores, ranked, studentTypeId, c),
    );

  const take = (course?: Course) => {
    if (course && !used.has(course.id)) {
      used.add(course.id);
      chosen.push(course.id);
      return true;
    }
    return false;
  };

  // A — strongest desire.
  const topCat = ranked[0];
  take(rank(ELECTIVE_COURSES.filter((e) => e.category === topCat))[0]);

  // B — uses an existing skill (skill-category, not already used, prefer new category).
  const skillCats = Array.from(c.skillCategories);
  const skillCandidates = rank(
    ELECTIVE_COURSES.filter(
      (e) => skillCats.includes(e.category) && !used.has(e.id),
    ),
  );
  take(skillCandidates.find((e) => e.category !== topCat) ?? skillCandidates[0]);

  // C — manageable novelty: beginner-friendly, feasible, category outside top-3.
  const top3 = new Set(ranked.slice(0, 3));
  const novelty = rank(
    ELECTIVE_COURSES.filter(
      (e) =>
        !used.has(e.id) &&
        !top3.has(e.category) &&
        e.beginnerFriendliness >= 2 &&
        e.timeLevel <= c.time + 1 &&
        e.costLevel <= c.cost + 1,
    ),
  );
  take(novelty[0]);

  // Backfill any empty slots with best remaining, preferring unused categories.
  if (chosen.length < 3) {
    const usedCats = new Set(chosen.map((id) => COURSE_BY_ID[id].category));
    const rest = rank(ELECTIVE_COURSES.filter((e) => !used.has(e.id)));
    for (const e of rest) {
      if (chosen.length >= 3) break;
      if (!usedCats.has(e.category)) {
        usedCats.add(e.category);
        take(e);
      }
    }
    for (const e of rest) {
      if (chosen.length >= 3) break;
      take(e);
    }
  }

  return chosen.slice(0, 3);
}

/** Full deterministic placement pipeline. */
export function computePlacement(answers: AnswerMap): Placement {
  const scores = computeScores(answers);
  const ranked = rankCategories(scores);
  const c = readConstraints(answers);

  const studentTypeId = pickStudentType(scores);
  const majorId = pickMajor(ranked, studentTypeId);
  const minorId = pickMinor(ranked, majorId);
  const requiredCourseId = pickRequiredCourse(scores, ranked, studentTypeId, c);
  const electiveIds = pickElectives(scores, ranked, studentTypeId, c);

  const reqCourse = COURSE_BY_ID[requiredCourseId];
  const audioLessonId = AUDIO_BY_ID[reqCourse.relatedAudioLesson]
    ? reqCourse.relatedAudioLesson
    : (AUDIO_BY_CATEGORY[ranked[0]]?.id ?? "aud_making");
  const assignmentId = ASSIGNMENT_BY_ID[reqCourse.firstAssignment]
    ? reqCourse.firstAssignment
    : (ASSIGNMENT_BY_CATEGORY[ranked[0]]?.id ?? "asg_creativity");

  const rationale = buildRationale(
    { studentTypeId, majorId, minorId, requiredCourseId, electiveIds },
    ranked,
    c,
  );

  return {
    studentTypeId,
    majorId,
    minorId,
    requiredCourseId,
    electiveIds,
    audioLessonId,
    assignmentId,
    rankedCategories: ranked,
    scores,
    rationale,
  };
}

function buildRationale(
  sel: {
    studentTypeId: string;
    majorId: string;
    minorId: string;
    requiredCourseId: string;
    electiveIds: string[];
  },
  ranked: CategoryId[],
  c: Constraints,
): PlacementRationale {
  const top = CATEGORY_BY_ID[ranked[0]].label;
  const second = CATEGORY_BY_ID[ranked[1]].label;
  return {
    studentType: `Closest match to your category profile — led by ${top}.`,
    major: `Serves your strongest categories (${top}, ${second}).`,
    minor: `Rounds out a secondary strength without repeating the major.`,
    requiredCourse: `Best-fit Freshman course for your ${top.toLowerCase()} signal within your time (${c.time}/3), budget (${c.cost}/3) and energy (${c.energy}/3).`,
    electives: sel.electiveIds.map((id, i) => {
      const labels = [
        "matches your strongest desire",
        "uses a skill you already have",
        "introduces manageable novelty",
      ];
      return `${COURSE_BY_ID[id].title} — ${labels[i] ?? "well-rounded fit"}.`;
    }),
    audioLesson: `Paired to your Freshman course.`,
    assignment: `A one-week experiment tied to your top signal (${top}).`,
  };
}

export function extractName(answers: AnswerMap): string {
  const raw = answers[NAME_QUESTION_ID];
  const name = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return name && name.length > 0 ? name : "Anonymous Student";
}

export function extractAge(answers: AnswerMap): string | null {
  const raw = answers[AGE_QUESTION_ID];
  const age = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return age && age.length > 0 ? age : null;
}
