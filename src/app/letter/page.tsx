"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Submission } from "@/lib/types";
import { getCurrentSubmission } from "@/lib/storage";
import { STUDENT_TYPE_BY_ID } from "@/data/studentTypes";
import { MAJOR_BY_ID } from "@/data/majors";
import { MINOR_BY_ID } from "@/data/minors";
import {
  LETTER_BODIES,
  HUMOROUS_OBSERVATIONS,
  SEVEN_DAY_ASSIGNMENTS,
  fillTemplate,
  OFFICE_NAME,
  UNIVERSITY_NAME,
} from "@/data/letterTemplates";

export default function LetterPage() {
  const [sub, setSub] = useState<Submission | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSub(getCurrentSubmission());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <main className="page">
        <div className="wrap center muted">Preparing your letter…</div>
      </main>
    );
  }

  if (!sub) {
    return (
      <main className="page">
        <div className="wrap center">
          <div className="paper mt-3">
            <h2>No letter on file</h2>
            <p className="muted">Complete the placement exam first.</p>
            <Link href="/quiz" className="btn mt-2">
              Take the Placement Exam →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { name, placement } = sub;
  const type = STUDENT_TYPE_BY_ID[placement.studentTypeId];
  const major = MAJOR_BY_ID[placement.majorId];
  const minor = MINOR_BY_ID[placement.minorId];
  const topCategory = placement.rankedCategories[0];

  const tokens = {
    name,
    type: type.name,
    major: major.name,
    minor: minor.name,
  };
  const body = fillTemplate(LETTER_BODIES[type.id] ?? "", tokens);
  const observation = HUMOROUS_OBSERVATIONS[topCategory];
  const firstAssignment = SEVEN_DAY_ASSIGNMENTS[topCategory][0];

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
            ⎙ Print / Save as PDF
          </button>
        </div>

        <article className="letter-sheet">
          <header className="letter-head">
            <div className="crest-mark" style={{ margin: "0 auto 0.6rem" }}>
              OAU
            </div>
            <h2 style={{ marginBottom: "0.15rem", letterSpacing: "0.02em" }}>
              {UNIVERSITY_NAME}
            </h2>
            <p className="overline" style={{ display: "block" }}>
              {OFFICE_NAME}
            </p>
            <p className="tiny muted" style={{ margin: 0 }}>
              Bureau of Second Drafts · Desk of the Guidance Counselor
            </p>
          </header>

          <div className="letter-body">
            <p className="tiny muted" style={{ marginBottom: "1.4rem" }}>
              {dateStr}
            </p>

            <p className="letter-salutation">Dear {name},</p>

            <p>
              Following your recent examination, this Office is pleased to
              confirm your placement as a <strong>{type.name}</strong>. The
              designation is not a diagnosis. It is a recognition — of something
              you have, in fact, known about yourself for a while.
            </p>

            <p>{body}</p>

            <p>
              <em>An observation from your file:</em> {observation}
            </p>

            <p>
              <em>Your first assignment</em>, effective immediately and lasting
              precisely seven days: {stripDay(firstAssignment)} The remaining six
              days are printed on your placement page, should you need them.
            </p>

            <p>
              You are not starting over. You are starting from the most informed
              position of your life. We look forward to seeing what you do with
              it.
            </p>

            <div className="letter-sign">
              <div className="sign-row">
                <div>
                  <p style={{ margin: 0 }}>With genuine regard,</p>
                  <p className="signature">A. Counselor</p>
                  <p className="tiny muted" style={{ margin: 0 }}>
                    Dean of Guidance &amp; Placement · {UNIVERSITY_NAME}
                  </p>
                </div>
                <div className="seal">
                  <div className="stamp-round">
                    Office of
                    <br />
                    Guidance &amp;
                    <br />
                    Placement
                  </div>
                </div>
              </div>
            </div>

            <p
              className="tiny muted"
              style={{ marginTop: "1.6rem", borderTop: "1px solid var(--line)", paddingTop: "0.8rem" }}
            >
              Filed under: {type.name} · Major in {major.name} · Minor in{" "}
              {minor.name}. This letter is a Phase-One prototype; final
              stationery and signatures pending.
            </p>
          </div>
        </article>

        <p className="footer no-print">
          <Link href="/">Office lobby</Link> ·{" "}
          <Link href="/result">Placement</Link>
        </p>
      </div>
    </main>
  );
}

/** Turn "Day 1 — Clear one square foot…" into a clean inline clause. */
function stripDay(line: string): string {
  const cleaned = line.replace(/^Day\s*\d+\s*—\s*/i, "").trim();
  return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
}
