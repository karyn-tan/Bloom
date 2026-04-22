# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Parallel Development Note

This branch (feat/health-visualization) was developed in parallel with feat/email-reminders.
See WORKTREE_EVIDENCE.md for parallel development evidence.

@project_memory/bloom_prd.md

Always start your response with a 🌸 emoji.

---

## Project Overview

- **Bloom** is a web app for people who buy or receive cut flowers
- Core loop: upload a bouquet photo → PlantNet identifies each flower → Gemini generates tailored care tips and lifespan estimates → user tracks bouquets on a dashboard
- Target users: casual buyers (Maya) and motivated hobbyists (Priya) — see @project_memory/bloom_mom_tests.md for context

---

## Tech Stack

- **Framework:** Next.js 14, App Router, TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Auth + DB + Storage:** Supabase (Auth, Postgres, Storage, Row Level Security)
- **Flower identification:** PlantNet API — docs: https://my.plantnet.org/doc/api/varieties
- **Care tips + lifespan:** Gemini 1.5-flash
- **Rate limiting:** Upstash Redis (100 req/user/60sec)
- **Email reminders:** Resend
- **Deployment:** Vercel

---

## Commands

```bash
npm run dev          # Start local dev server
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier
npm test             # Run all tests (Vitest)
npx vitest run path/to/test.ts   # Run a single test file
npx playwright test              # Run all E2E tests
npx playwright test --grep "name" # Run a single E2E test
supabase start                   # Start local Supabase stack
supabase db push                 # Apply migrations
supabase gen types typescript --local > src/types/supabase.ts
```

---

## Architecture Decisions

- **Two-step identification:** PlantNet identifies the flower species → Gemini generates care tips from that species name. Never use a single Gemini Vision call to do both.
- **Cache Gemini results:** Store all care tips in the DB on first generation. Never re-call Gemini when a user re-opens a scan result.
- **Feature-based layout:** Code lives under `src/app/` (routes), `src/components/` (UI), `src/lib/` (API clients, utilities), `src/types/` (shared types + Supabase generated types).
- **Progressive rendering:** Render flower identification cards as each completes — do not wait for the full bouquet to process before showing results.
- **Seasonal recommendations:** Cached per user with a 24-hour TTL in the DB; do not regenerate on every page load.
- **Health state is derived, never stored:** `HealthState` (hearts + droplets) is always computed server-side in `lib/health.ts` from the care log and `added_at` date at render time. Never persist it to the DB.
- **Adaptive care tips:** Cached per bouquet per calendar day in `adaptive_tip_cache`. Do not call Gemini if a tip for today already exists. If no care actions have been logged yet, render a static onboarding prompt without calling Gemini.

---

## Coding Conventions

- **No `any` types** — ever. Use `unknown` and narrow it.
- **Zod validation** on every external API response (PlantNet, Gemini, Resend). Never trust raw API output.
- **Prettier** pre-commit hook via husky + lint-staged — never skip it (`--no-verify` is blocked).
- All environment variables accessed through a typed config module, not raw `process.env` spread through the codebase.
- **API route order:** authenticate first → rate limit second → business logic. No exceptions.
- **IDOR pattern:** always scope resource-by-ID queries with `.eq('user_id', userId)` in addition to RLS. Return 404 (not 403) when a resource isn't found or doesn't belong to the user.

### Commit Message Format

```
<type>(<scope>): <short description>
```

Types: `feat`, `fix`, `test`, `refactor`, `chore`. Scopes: `auth`, `scan`, `care`, `bouquet`, `history`, `recommendations`, `reminders`, `rls`, `ratelimit`, `health`, `careLog`.

TDD commits must follow this three-commit pattern per cycle:

```
test(scope): [RED] <describe the behavior being tested>
feat(scope): [GREEN] <minimum implementation>
refactor(scope): <what was cleaned up>
```

The `[RED]` commit contains only the failing test. The `[GREEN]` commit contains only the minimum code to pass it. Mixing test and implementation code in the same commit is not allowed.

---

## Testing Strategy

- **TDD workflow:** Write a failing test (red) → make it pass (green) → refactor. Commit at each stage.
- **Vitest** for unit tests (parsers, validators, calculators) and integration tests (API routes, Supabase RLS policies, rate limiting).
- **Playwright** for 7 E2E flows: sign-up, scan + identify, care tips display, dashboard bouquet tracking, scan history pagination, IDOR verification (user A cannot access user B's data), and plant health + adaptive tips (hearts/droplets update correctly, corrective/positive tips render based on care log).
- RLS policies must be tested directly — do not mock Supabase in integration tests.

---

## Do's and Don'ts

**DO:**

- Scope every DB query with `user_id = auth.uid()` — always, without exception
- Enable RLS on every table before writing any query logic
- Rate-limit all API routes via Upstash before any external call
- Validate all external API responses with Zod schemas
- Store uploaded images in Supabase Storage under a path scoped to the authenticated user's UID
- Use CSS variable color tokens (`--color-bg`, `--color-accent-red`, etc.) for every color — no hard-coded hex values in component files
- Use solid offset shadows (`4px 4px 0px var(--color-border)`) — not blurred `box-shadow`
- Render `HeartIcon` and `DropletIcon` as SVG components (in `src/components/icons/`) with a `filled: boolean` prop
- Compute `HealthState` in `lib/health.ts` as a pure function; pass the result to components — never derive it inside a component

**DON'T:**

- Don't call Gemini Vision directly on the photo **for identification** — use PlantNet first, then pass the species name to Gemini for care tips. Exception: `assessFreshness` in `src/lib/gemini.ts` is explicitly permitted to send the raw image to Gemini Vision for **visual freshness scoring only** (not identification). This is a deliberate product decision (F10/US-14) and must not be used for any other purpose.
- Don't regenerate Gemini care tips that are already cached in the DB
- Don't expose `PLANTNET_API_KEY`, `GEMINI_API_KEY`, or `RESEND_API_KEY` in client-side code
- Don't disable RLS on any table for any reason
- Don't use `any` types
- Don't skip the Prettier pre-commit hook
- Don't query DB resources without scoping to the authenticated user (IDOR risk)
- Don't store `HealthState` in the database — always derive it from the care log and `added_at` at render time
- Don't call Gemini for an adaptive tip if a cached tip for today already exists
- Don't use gradients, blurred shadows, `border-radius` > 4px, or pure `#ffffff`/`#000000`

---

## Security Gates (CI/CD Pipeline)

The following security gates are enforced in the CI/CD pipeline:

### 1. Pre-commit Secrets Detection (Gitleaks)

- **Tool:** Gitleaks via GitHub Actions
- **File:** `.github/workflows/security.yml`
- **Trigger:** Every push and PR
- **Purpose:** Detect committed secrets, API keys, credentials

### 2. Dependency Scanning (npm audit)

- **Tool:** npm audit
- **Trigger:** Every push and PR
- **Level:** Moderate and above
- **File:** `.github/workflows/ci.yml` (security-audit job)

### 3. SAST Analysis (CodeQL)

- **Tool:** GitHub CodeQL
- **Languages:** TypeScript, JavaScript
- **Trigger:** Push to main/develop, weekly schedule
- **File:** `.github/workflows/security.yml`

### 4. Security-focused Sub-agent

- **Agent:** `security-reviewer` in `.claude/agents/`
- **Purpose:** Review code for security issues
- **Checks:** IDOR prevention, RLS policies, API key exposure

### 5. OWASP Top 10 Awareness

This project addresses the following OWASP Top 10 (2021):

| Rank | Risk                         | Mitigation                                     |
| ---- | ---------------------------- | ---------------------------------------------- |
| A01  | Broken Access Control        | RLS policies, user_id scoping, IDOR prevention |
| A02  | Cryptographic Failures       | Supabase Auth for session management           |
| A03  | Injection                    | Zod validation on all API inputs               |
| A05  | Security Misconfiguration    | Environment validation, no debug in prod       |
| A07  | Identification/Auth Failures | Rate limiting, secure session handling         |
| A09  | Security Logging/Monitoring  | Error logging, audit trail in care_log         |

### Security Acceptance Criteria (Definition of Done)

- [ ] All new API routes have rate limiting
- [ ] All DB queries include user_id scoping
- [ ] No hardcoded secrets or API keys
- [ ] RLS policies enabled for new tables
- [ ] Zod validation on external API responses
- [ ] Error messages don't leak sensitive info
- [ ] Security-reviewer agent approval (optional)

---

## CI/CD Pipeline

### Stages

| Stage             | Command                                | Workflow                                |
| ----------------- | -------------------------------------- | --------------------------------------- |
| 1. Lint           | `npm run lint && npm run format:check` | `.github/workflows/ci.yml`              |
| 2. Type Check     | `npm run typecheck`                    | `.github/workflows/ci.yml`              |
| 3. Unit Tests     | `npm run test:ci`                      | `.github/workflows/ci.yml`              |
| 4. E2E Tests      | `npm run test:e2e`                     | `.github/workflows/ci.yml`              |
| 5. Security Audit | `npm audit`                            | `.github/workflows/security.yml`        |
| 6. AI PR Review   | C.L.E.A.R. framework                   | `.github/workflows/pr-review.yml`       |
| 7. Build          | `npm run build`                        | `.github/workflows/ci.yml`              |
| 8. Deploy         | Vercel                                 | Manual (configured in Vercel dashboard) |

### Branch Protection

- All PRs must pass CI checks before merging
- Required status checks: `lint`, `typecheck`, `unit-tests`, `build`
- Security scanning runs on all PRs
- AI review comments applied using C.L.E.A.R. framework
