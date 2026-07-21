// Shared types for the OAU Second Draft Placement Exam.

/** The eight scoring categories. Keys must match categories.ts. */
export type CategoryId =
  | "creativity"
  | "purpose"
  | "adventure"
  | "community"
  | "income"
  | "learning"
  | "restoration"
  | "practical";

export type CategoryScores = Record<CategoryId, number>;

export interface Category {
  id: CategoryId;
  label: string;
  blurb: string;
}

/** A single selectable answer for a scored (choice) question. */
export interface AnswerChoice {
  id: string;
  label: string;
  /** Partial weights added to the category vector when chosen. */
  weights?: Partial<CategoryScores>;
}

export type QuestionKind = "single" | "multi" | "scale" | "open";

export interface Question {
  id: string;
  kind: QuestionKind;
  /** Short registrar-style label used on the progress + review. */
  section: string;
  prompt: string;
  help?: string;
  /** For single / multi / scale questions. */
  choices?: AnswerChoice[];
  /** For open questions — captured but NOT scored in Phase One. */
  placeholder?: string;
  /** For multi questions — max selectable (optional cap). */
  maxSelections?: number;
}

/** A student's raw answers, keyed by question id. */
export type AnswerMap = Record<string, string | string[] | undefined>;

export interface StudentType {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Signature vector: the category profile this type leans toward. */
  signature: Partial<CategoryScores>;
}

export interface Major {
  id: string;
  name: string;
  /** Categories this major serves, most important first. */
  categories: CategoryId[];
  description: string;
}

export interface Minor {
  id: string;
  name: string;
  categories: CategoryId[];
  description: string;
}

export interface Elective {
  id: string;
  name: string;
  categories: CategoryId[];
  description: string;
}

/** The fully computed placement for a student. */
export interface Placement {
  studentTypeId: string;
  majorId: string;
  minorId: string;
  electiveIds: string[];
  /** Ranked category ids, strongest first. */
  rankedCategories: CategoryId[];
  scores: CategoryScores;
}

/** A stored submission (localStorage record). */
export interface Submission {
  id: string;
  name: string;
  createdAt: string; // ISO timestamp
  answers: AnswerMap;
  placement: Placement;
}
