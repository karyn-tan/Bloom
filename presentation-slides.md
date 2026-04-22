# Bloom — Presentation Slides

---

## Slide 1: Title

**Bloom**
Know Your Flowers. Keep Them Alive.

Feng Hua Tan & Hemang Murugan

---

## Slide 2: Introduction

Bloom is a web app for people who buy or receive cut flowers.

Upload a photo of your bouquet, and Bloom identifies each flower, tells you how long it will last, and gives you exactly what you need to keep it alive longer.

No guessing. No Googling. Just scan and care.

---

## Slide 3: Objective

Help casual flower buyers bridge the gap between "I have flowers" and "I know exactly what to do with them."

Bloom aims to:

1. Identify flowers instantly from a single bouquet photo
2. Deliver species-specific care tips that are actionable, not generic
3. Track bouquet health over time so users know when to act
4. Build flower literacy through purchase history and seasonal recommendations

---

## Slide 4: Problem Statement

People who buy cut flowers routinely watch them die faster than expected and feel like they did something wrong. The root failure is identification. If you cannot name the flowers in your bouquet, you cannot act on any species-specific care advice.

**Maya, 26, grad student:**
> "The article had a lot of specific stuff like 'for roses do this, for tulips do that' and I didn't actually know what I had, so I just did the general tips and hoped for the best."

**Priya, 34, motivated hobbyist:**
> "I bought ranunculus for the first time and lost the whole bunch because I didn't know they need cold water. Looked it up after the fact, which was too late obviously."

The information exists. The problem is that it assumes knowledge buyers do not have.

---

## Slide 5: Design

**Visual Language:** Neo-brutalist with a hand-drawn retro aesthetic inspired by Cuphead (2017)

**Design Principles:**
- Bold ink outlines, thick 2px borders on everything
- Solid offset shadows (no blurred drop shadows)
- Warm, saturated muted color palette (cream, brick red, golden yellow, moss teal, deep navy)
- Pixel-art style heart and water droplet icons for the health system
- No gradients, no rounded corners, no pure black or white

**Color Palette:**
- Background: warm cream (#f5edd6)
- Cards: near-white (#fdf6e3)
- Borders/text: deep navy (#1a1a2e)
- Primary accent: brick red (#c0392b)
- Secondary accent: golden yellow (#e2a12b)
- Success: moss teal (#2a7f6f)

---

## Slide 6: Mockups

*Screenshots from the live application at https://bloom-flowering.vercel.app*

**Suggested screenshots to include:**
- Login/signup page showing the neo-brutalist design
- Dashboard with active bouquets, hearts, and water droplets
- Scan results page with flower cards showing care tips, lifespan, and fun facts
- Bouquet detail page with the "How's it going?" adaptive tip section
- Seasonal recommendations section

---

## Slide 7: Technologies Used

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 (App Router), TypeScript | Server components keep API keys secure, co-located API routes |
| Styling | Tailwind CSS | Fast iteration with consistent design tokens |
| Auth, DB, Storage | Supabase | Auth, Postgres, Storage, RLS all in one service |
| Flower Identification | PlantNet API | Domain-specific plant ID, more accurate than general vision models |
| Care Tips + Lifespan | Google Gemini 1.5 Flash | Fast structured JSON generation from species names |
| Rate Limiting | Upstash Redis | Serverless-compatible sliding window rate limiting |
| Email Reminders | Resend | Transactional email for care reminders |
| CI/CD | GitHub Actions (7 stages) | Lint, typecheck, tests, security audit, build, E2E, AI review |
| Deployment | Vercel | Zero-config Next.js deployment |
| AI-Assisted Dev | Claude Code | TDD workflow, custom skills, sub-agents, MCP integrations |

---

## Slide 8: What We Are Most Proud Of

**The two-step identification architecture.** PlantNet identifies the flower first, then Gemini generates care tips from the species name. This separation means identification errors are caught and surfaced before wrong care advice is ever generated. It is a deliberate design decision that protects the user from silent failures.

**The health visualization system.** Hearts and water droplets give bouquet health a tactile, game-like quality. Hearts track lifespan (time-based), droplets track hydration (behavior-based), and they are completely independent. The whole thing is computed as a pure function server-side, never stored in the database, and fully unit tested.

**Rigorous TDD from day one.** Every feature followed the RED, GREEN, REFACTOR commit pattern. You can trace any feature through the git history and see the failing test, the minimal implementation, and the cleanup as three separate commits. 255+ tests, 70%+ coverage, and a CI pipeline with 7 stages and 5 security gates.

**Real collaboration.** We coordinated daily over WhatsApp, took turns on features, and helped each other through blockers. The parallel development workflow using git worktrees meant we could work on health visualization and email reminders simultaneously without stepping on each other.

---

## Slide 9: What We Struggled Most With

**Getting the CI/CD pipeline green.** After writing all the features and tests locally, getting everything to pass in GitHub Actions was a multi-day effort. TypeScript errors that did not surface locally, ESLint configuration conflicts, integration tests that needed real infrastructure, and type casting issues across dozens of test files all had to be resolved one by one.

**Supabase RLS and IDOR prevention.** Ensuring every single database query was scoped to the authenticated user, and that Row Level Security policies were correctly configured for every table, required meticulous attention. One missed `.eq('user_id', userId)` could create a security vulnerability. We had to run security reviews and fix critical issues multiple times.

**Gemini response reliability.** Gemini does not guarantee a stable JSON schema. Getting consistent, parseable responses required careful prompt engineering and strict Zod validation on every response. Handling malformed responses gracefully without showing blank or broken cards to the user was harder than expected.

**Merging parallel work.** Working in separate git worktrees was powerful, but merging the two feature branches back together required careful conflict resolution, especially where both branches touched shared files like configuration and types.

---

## Slide 10: Demo

**Live Application:** https://bloom-flowering.vercel.app

**Video Walkthrough:** https://www.youtube.com/watch?v=gZB-fzI3WCc

**GitHub Repository:** https://github.com/karyn-tan/Bloom
