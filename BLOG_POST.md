# Building Bloom: How AI-Assisted Development Changed My Workflow

_A 3-week journey building a production flower care app with Claude Code, Test-Driven Development, and GitHub Actions_

---

## Introduction

When my teammate and I set out to build **Bloom**—a cut flower care tracking app—we knew we wanted to do more than just write code. We wanted to master modern AI-assisted development workflows. Over three weeks, we built a production-grade Next.js application with 15 MVP features, 255+ tests, and a 7-stage CI/CD pipeline. Here's what we learned.

**Live App:** [https://bloom-flowering.vercel.app](https://bloom-flowering.vercel.app)  
**GitHub:** [github.com/karyn-tan/Bloom](https://github.com/karyn-tan/Bloom)

---

## The Project

Bloom helps people who receive or buy cut flowers:

1. **Upload a photo** → PlantNet API identifies each flower
2. **Get care tips** → Gemini generates personalized advice
3. **Track health** → Visual hearts/droplets show freshness
4. **Email reminders** → Never forget to water or trim

Our tech stack: Next.js 14, TypeScript, Supabase, PlantNet API, Gemini 1.5-flash, Resend, and Claude Code.

---

## Lesson 1: Custom Skills Turn Conventions into Automation

One of our first realizations: every team has conventions, but they're often tribal knowledge. We created a `tdd-feature` Claude Code skill that encoded our 3-commit pattern:

```
test(scope): [RED] description of failing test
feat(scope): [GREEN] minimum implementation
refactor(scope): cleanup and documentation
```

**The result?** Inconsistent commits became impossible. The skill auto-detected the scope from file paths, suggested similar files for pattern matching, and even logged sessions for evidence. When we needed to fix a login bug at 2 AM, the skill guided us through the exact same workflow we used at 2 PM.

**Key insight:** Skills don't just automate—they encode culture. Our PR reviews became faster because everyone knew the pattern.

---

## Lesson 2: Parallel Development with Git Worktrees

Ever been mid-feature when your teammate needs you on their branch? We solved this with **git worktrees**.

While I built health visualization in `Bloom/`, my teammate developed email reminders in `Bloom-email-reminders/`. Same repo, different directories, completely independent:

```bash
git worktree add ../Bloom-email-reminders feat/email-reminders
git worktree list
# /Users/hemang/Bloom [feat/health-visualization]
# /Users/hemang/Bloom-email-reminders [feat/email-reminders]
```

Our git history shows the magic:

```
* ce03485 docs(health): parallel dev docs
* 7bec2a0 refactor(health): add comment
| * dce5b1c docs(reminders): parallel dev docs
| * 6df924f refactor(reminders): add comment
|/
* 2bc3db1 SHARED BASE
```

Both branches diverged from the same commit—true parallel development. No stashing, no "give me a minute," just flow.

---

## Lesson 3: MCP Makes Context Switching Disappear

The Model Context Protocol (MCP) was transformative. We configured three servers:

1. **Supabase MCP** → Query database schemas mid-coding
2. **Playwright MCP** → Run E2E tests without leaving Claude
3. **GitHub MCP** → Check issues and create PRs

Before MCP, building the login feature meant: editor → browser (Supabase) → editor → terminal (tests) → editor → browser (GitHub).

With MCP? Everything stayed in context. We estimate **~70% reduction in context switches**. When you're deep in flow, that matters.

---

## Lesson 4: TDD Isn't Slow—It's Insurance

I'll admit: writing tests first felt unnatural. For health visualization, I wanted to jump to the hearts/droplets UI. But forcing the [RED] commit first caught edge cases I'd have missed:

- Empty care logs (new bouquets have no history)
- Date boundary errors (UTC vs local time)
- Division by zero (lifespan calculations)

When we refactored the health calculation three weeks later, those tests saved us. We changed the algorithm confidently because 255+ tests had our backs.

**The numbers:**

- 255+ tests passing
- 70.74% line coverage
- 87.32% branch coverage

Not because we chased metrics—because TDD made it natural.

---

## Lesson 5: CI/CD Is Documentation That Runs

Our 7-stage GitHub Actions pipeline started as a "nice to have" and became essential:

1. Lint & Format
2. Type Check
3. Unit Tests
4. Security Audit
5. Build
6. E2E Tests
7. CI Summary

Initially, it felt bureaucratic. Then we caught a security vulnerability (exposed API key in logs) during the Security Audit stage. The Type Check stage found a type error that would have crashed production. The pipeline became our safety net.

**Security gates we implemented:**

- Gitleaks for secrets detection
- npm audit for dependencies
- CodeQL for SAST analysis
- RLS policies on every table

The pipeline runs on every push. When it passes, we deploy with confidence.

---

## Lesson 6: The C.L.E.A.R. Framework Makes Reviews Actually Useful

PR reviews used to be "LGTM" or nitpicks. We adopted the C.L.E.A.R. framework:

- **Context:** What problem does this solve?
- **Logic:** Is the implementation sound?
- **Evidence:** Are there tests and docs?
- **Architecture:** Does it follow conventions?
- **Risk:** What could go wrong?

One review caught an IDOR vulnerability—I forgot to scope care_log queries by user_id. The "Risk" question forced me to think about data exposure. The fix was two lines; the impact was preventing users from seeing each other's private data.

Structured frameworks beat gut feelings.

---

## What We Built

| Feature                                | Tech                             | Status |
| -------------------------------------- | -------------------------------- | ------ |
| Auth (email/password, Google OAuth)    | Supabase Auth                    | ✅     |
| Photo upload & identification          | PlantNet API                     | ✅     |
| Care tips generation                   | Gemini 1.5-flash                 | ✅     |
| Health visualization (hearts/droplets) | Custom SVG components            | ✅     |
| Email reminders                        | Supabase Edge Functions + Resend | ✅     |
| Adaptive care tips                     | Gemini + caching                 | ✅     |
| CI/CD pipeline                         | GitHub Actions (7 stages)        | ✅     |
| 255+ tests                             | Vitest + Playwright              | ✅     |

---

## The Numbers

- **3 weeks** from zero to production
- **15 MVP features** complete
- **255+ tests** passing
- **70%+ coverage** achieved
- **7 CI/CD stages** automated
- **2 sprints** with retrospectives
- **12 GitHub Issues** with acceptance criteria

---

## Would We Do It Again?

Absolutely. The Claude Code workflow—skills, MCP, agents—felt like having a senior engineer pair programming. But here's what surprised me: **the AI didn't replace thinking; it amplified it.**

We still architected. We still designed. We still made hard decisions about tradeoffs (Edge Functions vs API routes? Supabase vs PlanetScale?). The AI handled the boilerplate so we could focus on the interesting parts.

If you're considering AI-assisted development:

1. **Start with conventions** → Encode them in skills
2. **Parallelize early** → Use worktrees
3. **Test first** → RED/GREEN/REFACTOR isn't optional
4. **Automate quality** → CI/CD isn't bureaucracy, it's safety
5. **Review systematically** → C.L.E.A.R. beats "looks good to me"

---

## Try It Yourself

[https://bloom-flowering.vercel.app](https://bloom-flowering.vercel.app)

Upload a flower photo. Watch PlantNet identify it. See Gemini generate care tips. Track your bouquet's health.

Or check the code: [github.com/karyn-tan/Bloom](https://github.com/karyn-tan/Bloom)

---

## About the Authors

**Hemang Murugan** and **Feng Hua Tan** built this as Project 3 for CS 4530/4531 - Software Engineering at Northeastern University. The project demonstrates mastery of Claude Code extensibility, professional AI-assisted workflows, and production engineering practices.

---

**Questions?** Reach out or open an issue on GitHub.

#ai #webdevelopment #nextjs #tdd #cicd #softwareengineering #claude #openai #education #studentproject
