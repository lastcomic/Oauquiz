"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Personalization, Submission } from "@/lib/types";
import { getCurrentSubmission } from "@/lib/storage";
import { effectivePlacement } from "@/lib/submission";
import { buildContext, buildFallback } from "@/lib/personalize";
import { STUDENT_TYPE_BY_ID } from "@/data/studentTypes";
import { MAJOR_BY_ID } from "@/data/majors";
import { MINOR_BY_ID } from "@/data/minors";
import { COURSE_BY_ID } from "@/data/courses";
import { AUDIO_BY_ID } from "@/data/audioLessons";
import { ASSIGNMENT_BY_ID } from "@/data/assignments";
import { CATEGORY_BY_ID } from "@/data/categories";
import { UNIVERSITY_NAME, OFFICE_NAME, MOTTO } from "@/data/brand";
import OauSeal from "@/components/OauSeal";

export default function FilePage() {
  const [sub, setSub] = useState<Submission | null>(null);
  const [person, setPerson] = useState<Personalization | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const s = getCurrentSubmission();
    setSub(s);
    if (s) setPerson(s.personalization ?? buildFallback(buildContext(s)));
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <main className="page">
        <div className="wrap center muted">Assembling your file…</div>
      </main>
    );
  }
  if (!sub || !person) {
    return (
      <main className="page">
        <div className="wrap center">
          <div className="paper mt-3">
            <h2>No student file on record</h2>
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
  const electives = p.electiveIds.map((id) => COURSE_BY_ID[id]);
  const audio = AUDIO_BY_ID[p.audioLessonId];
  const assignment = ASSIGNMENT_BY_ID[p.assignmentId];
  const L = person.guidanceLetter;
  const dateStr = new Date(sub.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="page">
      <div className="wrap">
        <div className="btn-row no-print mb-2" style={{ justifyContent: "space-between" }}>
          <Link href="/result" className="btn btn-ghost">
            ← Back to placement
          </Link>
          <button className="btn" type="button" onClick={() => window.print()}>
            ⎙ Save as PDF / Print
          </button>
        </div>

        <article className="letter-sheet">
          {/* Letterhead */}
          <header className="letter-head">
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.6rem" }}>
              <OauSeal size={60} />
            </div>
            <h2 style={{ marginBottom: "0.15rem" }}>{UNIVERSITY_NAME}</h2>
            <p className="overline" style={{ display: "block" }}>
              Official Student File · {OFFICE_NAME}
            </p>
            <p className="tiny muted" style={{ margin: 0 }}>
              {name} · Filed {dateStr}
            </p>
          </header>

          {/* Placement summary */}
          <section className="file-section">
            <h3>Placement</h3>
            <div className="transcript-line"><span>Student Type</span><strong>{type.name}</strong></div>
            <div className="transcript-line"><span>Major</span><strong>{major.code} · {major.name}</strong></div>
            <div className="transcript-line"><span>Minor</span><strong>{minor.code} · {minor.name}</strong></div>
          </section>

          {/* Transcript */}
          <section className="file-section">
            <h3>Transcript · Strength Profile</h3>
            {p.rankedCategories.map((id) => (
              <div key={id} className="transcript-line">
                <span>{CATEGORY_BY_ID[id].label}</span>
                <strong>{p.scores[id]}</strong>
              </div>
            ))}
          </section>

          {/* Schedule */}
          <section className="file-section">
            <h3>Course Schedule · First Term</h3>
            <div style={{ overflowX: "auto" }}>
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Time</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{required.courseNumber}</td>
                    <td>{required.title}</td>
                    <td>Required</td>
                    <td>{required.timeCommitment}</td>
                    <td>{required.costLabel}</td>
                  </tr>
                  {electives.map((e) => (
                    <tr key={e.id}>
                      <td>{e.courseNumber}</td>
                      <td>{e.title}</td>
                      <td>Elective</td>
                      <td>{e.timeCommitment}</td>
                      <td>{e.costLabel}</td>
                    </tr>
                  ))}
                  <tr>
                    <td>{audio.code}</td>
                    <td>{audio.title}</td>
                    <td>Audio</td>
                    <td>{audio.minutes} min</td>
                    <td>—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Guidance letter */}
          <section className="file-section page-break">
            <h3>Guidance Counselor Letter</h3>
            <p className="tiny muted">Re: {L.subjectLine}</p>
            <p>{L.opening}</p>
            <p>{L.assessment}</p>
            <p>{L.recommendation}</p>
            <p>{L.closing}</p>
          </section>

          {/* Why these courses */}
          <section className="file-section">
            <h3>Why We Chose These Courses</h3>
            <p>{person.whyTheseCourses.intro}</p>
            <p><strong>Student type.</strong> {person.whyTheseCourses.studentType}</p>
            <p><strong>Major.</strong> {person.whyTheseCourses.major}</p>
            <p><strong>Minor.</strong> {person.whyTheseCourses.minor}</p>
            <p><strong>Required course.</strong> {person.whyTheseCourses.requiredCourse}</p>
            {person.whyTheseCourses.electives.map((e) => (
              <p key={e.id}>
                <strong>{COURSE_BY_ID[e.id]?.title ?? "Elective"}.</strong> {e.text}
              </p>
            ))}
          </section>

          {/* Second draft summary */}
          <section className="file-section">
            <h3>Your Second Draft Summary</h3>
            <p>{person.secondDraftSummary}</p>
          </section>

          {/* Seven-day assignment */}
          <section className="file-section">
            <h3>Seven-Day Assignment · {assignment.title}</h3>
            <p className="muted">{person.sevenDayIntro}</p>
            {assignment.days.map((d, i) => (
              <div key={i} className="assignment-day">{d}</div>
            ))}
            <p className="tiny muted mt-1">
              <strong>Done when:</strong> {assignment.successMeasure}
            </p>
          </section>

          {/* Dean's message */}
          <section className="file-section">
            <h3>Message from the Dean</h3>
            <p style={{ fontStyle: "italic" }}>“{person.deansMessage}”</p>
          </section>

          {/* Advisor prompt */}
          <section className="file-section">
            <h3>Your Private AI Advisor Prompt</h3>
            <p className="tiny muted">Paste into ChatGPT, Claude, or Gemini.</p>
            <pre className="prompt-box">{person.advisorPrompt}</pre>
          </section>

          {/* Signature */}
          <div className="letter-sign">
            <div className="sign-row">
              <div>
                <p style={{ margin: 0 }}>Certified by the Office of Guidance &amp; Placement,</p>
                <p className="signature">A. Counselor</p>
                <p className="tiny" style={{ margin: 0, color: "var(--stamp-red)", fontFamily: "var(--sans)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {MOTTO}
                </p>
              </div>
              <div className="seal">
                <div className="stamp-round">
                  Office of<br />Guidance &amp;<br />Placement
                </div>
              </div>
            </div>
          </div>
        </article>

        <p className="footer no-print">
          <Link href="/">Office lobby</Link> · <Link href="/result">Placement</Link>
        </p>
      </div>
    </main>
  );
}
