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

## Phase 2 — Curriculum Engine, AI, PDF, Payments, Email

Phase 2A (curriculum engine + AI report + PDF + admin) and Phase 2B (Stripe
checkout + email delivery) are built. Everything **degrades gracefully**: with
no keys the app runs in simulation/template mode and still deploys; adding keys
activates the real integrations — no code changes.

### Environment variables (set in Vercel → Settings → Environment Variables)

| Variable | Enables | Notes |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Live AI-written letters | Falls back to hand-written templates when absent. |
| `AI_MODEL` | Override AI model | Default `claude-sonnet-5`. |
| `LEAD_MODE` | **Free lead-capture vs. charging** | Default **free** (lead mode). Set `LEAD_MODE=false` (with a Stripe key) to charge. |
| `BEEHIIV_API_KEY` / `BEEHIIV_PUBLICATION_ID` | Auto-subscribe leads to your Beehiiv list | Placement is attached as custom fields (`student_type`, `major`, `minor`). |
| `LEAD_NOTIFY_EMAIL` | Email you on each new lead | Uses the Resend key. |
| `ADMIN_TOKEN` | Protect the `/api/leads` export | When set, the admin Leads panel asks for it. Open in dev when unset. |
| `STRIPE_SECRET_KEY` | Real Stripe Checkout (only if `LEAD_MODE=false`) | Absent → simulation ("test mode") checkout. |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook fulfillment | For `/api/stripe/webhook`. |
| `STRIPE_PRICE_ID` | Fixed Stripe price | Otherwise uses `PRICE_AMOUNT_CENTS`. |
| `PRICE_AMOUNT_CENTS` / `PRICE_CURRENCY` / `PRODUCT_NAME` | Inline price | Defaults `2900` / `usd` / "OAU Official Student File". |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` | Real email delivery via your own mailbox (PDF attached) | Preferred when set. `SMTP_SECURE=true` for port 465, else STARTTLS on 587. |
| `RESEND_API_KEY` / `EMAIL_FROM` | Alternative email delivery (PDF attached) | Used if SMTP isn't set. Absent (and no SMTP) → email is simulated. |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Durable order store (Upstash/Vercel KV) | Optional; a client-driven fallback delivers without it. |
| `NEXT_PUBLIC_BASE_URL` | Stripe redirect origin | Optional; defaults to the request origin. |

### Phase 2 data + logic files
| File | Controls |
| --- | --- |
| `src/data/courses.ts` | Full course catalog + metadata (required + electives) |
| `src/data/audioLessons.ts` · `assignments.ts` | Audio lessons · seven-day assignments |
| `src/lib/scoring.ts` | Deterministic recommendation engine |
| `src/lib/personalize.ts` | AI prompt + six-document template fallback |
| `src/app/api/personalize` | AI letters (Anthropic + fallback) |
| `src/app/api/checkout` · `deliver` · `stripe/webhook` · `resend` · `config` | Payments + email delivery |
| `src/lib/pdf.ts` | Server-side Student File PDF (pdf-lib) |

Deferred: a shared database for cross-device admin (the dashboard is per-device
until then).

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
