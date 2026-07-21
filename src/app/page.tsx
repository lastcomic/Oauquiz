import Link from "next/link";
import Crest from "@/components/Crest";
import { CORE_LINE } from "@/data/letterTemplates";
import { QUESTIONS } from "@/data/questions";

export default function LandingPage() {
  return (
    <main className="page">
      <div className="wrap">
        <Crest subtitle="Office of Guidance & Placement" />

        <div className="paper mt-3">
          <p className="overline center">The Second Draft</p>
          <h1 className="serif-display center" style={{ marginBottom: "0.6rem" }}>
            The Placement Exam
          </h1>
          <p className="center muted" style={{ fontSize: "1.1rem" }}>
            An official — if lightly amused — examination for the second half of
            life. We reask the oldest question in the catalog:
          </p>
          <p
            className="center"
            style={{
              fontSize: "1.35rem",
              color: "var(--navy)",
              fontStyle: "italic",
              margin: "1.2rem 0",
            }}
          >
            “What do you want to be when you grow up?”
          </p>
          <p className="center muted">
            The difference this time is that you actually know a few things.
          </p>

          <hr className="rule-double" />

          <p
            className="center"
            style={{ fontSize: "1.15rem", color: "var(--charcoal)" }}
          >
            <strong>{CORE_LINE}</strong>
          </p>

          <div className="btn-row mt-3" style={{ justifyContent: "center" }}>
            <Link href="/quiz" className="btn btn-block">
              Begin the Placement Exam →
            </Link>
          </div>
          <p className="center tiny muted mt-2">
            {QUESTIONS.length} questions · about six minutes · no account, no
            email, nothing leaves this device.
          </p>
        </div>

        <div className="paper mt-3">
          <span className="overline">What this is</span>
          <div className="stack mt-2">
            <div>
              <p style={{ margin: 0 }}>
                Walk into the <em>Office of Guidance &amp; Placement</em>, sit
                down, and fill out the form. We read your answers, assign you a{" "}
                <strong>student type</strong>, and hand you a{" "}
                <strong>major</strong>, a <strong>minor</strong>, three{" "}
                <strong>electives</strong>, and a seven-day first assignment.
              </p>
            </div>
            <div>
              <span className="overline">What this is not</span>
              <p className="muted" style={{ margin: "0.35rem 0 0" }}>
                Not a personality quiz. Not a self-help seminar. Not a retirement
                calculator. Nobody here will tell you to “find your passion.” We
                assume you already have several and simply misplaced the form.
              </p>
            </div>
          </div>
        </div>

        <p className="footer">
          A prototype of the Office of Guidance &amp; Placement ·{" "}
          <Link href="/admin" className="no-print">
            Registrar (local records)
          </Link>
        </p>
      </div>
    </main>
  );
}
