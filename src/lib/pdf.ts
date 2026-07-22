import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import type { PersonalizeContext } from "@/lib/personalize";
import type { Personalization } from "@/lib/types";
import { MOTTO } from "@/data/brand";
import { COUNSELOR } from "@/lib/personalize";

// Server-side generation of the official Student File PDF. Pure JS
// (pdf-lib) — no headless browser, no external PDF service.

const NAVY = rgb(0.106, 0.165, 0.278);
const RED = rgb(0.651, 0.239, 0.165);
const INK = rgb(0.173, 0.149, 0.125);
const MUTED = rgb(0.4, 0.37, 0.34);

const PAGE = { w: 612, h: 792, margin: 56 };

interface Fonts {
  body: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  mono: PDFFont;
}

class Layout {
  doc: PDFDocument;
  fonts: Fonts;
  page: PDFPage;
  y: number;

  constructor(doc: PDFDocument, fonts: Fonts, page: PDFPage) {
    this.doc = doc;
    this.fonts = fonts;
    this.page = page;
    this.y = PAGE.h - PAGE.margin;
  }

  private ensure(space: number) {
    if (this.y - space < PAGE.margin) {
      this.page = this.doc.addPage([PAGE.w, PAGE.h]);
      this.y = PAGE.h - PAGE.margin;
    }
  }

  gap(h = 10) {
    this.y -= h;
  }

  private wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
    const lines: string[] = [];
    for (const rawLine of text.split("\n")) {
      const words = rawLine.split(/\s+/).filter(Boolean);
      let line = "";
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (font.widthOfTextAtSize(test, size) > maxW && line) {
          lines.push(line);
          line = w;
        } else {
          line = test;
        }
      }
      lines.push(line);
    }
    return lines;
  }

  text(
    content: string,
    opts: {
      font?: PDFFont;
      size?: number;
      color?: ReturnType<typeof rgb>;
      lineHeight?: number;
      indent?: number;
      align?: "left" | "center";
    } = {},
  ) {
    const font = opts.font ?? this.fonts.body;
    const size = opts.size ?? 10.5;
    const color = opts.color ?? INK;
    const lh = opts.lineHeight ?? size * 1.45;
    const indent = opts.indent ?? 0;
    const maxW = PAGE.w - PAGE.margin * 2 - indent;
    const lines = this.wrap(content, font, size, maxW);
    for (const line of lines) {
      this.ensure(lh);
      let x = PAGE.margin + indent;
      if (opts.align === "center") {
        const tw = font.widthOfTextAtSize(line, size);
        x = (PAGE.w - tw) / 2;
      }
      this.page.drawText(line, { x, y: this.y, size, font, color });
      this.y -= lh;
    }
  }

  heading(label: string) {
    this.gap(10);
    this.ensure(24);
    this.text(label.toUpperCase(), {
      font: this.fonts.bold,
      size: 9,
      color: RED,
    });
    this.gap(2);
    this.rule();
    this.gap(6);
  }

  rule() {
    this.ensure(6);
    this.page.drawLine({
      start: { x: PAGE.margin, y: this.y },
      end: { x: PAGE.w - PAGE.margin, y: this.y },
      thickness: 0.75,
      color: rgb(0.8, 0.76, 0.68),
    });
    this.y -= 4;
  }

  kv(key: string, value: string) {
    this.ensure(16);
    this.page.drawText(key, {
      x: PAGE.margin,
      y: this.y,
      size: 10,
      font: this.fonts.bold,
      color: NAVY,
    });
    const vx = PAGE.margin + 140;
    const lines = this.wrap(value, this.fonts.body, 10, PAGE.w - PAGE.margin - vx);
    lines.forEach((line, i) => {
      if (i > 0) {
        this.ensure(14);
      }
      this.page.drawText(line, {
        x: vx,
        y: this.y,
        size: 10,
        font: this.fonts.body,
        color: INK,
      });
      this.y -= 14;
    });
  }
}

export async function generateStudentFilePdf(
  ctx: PersonalizeContext,
  person: Personalization,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const fonts: Fonts = {
    body: await doc.embedFont(StandardFonts.TimesRoman),
    bold: await doc.embedFont(StandardFonts.TimesRomanBold),
    italic: await doc.embedFont(StandardFonts.TimesRomanItalic),
    mono: await doc.embedFont(StandardFonts.Courier),
  };
  const page = doc.addPage([PAGE.w, PAGE.h]);
  const L = new Layout(doc, fonts, page);

  // Letterhead
  L.text("OLD AGE UNIVERSITY", { font: fonts.bold, size: 18, color: NAVY, align: "center" });
  L.gap(2);
  L.text("Official Student File · Office of Guidance & Placement", {
    size: 9, color: RED, align: "center",
  });
  L.gap(2);
  L.text(`${ctx.name}${ctx.age ? ` · Age ${ctx.age}` : ""}`, {
    size: 10, color: MUTED, align: "center",
  });
  L.gap(8);
  L.rule();

  // Placement
  L.heading("Placement");
  L.kv("Student Type", ctx.studentType.name);
  L.kv("Major", ctx.major.name);
  L.kv("Minor", ctx.minor.name);

  // Transcript
  L.heading("Transcript · Strength Profile");
  for (const s of ctx.scores) L.kv(s.label, String(s.value));

  // Schedule
  L.heading("Course Schedule · First Term");
  L.text(
    `${ctx.requiredCourse.courseNumber}  ${ctx.requiredCourse.title}  (Required · Freshman Class)`,
    { font: fonts.bold, size: 10, color: NAVY },
  );
  for (const e of ctx.electives) {
    L.text(`${e.courseNumber}  ${e.title}  (Elective)`, { size: 10 });
  }
  L.text(`Audio Lesson  ${ctx.audio.title} (${ctx.audio.minutes} min)`, { size: 10 });

  // Guidance letter
  const GL = person.guidanceLetter;
  L.heading("Guidance Counselor Letter");
  L.text(`Re: ${GL.subjectLine}`, { font: fonts.italic, size: 10, color: MUTED });
  L.gap(4);
  for (const para of [GL.opening, GL.assessment, GL.recommendation, GL.closing]) {
    if (!para) continue;
    L.text(para);
    L.gap(6);
  }

  // Why these courses
  const W = person.whyTheseCourses;
  L.heading("Why We Chose These Courses");
  if (W.intro) { L.text(W.intro); L.gap(4); }
  const rows: [string, string][] = [
    ["Student type.", W.studentType],
    ["Major.", W.major],
    ["Minor.", W.minor],
    ["Required course.", W.requiredCourse],
  ];
  for (const [k, v] of rows) {
    if (!v) continue;
    L.text(`${k} ${v}`);
    L.gap(4);
  }
  ctx.electives.forEach((e) => {
    const ex = W.electives.find((x) => x.id === e.id);
    if (ex?.text) { L.text(`${e.title}. ${ex.text}`); L.gap(4); }
  });

  // Summary
  L.heading("Your Second Draft Summary");
  L.text(person.secondDraftSummary);

  // Seven-day assignment
  L.heading(`Seven-Day Assignment · ${ctx.assignment.title}`);
  if (person.sevenDayIntro) { L.text(person.sevenDayIntro, { color: MUTED }); L.gap(4); }
  for (const d of ctx.assignment.days) L.text(d, { size: 10 });
  L.gap(2);
  L.text(`Done when: ${ctx.assignment.successMeasure}`, { font: fonts.italic, size: 10, color: MUTED });

  // Dean's message
  L.heading("Message from the Dean");
  L.text(person.deansMessage, { font: fonts.italic });

  // Advisor prompt
  L.heading("Your Private AI Advisor Prompt");
  L.text("Paste into ChatGPT, Claude, or Gemini.", { size: 9, color: MUTED });
  L.gap(4);
  L.text(person.advisorPrompt, { font: fonts.mono, size: 8.5, lineHeight: 12 });

  // Signature
  L.gap(14);
  L.rule();
  L.gap(6);
  L.text("Certified by the Office of Guidance & Placement,", { size: 10 });
  L.gap(2);
  L.text(COUNSELOR.name, { font: fonts.italic, size: 15, color: NAVY });
  L.text(COUNSELOR.title, { size: 9, color: MUTED });
  L.gap(2);
  L.text(MOTTO.toUpperCase(), { font: fonts.bold, size: 9, color: RED });

  return doc.save();
}
