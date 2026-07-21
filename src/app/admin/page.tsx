"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Crest from "@/components/Crest";
import type { Personalization, Submission } from "@/lib/types";
import {
  getAllSubmissions,
  clearAllSubmissions,
  updateSubmission,
  setPersonalization,
} from "@/lib/storage";
import { effectivePlacement } from "@/lib/submission";
import { buildContext, buildFallback } from "@/lib/personalize";
import { STUDENT_TYPES, STUDENT_TYPE_BY_ID } from "@/data/studentTypes";
import { MAJOR_BY_ID } from "@/data/majors";
import { MINOR_BY_ID } from "@/data/minors";
import {
  COURSE_BY_ID,
  REQUIRED_COURSES,
  ELECTIVE_COURSES,
} from "@/data/courses";

export default function AdminPage() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loaded, setLoaded] = useState(false);

  function refresh() {
    setSubs(getAllSubmissions());
  }
  useEffect(() => {
    refresh();
    setLoaded(true);
  }, []);

  const stats = useMemo(() => computeStats(subs), [subs]);

  function clearAll() {
    if (window.confirm("Permanently delete all locally stored submissions on this device?")) {
      clearAllSubmissions();
      refresh();
    }
  }

  function exportCsv() {
    const header = [
      "id", "name", "age", "email", "student_type", "major", "minor",
      "required_course", "elective_1", "elective_2", "elective_3",
      "audio", "created_at", "overridden", "purchased", "delivered_at",
    ];
    const rows = subs.map((s) => {
      const p = effectivePlacement(s);
      const els = p.electiveIds.map((id) => COURSE_BY_ID[id]?.courseNumber ?? id);
      return [
        s.id,
        s.name,
        (s.answers["q01b_age"] as string) ?? "",
        s.order?.email ?? "",
        STUDENT_TYPE_BY_ID[p.studentTypeId]?.name ?? "",
        MAJOR_BY_ID[p.majorId]?.name ?? "",
        MINOR_BY_ID[p.minorId]?.name ?? "",
        COURSE_BY_ID[p.requiredCourseId]?.courseNumber ?? "",
        els[0] ?? "", els[1] ?? "", els[2] ?? "",
        p.audioLessonId,
        s.createdAt,
        s.overrides ? "yes" : "no",
        s.order?.purchased ? "yes" : "no",
        s.order?.deliveredAt ?? "",
      ];
    });
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "oau-submissions.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <main className="page">
      <div className="wrap">
        <Crest subtitle="Registrar · Local Records & Dashboard" />

        <div className="paper mt-3">
          <div className="btn-row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="overline">Admin Dashboard</span>
              <h2 style={{ margin: "0.3rem 0 0", fontSize: "1.5rem" }}>
                {subs.length} record{subs.length === 1 ? "" : "s"} on this device
              </h2>
              <p className="tiny muted" style={{ margin: "0.2rem 0 0" }}>
                {subs.filter((s) => s.order?.purchased).length} purchased ·{" "}
                {subs.filter((s) => s.order?.deliveredAt).length} delivered
              </p>
            </div>
            {subs.length > 0 ? (
              <div className="btn-row">
                <button className="btn btn-ghost" type="button" onClick={exportCsv}>
                  Export CSV
                </button>
                <button className="btn btn-ghost" type="button" onClick={clearAll}>
                  Clear all
                </button>
              </div>
            ) : null}
          </div>
          <p className="tiny muted mt-2">
            Records, edits, and regenerated letters are stored in this browser&apos;s
            <code> localStorage</code> — this dashboard is per-device (a shared
            database arrives with Phase 2B).
          </p>
        </div>

        {!loaded ? (
          <p className="muted mt-3">Opening the filing cabinet…</p>
        ) : subs.length === 0 ? (
          <div className="paper mt-3 center">
            <p className="muted">No submissions yet.</p>
            <Link href="/quiz" className="btn mt-2">Take the Placement Exam →</Link>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="paper mt-3">
              <span className="overline">Quiz Statistics</span>
              <div className="stats-grid mt-2">
                <StatList title="Most common student types" rows={stats.types} />
                <StatList title="Most assigned electives" rows={stats.electives} />
                <StatList title="Most assigned majors" rows={stats.majors} />
              </div>
            </div>

            {/* Records */}
            <div className="paper mt-3">
              <span className="overline">Records · Edit &amp; Regenerate</span>
              <div className="mt-2">
                {subs.map((s, i) => (
                  <RecordEditor
                    key={s.id}
                    sub={s}
                    index={subs.length - i}
                    onChange={refresh}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        <p className="footer">
          <Link href="/">Office lobby</Link> · <Link href="/result">Latest placement</Link>
        </p>
      </div>
    </main>
  );
}

function StatList({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <div>
      <p className="field-key" style={{ marginBottom: "0.4rem" }}>{title}</p>
      {rows.length === 0 ? (
        <p className="tiny muted">—</p>
      ) : (
        rows.map(([label, n]) => (
          <div key={label} className="transcript-line">
            <span className="tiny">{label}</span>
            <strong className="tiny">{n}</strong>
          </div>
        ))
      )}
    </div>
  );
}

function RecordEditor({
  sub,
  index,
  onChange,
}: {
  sub: Submission;
  index: number;
  onChange: () => void;
}) {
  const p = effectivePlacement(sub);
  const [typeId, setTypeId] = useState(p.studentTypeId);
  const [reqId, setReqId] = useState(p.requiredCourseId);
  const [els, setEls] = useState<string[]>(p.electiveIds);
  const [busy, setBusy] = useState<null | "save" | "regen" | "resend">(null);
  const [msg, setMsg] = useState<string | null>(null);

  const dirty =
    typeId !== p.studentTypeId ||
    reqId !== p.requiredCourseId ||
    els.join() !== p.electiveIds.join();

  function saveOverrides() {
    const req = COURSE_BY_ID[reqId];
    updateSubmission(sub.id, {
      overrides: {
        studentTypeId: typeId,
        requiredCourseId: reqId,
        electiveIds: els,
        // keep audio + assignment consistent with the (possibly new) required course
        audioLessonId: req?.relatedAudioLesson ?? p.audioLessonId,
        assignmentId: req?.firstAssignment ?? p.assignmentId,
      },
      personalization: undefined, // invalidate cached letter; regenerate below
    });
    setMsg("Saved. Regenerate the report to refresh the letter.");
    onChange();
  }

  function resetOverrides() {
    updateSubmission(sub.id, { overrides: undefined, personalization: undefined });
    setTypeId(sub.placement.studentTypeId);
    setReqId(sub.placement.requiredCourseId);
    setEls(sub.placement.electiveIds);
    setMsg("Reset to the engine's original recommendation.");
    onChange();
  }

  async function regenerate() {
    setBusy("regen");
    setMsg(null);
    // Ensure current edits are persisted first so context reflects them.
    if (dirty) saveOverrides();
    const latest = getLatest(sub.id) ?? sub;
    try {
      const context = buildContext(latest);
      const res = await fetch("/api/personalize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ context }),
      });
      const person = (await res.json()) as Personalization;
      setPersonalization(sub.id, person);
      setMsg(`Report regenerated (${person.source === "ai" ? "AI" : "template"}).`);
      onChange();
    } catch {
      setMsg("Could not regenerate. Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function resendEmail() {
    const latest = getLatest(sub.id) ?? sub;
    let email = latest.order?.email;
    if (!email) {
      email = window.prompt("Send the Student File to which email?") ?? "";
      if (!email) return;
    }
    setBusy("resend");
    setMsg(null);
    try {
      const context = buildContext(latest);
      const personalization = latest.personalization ?? buildFallback(context);
      const res = await fetch("/api/resend", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, context, personalization }),
      });
      const d = await res.json();
      if (!res.ok || d.error) {
        setMsg(d.error || "Could not send.");
      } else {
        updateSubmission(sub.id, {
          order: {
            ...(latest.order ?? {}),
            email,
            purchased: true,
            deliveredAt: new Date().toISOString(),
          },
        });
        setMsg(d.simulated ? `Simulated send to ${email}.` : `Emailed to ${email}.`);
        onChange();
      }
    } catch {
      setMsg("Could not send.");
    } finally {
      setBusy(null);
    }
  }

  function setElective(i: number, value: string) {
    setEls((cur) => cur.map((v, idx) => (idx === i ? value : v)));
  }

  return (
    <details className="record">
      <summary>
        #{index} · <strong>{sub.name}</strong> — {STUDENT_TYPE_BY_ID[p.studentTypeId]?.name}
        {sub.overrides ? " · (overridden)" : ""}
      </summary>
      <div style={{ padding: "0.6rem 0.25rem" }}>
        <p className="kv">
          <b>Filed:</b> {new Date(sub.createdAt).toLocaleString()} &nbsp;|&nbsp;
          <b> Major:</b> {MAJOR_BY_ID[p.majorId]?.name} &nbsp;|&nbsp;
          <b> Minor:</b> {MINOR_BY_ID[p.minorId]?.name}
        </p>
        <p className="kv">
          <b>Email:</b> {sub.order?.email || "—"} &nbsp;|&nbsp;
          <b> Purchased:</b> {sub.order?.purchased ? "yes" : "no"} &nbsp;|&nbsp;
          <b> Delivered:</b>{" "}
          {sub.order?.deliveredAt
            ? new Date(sub.order.deliveredAt).toLocaleString()
            : "—"}
        </p>

        <div className="edit-grid mt-2">
          <label className="edit-field">
            <span>Student type</span>
            <select value={typeId} onChange={(e) => setTypeId(e.target.value)}>
              {STUDENT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </label>
          <label className="edit-field">
            <span>Required course</span>
            <select value={reqId} onChange={(e) => setReqId(e.target.value)}>
              {REQUIRED_COURSES.map((c) => (
                <option key={c.id} value={c.id}>{c.courseNumber} — {c.title}</option>
              ))}
            </select>
          </label>
          {els.map((elId, i) => (
            <label key={i} className="edit-field">
              <span>Elective {i + 1}</span>
              <select value={elId} onChange={(e) => setElective(i, e.target.value)}>
                {ELECTIVE_COURSES.map((c) => (
                  <option key={c.id} value={c.id}>{c.courseNumber} — {c.title}</option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <div className="btn-row mt-2">
          <button
            className="btn"
            type="button"
            style={{ minHeight: "40px", padding: "0.5rem 1rem" }}
            disabled={!dirty || busy !== null}
            onClick={saveOverrides}
          >
            Save overrides
          </button>
          <button
            className="btn btn-gold"
            type="button"
            style={{ minHeight: "40px", padding: "0.5rem 1rem" }}
            disabled={busy !== null}
            onClick={regenerate}
          >
            {busy === "regen" ? "Regenerating…" : "Regenerate report"}
          </button>
          {sub.overrides ? (
            <button
              className="btn btn-ghost"
              type="button"
              style={{ minHeight: "40px", padding: "0.5rem 1rem" }}
              disabled={busy !== null}
              onClick={resetOverrides}
            >
              Reset to engine
            </button>
          ) : null}
          <button
            className="btn btn-ghost"
            type="button"
            style={{ minHeight: "40px", padding: "0.5rem 1rem" }}
            disabled={busy !== null}
            onClick={resendEmail}
          >
            {busy === "resend" ? "Sending…" : "Resend email"}
          </button>
        </div>
        {msg ? <p className="tiny muted mt-2">{msg}</p> : null}
      </div>
    </details>
  );
}

function getLatest(id: string): Submission | null {
  return getAllSubmissions().find((s) => s.id === id) ?? null;
}

function computeStats(subs: Submission[]) {
  const typeCount = new Map<string, number>();
  const electiveCount = new Map<string, number>();
  const majorCount = new Map<string, number>();
  for (const s of subs) {
    const p = effectivePlacement(s);
    inc(typeCount, STUDENT_TYPE_BY_ID[p.studentTypeId]?.name ?? p.studentTypeId);
    inc(majorCount, MAJOR_BY_ID[p.majorId]?.name ?? p.majorId);
    for (const id of p.electiveIds) {
      inc(electiveCount, COURSE_BY_ID[id]?.title ?? id);
    }
  }
  const top = (m: Map<string, number>): [string, number][] =>
    Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return { types: top(typeCount), electives: top(electiveCount), majors: top(majorCount) };
}

function inc(m: Map<string, number>, k: string) {
  m.set(k, (m.get(k) ?? 0) + 1);
}
