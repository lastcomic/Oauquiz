import type { Personalization, Submission } from "@/lib/types";
import { CATEGORY_BY_ID } from "@/data/categories";
import { STUDENT_TYPE_BY_ID } from "@/data/studentTypes";
import { MAJOR_BY_ID } from "@/data/majors";
import { MINOR_BY_ID } from "@/data/minors";
import { COURSE_BY_ID } from "@/data/courses";
import { AUDIO_BY_ID } from "@/data/audioLessons";
import { ASSIGNMENT_BY_ID } from "@/data/assignments";
import { QUESTIONS } from "@/data/questions";
import { effectivePlacement } from "@/lib/submission";
import { extractName, extractAge } from "@/lib/scoring";

// ─────────────────────────────────────────────────────────────
// PERSONALIZATION
// The engine has ALREADY chosen everything. This module only turns
// those choices into six explanatory documents — via the AI when a
// key is configured, otherwise via brand-consistent templates.
// The AI never changes a recommendation; it explains it.
// ─────────────────────────────────────────────────────────────

export const OAU_MOTTO = "Not over. Complete.";
export const OAU_SIGNOFF = "Office of Guidance and Placement · Old Age University";

/** The Guidance Counselor persona who signs the letter. */
export const COUNSELOR = {
  name: "Dr. Gerald Fitch",
  title: "Guidance Counselor · Old Age University, Class of 1987",
  signoff: "Stay Gold.",
};

export interface PersonalizeContext {
  name: string;
  age: string | null;
  studentType: { id: string; name: string; tagline: string; description: string };
  major: { name: string; description: string };
  minor: { name: string; description: string };
  requiredCourse: { courseNumber: string; title: string; description: string };
  electives: { id: string; courseNumber: string; title: string; description: string }[];
  audio: { title: string; minutes: number; description: string };
  assignment: { title: string; days: string[]; successMeasure: string };
  topCategories: string[]; // labels, strongest first
  scores: { label: string; value: number }[];
  answers: { prompt: string; answer: string }[];
  someday: string | null;
  note: string | null;
}

/** Build a fully-resolved, self-contained context from a stored submission. */
export function buildContext(sub: Submission): PersonalizeContext {
  const p = effectivePlacement(sub);
  const type = STUDENT_TYPE_BY_ID[p.studentTypeId];
  const major = MAJOR_BY_ID[p.majorId];
  const minor = MINOR_BY_ID[p.minorId];
  const req = COURSE_BY_ID[p.requiredCourseId];
  const audio = AUDIO_BY_ID[p.audioLessonId];
  const assignment = ASSIGNMENT_BY_ID[p.assignmentId];

  const readable: { prompt: string; answer: string }[] = [];
  let someday: string | null = null;
  let note: string | null = null;

  for (const q of QUESTIONS) {
    const raw = sub.answers[q.id];
    if (raw == null || (Array.isArray(raw) && raw.length === 0)) continue;
    if (q.kind === "open") {
      const val = (Array.isArray(raw) ? raw.join(" ") : raw).trim();
      if (!val) continue;
      if (q.id === "q06_someday") someday = val;
      else if (q.id === "q15_note") note = val;
      if (q.id !== "q01_name") readable.push({ prompt: q.prompt, answer: val });
    } else {
      const ids = Array.isArray(raw) ? raw : [raw];
      const labels = ids
        .map((id) => q.choices?.find((c) => c.id === id)?.label ?? id)
        .join("; ");
      readable.push({ prompt: q.prompt, answer: labels });
    }
  }

  return {
    name: extractName(sub.answers),
    age: extractAge(sub.answers),
    studentType: {
      id: type.id,
      name: type.name,
      tagline: type.tagline,
      description: type.description,
    },
    major: { name: major.name, description: major.description },
    minor: { name: minor.name, description: minor.description },
    requiredCourse: {
      courseNumber: req.courseNumber,
      title: req.title,
      description: req.description,
    },
    electives: p.electiveIds.map((id) => {
      const c = COURSE_BY_ID[id];
      return {
        id,
        courseNumber: c.courseNumber,
        title: c.title,
        description: c.description,
      };
    }),
    audio: { title: audio.title, minutes: audio.minutes, description: audio.description },
    assignment: {
      title: assignment.title,
      days: assignment.days,
      successMeasure: assignment.successMeasure,
    },
    topCategories: p.rankedCategories.slice(0, 3).map((c) => CATEGORY_BY_ID[c].label),
    scores: p.rankedCategories.map((c) => ({
      label: CATEGORY_BY_ID[c].label,
      value: p.scores[c],
    })),
    answers: readable,
    someday,
    note,
  };
}

// ── AI PROMPT ──────────────────────────────────────────────────

export const SYSTEM_PROMPT = `You are Dr. Gerald Fitch, Guidance Counselor at Old Age University (OAU). Class of 1987. Retired. You came back because you got bored. OAU is for adults roughly 45 to 65 revisiting the question "what do you want to be when you grow up" now that they finally have the information to answer it.

The quiz engine has ALREADY chosen this student's student type, major, minor, required course, electives, audio lesson, and first assignment. You do NOT change those decisions. You do NOT invent new courses, majors, course numbers, statistics, or credentials. You explain and you write, in your voice.

Your voice: deadpan, warm, seen-it-all. You have read their file. Short sentences. Observed, never clinical. No self-help language. No coaching speak. No motivational-speaker lines. No em dashes, ever. You treat their real-life situation like standard freshman intake paperwork: normal, filed, handled. Humor is dry and comes from official university language applied to real midlife situations, never from jokes about getting old, bad knees, technology, memory, retirement, or any age stereotype.

Never diagnose. Never claim certainty. Never tell anyone to quit their job or make a drastic change. When you point them anywhere, point them toward one small thing.

Return ONLY valid JSON (no markdown fences, no commentary) matching the requested schema exactly.`;

export function buildUserPrompt(ctx: PersonalizeContext): string {
  const answers = ctx.answers
    .map((a) => `- ${a.prompt}\n    → ${a.answer}`)
    .join("\n");
  const scores = ctx.scores.map((s) => `${s.label}: ${s.value}`).join(", ");
  const electives = ctx.electives
    .map((e) => `${e.courseNumber} ${e.title} — ${e.description}`)
    .join("\n");

  const situation =
    [ctx.someday ? `Someday: ${ctx.someday}` : "", ctx.note ? `In their words: ${ctx.note}` : ""]
      .filter(Boolean)
      .join(" | ") || "(not stated — work from their answers and scores)";

  return `STUDENT FILE (all decisions already made by the engine — explain, do not change):

Name: ${ctx.name}
Age: ${ctx.age ?? "not provided"}
Situation (the one-line reason they walked in): ${situation}
Student Type: ${ctx.studentType.name} — ${ctx.studentType.tagline}
Recommended Major: ${ctx.major.name}
Recommended Minor: ${ctx.minor.name}
Required Freshman Course: ${ctx.requiredCourse.courseNumber} ${ctx.requiredCourse.title} — ${ctx.requiredCourse.description}
Assigned Electives:
${electives}
Audio Lesson: ${ctx.audio.title} (${ctx.audio.minutes} min) — ${ctx.audio.description}
First Assignment: ${ctx.assignment.title} — success when: ${ctx.assignment.successMeasure}
Strength Scores (strongest first): ${scores}
${ctx.someday ? `Their "someday": ${ctx.someday}` : ""}
${ctx.note ? `Note to the office: ${ctx.note}` : ""}

Their quiz answers:
${answers}

Produce SIX personalized documents as a single JSON object with EXACTLY these keys:
{
  "guidanceLetter": { "subjectLine": string, "opening": string, "assessment": string, "recommendation": string, "closing": string },
  "whyTheseCourses": { "intro": string, "studentType": string, "major": string, "minor": string, "requiredCourse": string, "electives": [ { "id": string, "text": string } ] },
  "secondDraftSummary": string,
  "sevenDayIntro": string,
  "deansMessage": string,
  "advisorPrompt": string,
  "encouragement": string,
  "questionToConsider": string
}

Rules:
- "whyTheseCourses.electives" MUST contain one entry per elective using these exact ids in order: ${ctx.electives.map((e) => `"${e.id}"`).join(", ")}.
- "guidanceLetter" is a letter from Dr. Gerald Fitch to the student, second person, ~200 to 320 words across its four parts. Follow this exact structure in Fitch's voice:
    * opening: begins with the sentence "I have been doing this a long time. I know a file when I see one." Then one short beat.
    * assessment: reference the specific details from their situation and answers, reworded as notes in their student file. Reframe each struggle as normal freshman behavior, not a crisis. Include one line that lands emotionally and makes them feel seen, not mocked.
    * recommendation: point them to TWO of the courses already assigned below, by name (the required course and/or an elective). Do not invent courses. This is where you start them.
    * closing: land one line and stop. End with exactly "Stay Gold."
  No em dashes anywhere in the letter. Short sentences. If any sentence sounds like a greeting card, rewrite it. Do not restate the university motto in the letter.
- Keep "whyTheseCourses", "secondDraftSummary", and "sevenDayIntro" in the same dry, plain OAU voice (they are office paperwork, not Fitch's signed letter).
- "deansMessage" is a short spoken video script (~120 words) from the Dean (a different person than Fitch), warm and brief.
- "advisorPrompt" is a ready-to-paste prompt the student can give ChatGPT/Claude/Gemini: it must include their student type, major, minor, required course, three electives, first assignment, stated goals and limitations, and ask the AI to propose ONE small experiment at a time. It must instruct that AI never to invent OAU courses.
- Keep everything in the OAU voice described in your instructions.`;
}

/** Best-effort parse of the model's JSON into a Personalization. */
export function parseModelJson(text: string): Personalization | null {
  let raw = text.trim();
  // Strip accidental code fences.
  raw = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    const o = JSON.parse(raw.slice(start, end + 1));
    if (!o.guidanceLetter || !o.whyTheseCourses) return null;
    return {
      source: "ai",
      guidanceLetter: {
        subjectLine: String(o.guidanceLetter.subjectLine ?? "Your Placement"),
        opening: String(o.guidanceLetter.opening ?? ""),
        assessment: String(o.guidanceLetter.assessment ?? ""),
        recommendation: String(o.guidanceLetter.recommendation ?? ""),
        closing: String(o.guidanceLetter.closing ?? ""),
      },
      whyTheseCourses: {
        intro: String(o.whyTheseCourses.intro ?? ""),
        studentType: String(o.whyTheseCourses.studentType ?? ""),
        major: String(o.whyTheseCourses.major ?? ""),
        minor: String(o.whyTheseCourses.minor ?? ""),
        requiredCourse: String(o.whyTheseCourses.requiredCourse ?? ""),
        electives: Array.isArray(o.whyTheseCourses.electives)
          ? o.whyTheseCourses.electives.map((e: { id?: string; text?: string }) => ({
              id: String(e.id ?? ""),
              text: String(e.text ?? ""),
            }))
          : [],
      },
      secondDraftSummary: String(o.secondDraftSummary ?? ""),
      sevenDayIntro: String(o.sevenDayIntro ?? ""),
      deansMessage: String(o.deansMessage ?? ""),
      advisorPrompt: String(o.advisorPrompt ?? ""),
      encouragement: String(o.encouragement ?? ""),
      questionToConsider: String(o.questionToConsider ?? ""),
    };
  } catch {
    return null;
  }
}

// ── TEMPLATE FALLBACK (used when no API key is configured) ─────

export function buildFallback(ctx: PersonalizeContext): Personalization {
  const first = ctx.name.split(/\s+/)[0] || ctx.name;
  const top = ctx.topCategories[0] ?? "your strongest signal";
  const second = ctx.topCategories[1] ?? "";
  const el = ctx.electives;

  const specifics: string[] = [];
  const more = ctx.answers.find((a) => a.prompt.includes("MORE"));
  const less = ctx.answers.find((a) => a.prompt.includes("LESS"));
  const finished = ctx.answers.find((a) => a.prompt.toLowerCase().includes("finished"));
  if (more) specifics.push(`you said you want more of "${more.answer.toLowerCase()}"`);
  if (less) specifics.push(`less of "${less.answer.toLowerCase()}"`);
  if (finished) specifics.push(`you're finished with "${finished.answer.toLowerCase()}"`);
  const specific = specifics.slice(0, 3).join(", ");

  return {
    source: "template",
    guidanceLetter: {
      subjectLine: `Intake reviewed. ${ctx.studentType.name}.`,
      opening: `I have been doing this a long time. I know a file when I see one. Yours came across my desk this morning, ${first}.`,
      assessment: `${specific ? `The file notes a few things. ${specific.charAt(0).toUpperCase()}${specific.slice(1)}. ` : ""}Your answers lean toward ${top}${second ? `, with ${second} right behind it` : ""}. People treat that like a problem to solve. It is not. It is standard freshman behavior. I have a drawer full of files that say the same thing. You are not behind. You are enrolled.`,
      recommendation: `I am starting you in two places. ${ctx.requiredCourse.courseNumber} ${ctx.requiredCourse.title}, because that is where your file points. And ${el[0]?.title ?? "your first elective"}, because it uses something you already have. Your major is ${ctx.major.name}. Your minor is ${ctx.minor.name}. That is the paperwork. The rest is showing up.`,
      closing: `Do the seven day assignment. It is small. That is the point. Stay Gold.`,
    },
    whyTheseCourses: {
      intro: `Every recommendation below was chosen by matching your answers to the OAU catalog. Here is the reasoning, in plain terms.`,
      studentType: `${ctx.studentType.name} — ${ctx.studentType.tagline} ${ctx.studentType.description}`,
      major: `${ctx.major.name}: this major serves your leading strengths (${ctx.topCategories.slice(0, 2).join(" and ")}). ${ctx.major.description}`,
      minor: `${ctx.minor.name}: a complementary second strength that doesn't simply repeat the major. ${ctx.minor.description}`,
      requiredCourse: `${ctx.requiredCourse.courseNumber} ${ctx.requiredCourse.title}: the best-fit Freshman course for your ${top.toLowerCase()} signal, sized to the time, budget, and energy you told us you have. ${ctx.requiredCourse.description}`,
      electives: el.map((e, i) => ({
        id: e.id,
        text:
          i === 0
            ? `${e.title} matches your strongest desire — ${top.toLowerCase()}. ${e.description}`
            : i === 1
              ? `${e.title} builds on a skill you already have, so you start with an advantage. ${e.description}`
              : `${e.title} introduces a manageable amount of novelty — a new door, not a cliff. ${e.description}`,
      })),
    },
    secondDraftSummary: `${first}, in one page: your answers describe someone finished with proving and ready to make deliberate use of what they've learned. Your strongest signals are ${ctx.topCategories.join(", ")}. Your placement — ${ctx.studentType.name}, majoring in ${ctx.major.name} — is built to turn that self-knowledge into a first, testable step rather than a grand announcement.`,
    sevenDayIntro: `Your first assignment, "${ctx.assignment.title}", is designed to take under two hours total across the week and to cost little or nothing. You'll know you finished when: ${ctx.assignment.successMeasure}`,
    deansMessage: `Hello ${first}. I'm the Dean. I read your file. I won't keep you — you've done enough reading of your own life lately. I'll only say this: what you're feeling isn't a crisis of direction. Your answers are remarkably clear about where you lean. Your job this week isn't to decide anything permanent. It's to run one small experiment and notice how it feels. That's the whole assignment. Welcome to the class. We're glad you enrolled.`,
    advisorPrompt: buildAdvisorPrompt(ctx),
    encouragement: `You underestimated at least one of your strengths in ${second || top}. The Guidance Office did not.`,
    questionToConsider: `If the seven-day assignment goes well, what is the slightly larger version you'd be willing to try next month?`,
  };
}

export function buildAdvisorPrompt(ctx: PersonalizeContext): string {
  const el = ctx.electives.map((e) => `${e.courseNumber} ${e.title}`).join("; ");
  const goals =
    ctx.someday ? `My "someday": ${ctx.someday}. ` : "";
  const limits = ctx.note ? `Context/limitations: ${ctx.note}. ` : "";
  return `You are my private Second Draft Advisor from Old Age University. Help me act on my placement with small experiments — never dramatic life changes, never "quit your job" advice.

My placement (do not change these; do not invent OAU courses):
- Student type: ${ctx.studentType.name}
- Major: ${ctx.major.name}
- Minor: ${ctx.minor.name}
- Required course: ${ctx.requiredCourse.courseNumber} ${ctx.requiredCourse.title}
- Electives: ${el}
- First assignment: ${ctx.assignment.title}
- Strongest signals: ${ctx.topCategories.join(", ")}
${goals}${limits}
Work with me one step at a time. Propose ONE small, cheap, under-two-hours experiment, wait for me to report back, then suggest the next. Keep a calm, encouraging, non-hype tone. Start by asking me one clarifying question about my week.`;
}
