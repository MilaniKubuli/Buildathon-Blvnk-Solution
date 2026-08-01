# ThumaFix SA

**Report it. Route it. Resolve it.**

ThumaFix SA is an account-based South African municipal utility reporting MVP. It guides a resident from a plain-language complaint and confirmed location to a transparent category, route, urgency suggestion, duplicate-review decision and private tracking reference. Operational decisions remain with authorised people: the system never automatically merges reports, creates a canonical incident, or dispatches a crew.

The working interface is intentionally honest about readiness. With no provider credentials it can be previewed locally, run deterministic analysis, capture a user-confirmed pin and keep user-entered reports in that browser. It does **not** claim those local records were delivered to a municipality. When Supabase is configured and the migrations, authoritative boundary data and attachment Edge Function are deployed, verified residents use the protected PostGIS report path and private tracking view.

## Readiness at a glance

| Area | Current state |
| --- | --- |
| Premium responsive interface and protected workspace | Implemented |
| Five-step report flow and private tracking | Implemented; Supabase when connected, labelled browser storage for development preview only |
| Deterministic category, route, urgency, duplicate and resource logic | Implemented and unit-tested |
| Supabase Auth browser session and resident verification | Implemented; requires a configured project and applied migrations |
| Postgres/PostGIS schema, RLS, private attachments and audit model | Implemented as migrations; not applied by this repository |
| Google map, device location, search and reverse geocoding | Provider-ready; requires a restricted browser key |
| Groq structured analysis | Server adapter implemented; no live Edge Function/API route yet |
| Resend email, Twilio SMS and in-app notifications | Preferences, owner inbox and server adapters implemented; delivery dispatcher/webhooks still require deployment |
| Eleven written languages plus South African Sign Language support | Selector and architecture present; translated copy and SASL content require qualified human review |
| InfinityFree | Frontend-only static export path; secure backend remains Supabase/Edge Functions |

See [Known limitations](docs/known-limitations.md) before treating the MVP as production-ready.

## Technology

- Next-compatible React 19 application built with vinext and Vite
- TypeScript and Zod
- Supabase Auth, PostgreSQL, PostGIS, Storage and Row Level Security design
- Google Maps JavaScript, Places and Geocoding integration
- GroqCloud-compatible structured ticket analysis adapter
- Resend, Twilio and protected in-app notification adapters
- Vitest domain, integration and attachment-inspection tests; Playwright local end-to-end coverage

## Local setup

Prerequisites:

- Node.js `>=22.13.0`
- npm
- Optional provider projects only when testing live integrations

From this directory in PowerShell:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Development mode offers a clearly labelled local interface preview. It is **not authentication**, does not create a resident, and must not be enabled in production. When Supabase is configured, the Auth provider loads the real session and role from `profiles` and `user_roles`.

Never put a real password, South African ID number, service-role key or provider secret in source control. Until the POPIA, security and operator-readiness checklist is complete, do not use real-person data for development. Automated tests use isolated, disposable fixtures and never seed the application database or operator-facing UI.

## Environment

Copy [.env.example](.env.example) to the ignored `.env.local` file and add only the values required for the capability being exercised.

Browser-visible variables:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_GOOGLE_MAP_ID` (optional)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_MUNICIPALITY_SLUG` (must match an approved active boundary row)
- `NEXT_PUBLIC_ENABLE_LOCAL_PREVIEW` (local convenience only; leave `false` for builds)

Server or Edge Function secrets:

- `GROQ_API_KEY` and optional Groq model/endpoint settings
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY` and `RESEND_FROM`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` and `TWILIO_FROM_NUMBER`
- protected in-app notification and distributed rate-limit endpoint credentials

`NEXT_PUBLIC_*` values are embedded in the browser bundle. The Google key must be API- and referrer-restricted, and the Supabase anon key is safe only with verified RLS policies. Full setup is in [Integration guide](docs/integrations.md) and [Deployment](docs/deployment.md).

## Quality commands

```powershell
npm test
npm run typecheck
npm run lint
npm run build
```

The isolated suites can also be run directly:

```powershell
node node_modules/vitest/vitest.mjs run --config tests/domain/vitest.config.ts
node node_modules/vitest/vitest.mjs run --config tests/integrations/vitest.config.ts
```

`npm run test:e2e` runs the local unauthenticated and development-preview browser specifications. Connected-provider, RLS and real-device cases remain in the acceptance matrix in [Test plan](docs/test-plan.md).

## Database and initial super administrator

The ordered SQL files in `supabase/migrations/` create an empty application model. They do not seed fake residents, reports, boundaries, departments or incidents. Follow [Database setup](docs/database-setup.md) to:

1. Apply the migrations to a dedicated Supabase project.
2. Create separate identity encryption and fingerprint keys directly in Vault.
3. Configure verified email, South African mobile OTP and staff MFA.
4. Import authoritative municipality and suburb boundaries with provenance.
5. Load approved real departments and routing rules.
6. Register the intended administrator through Auth, complete verification, then call `app.bootstrap_super_admin(<auth-user-uuid>)` from a privileged administrative session.

The bootstrap accepts a UUID, not credentials. Do not place the intended person's real name, email, phone, password or ID in a migration, environment example, test, screenshot or Git history. A generated checksum-valid ID is still invented and must never be used for a real person's account.

## Static frontend build for InfinityFree

After the secure backend is live and the public variables target the final HTTPS origin:

```powershell
npm run build:static
```

Upload the contents of `dist/client/` to InfinityFree's `htdocs/`. Upload **only** the public static output; never upload `.env.local`, source secrets or the Supabase service-role key. Groq, notification delivery, privileged database work, attachment processing and production rate limiting must run in protected Supabase Edge Functions or another server runtime. The repository is not deployed and no GitHub repository is created by this project.

## Documentation

- [Architecture](docs/architecture.md)
- [Data model](docs/data-model.md)
- [Database setup](docs/database-setup.md)
- [Security and privacy controls](docs/security-and-privacy.md)
- [Integration contracts](docs/integrations.md)
- [Duplicate strategy](docs/duplicate-strategy.md)
- [Resource prioritisation](docs/resource-prioritisation.md)
- [Privacy and data policy](docs/privacy-and-data.md)
- [Test plan](docs/test-plan.md)
- [Deployment](docs/deployment.md)
- [Known limitations](docs/known-limitations.md)

## Product safety boundaries

- ThumaFix SA is not an emergency service.
- A browser coordinate is device-reported or user-selected and user-confirmed; it is not verified physical presence.
- South African ID validation checks structure, encoded date and checksum only; it does not prove issuance, ownership or a name match.
- AI output is advisory, schema-validated and subject to human review.
- Possible duplicates are evidence-backed suggestions only. Linking requires an authorised human.
- Resource scores are advisory. No score dispatches or assigns a real crew.
