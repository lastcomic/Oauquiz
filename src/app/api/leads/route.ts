import { NextResponse } from "next/server";
import { config, kvEnabled } from "@/lib/config";
import { getLeads } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/leads[?format=csv]  — the operator's lead list.
// Protected by ADMIN_TOKEN when set (pass ?token= or Authorization: Bearer).
// Reads from KV; returns an empty list (with kvConfigured:false) when no
// durable store is configured, so the client can fall back to local records.

function authorized(req: Request): boolean {
  if (!config.adminToken) return true; // open in dev when no token set
  const url = new URL(req.url);
  const q = url.searchParams.get("token");
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.replace(/^Bearer\s+/i, "");
  return q === config.adminToken || bearer === config.adminToken;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const leads = await getLeads();
  const url = new URL(req.url);

  if (url.searchParams.get("format") === "csv") {
    const header = [
      "created_at", "name", "email", "age", "student_type",
      "major", "minor", "top_categories", "someday", "note", "delivered", "beehiiv",
    ];
    const rows = leads.map((l) => [
      l.createdAt, l.name, l.email, l.age ?? "", l.studentType,
      l.major, l.minor, l.topCategories.join(" · "),
      l.someday ?? "", l.note ?? "", l.delivered ? "yes" : "no", l.beehiiv ?? "",
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv",
        "content-disposition": 'attachment; filename="oau-leads.csv"',
      },
    });
  }

  return NextResponse.json({ kvConfigured: kvEnabled(), count: leads.length, leads });
}
