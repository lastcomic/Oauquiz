"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Crest from "@/components/Crest";
import { QUESTIONS, NAME_QUESTION_ID } from "@/data/questions";
import type { AnswerMap, Question } from "@/lib/types";
import { computePlacement, extractName } from "@/lib/scoring";
import { saveSubmission, makeId } from "@/lib/storage";

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [error, setError] = useState<string | null>(null);

  const total = QUESTIONS.length;
  const question = QUESTIONS[step];
  const progress = Math.round(((step + 1) / total) * 100);

  function setSingle(qid: string, choiceId: string) {
    setError(null);
    setAnswers((a) => ({ ...a, [qid]: choiceId }));
  }

  function toggleMulti(q: Question, choiceId: string) {
    setError(null);
    setAnswers((a) => {
      const cur = Array.isArray(a[q.id]) ? [...(a[q.id] as string[])] : [];
      const idx = cur.indexOf(choiceId);
      if (idx >= 0) {
        cur.splice(idx, 1);
      } else {
        if (q.maxSelections && cur.length >= q.maxSelections) {
          return a; // at cap; ignore
        }
        cur.push(choiceId);
      }
      return { ...a, [q.id]: cur };
    });
  }

  function setOpen(qid: string, value: string) {
    setError(null);
    setAnswers((a) => ({ ...a, [qid]: value }));
  }

  function isAnswered(q: Question): boolean {
    const v = answers[q.id];
    if (q.kind === "open") {
      // Only the name question is required.
      if (q.id === NAME_QUESTION_ID) {
        return typeof v === "string" && v.trim().length > 0;
      }
      return true;
    }
    if (Array.isArray(v)) return v.length > 0;
    return typeof v === "string" && v.length > 0;
  }

  function next() {
    if (!isAnswered(question)) {
      setError(
        question.id === NAME_QUESTION_ID
          ? "The registrar requires a name to open your file."
          : "Please choose at least one option to continue.",
      );
      return;
    }
    if (step < total - 1) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      submit();
    }
  }

  function back() {
    setError(null);
    if (step > 0) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function submit() {
    const placement = computePlacement(answers);
    const name = extractName(answers);
    saveSubmission({
      id: makeId(),
      name,
      createdAt: new Date().toISOString(),
      answers,
      placement,
    });
    router.push("/result");
  }

  const maxReached =
    question.kind === "multi" &&
    question.maxSelections !== undefined &&
    Array.isArray(answers[question.id]) &&
    (answers[question.id] as string[]).length >= question.maxSelections;

  return (
    <main className="page">
      <div className="wrap">
        <Link href="/" className="backlink no-print">
          ← Leave the exam
        </Link>

        <div className="progress">
          <span className="progress-label">
            Q{step + 1} / {total}
          </span>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-label">{question.section}</span>
        </div>

        <div className="paper">
          <span className="overline">{question.section}</span>
          <h2 style={{ fontSize: "1.4rem", marginTop: "0.5rem" }}>
            {question.prompt}
          </h2>
          {question.help ? (
            <p className="muted field-note" style={{ marginTop: "-0.3rem" }}>
              {question.help}
            </p>
          ) : null}

          <div className="mt-2">
            {question.kind === "open" ? (
              <OpenInput
                question={question}
                value={(answers[question.id] as string) ?? ""}
                onChange={(v) => setOpen(question.id, v)}
              />
            ) : (
              <div className="q-list">
                {question.choices?.map((c) => {
                  const isMulti = question.kind === "multi";
                  const selected = isMulti
                    ? Array.isArray(answers[question.id]) &&
                      (answers[question.id] as string[]).includes(c.id)
                    : answers[question.id] === c.id;
                  const disabled = isMulti && !selected && maxReached;
                  return (
                    <label
                      key={c.id}
                      className={`q-choice${selected ? " selected" : ""}`}
                      style={disabled ? { opacity: 0.45 } : undefined}
                    >
                      <input
                        type={isMulti ? "checkbox" : "radio"}
                        name={question.id}
                        checked={!!selected}
                        disabled={disabled}
                        onChange={() =>
                          isMulti
                            ? toggleMulti(question, c.id)
                            : setSingle(question.id, c.id)
                        }
                      />
                      <span>{c.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {question.kind === "multi" && question.maxSelections ? (
            <p className="tiny muted mt-2">
              Choose up to {question.maxSelections}.
            </p>
          ) : null}

          {error ? <p className="error-text">{error}</p> : null}

          <hr className="rule" />

          <div className="btn-row" style={{ justifyContent: "space-between" }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={back}
              disabled={step === 0}
            >
              ← Back
            </button>
            <button type="button" className="btn" onClick={next}>
              {step === total - 1 ? "Submit for Placement" : "Next →"}
            </button>
          </div>
        </div>

        <p className="footer">
          Answers stay on this device. Open responses are recorded but, in this
          draft, not yet graded.
        </p>
      </div>
    </main>
  );
}

function OpenInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (v: string) => void;
}) {
  const isName = question.id === NAME_QUESTION_ID;
  if (isName) {
    return (
      <input
        className="field"
        type="text"
        value={value}
        placeholder={question.placeholder}
        maxLength={80}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
      />
    );
  }
  return (
    <textarea
      className="field"
      rows={4}
      value={value}
      placeholder={question.placeholder}
      maxLength={600}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
