import Link from "next/link";
import OauSeal from "@/components/OauSeal";
import BrandImage from "@/components/BrandImage";
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

        {/* Companion book + society branding (appears when artwork is added to /public) */}
        <div className="paper mt-3">
          <div className="book-row">
            <BrandImage
              src="/book-cover.png"
              alt="Freshman Class of Old Age — the book"
              maxHeight={190}
            />
            <div>
              <span className="overline">The Companion Text</span>
              <h3 style={{ margin: "0.35rem 0 0.3rem" }}>
                Freshman Class of Old Age
              </h3>
              <p className="muted field-note">
                The orientation you never got for the second half. The book from
                John Heffron — winner of NBC&apos;s <em>Last Comic Standing</em>.
              </p>
              <a
                className="btn btn-ghost"
                href="https://johnheffron.com"
                target="_blank"
                rel="noreferrer"
                style={{ minHeight: "40px", padding: "0.5rem 1rem" }}
              >
                Visit johnheffron.com →
              </a>
            </div>
          </div>
        </div>

        <div className="center mt-3">
          <div className="brand-strip">
            <BrandImage
              src="/second-draft-society.png"
              alt="The Second Draft Society"
              maxHeight={96}
            />
            <BrandImage
              src="/youngest-of-old-people.png"
              alt="The Youngest of the Old People"
              maxHeight={96}
            />
          </div>
        </div>

        <p className="footer">
          A project of The Second Draft Society ·{" "}
          <a href="https://johnheffron.com" target="_blank" rel="noreferrer">
            johnheffron.com
          </a>{" "}
          ·{" "}
          <Link href="/admin" className="no-print">
            Registrar
          </Link>
        </p>
      </div>
    </main>
  );
}
