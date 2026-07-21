"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Crest from "@/components/Crest";
import { getCurrentSubmission, updateSubmission } from "@/lib/storage";
import { buildContext, buildFallback } from "@/lib/personalize";
import { MOTTO } from "@/data/brand";

type State =
  | { kind: "working" }
  | { kind: "done"; email: string; simulated: boolean; already?: boolean }
  | { kind: "error"; message: string };

export default function SuccessPage() {
  const [state, setState] = useState<State>({ kind: "working" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id") || "";
    if (!sessionId) {
      setState({ kind: "error", message: "No checkout session was found." });
      return;
    }
    const sub = getCurrentSubmission();
    if (!sub) {
      setState({ kind: "error", message: "No student file found on this device." });
      return;
    }
    const context = buildContext(sub);
    const personalization = sub.personalization ?? buildFallback(context);
    const email = sub.order?.email;

    fetch("/api/deliver", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, email, context, personalization }),
    })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok || d.error) {
          setState({ kind: "error", message: d.error || "Delivery failed." });
          return;
        }
        updateSubmission(sub.id, {
          order: {
            ...(sub.order ?? {}),
            email: d.email ?? email,
            sessionId,
            purchased: true,
            deliveredAt: new Date().toISOString(),
            channel: sessionId.startsWith("simulated:") ? "simulated" : "stripe",
          },
        });
        setState({
          kind: "done",
          email: d.email ?? email ?? "your email",
          simulated: !!d.simulated,
          already: !!d.already,
        });
      })
      .catch(() => setState({ kind: "error", message: "Delivery request failed." }));
  }, []);

  return (
    <main className="page">
      <div className="wrap">
        <Crest subtitle="Office of Guidance & Placement" />

        <div className="paper mt-3" style={{ position: "relative" }}>
          <div style={{ position: "absolute", right: "1rem", top: "1rem" }}>
            <span className="stamp">Enrolled</span>
          </div>

          {state.kind === "working" ? (
            <>
              <p className="overline">Processing</p>
              <h1 style={{ fontSize: "1.6rem" }}>Preparing your file…</h1>
              <p className="muted">
                We&apos;re generating your PDF and sending your package. One
                moment.
              </p>
            </>
          ) : state.kind === "done" ? (
            <>
              <p className="overline" style={{ paddingRight: "6rem" }}>
                Registration Complete
              </p>
              <h1 style={{ fontSize: "1.7rem" }}>You&apos;re enrolled.</h1>
              <p>
                Your official Student File is on its way to{" "}
                <strong>{state.email}</strong>
                {state.already ? " (already delivered earlier)" : ""}. It
                includes a typeset PDF, your private AI advisor prompt, and a
                welcome from the Dean.
              </p>
              {state.simulated ? (
                <p className="tiny muted">
                  Note: email delivery is running in simulation (no provider
                  configured), so no message was actually sent. Add a
                  <code> RESEND_API_KEY</code> to send for real. Your file is
                  still available below.
                </p>
              ) : null}
              <div className="btn-row mt-2">
                <Link href="/file" className="btn btn-gold">Open my Student File</Link>
                <Link href="/result" className="btn btn-ghost">Back to placement</Link>
              </div>
              <p className="muted" style={{ fontStyle: "italic", marginTop: "1.2rem", marginBottom: 0 }}>
                {MOTTO}
              </p>
            </>
          ) : (
            <>
              <p className="overline">Something went sideways</p>
              <h1 style={{ fontSize: "1.5rem" }}>We couldn&apos;t finish delivery</h1>
              <p className="muted">{state.message}</p>
              <p className="muted">
                Your placement is safe. You can still open your file directly.
              </p>
              <div className="btn-row mt-2">
                <Link href="/file" className="btn">Open my Student File</Link>
                <Link href="/result" className="btn btn-ghost">Back to placement</Link>
              </div>
            </>
          )}
        </div>

        <p className="footer">
          <Link href="/">Office lobby</Link>
        </p>
      </div>
    </main>
  );
}
