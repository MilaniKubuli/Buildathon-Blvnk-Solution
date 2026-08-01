# ThumaFix SA — Buildathon Plan v2
## Challenge 2: Hyper-Local Utility Reporting Assistant

---

## 0. Repo reality check (read this first)

`git ls-files` returns **12 files — all configuration plus a README. There is no application source code in this repository.**

| README claims | Actual repo state |
|---|---|
| "Deterministic category, route, urgency, duplicate logic — implemented and unit-tested" | No `src/`, no `tests/` |
| "Postgres/PostGIS schema, RLS, audit model — implemented as migrations" | No `supabase/` directory |
| "Groq structured analysis — server adapter implemented" | No adapter file |
| Links to 10 docs in `docs/` | No `docs/` directory |
| `npm test` runs three vitest suites | Script points at `tests/domain/vitest.config.ts` — does not exist, so `npm test` fails immediately |

**Action required in Hour 0:** ask whoever ran "Add files via upload" whether the source exists on their machine. GitHub's web uploader commonly drops folders when files are dragged individually. If the code exists, this plan changes completely. **If it doesn't, we are greenfield with pre-committed dependency choices — which is what the rest of this plan assumes.**

What the existing `package.json` *does* usefully lock in: React 19, Next 16, Zod 4, Tailwind 4, react-hook-form, Vitest, Playwright, and Google Maps client libraries.

---

## 1. Decisions from your review

| Decision | Status | Note |
|---|---|---|
| Neon for the database | **Locked** | Free to adopt now — nothing is built against Supabase yet. Drop `@supabase/supabase-js`. |
| Two LLM reasoning calls | **Locked** | Extraction (call 1), duplicate adjudication (call 2). Translation is a separate non-reasoning model call — see §4. |
| Map visual | **Locked** | Doubles as the urgency dashboard. Renderer choice is open — see §8. |
| Translation + evaluation layer | **Locked in principle, provider changed** | I'm recommending against Google Translate as the primary. Reasoning in §4 — this is the main thing I want you to push back on. |

---

## 2. The scope warning I need to raise

The committed README describes a system with Supabase Auth, RLS, PostGIS, Vault encryption keys, MFA, South African ID validation, POPIA compliance, a super-admin bootstrap, Resend email, Twilio SMS, eleven translated UI languages, and South African Sign Language support.

**Almost none of that earns a mark.** The brief is explicit:

> §5.8 Teams are not required to: connect to a real municipality · build a production ticketing system
> §15 Teams do not need: production authentication · multiple user roles · production databases

Meanwhile the rubric puts **30 marks on AI Reasoning** and **20 on Workflow** — and the README's own status table admits the Groq path has *"no live Edge Function/API route yet."* The one thing that is mandatory (§2.2: *"Send user-provided data to a live or locally running AI model"*) is the one thing not built.

**Recommendation: formally park the auth/POPIA/notifications vision for the buildathon.** Build the anonymous single-screen workflow the brief actually asks for. Keep the safety-boundary language from the README's "Product safety boundaries" section — that framing is genuinely excellent and maps directly to the Responsible AI requirements in §2.3.

---

## 3. Architecture

```
Single-page UI (React 19 / Next 16 / Tailwind)
        ↓
Server API route  — Groq + Neon keys stay server-side
        ↓
Input validation (length, empty, rate guard)
        ↓
[T] Translation pass — NLLB-200 via HF Inference (non-reasoning model call)
        ↓
LLM CALL 1 — Qwen extraction, fed BOTH original text and translation
        → category, location, hazard signals, missing fields,
          clarification questions, translation agreement flag
        ↓
Zod validation (retry once on malformed JSON, then fail cleanly)
        ↓
[CODE] Translation integrity checks — entity preservation, numeric survival, negation (§4)
        ↓
[CODE] Simulated geocoding — landmark gazetteer lookup → lat/lng (§8)
        ↓
[CODE] Duplicate pre-filter — Neon query: category match OR pg_trgm
       location similarity OR <500 m Haversine, last 14 days, max 5 candidates
        ↓
LLM CALL 2 — Qwen duplicate adjudication over those candidates
        ↓
[CODE] Urgency engine (§5) + department routing lookup (§6)
        ↓
Human review screen — edit any field, confirm/reject duplicate link,
                      approve or reject
        ↓
Neon: approved ticket persisted → new incident, or joined to an existing
      incident with report_count incremented (which feeds urgency escalation)
```

Every arrow marked `[CODE]` is deterministic application logic, not the model. That separation is exactly what §3.1 of the brief asks for and is worth defending explicitly in the demo.

**Stack:**
- **DB:** Neon Postgres via `@neondatabase/serverless` (HTTP driver — works on Vercel *and* Cloudflare Workers, so it survives whichever deploy target we pick). Raw SQL, no ORM — faster to write in a 10-hour window.
- **Extensions:** `pg_trgm` for fuzzy location matching. **Skip PostGIS** — §5.8 explicitly excludes GIS, and Haversine in TypeScript over simulated coordinates is ~10 lines.
- **AI:** Groq (Qwen) for both reasoning calls; Hugging Face Inference (NLLB-200) for translation. Both are explicitly approved open-weight infrastructure under §2.1.

---

## 4. Multilingual handling and the translation integrity layer

### Why I'm steering away from Google Translate as the primary

Three reasons, in order of severity:

**1. It may violate the competition rules.** §2.1 states teams *"may not rely on paid proprietary AI APIs for the core functionality being evaluated."* §10 confirms the organisers' data pack contains *"utility reports in multiple South African languages"* — so judges may well test us with an isiZulu or Afrikaans complaint. If translation sits on the critical path for that case, then a paid proprietary AI API is doing core evaluated work. That is a needless risk to take on a category worth 20 marks.

**2. Hugging Face Inference is named as approved infrastructure**, and Meta's **NLLB-200** (`facebook/nllb-200-distilled-600M`) covers isiZulu, isiXhosa, Afrikaans, Sesotho, Setswana, Xitsonga and Siswati. It is open-weight, free-tier, and purpose-built for exactly the low-resource languages this challenge involves.

**3. Setup cost and quality.** Google Cloud Translation needs a GCP project with billing enabled — a provisioning detour during a 10-hour build. And its weakest point is *code-switching*, which is precisely how South Africans write complaints in practice ("kune water leak la e Main Road"). A model processing the full sentence in context handles that better than a translate-then-parse pipeline.

### The architecture that gives you the evaluation layer you asked for

The key move: **we do not translate before we extract.** Qwen is natively multilingual, so it reads the complaint in its original language and emits English field values directly. Translation stops being a dependency and becomes an *independent second opinion* — which is what makes a sensibility check meaningful in the first place. You cannot validate a translation against itself.

```
Original complaint (any language)
   ├──────────────────────────────► Qwen extracts directly, in-language ─┐
   └──► NLLB-200 → English text ────────────────────────────────────────┴──► compare
```

Both paths are fed into LLM call 1 together, so this costs **no extra reasoning call** — Qwen sees the original and the NLLB English side by side and reports whether they agree.

### The three integrity checks

**Layer 1 — Entity preservation (pure code, deterministic).** The highest-value check and the cheapest.
- Every number and time in the source must survive into the translation unchanged. Catches the corruption class that actually matters: `"3 days"` → `"30 days"`, `"no. 42"` → `"42"`.
- Landmark and proper-noun tokens must appear in the output or resolve to a known gazetteer alias.
- Negation markers must be preserved — a dropped *"not"* inverts the complaint's meaning and nothing downstream would notice.

**Layer 2 — Cross-source field agreement.** Compare the fields that actually drive decisions, not raw strings: does the in-language read and the translated read produce the same `category` and the same `location.landmarks`? String-level differences are noise; field-level disagreement is signal.

**Layer 3 — Round-trip back-translation.** English → source language → re-run Layer 1. Only if the schedule allows; Layers 1 and 2 carry most of the value.

### Output and consequences

The layer emits `translation_integrity: verified | needs_review | unreliable`, and this **gates behaviour**:

| Verdict | Behaviour |
|---|---|
| `verified` | Normal flow; ticket can be prepared for approval |
| `needs_review` | Both readings shown side-by-side in the review screen; human picks the correct interpretation before approval |
| `unreliable` | No ticket prepared. Route to clarification questions. Never guess. |

**The review screen shows the original text next to the translation, both editable.** A reviewer who speaks the language can correct the machine directly. That extends human-in-the-loop coverage to translation itself — a strong story against §2.3 and the shared human-review requirement in §8 of the brief.

**Google Translate stays pluggable** behind `TRANSLATION_PROVIDER=nllb|google` as an optional third signal. If you disagree with my reasoning, it's a one-line flip — but I'd want the open-weight path to be the one judges see.

---

## 5. Urgency engine

Unchanged from v1 and still, I think, our strongest single differentiator. Urgency is **computed in code**; the model only supplies observable signals.

```
urgency_score = base(category) + hazard_modifiers + escalation_boost     → clamped [0, 100]
```

| Component | Source | Values |
|---|---|---|
| **Base by category** | Code lookup | sewage 60 · burst pipe 55 · missing manhole 55 · traffic signal 50 · power outage 45 · fallen tree 40 · pothole 30 · illegal dumping 25 |
| **Hazard modifiers** | Model extracts booleans → code scores them | `endangers_people` +25 · `affects_infrastructure` +15 · `wide_impact` +10 · `worsening` +10 |
| **Escalation boost** | Neon query, pure code | +5 per linked duplicate report (capped +15) · +10 if open >48 h and still receiving reports |

**Bands:** 0–34 low · 35–59 medium · 60–79 high · 80+ critical.

The UI shows the full arithmetic: *"Base 55 + endangers people 25 + 2 repeat reports 10 = 90 · CRITICAL."* Every point is traceable to either a rule or an extracted signal. When a judge asks where urgency comes from, we open the breakdown rather than shrug at a model.

Per §2.3, this is labelled a **heuristic priority score**, never a calibrated probability. The model's separate `confidence` is documented in the README as self-assessed certainty, explicitly uncalibrated.

---

## 6. Duplicate detection

Three layers, cheapest first — now stronger on Neon than it would have been on SQLite:

1. **Deterministic pre-filter (SQL).** Candidates = open incidents from the last 14 days where category matches **OR** `pg_trgm` similarity on location text exceeds threshold **OR** the simulated pin is within ~500 m (Haversine, in code). Cap at 5. The geographic test is a genuine upgrade — it catches duplicates that describe the same place in completely different words.
2. **LLM call 2 — adjudication.** New report versus those candidates: same incident / different / unsure, with per-candidate reasoning. Returns `possible_duplicate`, `matched_incident_ids[]`, `duplicate_reasoning`.
3. **Human decision.** Side-by-side comparison with the model's reasoning; the user chooses **Join existing incident** or **Create new incident**. Joining increments `report_count`, which raises that incident's urgency and grows its map pin.

`unsure` is surfaced honestly as *"possible match — needs your judgement"*, never as a confident claim. Per §5.6 the user must be able to reject the suggestion, and rejection is a first-class path, not a dead end.

That loop — **duplicate → report_count → urgency → pin size** — is the spine of the demo. It ties the database, the comparative logic, the urgency metric and the map into one visible cause-and-effect chain.

---

## 7. Extraction schema (LLM call 1)

```json
{
  "category": "burst_water_pipe | electricity_outage | pothole | broken_traffic_light |
               illegal_dumping | sewage_overflow | fallen_tree | missing_manhole_cover |
               other | unknown",
  "location": { "text": "string | null", "landmarks": ["string"] },
  "summary": "string",
  "hazard_signals": {
    "endangers_people": false,
    "affects_infrastructure": false,
    "wide_impact": false,
    "worsening": false
  },
  "missing_fields": ["location"],
  "clarification_questions": ["Which park do you mean?"],
  "confidence": 0.82,
  "language_detected": "zu",
  "translation_agreement": "agree | disagree | not_applicable",
  "disagreement_notes": "string | null"
}
```

Enforced by prompt **and** Zod:
- Unknown location → `location.text: null` plus a clarification question. **Never invent a place.**
- `category: "unknown"` is a legal, expected outcome — it is what the *"something smells bad near the park"* case in §5.7 must produce.
- **Urgency, department, and duplicate verdicts are deliberately absent from this schema.** They are computed downstream, so the model has no opportunity to hallucinate them.

The final approved ticket merges extraction + urgency breakdown + department + routing reason + duplicate decision + `review_status` / `reviewed_by` / `changes_made` per §8 of the brief.

---

## 8. Map visual

**Simulated locations only** — §5.8 excludes real GPS and city-wide GIS, so we resolve landmarks against a seeded gazetteer table (landmark string → lat/lng, fuzzy-matched with `pg_trgm`) covering one fictional municipality.

**If a location cannot be resolved, no pin is drawn.** The report appears in an "unlocated reports" side list instead. Inventing a map position would violate the same principle as inventing a field value, and the honest empty state is itself demonstrable.

Pin encoding, which makes the whole system legible at a glance:
- **Colour** = urgency band
- **Size** = `report_count`
- **Click** = incident detail with the urgency breakdown

Submitting the duplicate demo case makes a pin visibly grow and change colour. That is the moment the architecture explains itself without narration.

**Renderer — open question.** `@googlemaps/js-api-loader` and `markerclusterer` are already in `package.json`, but Google Maps needs a billing-enabled, referrer-restricted browser key. My inclination is **Leaflet + OpenStreetMap**: no key, no billing, no `NEXT_PUBLIC_` credential in the bundle, and judges can clone and run it with zero setup. `leaflet.markercluster` covers clustering. If your team already has a working Maps key provisioned, keeping Google is fine and the deps are there — your call. (A referrer-restricted Maps key is designed to be public and doesn't breach §2.2, but zero keys is a cleaner story than one we have to explain.)

---

## 9. Data model (Neon)

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

incidents (
  id                TEXT PRIMARY KEY,          -- INC-104
  category          TEXT NOT NULL,
  location_text     TEXT,
  lat               DOUBLE PRECISION,          -- null when unresolved → no pin
  lng               DOUBLE PRECISION,
  urgency_score     INTEGER,
  urgency_breakdown JSONB,                     -- the traceable arithmetic
  urgency_level     TEXT,
  department        TEXT,
  status            TEXT DEFAULT 'open',
  report_count      INTEGER DEFAULT 1,
  first_reported_at TIMESTAMPTZ,
  last_reported_at  TIMESTAMPTZ
);

reports (
  id                   TEXT PRIMARY KEY,       -- RPT-001
  incident_id          TEXT REFERENCES incidents(id),   -- null until approved
  raw_text             TEXT NOT NULL,
  language_detected    TEXT,
  translated_text      TEXT,
  translation_integrity TEXT,
  extracted            JSONB,                  -- full validated model output
  review_status        TEXT,                   -- pending | approved | rejected
  reviewed_by          TEXT,
  changes_made         BOOLEAN,
  created_at           TIMESTAMPTZ DEFAULT now()
);

landmarks (                                     -- simulated gazetteer
  name TEXT PRIMARY KEY, suburb TEXT,
  lat DOUBLE PRECISION, lng DOUBLE PRECISION
);
CREATE INDEX ON landmarks USING gin (name gin_trgm_ops);
CREATE INDEX ON incidents USING gin (location_text gin_trgm_ops);
```

Seeded with ~8 open incidents and ~20 landmarks from a JSON file, so the organisers' data pack can be swapped in by replacing the file rather than editing code.

---

## 10. Demo cases

The brief requires three; we prepare five so a judge's surprise case has somewhere familiar to land.

1. **Normal** — *"Big pothole on Church Street just before the Engen garage, cars are swerving into oncoming traffic."* → clean extraction, infrastructure modifier, Roads and Transport, pin appears.
2. **Ambiguous (required by §5.7)** — *"Something smells bad near the park. Please send someone."* → `category: unknown`, `location: null`, clarification questions, low confidence, **no pin, no ticket** until a human answers.
3. **Duplicate (§5.6)** — *"Huge water leak opposite the Spar near the traffic lights"* against seeded INC-104 / INC-107 → adjudication, join, `report_count` rises, pin grows, urgency escalates to a higher band on screen.
4. **Multilingual + integrity** — an isiZulu or code-switched complaint. Shows in-language extraction, the NLLB cross-check, and the side-by-side review. If we can find a case where the two sources disagree, *demonstrate the `needs_review` path deliberately* — catching your own system's uncertainty is worth more to judges than a clean pass.
5. **Critical hazard** — *"Open manhole on the corner where kids walk to school, someone nearly fell in last night."* → `endangers_people` → critical band, exercising the top of the urgency range.

**Known limitation for demonstration step 9:** heavy code-switching or slang degrades extraction confidence. We show it degrading *gracefully* — low confidence, clarification requested, no invented values. §13 asks for one known failure case; a system that recognises its own limits is the point of the exercise.

---

## 11. Schedule

Structured as parallel tracks — collapse to sequential order if the team is smaller than three.

| Hour | Track A — AI pipeline | Track B — UI & map | Track C — data & integrations |
|---|---|---|---|
| 0–1 | Chase missing source code · confirm exact Groq model ID | Strip README to buildathon scope | Neon project + schema + seed |
| 1–2 | Extraction prompt + Zod schema + retry | Submit screen, sample-case buttons | NLLB via HF Inference, smoke-tested |
| 2–3 | Wire live API route end-to-end | Analysis screen, editable fields | Gazetteer seed + geocode lookup |
| 3–4 | Translation integrity checks (code) | Map with pins, urgency colouring | Urgency engine + unit tests |
| 4–5 | Duplicate pre-filter SQL | Duplicate comparison screen | Department routing table |
| 5–6 | LLM call 2 — adjudication | Review / edit / approve screen | Persistence + join-incident logic |
| 6–7 | **Integration checkpoint — full loop must run end to end** | | |
| 7–8 | Error handling: Groq down, rate limit, malformed JSON, HF timeout | Urgency dashboard / incident list | Escalation boost wiring |
| 8–9 | Run all five demo cases · fix failures · test two unseen cases | | |
| 9–10 | README (all §12 required sections) · architecture diagram · deploy · rehearse | | |

**Cut list, in the order things get dropped if we fall behind.** Agree this now, while nobody is panicking:

1. Round-trip back-translation (Layer 3) — Layers 1 and 2 carry the value
2. Map clustering — plain pins are enough
3. Time-based escalation boost — keep the report-count boost
4. Multilingual entirely — falls back to English-only; **the core workflow survives**
5. *Never cut:* live model call · Zod validation · null-not-invented behaviour · human review and approval

Items 1–4 are Innovation marks, capped at 5 total. Items under "never cut" are worth 70.

---

## 12. Risks

| Risk | Mitigation |
|---|---|
| **Source code may exist on a teammate's machine** | Resolve in Hour 0 before writing anything |
| **`vinext` 0.0.50 + Cloudflare Workers is a pre-1.0 stack** | Highest technical risk in the repo. Plain Next.js on Vercel is the low-risk path and Neon's HTTP driver works on both. Decide in Hour 0 — see §13. |
| "Qwen 3.6-27b" is not a Groq model ID | Groq's Qwen offering is `qwen/qwen3-32b`. Verify in the console Hour 0. Behind `GROQ_MODEL`, so it's a one-line swap; `llama-3.3-70b-versatile` is the fallback. The exact name is a required README item. |
| Qwen emits `<think>` blocks that break JSON parsing | Strip reasoning tags before parsing, or use Groq's reasoning-format parameter |
| Groq free-tier limits during judging | Cache responses keyed by input hash — sample cases then return instantly and deterministically |
| HF Inference cold start (~20 s on first call) | Warm it during setup; on timeout, fall back to Qwen-only with `translation_integrity: needs_review` |
| Schema drift from the model | `response_format: json_object` + Zod + one retry with the validation error fed back |
| `npm test` currently fails (configs absent) | Fix the script in Hour 0 — a failing test command is the first thing a technical judge will try |
| `tsconfig.tsbuildinfo` is committed despite being gitignored | `git rm --cached` in Hour 0 |

---

## 13. Open questions for you

1. **Does the source code exist somewhere?** Everything above assumes greenfield. This is the one answer that could invalidate the plan.
2. **`vinext`/Cloudflare, or plain Next.js on Vercel?** I'd take Vercel — a pre-1.0 build tool is a poor place to spend debugging hours when the rubric awards nothing for it. But if someone on the team chose vinext deliberately and knows it, that changes the calculus.
3. **Do you accept NLLB over Google Translate as primary?** §4 is my case. The rule risk in §2.1 is the part I'd weigh most heavily.
4. **Leaflet or Google Maps?** Comes down to whether a billing-enabled Maps key already exists.
5. **Urgency weights in §5** — the base scores and modifiers are judgement calls. Worth ten minutes of team argument before Hour 3, and near-free to tune afterwards.
6. **Do we formally park the auth/POPIA/notifications scope?** I think yes, and I think it's the highest-leverage decision available — but it means telling whoever wrote that README that their work is out of scope for these ten hours.
