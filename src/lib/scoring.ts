import type {
  AnswerMap,
  CategoryId,
  CategoryScores,
  Placement,
} from "@/lib/types";
import { CATEGORY_IDS, emptyScores } from "@/data/categories";
import { QUESTIONS, NAME_QUESTION_ID } from "@/data/questions";
import { STUDENT_TYPES } from "@/data/studentTypes";
import { MAJORS } from "@/data/majors";
import { MINORS } from "@/data/minors";
import { ELECTIVES } from "@/data/electives";

// ─────────────────────────────────────────────────────────────
// TEMPORARY RULE-BASED SCORING (no AI).
// 1. Sum answer weights into a category vector.
// 2. Match vector to the closest student-type signature.
// 3. Derive major / minor / electives from top categories.
// Open-response answers are captured elsewhere but NOT scored.
// ─────────────────────────────────────────────────────────────

/** Sum the weights of every selected (scored) answer. */
export function computeScores(answers: AnswerMap): CategoryScores {
  const scores = emptyScores();

  for (const q of QUESTIONS) {
    if (q.kind === "open" || !q.choices) continue;
    const raw = answers[q.id];
    if (!raw) continue;
    const selectedIds = Array.isArray(raw) ? raw : [raw];

    for (const choiceId of selectedIds) {
      const choice = q.choices.find((c) => c.id === choiceId);
      if (!choice?.weights) continue;
      for (const key of CATEGORY_IDS) {
        const w = choice.weights[key];
        if (w) scores[key] += w;
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

function cosineSimilarity(
  a: CategoryScores,
  b: Partial<CategoryScores>,
): number {
  let dot = 0;
  for (const id of CATEGORY_IDS) dot += a[id] * (b[id] ?? 0);
  const denom = magnitude(a) * magnitude(b);
  return denom === 0 ? 0 : dot / denom;
}

/** Category ids ranked strongest first (stable, deterministic tie-break). */
export function rankCategories(scores: CategoryScores): CategoryId[] {
  return [...CATEGORY_IDS].sort((a, b) => {
    const diff = scores[b] - scores[a];
    if (diff !== 0) return diff;
    // Deterministic tie-break by canonical order.
    return CATEGORY_IDS.indexOf(a) - CATEGORY_IDS.indexOf(b);
  });
}

/** Best-fit student type by cosine similarity to each signature. */
export function pickStudentType(scores: CategoryScores): string {
  let bestId = STUDENT_TYPES[0].id;
  let best = -Infinity;
  for (const t of STUDENT_TYPES) {
    const sim = cosineSimilarity(scores, t.signature);
    if (sim > best) {
      best = sim;
      bestId = t.id;
    }
  }
  return bestId;
}

/** Score how well a set of categories matches the ranked list (leading = heavier). */
function categoryFitScore(
  ranked: CategoryId[],
  categories: CategoryId[],
): number {
  let score = 0;
  categories.forEach((cat, idx) => {
    const rankPos = ranked.indexOf(cat);
    if (rankPos === -1) return;
    // Higher when the item's leading categories are high in the student's ranking.
    const rankWeight = ranked.length - rankPos; // stronger category => bigger
    const itemWeight = categories.length - idx; // leading category => bigger
    score += rankWeight * itemWeight;
  });
  return score;
}

export function pickMajor(ranked: CategoryId[]): string {
  let bestId = MAJORS[0].id;
  let best = -Infinity;
  MAJORS.forEach((m, idx) => {
    const s = categoryFitScore(ranked, m.categories) - idx * 0.001;
    if (s > best) {
      best = s;
      bestId = m.id;
    }
  });
  return bestId;
}

export function pickMinor(ranked: CategoryId[], majorId: string): string {
  // Prefer a minor built on the student's 2nd/3rd categories, and not
  // simply a duplicate of the major's leading category.
  const majorLead = MAJORS.find((m) => m.id === majorId)?.categories[0];
  let bestId = MINORS[0].id;
  let best = -Infinity;
  MINORS.forEach((m, idx) => {
    let s = categoryFitScore(ranked, m.categories) - idx * 0.001;
    if (m.categories[0] === majorLead) s -= 100; // avoid echoing the major
    if (s > best) {
      best = s;
      bestId = m.id;
    }
  });
  return bestId;
}

export function pickElectives(ranked: CategoryId[], count = 3): string[] {
  const chosen: string[] = [];
  const used = new Set<string>();
  // Walk the top categories and pick the best unused elective for each.
  const topCats = ranked.slice(0, Math.max(count, 4));

  for (const cat of topCats) {
    if (chosen.length >= count) break;
    const candidates = ELECTIVES.filter(
      (e) => e.categories.includes(cat) && !used.has(e.id),
    ).sort(
      (a, b) =>
        categoryFitScore(ranked, b.categories) -
        categoryFitScore(ranked, a.categories),
    );
    if (candidates[0]) {
      chosen.push(candidates[0].id);
      used.add(candidates[0].id);
    }
  }

  // Backfill if we still need more (e.g. sparse data).
  if (chosen.length < count) {
    const rest = [...ELECTIVES]
      .filter((e) => !used.has(e.id))
      .sort(
        (a, b) =>
          categoryFitScore(ranked, b.categories) -
          categoryFitScore(ranked, a.categories),
      );
    for (const e of rest) {
      if (chosen.length >= count) break;
      chosen.push(e.id);
      used.add(e.id);
    }
  }

  return chosen.slice(0, count);
}

/** Full placement pipeline. */
export function computePlacement(answers: AnswerMap): Placement {
  const scores = computeScores(answers);
  const rankedCategories = rankCategories(scores);
  const studentTypeId = pickStudentType(scores);
  const majorId = pickMajor(rankedCategories);
  const minorId = pickMinor(rankedCategories, majorId);
  const electiveIds = pickElectives(rankedCategories, 3);

  return {
    studentTypeId,
    majorId,
    minorId,
    electiveIds,
    rankedCategories,
    scores,
  };
}

/** Pull the student's name out of the answer map (Q1). */
export function extractName(answers: AnswerMap): string {
  const raw = answers[NAME_QUESTION_ID];
  const name = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  return name && name.length > 0 ? name : "Anonymous Student";
}
