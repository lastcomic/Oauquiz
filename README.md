# OLD AGE UNIVERSITY — The Second Draft Placement Exam

An official, lightly humorous "placement exam" for the second half of life
(adults ~45–65). It reasks *"what do you want to be when you grow up"* now that
you have real self-knowledge.

> You are not starting over. You are starting from the most informed position of
> your life.

This is **Phase One** — a local, mobile-first prototype. No backend, no accounts,
no AI. All content lives in easy-to-edit data files; all submissions live in
`localStorage`.

---

## Implementation Plan

### Stack
- **Next.js (App Router) + TypeScript**
- Clean, small React components
- Mobile-first, responsive CSS (design tokens in `globals.css`)
- All content in local TS data files under `src/data/`
- Submissions persisted to `localStorage` (no database, no API)

### Routes
| Route | Purpose |
| --- | --- |
| `/` | Landing page — premise, the core line, "Begin the Exam" |
| `/quiz` | 15-question multi-step form with a progress indicator |
| `/result` | Personalized placement (type, major, minor, electives, assignment) |
| `/letter` | Printable official Guidance Counselor letter |
| `/admin` | Local admin screen listing all submitted answers |

### Data files (the things you edit)
| File | Controls |
| --- | --- |
| `src/data/questions.ts` | The 15 quiz questions + answer choices + weights |
| `src/data/categories.ts` | The 8 scoring categories |
| `src/data/studentTypes.ts` | The 6 student types + their category signatures |
| `src/data/majors.ts` | Recommended majors |
| `src/data/minors.ts` | Recommended minors |
| `src/data/electives.ts` | Elective courses |
| `src/data/letterTemplates.ts` | Guidance Counselor letter/message templates |

### Logic
| File | Responsibility |
| --- | --- |
| `src/lib/types.ts` | Shared TypeScript types |
| `src/lib/scoring.ts` | Rule-based scoring → category scores → student type → major/minor/electives/assignment |
| `src/lib/storage.ts` | `localStorage` read/write for the current + all submissions |

### Scoring categories
Creativity · Purpose · Adventure · Community · Income · Learning · Restoration ·
Practical Usefulness

### Student types (placeholders, easy to edit)
Dormant Creative · Experienced Explorer · Useful Expert ·
Applied Reinvention Student · Community Builder · Recovering Optimizer

### How scoring works (temporary, rule-based)
1. Each scored answer choice carries weights across the 8 categories.
2. Answers are summed into a category-score vector.
3. The vector is matched (cosine similarity) against each student type's
   signature to pick the best-fit **student type**.
4. The top categories drive the recommended **major**, **minor**, and three
   **electives**, plus a seven-day **first assignment**.
5. Open-response answers are **captured and stored but not scored** in Phase One.

### Design language
Vintage academic, premium but welcoming. Official university forms, registrar
stamps, serif type, quiet humor, lots of white space, phone-first.

Palette — Navy `#1B2A47` · Gold `#C9A961` · Cream `#E8DCC4` ·
Stamp Red `#A63D2A` · Charcoal `#2C2620`.

### Explicitly NOT in Phase One
Stripe, email, accounts, databases, OpenAI/Claude API, video/PDF services,
memberships, subscriptions, chatbot. Local mock data + `localStorage` only.

---

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Build check:

```bash
npm run build
```

### Try it
1. Visit `/` and begin the exam.
2. Answer the 15 questions (a name is required; open responses are optional).
3. Land on `/result`; download your student file (JSON) or open the printable
   `/letter`.
4. Use **Restart** to retake.
5. Visit `/admin` to see every submission stored locally on this device.
