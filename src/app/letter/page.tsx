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
import { UNIVERSITY_NAME, OFFICE_NAME, MOTTO } from "@/data/brand";
import { COUNSELOR } from "@/lib/personalize";

export default function LetterPage() {
  const [sub, setSub] = useState<Submission | null>(null);
  const [person, setPerson] = useState<Personalization | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const s = getCurrentSubmission();
    setSub(s);
    if (s) {
      setPerson(s.personalization ?? buildFallback(buildContext(s)));
    }
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <main className="page">
        <div className="wrap center muted">Preparing your letter…</div>
      </main>
    );
  }

  if (!sub || !person) {
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

  const p = effectivePlacement(sub);
  const name = sub.name;
  const type = STUDENT_TYPE_BY_ID[p.studentTypeId];
  const major = MAJOR_BY_ID[p.majorId];
  const minor = MINOR_BY_ID[p.minorId];
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
            <p className="tiny muted" style={{ marginBottom: "0.4rem" }}>
              {dateStr}
            </p>
            <p className="overline" style={{ marginBottom: "1.2rem" }}>
              Re: {L.subjectLine}
            </p>

            <p>{L.opening}</p>
            <p>{L.assessment}</p>
            <p>{L.recommendation}</p>
            <p>{L.closing}</p>

            <div className="letter-sign">
              <div className="sign-row">
                <div>
                  <p className="signature">{COUNSELOR.name}</p>
                  <p className="tiny muted" style={{ margin: 0 }}>
                    {COUNSELOR.title}
                  </p>
                  <p className="tiny" style={{ margin: "0.6rem 0 0", color: "var(--stamp-red)", fontFamily: "var(--sans)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {MOTTO}
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
              {minor.name}.
              {person.source === "template"
                ? " (Draft letter — live AI personalization enables when a counselor key is configured.)"
                : ""}
            </p>
          </div>
        </article>

        <p className="footer no-print">
          <Link href="/">Office lobby</Link> · <Link href="/result">Placement</Link> ·{" "}
          <Link href="/file">Full student file</Link>
        </p>
      </div>
    </main>
  );
}
