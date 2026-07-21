import { NextResponse } from "next/server";
import type { PersonalizeContext } from "@/lib/personalize";
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  buildFallback,
  parseModelJson,
} from "@/lib/personalize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/personalize
// Body: { context: PersonalizeContext }
// Returns: Personalization (source "ai" when a key is configured and the
// call succeeds; otherwise "template"). Never throws to the client — the
// template fallback guarantees a usable response with no backend required.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-5";

export async function POST(req: Request) {
  let context: PersonalizeContext;
  try {
    const body = await req.json();
    context = body.context as PersonalizeContext;
    if (!context || !context.studentType) {
      return NextResponse.json({ error: "Missing context" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // No key configured — deterministic template documents.
    return NextResponse.json(buildFallback(context));
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || DEFAULT_MODEL,
        max_tokens: 2400,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(context) }],
      }),
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const fb = buildFallback(context);
      return NextResponse.json(fb, { headers: { "x-oau-fallback": String(res.status) } });
    }

    const data = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text =
      data.content
        ?.filter((b) => b.type === "text")
        .map((b) => b.text ?? "")
        .join("") ?? "";

    const parsed = parseModelJson(text);
    if (!parsed) {
      return NextResponse.json(buildFallback(context), {
        headers: { "x-oau-fallback": "parse" },
      });
    }
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(buildFallback(context), {
      headers: { "x-oau-fallback": "error" },
    });
  }
}
