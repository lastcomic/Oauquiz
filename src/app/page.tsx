import Link from "next/link";
import OauSeal from "@/components/OauSeal";
import { CORE_LINE, UNIVERSITY_NAME, MOTTO } from "@/data/brand";
import { QUESTIONS } from "@/data/questions";

export default function LandingPage() {
  return (
    <main className="page">
      <div className="wrap">
        <section className="hero">
          <div style={{ display: "flex", justifyContent: "center" }}>
            <OauSeal size={96} />
          </div>
          <p className="overline" style={{ marginTop: "0.9rem" }}>
            {UNIVERSITY_NAME} · Office of Guidance &amp; Placement
          </p>
          <h1 className="hero-title">
            The Placement <span className="gold">Exam</span>
          </h1>
          <p className="tiny" style={{ color: "var(--gold)", letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>
            The Second Draft · For the Youngest of the Old People
          </p>

          <hr className="hero-rule" />

          <p className="hero-quote">“What do you want to be when you grow up?”</p>
          <p className="muted" style={{ maxWidth: "34rem", margin: "0 auto" }}>
            An official — if lightly amused — examination for the second half of
            life. The difference this time is that you actually know a few
            things.
          </p>

          <div className="btn-row mt-3" style={{ justifyContent: "center" }}>
            <Link href="/quiz" className="btn btn-gold btn-block">
              Begin the Placement Exam →
            </Link>
          </div>
          <p className="tiny mt-2" style={{ color: "rgba(232,220,196,0.6)" }}>
            {QUESTIONS.length} questions · about six minutes · free
          </p>

          <span className="motto-tag">{MOTTO}</span>
        </section>

        <div className="paper mt-3">
          <p className="center" style={{ fontSize: "1.15rem", color: "var(--charcoal)", margin: 0 }}>
            <strong>{CORE_LINE}</strong>
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
