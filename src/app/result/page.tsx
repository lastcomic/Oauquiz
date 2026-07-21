"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Crest from "@/components/Crest";
import type { Personalization, Submission } from "@/lib/types";
import {
  getCurrentSubmission,
  clearCurrentSubmission,
  setPersonalization,
} from "@/lib/storage";
import { effectivePlacement } from "@/lib/submission";
import { buildContext } from "@/lib/personalize";
import { STUDENT_TYPE_BY_ID } from "@/data/studentTypes";
import { MAJOR_BY_ID } from "@/data/majors";
import { MINOR_BY_ID } from "@/data/minors";
import { COURSE_BY_ID } from "@/data/courses";
import { AUDIO_BY_ID } from "@/data/audioLessons";
import { ASSIGNMENT_BY_ID } from "@/data/assignments";
import { CATEGORY_BY_ID, CATEGORY_IDS } from "@/data/categories";
import { CORE_LINE } from "@/data/brand";

export default function ResultPage() {
  const [sub, setSub] = useState<Submission | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [person, setPerson] = useState<Personalization | null>(null);
  const [aiState, setAiState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const requested = useRef(false);

  useEffect(() => {
    const s = getCurrentSubmission();
    setSub(s);
    setLoaded(true);
    if (s?.personalization) {
      setPerson(s.personalization);
      setAiState("done");
    }
  }, []);

  useEffect(() => {
    if (!sub || sub.personalization || requested.current) return;
    requested.current = true;
    setAiState("loading");
    const context = buildContext(sub);
    fetch("/api/personalize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ context }),
    })
      .then((r) => r.json())
      .then((p: Personalization) => {
        setPerson(p);
        setPersonalization(sub.id, p);
        setAiState("done");
      })
      .catch(() => setAiState("error"));
  }, [sub]);

  if (!loaded) {
    return (
      <main className="page">
        <div className="wrap center muted">Retrieving your file…</div>
      </main>
    );
  }

  if (!sub) {
    return (
      <main className="page">
        <div className="wrap">
          <Crest />
          <div className="paper mt-3 center">
            <h2>No student file found</h2>
            <p className="muted">
              We couldn&apos;t find a completed exam on this device.
            </p>
            <Link href="/quiz" className="btn mt-2">
              Take the Placement Exam →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const p = effectivePlacement(sub);
  const name = sub.name;
  const type = STUDENT_TYPE_BY_ID[p.studentTypeId];
  const major = MAJOR_BY_ID[p.majorId];
  const minor = MINOR_BY_ID[p.minorId];
  const required = COURSE_BY_ID[p.requiredCourseId];
  const electives = p.electiveIds.map((id) => COURSE_BY_ID[id]).filter(Boolean);
  const audio = AUDIO_BY_ID[p.audioLessonId];
  const assignment = ASSIGNMENT_BY_ID[p.assignmentId];
  const topCategory = p.rankedCategories[0];
  const maxScore = Math.max(1, ...CATEGORY_IDS.map((id) => p.scores[id]));

  function downloadFile() {
    if (!sub) return;
    const blob = new Blob([JSON.stringify(sub, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safe = name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "student";
    a.href = url;
    a.download = `oau-student-file-${safe}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function restart() {
    clearCurrentSubmission();
    window.location.href = "/quiz";
  }

  return (
    <main className="page">
      <div className="wrap">
        <Crest subtitle="Office of Guidance & Placement" />

        {/* Certificate */}
        <div className="paper mt-3" style={{ position: "relative" }}>
          <div style={{ position: "absolute", right: "1rem", top: "1rem" }}>
            <span className="stamp">Placed</span>
          </div>
          <p className="overline" style={{ paddingRight: "5.5rem" }}>
            Certificate of Placement
          </p>
          <h1 style={{ fontSize: "1.9rem", marginTop: "0.4rem" }}>{name}</h1>
          <p className="muted" style={{ marginTop: "-0.4rem" }}>
            has been reviewed by the Office of Guidance &amp; Placement.
          </p>
          <hr className="rule" />
          <div className="field-row">
            <span className="field-key">Student Type</span>
            <span className="field-val">{type.name}</span>
            <span className="muted field-note">{type.tagline}</span>
          </div>
          <div className="field-row">
            <span className="field-key">Major</span>
            <span className="field-val">{major.name}</span>
          </div>
          <div className="field-row">
            <span className="field-key">Minor</span>
            <span className="field-val">{minor.name}</span>
          </div>
        </div>

        {/* Transcript */}
        <div className="paper mt-3">
          <span className="overline">Transcript · Strength Profile</span>
          <div className="mt-2">
            {p.rankedCategories.map((id) => {
              const val = p.scores[id];
              const pct = Math.round((val / maxScore) * 100);
              return (
                <div key={id} className="meter">
                  <span>{CATEGORY_BY_ID[id].label}</span>
                  <div className="meter-track">
                    <div className="meter-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="meter-num">{val}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Course schedule */}
        <div className="paper mt-3">
          <span className="overline">Course Schedule · First Term</span>
          <div className="card-list mt-2">
            <CourseCard course={required} tag="Required · Freshman Class" />
            {electives.map((e) => (
              <CourseCard key={e.id} course={e} tag="Elective" />
            ))}
          </div>
          <div className="mini-card mt-2" style={{ borderLeftColor: "var(--navy)" }}>
            <h4>
              Audio Lesson · {audio.code} — {audio.title}
            </h4>
            <p className="muted">
              {audio.minutes} min · {audio.description}
            </p>
          </div>
        </div>

        {/* Seven-day assignment */}
        <div className="paper mt-3">
          <span className="overline">First Assignment · Seven Days</span>
          <h3 style={{ margin: "0.4rem 0 0.2rem" }}>{assignment.title}</h3>
          <p className="muted field-note">
            {person?.sevenDayIntro ??
              `Oriented around your strongest signal: ${CATEGORY_BY_ID[topCategory].label}.`}
          </p>
          <div className="mt-2">
            {assignment.days.map((line, i) => (
              <div key={i} className="assignment-day">
                {line}
              </div>
            ))}
          </div>
          <p className="tiny muted mt-2">
            <strong>Done when:</strong> {assignment.successMeasure}
          </p>
        </div>

        {/* The six documents */}
        <div className="paper mt-3">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem", flexWrap: "wrap" }}>
            <span className="overline">Your Guidance Office Report</span>
            <AiBadge state={aiState} source={person?.source} />
          </div>

          {aiState === "loading" && !person ? (
            <p className="muted mt-2">
              Your counselor is reading your file and writing your report…
            </p>
          ) : person ? (
            <div className="stack mt-2">
              <DocBlock n={1} title="Official Guidance Counselor Letter">
                <p style={{ marginBottom: "0.6rem" }}>{person.guidanceLetter.opening}</p>
                <p className="muted tiny" style={{ marginBottom: 0 }}>
                  Read the full letter, ready to print:{" "}
                  <Link href="/letter">open the official letter →</Link>
                </p>
              </DocBlock>

              <DocBlock n={2} title="Why We Chose These Courses">
                <p>{person.whyTheseCourses.intro}</p>
                <p><strong>Student type.</strong> {person.whyTheseCourses.studentType}</p>
                <p><strong>Major.</strong> {person.whyTheseCourses.major}</p>
                <p><strong>Minor.</strong> {person.whyTheseCourses.minor}</p>
                <p><strong>Required course.</strong> {person.whyTheseCourses.requiredCourse}</p>
                {person.whyTheseCourses.electives.map((e) => (
                  <p key={e.id}>
                    <strong>{COURSE_BY_ID[e.id]?.title ?? "Elective"}.</strong>{" "}
                    {e.text}
                  </p>
                ))}
              </DocBlock>

              <DocBlock n={3} title="Your Second Draft Summary">
                <p style={{ marginBottom: 0 }}>{person.secondDraftSummary}</p>
              </DocBlock>

              <DocBlock n={5} title="Message from the Dean">
                <p className="muted tiny" style={{ margin: "0 0 0.4rem" }}>
                  Short video script — read it aloud in your head.
                </p>
                <p style={{ fontStyle: "italic", marginBottom: 0 }}>
                  “{person.deansMessage}”
                </p>
              </DocBlock>

              <DocBlock n={6} title="Your Private AI Advisor Prompt">
                <p className="muted tiny">
                  Paste this into ChatGPT, Claude, or Gemini to keep going.
                </p>
                <CopyBox text={person.advisorPrompt} />
              </DocBlock>

              {person.encouragement ? (
                <div className="mini-card" style={{ borderLeftColor: "var(--stamp-red)" }}>
                  <p style={{ margin: 0 }}>{person.encouragement}</p>
                  {person.questionToConsider ? (
                    <p className="muted" style={{ margin: "0.5rem 0 0" }}>
                      <strong>A question to sit with:</strong>{" "}
                      {person.questionToConsider}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <p className="muted mt-2">
              Your report could not be generated automatically. The engine
              recommendations above are complete; try reloading for the written
              report.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="paper mt-3">
          <div className="btn-row">
            <Link href="/file" className="btn btn-gold">
              Open Printable Student File
            </Link>
            <Link href="/letter" className="btn">
              Read Official Letter
            </Link>
            <button className="btn btn-ghost" type="button" onClick={downloadFile}>
              Download JSON
            </button>
            <button className="btn btn-ghost" type="button" onClick={restart}>
              ↻ Restart
            </button>
          </div>
          <p className="tiny muted mt-2">
            The printable Student File is your PDF — open it and choose
            “Save as PDF.”
          </p>
        </div>

        <p className="center muted" style={{ fontStyle: "italic", marginTop: "1.5rem" }}>
          {CORE_LINE}
        </p>

        <p className="footer">
          <Link href="/">Office lobby</Link> ·{" "}
          <Link href="/admin">Registrar (local records)</Link>
        </p>
      </div>
    </main>
  );
}

function CourseCard({
  course,
  tag,
}: {
  course: { courseNumber: string; title: string; description: string; timeCommitment: string; costLabel: string; setting: string; socialLevel: string };
  tag: string;
}) {
  const social = course.socialLevel.replace("_", " ");
  return (
    <div className="mini-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
        <h4>
          {course.courseNumber} — {course.title}
        </h4>
        <span className="tiny" style={{ color: "var(--stamp-red)", fontFamily: "var(--sans)", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
          {tag}
        </span>
      </div>
      <p className="muted" style={{ margin: "0 0 0.4rem" }}>{course.description}</p>
      <div className="chips">
        <span className="chip">{course.timeCommitment}</span>
        <span className="chip">{course.costLabel}</span>
        <span className="chip">{course.setting}</span>
        <span className="chip">{social}</span>
      </div>
    </div>
  );
}

function DocBlock({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="doc-block">
      <div className="doc-head">
        <span className="doc-num">{n}</span>
        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{title}</h3>
      </div>
      <div className="doc-body">{children}</div>
    </div>
  );
}

function AiBadge({
  state,
  source,
}: {
  state: string;
  source?: "ai" | "template";
}) {
  if (state === "loading") {
    return <span className="chip">Writing…</span>;
  }
  if (source === "ai") {
    return <span className="chip" style={{ background: "rgba(27,42,71,.1)" }}>Personalized by your counselor</span>;
  }
  if (source === "template") {
    return (
      <span className="chip" title="Add ANTHROPIC_API_KEY to enable live AI personalization.">
        Draft letters
      </span>
    );
  }
  return null;
}

function CopyBox({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <pre className="prompt-box">{text}</pre>
      <button
        type="button"
        className="btn btn-ghost"
        style={{ minHeight: "40px", padding: "0.5rem 1rem" }}
        onClick={() => {
          navigator.clipboard?.writeText(text).then(
            () => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            },
            () => setCopied(false),
          );
        }}
      >
        {copied ? "Copied ✓" : "Copy prompt"}
      </button>
    </div>
  );
}
