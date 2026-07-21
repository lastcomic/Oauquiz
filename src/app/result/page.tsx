"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Crest from "@/components/Crest";
import type { Submission } from "@/lib/types";
import { getCurrentSubmission, clearCurrentSubmission } from "@/lib/storage";
import { STUDENT_TYPE_BY_ID } from "@/data/studentTypes";
import { MAJOR_BY_ID } from "@/data/majors";
import { MINOR_BY_ID } from "@/data/minors";
import { ELECTIVE_BY_ID } from "@/data/electives";
import { CATEGORY_BY_ID } from "@/data/categories";
import {
  COUNSELOR_MESSAGES,
  SEVEN_DAY_ASSIGNMENTS,
  fillTemplate,
  CORE_LINE,
} from "@/data/letterTemplates";

export default function ResultPage() {
  const [sub, setSub] = useState<Submission | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSub(getCurrentSubmission());
    setLoaded(true);
  }, []);

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
              We couldn&apos;t find a completed exam on this device. The Office
              suggests starting one.
            </p>
            <Link href="/quiz" className="btn mt-2">
              Take the Placement Exam →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { placement, name } = sub;
  const type = STUDENT_TYPE_BY_ID[placement.studentTypeId];
  const major = MAJOR_BY_ID[placement.majorId];
  const minor = MINOR_BY_ID[placement.minorId];
  const electives = placement.electiveIds
    .map((id) => ELECTIVE_BY_ID[id])
    .filter(Boolean);
  const topCategory = placement.rankedCategories[0];
  const assignment = SEVEN_DAY_ASSIGNMENTS[topCategory];
  const counselor = fillTemplate(
    COUNSELOR_MESSAGES[type.id] ?? "",
    { name, type: type.name, major: major.name, minor: minor.name },
  );

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

        {/* Placement certificate */}
        <div className="paper mt-3" style={{ position: "relative" }}>
          <div style={{ position: "absolute", right: "1rem", top: "1rem" }}>
            <span className="stamp">Placed</span>
          </div>

          <p className="overline" style={{ paddingRight: "5.5rem" }}>
            Certificate of Placement
          </p>
          <h1 style={{ fontSize: "1.9rem", marginTop: "0.4rem" }}>{name}</h1>
          <p className="muted" style={{ marginTop: "-0.4rem" }}>
            has been reviewed by the Office of Guidance &amp; Placement and
            assigned the following.
          </p>

          <hr className="rule" />

          <div className="field-row">
            <span className="field-key">Student Type</span>
            <span className="field-val">{type.name}</span>
            <span className="muted field-note">{type.tagline}</span>
          </div>
          <p className="field-note" style={{ marginTop: "0.6rem" }}>
            {type.description}
          </p>

          <hr className="rule" />

          <div className="field-row">
            <span className="field-key">Recommended Major</span>
            <span className="field-val">{major.name}</span>
            <span className="muted field-note">{major.description}</span>
          </div>
          <div className="field-row">
            <span className="field-key">Recommended Minor</span>
            <span className="field-val">{minor.name}</span>
            <span className="muted field-note">{minor.description}</span>
          </div>
        </div>

        {/* Electives */}
        <div className="paper mt-3">
          <span className="overline">Three Electives</span>
          <div className="card-list mt-2">
            {electives.map((e) => (
              <div key={e.id} className="mini-card">
                <h4>{e.name}</h4>
                <p className="muted">{e.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Seven-day assignment */}
        <div className="paper mt-3">
          <span className="overline">First Assignment · Seven Days</span>
          <p className="muted field-note mt-1">
            Oriented around your strongest signal:{" "}
            <strong>{CATEGORY_BY_ID[topCategory].label}</strong>.
          </p>
          <div className="mt-2">
            {assignment.map((line, i) => (
              <div key={i} className="assignment-day">
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Counselor message */}
        <div className="paper mt-3">
          <span className="overline">A Note From Your Guidance Counselor</span>
          <p style={{ fontSize: "1.08rem", marginTop: "0.8rem" }}>{counselor}</p>
          <p
            className="muted"
            style={{ fontStyle: "italic", marginBottom: 0 }}
          >
            {CORE_LINE}
          </p>
        </div>

        {/* Actions */}
        <div className="paper mt-3">
          <div className="btn-row">
            <Link href="/letter" className="btn btn-gold">
              Read My Official Letter
            </Link>
            <button className="btn" type="button" onClick={downloadFile}>
              Download My Student File
            </button>
            <button className="btn btn-ghost" type="button" onClick={restart}>
              ↻ Restart the Exam
            </button>
          </div>
          <p className="tiny muted mt-2">
            “Download My Student File” saves your answers and placement as a JSON
            file to this device.
          </p>
        </div>

        {/* Coming later placeholder */}
        <div className="coming-later mt-3">
          <span className="placeholder-tag">Coming Later · Placeholder</span>
          <h3 style={{ marginBottom: "0.4rem" }}>
            Your Private Second Draft Advisor
          </h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            A future term will pair you with a private advisor who reads your
            open responses, remembers your “someday,” and helps you turn this
            placement into an actual next step. Final copy and features are
            pending — this section is a labeled placeholder for Phase Two.
          </p>
        </div>

        <p className="footer">
          <Link href="/" className="no-print">
            Office lobby
          </Link>{" "}
          ·{" "}
          <Link href="/admin" className="no-print">
            Registrar (local records)
          </Link>
        </p>
      </div>
    </main>
  );
}
