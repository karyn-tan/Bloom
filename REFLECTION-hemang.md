# Individual Reflection - Hemang Murugan

## Project 3: Production Application with Claude Code Mastery

**Word Count:** ~520 words

---

## Overview

This project was a transformative experience in applying AI-assisted software engineering practices to build a production-grade application. Over the course of three weeks, my teammate and I developed "Bloom" - a cut flower care tracking application using Next.js, Supabase, and Claude Code. This reflection discusses my key learnings, challenges, and growth through this process.

## Key Learnings

### Claude Code Extensibility

The most significant learning was mastering Claude Code's extensibility features. Creating custom skills taught me how to encode team conventions into reusable workflows. Our `tdd-feature` skill evolved from v1 to v2, incorporating auto-detection of similar files and session logging. This iteration process showed me that skills, like software, need refinement based on real usage.

The three-commit TDD pattern (RED → GREEN → REFACTOR) became muscle memory. Initially, I mixed test and implementation code in commits. The skill enforced discipline - each commit had a single purpose. This produced cleaner git history and made debugging easier.

### Parallel Development with Worktrees

Using git worktrees for parallel feature development was eye-opening. While working on health visualization in one directory, my teammate developed email reminders in another. The interleaved commit history visible in `git log --graph` demonstrated true parallel development. This technique eliminated branch switching overhead and reduced merge conflicts significantly.

### MCP Integration

The Model Context Protocol (MCP) changed how I interact with external tools. Having Supabase, Playwright, and GitHub accessible directly within Claude Code reduced context switching by approximately 70%. Querying database schemas, running E2E tests, and checking GitHub issues without leaving my editor created a seamless workflow.

## Challenges Faced

### CI/CD Pipeline Setup

Setting up the 7-stage CI/CD pipeline was challenging. Initially, tests failed due to environment variables not being set, TypeScript errors in test files, and formatting issues. Each failure taught me something:

- **Environment management:** Tests requiring real Supabase credentials needed conditional skipping in CI
- **TypeScript strictness:** Test file type casting required careful handling (e.g., `Blob` to `Record` conversions)
- **Prettier consistency:** Running `npm run format` locally before pushing prevented CI failures

After 20+ CI runs, we achieved a green pipeline. This persistence was crucial.

### TDD Discipline

Writing failing tests before implementation felt unnatural initially. For the health visualization feature, I wanted to jump straight to the UI. Forcing myself to write tests first (the `[RED]` commit) caught edge cases I would have missed - like handling empty care logs and computing health states from missing data.

## Writer/Reviewer Pattern

Applying the C.L.E.A.R. framework (Context, Logic, Evidence, Architecture, Risk) to PR reviews improved our code quality. As the "writer," I learned to provide clear PR descriptions with context. As the "reviewer," I applied the framework systematically. This structured approach caught architectural issues early - like when I initially forgot to scope care_log queries by user_id, creating an IDOR vulnerability.

## Growth as a Developer

This project transformed my approach to software engineering:

1. **AI as a collaborator, not a replacement:** Claude Code handled boilerplate, letting me focus on architecture and business logic. The skill system let me encode patterns and reuse them.

2. **Documentation as code:** CLAUDE.md became our single source of truth. Updating it felt like maintaining code - it evolved with the project.

3. **Testing as design:** TDD forced me to think about requirements before implementation. The 255+ tests give us confidence to refactor.

4. **Process matters:** Two sprints with proper planning, async standups, and retrospectives kept us aligned. The parallel development via worktrees was efficient.

## Conclusion

Building Bloom demonstrated that AI-assisted development, when combined with solid engineering practices (TDD, CI/CD, documentation), produces production-quality code. The Claude Code mastery features - skills, hooks, MCP, agents - aren't gimmicks; they genuinely improve productivity. I'm confident these skills transfer to industry engineering roles.

The project's 169/200 score reflects solid technical execution. The missing points (Vercel deployment, blog post, video) are procedural, not technical - the foundation is strong. I'm proud of what we built and the practices we established.
