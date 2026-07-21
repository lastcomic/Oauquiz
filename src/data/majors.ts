import type { Major } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// MAJORS — approved list. `categories` most-important first.
// The engine picks the major whose leading categories best match
// the student's top categories. Codes are cosmetic/editable.
// ─────────────────────────────────────────────────────────────

export const MAJORS: Major[] = [
  {
    id: "studio_practice",
    code: "MAJ-CR",
    name: "Studio Practice",
    categories: ["creativity", "restoration", "learning"],
    description:
      "A committed return to making — a craft, an art, a workshop of your own. Output over perfection.",
  },
  {
    id: "applied_purpose",
    code: "MAJ-PU",
    name: "Applied Purpose",
    categories: ["purpose", "community", "practical"],
    description:
      "Meaningful work aimed at real people: a cause, a service, a role that clearly matters.",
  },
  {
    id: "field_studies",
    code: "MAJ-AD",
    name: "Field Studies",
    categories: ["adventure", "learning", "restoration"],
    description:
      "A curriculum of new places and new problems. You learn by going, not by waiting.",
  },
  {
    id: "civic_hospitality",
    code: "MAJ-CO",
    name: "Civic & Hospitality",
    categories: ["community", "purpose", "restoration"],
    description:
      "Building the room where people belong — gatherings, clubs, tables, networks that hold.",
  },
  {
    id: "practical_trades",
    code: "MAJ-PR",
    name: "Practical Trades & Repair",
    categories: ["practical", "income", "creativity"],
    description:
      "Genuinely useful skills with a market: fixing, building, making things that work.",
  },
  {
    id: "second_income",
    code: "MAJ-IN",
    name: "Second-Half Enterprise",
    categories: ["income", "practical", "purpose"],
    description:
      "A right-sized venture built on what you already know — designed to eventually pay for itself.",
  },
  {
    id: "restorative_studies",
    code: "MAJ-RE",
    name: "Restorative Studies",
    categories: ["restoration", "learning", "purpose"],
    description:
      "Refilling first — rest, health, and gentle structure — before you decide what's next.",
  },
];

export const MAJOR_BY_ID: Record<string, Major> = MAJORS.reduce(
  (acc, m) => {
    acc[m.id] = m;
    return acc;
  },
  {} as Record<string, Major>,
);
