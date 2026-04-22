# Sprint 2 Planning

**Sprint:** Sprint 2  
**Dates:** April 15 - April 21, 2026  
**Duration:** 1 week  
**Team:** Hemang Murugan, Feng Hua Tan

---

## Sprint Goal

Implement health visualization, email reminders, and CI/CD pipeline to complete core MVP features and establish production-ready infrastructure.

---

## User Stories Committed

| US    | Story                                                                                               | Points | Assignee |
| ----- | --------------------------------------------------------------------------------------------------- | ------ | -------- |
| US-7  | As a user, I want to see care tips for my flowers so that I know how to keep them healthy           | 5      | Feng Hua |
| US-10 | As a user, I want to track multiple bouquets so that I can manage different arrangements            | 3      | Hemang   |
| US-12 | As a user, I want email reminders so that I don't forget to care for my flowers                     | 5      | Hemang   |
| US-14 | As a user, I want to see health status with hearts/droplets so that I know how my flowers are doing | 5      | Hemang   |
| US-15 | As a user, I want adaptive care tips based on my actions so that I get relevant advice              | 3      | Feng Hua |

**Total Story Points:** 21

---

## Technical Tasks

### Health Visualization & Care Tips (Hemang)

- [ ] Implement health state calculation (hearts + droplets)
- [ ] Create health.ts module with pure functions
- [ ] Build CareActionButtons component
- [ ] Create care log API with rate limiting
- [ ] Write unit tests for health module (TDD pattern)
- [ ] Add Playwright E2E tests for health flow
- [ ] Integrate AdaptiveTipCard for health status

### Email Reminders & Tracking (Hemang)

- [ ] Create Supabase Edge Function for email sending
- [ ] Integrate Resend API for email delivery
- [ ] Build reminder scheduling API
- [ ] Add reminder opt-in to bouquet save form
- [ ] Write tests for reminder scheduling
- [ ] Deploy Edge Function to Supabase

### Adaptive Care Tips (Feng Hua)

- [ ] Implement adaptive_tip_cache table
- [ ] Create /api/adaptive-tip API route
- [ ] Integrate Gemini for tip generation
- [ ] Add caching logic (no duplicate calls for same day)
- [ ] Write unit tests for tip generation
- [ ] Create AdaptiveTipCard component

### CI/CD Pipeline (Both)

- [ ] Set up GitHub Actions workflows (7 stages)
- [ ] Configure lint, typecheck, test jobs
- [ ] Add security scanning (Gitleaks, CodeQL, npm audit)
- [ ] Set up PR review automation
- [ ] Configure build and deploy stages
- [ ] Fix all CI pipeline errors
- [ ] Achieve 70%+ test coverage

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (TDD: RED→GREEN→REFACTOR)
- [ ] Integration tests for API routes
- [ ] E2E tests for critical paths
- [ ] Code reviewed with C.L.E.A.R. framework
- [ ] CI/CD pipeline green
- [ ] RLS policies enabled
- [ ] Documentation updated

---

## Sprint Board

| To Do                  | In Progress | Review | Done |
| ---------------------- | ----------- | ------ | ---- |
| US-10 Bouquet tracking |             |        |      |
| US-12 Email reminders  |             |        |      |
| US-15 Adaptive tips    |             |        |      |
| CI/CD Pipeline         |             |        |      |
| US-7 Care tips         |             |        |      |
| US-14 Health viz       |             |        |      |

---

## Async Standups

### April 16, 2026

**Hemang:** Started health module with TDD. Writing failing tests first. Blocker: None.  
**Feng Hua:** Set up adaptive_tip_cache migration. Starting Gemini integration.

### April 18, 2026

**Hemang:** Health visualization complete with tests. Working on email reminders Edge Function. Blocker: Need Resend API key for testing.  
**Feng Hua:** Adaptive tips API working with caching. Need to fix TypeScript errors in tests.

### April 20, 2026

**Hemang:** Email reminders deployed. CI/CD pipeline mostly working, fixing formatting issues. Blocker: None.  
**Feng Hua:** AdaptiveTipCard integrated into scan detail. All tests passing. Ready for PR.

---

## Risks & Mitigation

| Risk                                   | Probability | Impact | Mitigation                                           |
| -------------------------------------- | ----------- | ------ | ---------------------------------------------------- |
| CI/CD setup takes longer than expected | High        | Medium | Start early, use continue-on-error where appropriate |
| Gemini API rate limits                 | Medium      | High   | Implement caching, monitor usage                     |
| Edge Function cold starts              | Medium      | Low    | Acceptable for non-real-time emails                  |
| Parallel git worktree conflicts        | Low         | Medium | Regular pushes, clear commit messages                |

---

## Parallel Development

This sprint uses **git worktrees** for parallel feature development:

| Feature              | Branch                    | Worktree                 | Assignee |
| -------------------- | ------------------------- | ------------------------ | -------- |
| Health Visualization | feat/health-visualization | `Bloom/`                 | Hemang   |
| Email Reminders      | feat/email-reminders      | `Bloom-email-reminders/` | Hemang   |
| Adaptive Care Tips   | feat/adaptive-care-tips   | (shared)                 | Feng Hua |

**Base Commit:** `2bc3db1` (shared between all branches)

---

## Sprint 2 Success Criteria

- [ ] CI/CD pipeline passes all 7 stages
- [ ] 70%+ test coverage achieved
- [ ] 2+ features showing TDD pattern in git history
- [ ] All RLS policies tested
- [ ] Writer/Reviewer pattern used for PRs

---

## AI Disclosure

**Tool Used:** Claude Code (anthropic/claude-code)  
**AI-Generated:** ~65% (planning template, task breakdowns, risk assessment)  
**Human Review:** ✅ Both teammates reviewed and approved sprint commitment
