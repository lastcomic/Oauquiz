"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Crest from "@/components/Crest";
import type { Submission } from "@/lib/types";
import { getAllSubmissions, clearAllSubmissions } from "@/lib/storage";
import { STUDENT_TYPE_BY_ID } from "@/data/studentTypes";
import { MAJOR_BY_ID } from "@/data/majors";
import { MINOR_BY_ID } from "@/data/minors";
import { ELECTIVE_BY_ID } from "@/data/electives";
import { CATEGORY_BY_ID, CATEGORY_IDS } from "@/data/categories";
import { QUESTIONS } from "@/data/questions";
import type { CategoryScores } from "@/lib/types";

export default function AdminPage() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSubs(getAllSubmissions());
    setLoaded(true);
  }, []);

  function clearAll() {
    if (
      window.confirm(
        "Permanently delete all locally stored submissions on this device?",
      )
    ) {
      clearAllSubmissions();
      setSubs([]);
    }
  }

  return (
    <main className="page">
      <div className="wrap">
        <Crest subtitle="Registrar · Local Records Office" />

        <div className="paper mt-3">
          <div
            className="btn-row"
            style={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <div>
              <span className="overline">Submitted Placement Exams</span>
              <h2 style={{ margin: "0.3rem 0 0", fontSize: "1.5rem" }}>
                {subs.length} record{subs.length === 1 ? "" : "s"} on this device
              </h2>
            </div>
            {subs.length > 0 ? (
              <button className="btn btn-ghost" type="button" onClick={clearAll}>
                Clear all records
              </button>
            ) : null}
          </div>
          <p className="tiny muted mt-2">
            Everything here is read from <code>localStorage</code>. No server, no
            network. Clearing your browser data clears this office.
          </p>
        </div>

        {!loaded ? (
          <p className="muted mt-3">Opening the filing cabinet…</p>
        ) : subs.length === 0 ? (
          <div className="paper mt-3 center">
            <p className="muted">
              No submissions yet. Complete the exam and it will be filed here.
            </p>
            <Link href="/quiz" className="btn mt-2">
              Take the Placement Exam →
            </Link>
          </div>
        ) : (
          <>
            {/* Summary table */}
            <div className="paper mt-3">
              <span className="overline">Summary</span>
              <div className="table-scroll mt-2">
                <table className="records">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Major</th>
                      <th>Minor</th>
                      <th>Filed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subs.map((s, i) => (
                      <tr key={s.id}>
                        <td>{subs.length - i}</td>
                        <td>{s.name}</td>
                        <td>
                          {STUDENT_TYPE_BY_ID[s.placement.studentTypeId]?.name ??
                            "—"}
                        </td>
                        <td>{MAJOR_BY_ID[s.placement.majorId]?.name ?? "—"}</td>
                        <td>{MINOR_BY_ID[s.placement.minorId]?.name ?? "—"}</td>
                        <td className="tiny">
                          {new Date(s.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Full detail per submission */}
            <div className="paper mt-3">
              <span className="overline">Full Answer Records</span>
              <div className="mt-2">
                {subs.map((s, i) => (
                  <RecordDetail key={s.id} sub={s} index={subs.length - i} />
                ))}
              </div>
            </div>
          </>
        )}

        <p className="footer">
          <Link href="/">Office lobby</Link> ·{" "}
          <Link href="/result">Latest placement</Link>
        </p>
      </div>
    </main>
  );
}

function RecordDetail({ sub, index }: { sub: Submission; index: number }) {
  const type = STUDENT_TYPE_BY_ID[sub.placement.studentTypeId];
  const major = MAJOR_BY_ID[sub.placement.majorId];
  const minor = MINOR_BY_ID[sub.placement.minorId];

  return (
    <details className="record">
      <summary>
        #{index} · <strong>{sub.name}</strong> — {type?.name ?? "—"}
      </summary>
      <div style={{ padding: "0.5rem 0.25rem" }}>
        <p className="kv">
          <b>Type:</b> {type?.name} &nbsp;|&nbsp; <b>Major:</b> {major?.name}{" "}
          &nbsp;|&nbsp; <b>Minor:</b> {minor?.name}
        </p>
        <p className="kv">
          <b>Electives:</b>{" "}
          {sub.placement.electiveIds
            .map((id) => ELECTIVE_BY_ID[id]?.name ?? id)
            .join(", ")}
        </p>

        <hr className="rule" />
        <p className="kv">
          <b>Category scores</b>
        </p>
        <ScoreMeters scores={sub.placement.scores} />

        <hr className="rule" />
        <p className="kv">
          <b>Answers</b>
        </p>
        {QUESTIONS.map((q) => {
          const raw = sub.answers[q.id];
          const display = formatAnswer(q.id, raw);
          return (
            <p key={q.id} className="kv" style={{ margin: "0.35rem 0" }}>
              <span className="muted">{q.prompt}</span>
              <br />
              <b>{display || "—"}</b>
            </p>
          );
        })}
      </div>
    </details>
  );
}

function ScoreMeters({ scores }: { scores: CategoryScores }) {
  const max = Math.max(1, ...CATEGORY_IDS.map((id) => scores[id]));
  return (
    <div>
      {CATEGORY_IDS.map((id) => {
        const val = scores[id] ?? 0;
        const pct = Math.round((val / max) * 100);
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
  );
}

/** Human-readable answer for a stored value. */
function formatAnswer(
  qid: string,
  raw: string | string[] | undefined,
): string {
  const q = QUESTIONS.find((x) => x.id === qid);
  if (!q) return "";
  if (raw === undefined) return "";
  if (q.kind === "open") {
    return Array.isArray(raw) ? raw.join(" ") : raw;
  }
  const ids = Array.isArray(raw) ? raw : [raw];
  return ids
    .map((id) => q.choices?.find((c) => c.id === id)?.label ?? id)
    .join("; ");
}
