# Sprint 2 Retrospective

**Sprint:** Sprint 2  
**Dates:** April 15 - April 21, 2026  
**Duration:** 1 week

---

## Sprint Summary

**Goal:** Implement health visualization, email reminders, adaptive tips, and CI/CD pipeline  
**Status:** ✅ Completed  
**Velocity:** 21/21 points delivered (100%)

---

## What Went Well

### Hemang

- Health visualization with hearts/droplets looks great and works smoothly
- Email reminders Edge Function deployed successfully with Supabase
- CI/CD pipeline is now fully operational with all 7 stages
- Parallel development with git worktrees was efficient
- Achieved 70.74% test coverage (exceeded 70% target)
- TDD pattern visible in git history with [RED]/[GREEN] commits

### Feng Hua

- Adaptive care tips with Gemini integration working well
- Caching prevents duplicate API calls (saves costs)
- AdaptiveTipCard component is clean and reusable
- Integration with scan detail page is seamless

### Team

- Writer/Reviewer pattern with C.L.E.A.R. framework applied to PRs
- AI PR review workflow is configured
- Security scanning (Gitleaks + CodeQL + npm audit) all passing
- Async standups kept us synchronized
- Git worktrees enabled true parallel development

---

## What Could Be Improved

### Hemang

- E2E tests require dev server running - need better isolation
- Some CI pipeline iterations needed to fix formatting issues
- Should have run prettier locally before pushing
- Resend API key management needs documentation

### Feng Hua

- Gemini response parsing could be more robust
- Should add more edge case tests for adaptive tips
- Type casting in tests needs better type safety

### Team

- Need to document E2E test setup requirements
- Should establish pre-commit hooks for formatting
- Need to add more integration tests for RLS policies

---

## Completed Features

| Feature                      | Status | Evidence                                    | TDD Pattern               |
| ---------------------------- | ------ | ------------------------------------------- | ------------------------- |
| Health Visualization (US-14) | ✅     | `src/lib/health.ts`, hearts/droplets UI     | ✅ [RED]→[GREEN]→refactor |
| Email Reminders (US-12)      | ✅     | Supabase Edge Function, `/api/reminders`    | ✅ [RED]→[GREEN]→refactor |
| Adaptive Care Tips (US-15)   | ✅     | `src/app/api/adaptive-tip/`, caching        | ✅ [RED]→[GREEN]→refactor |
| CI/CD Pipeline (W14)         | ✅     | `.github/workflows/` (3 workflows)          | N/A                       |
| Writer/Reviewer + C.L.E.A.R. | ✅     | PR comments with framework applied          | N/A                       |
| Parallel Development         | ✅     | Worktree evidence in `WORKTREE_EVIDENCE.md` | N/A                       |

---

## Action Items

| Item                             | Owner    | Status         |
| -------------------------------- | -------- | -------------- |
| Add pre-commit hook for Prettier | Hemang   | ⏳ Pending     |
| Document E2E test requirements   | Feng Hua | ⏳ Pending     |
| Add more RLS integration tests   | Both     | ⏳ Pending     |
| Deploy to Vercel production      | Both     | ⏳ Next Sprint |

---

## Metrics

| Metric                   | Target | Actual    |
| ------------------------ | ------ | --------- |
| Story Points Completed   | 21     | 21 ✅     |
| Test Coverage            | >70%   | 70.74% ✅ |
| CI/CD Stages Passing     | 7/7    | 7/7 ✅    |
| Security Gates           | 4+     | 5 ✅      |
| TDD Features (RED/GREEN) | 3+     | 4 ✅      |
| PRs with C.L.E.A.R.      | 2+     | 2+ ✅     |

---

## C.L.E.A.R. Framework Review

### Context

Completing MVP features before deadline requires efficient parallel development and solid CI/CD infrastructure. Health visualization and adaptive tips are key differentiators for Bloom.

### Logic

- Health state derived from care log (pure function)
- Caching prevents unnecessary Gemini API calls
- CI/CD early feedback loop catches issues quickly
- Parallel worktrees prevent branch conflicts

### Evidence

- 255+ tests passing
- 70.74% coverage achieved
- CI pipeline green
- Worktree commits visible in git log
- Writer/Reviewer pattern documented in PRs

### Architecture

- Health module: pure functions for testability
- Edge Functions: serverless for email reminders
- CI/CD: GitHub Actions with 7 stages
- Worktrees: separate directories for parallel features

### Risk

- E2E tests depend on dev server (mitigation: skip in CI, run locally)
- Third-party API dependencies (mitigation: caching, fallbacks)
- Low risk remaining for MVP completion

---

## Completed Requirements Checklist

### W10: CLAUDE.md & Memory

- ✅ Comprehensive CLAUDE.md with @imports
- ✅ Auto-memory usage documented
- ✅ CLAUDE.md evolution visible in git

### W11: TDD

- ✅ 3+ features with TDD pattern
- ✅ 255+ tests passing
- ✅ [RED]→[GREEN]→refactor commits visible

### W12: Skills, Hooks, MCP, Agents

- ✅ 2+ custom skills (tdd-feature v1→v2, create-pr)
- ✅ 2+ hooks configured (PreToolUse, PostToolUse)
- ✅ MCP servers integrated (3 configured)
- ✅ Custom agents (test-writer, security-reviewer)
- ✅ Parallel development with worktrees

### W12: Writer/Reviewer + C.L.E.A.R.

- ✅ 2+ PRs with writer/reviewer pattern
- ✅ C.L.E.A.R. framework applied
- ✅ AI disclosure metadata

### W14: CI/CD & Security

- ✅ 7-stage CI pipeline
- ✅ 5 security gates
- ✅ 70%+ test coverage

---

## Team Feedback

### Hemang → Feng Hua

"Excellent work on the adaptive care tips! The caching implementation is efficient and the component is well-structured. The C.L.E.A.R. reviews on my PRs were thorough and helpful."

### Feng Hua → Hemang

"Great job on the CI/CD pipeline and health visualization. The parallel development with worktrees worked smoothly. Let's make sure we document the E2E test setup for future reference."

---

## Sprint 3 Priorities (If Continuing)

1. Deploy to Vercel production
2. Complete technical blog post
3. Record video demonstration
4. Write individual reflections
5. Final submission preparation

---

## AI Disclosure

**Tool Used:** Claude Code (anthropic/claude-code)  
**AI-Generated:** ~55% (structure, metrics, framework application)  
**Human Review:** ✅ Both teammates contributed insights and reviewed deliverables
