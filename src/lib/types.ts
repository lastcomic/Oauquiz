// Shared types for the OAU Second Draft Placement Exam + Curriculum Engine.

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
  weights?: Partial<CategoryScores>;
}

export type QuestionKind = "single" | "multi" | "scale" | "open";

export interface Question {
  id: string;
  kind: QuestionKind;
  section: string;
  prompt: string;
  help?: string;
  choices?: AnswerChoice[];
  placeholder?: string;
  maxSelections?: number;
}

/** A student's raw answers, keyed by question id. */
export type AnswerMap = Record<string, string | string[] | undefined>;

// ── Practical dimensions used by the engine to keep recommendations realistic ──

/** Weekly time the student can give, and a course demands. 0 = minimal … 3 = serious. */
export type TimeLevel = 0 | 1 | 2 | 3;
/** Budget the student has, and a course needs. 0 = ~free … 3 = real investment. */
export type CostLevel = 0 | 1 | 2 | 3;
/** Energy the student has, and a course demands. 0 = low … 3 = high. */
export type EnergyLevel = 0 | 1 | 2 | 3;
/** Social setting. */
export type SocialLevel = "solo" | "pair" | "small_group" | "crowd";
export type Setting = "indoor" | "outdoor" | "mixed";

export interface StudentType {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Category profile this type leans toward (cosine-matched). */
  signature: Partial<CategoryScores>;
  /** Majors that fit this type well, by id (advisory, not binding). */
  affinityMajors?: string[];
}

export interface Major {
  id: string;
  code: string;
  name: string;
  /** Categories this major serves, most important first. */
  categories: CategoryId[];
  description: string;
}

export interface Minor {
  id: string;
  code: string;
  name: string;
  categories: CategoryId[];
  description: string;
}

/** A seven-day first assignment. */
export interface Assignment {
  id: string;
  code: string;
  title: string;
  category: CategoryId;
  /** Seven lines, one per day. */
  days: string[];
  /** How the student knows they completed it. */
  successMeasure: string;
}

/** An audio lesson / dean's briefing. */
export interface AudioLesson {
  id: string;
  code: string;
  title: string;
  minutes: number;
  category: CategoryId;
  description: string;
  recommendedStudentTypes?: string[];
}

export type CourseKind = "required" | "elective";

/**
 * A course in the OAU catalog. Every value here is editable in the data file
 * without touching application code. The engine reads these fields directly.
 */
export interface Course {
  id: string;
  courseNumber: string;
  title: string;
  kind: CourseKind;
  category: CategoryId;
  description: string;

  // Practical metadata (drives realistic filtering)
  timeCommitment: string; // human label
  timeLevel: TimeLevel; // machine value
  costLabel: string; // human label
  costLevel: CostLevel; // machine value
  setting: Setting;
  socialLevel: SocialLevel;
  energyRequired: EnergyLevel;
  beginnerFriendliness: EnergyLevel; // 0 low … 3 very beginner-friendly

  // Category fit scores (0–3 each) — the eight OAU dimensions
  creativityScore: number;
  purposeScore: number;
  adventureScore: number;
  communityScore: number;
  incomeScore: number; // "income potential"
  learningScore: number;
  restorationScore: number;
  usefulnessScore: number; // "practical usefulness"

  // Relations
  relatedAudioLesson: string; // AudioLesson id
  firstAssignment: string; // Assignment id
  recommendedStudentTypes: string[];
  poorFitStudentTypes: string[];
}

/** The deterministically-selected recommendation set. */
export interface Placement {
  studentTypeId: string;
  majorId: string;
  minorId: string;
  requiredCourseId: string;
  electiveIds: string[];
  audioLessonId: string;
  assignmentId: string;
  rankedCategories: CategoryId[];
  scores: CategoryScores;
  /** Per-slot rationale from the deterministic engine (pre-AI). */
  rationale: PlacementRationale;
}

export interface PlacementRationale {
  studentType: string;
  major: string;
  minor: string;
  requiredCourse: string;
  electives: string[];
  audioLesson: string;
  assignment: string;
}

/**
 * AI-personalized (or template-fallback) narrative for a placement.
 * Produced as SIX separate documents from the same quiz data — the AI
 * explains the engine's decisions, it never changes them.
 */
export interface Personalization {
  source: "ai" | "template";

  /** Doc 1 — Official Guidance Counselor Letter. */
  guidanceLetter: {
    subjectLine: string;
    opening: string;
    assessment: string;
    recommendation: string;
    closing: string;
  };

  /** Doc 2 — Why We Chose These Courses (per-slot explanations). */
  whyTheseCourses: {
    intro: string;
    studentType: string;
    major: string;
    minor: string;
    requiredCourse: string;
    electives: { id: string; text: string }[];
  };

  /** Doc 3 — Your Second Draft Summary. */
  secondDraftSummary: string;

  /** Doc 4 — personalized framing for the 7-Day Assignment. */
  sevenDayIntro: string;

  /** Doc 5 — Message from the Dean (short video script). */
  deansMessage: string;

  /** Doc 6 — Private AI Advisor Prompt (paste into ChatGPT/Gemini/Claude). */
  advisorPrompt: string;

  /** Closing beats used across the report. */
  encouragement: string;
  questionToConsider: string;
}

/** Purchase / delivery record for a submission (Phase 2B). */
export interface OrderInfo {
  email?: string;
  /** Stripe Checkout session id (or "simulated:*" in test mode). */
  sessionId?: string;
  purchased?: boolean;
  /** ISO timestamp of the last successful email delivery. */
  deliveredAt?: string;
  /** How fulfillment happened. */
  channel?: "stripe" | "simulated";
}

/** A stored submission (localStorage record). */
export interface Submission {
  id: string;
  name: string;
  createdAt: string; // ISO timestamp
  answers: AnswerMap;
  placement: Placement;
  /** Cached personalization, if generated. */
  personalization?: Personalization;
  /** Admin overrides applied on top of the engine result. */
  overrides?: Partial<
    Pick<
      Placement,
      | "studentTypeId"
      | "majorId"
      | "minorId"
      | "requiredCourseId"
      | "electiveIds"
      | "audioLessonId"
      | "assignmentId"
    >
  >;
  /** Purchase / email-delivery state (Phase 2B). */
  order?: OrderInfo;
}
