# GitHub Issues - Bloom Project

This document contains all GitHub Issues for the Bloom project with acceptance criteria formatted as testable specifications.

---

## Sprint 1 Issues

### Issue #1: US-1 - Signup with Email/Password

**Labels:** `user-story`, `auth`, `sprint-1`, `mvp`  
**Assignee:** Hemang  
**Status:** ✅ Closed (completed in Sprint 1)

#### Description

As a new user, I want to sign up with email/password so that I can create an account.

#### Acceptance Criteria (Testable Specifications)

- [ ] **AC1:** Given valid email and password (8+ chars), when user submits signup form, then account is created and user is redirected to dashboard
- [ ] **AC2:** Given invalid email format, when user submits form, then error message "Invalid email format" is displayed
- [ ] **AC3:** Given password < 8 characters, when user submits form, then error message "Password must be at least 8 characters" is displayed
- [ ] **AC4:** Given existing email, when user submits form, then error message "Email already registered" is displayed
- [ ] **AC5:** Given valid signup, when user is created, then rate limit of 100 requests per 60 seconds is enforced

#### Definition of Done

- [ ] Unit tests for all acceptance criteria
- [ ] Integration tests for API route
- [ ] RLS policies enabled
- [ ] Rate limiting implemented
- [ ] Code reviewed with C.L.E.A.R. framework

#### Technical Notes

- API Route: `POST /api/auth/signup`
- Zod validation for email and password
- Supabase Auth integration
- Upstash Redis for rate limiting

---

### Issue #2: US-2 - Login with Email/Password

**Labels:** `user-story`, `auth`, `sprint-1`, `mvp`  
**Assignee:** Hemang  
**Status:** ✅ Closed (completed in Sprint 1)

#### Description

As a returning user, I want to log in so that I can access my saved scans.

#### Acceptance Criteria (Testable Specifications)

- [ ] **AC1:** Given valid credentials, when user submits login form, then session is created and user is redirected to dashboard
- [ ] **AC2:** Given invalid email, when user submits form, then error message "Invalid email or password" is displayed (no user enumeration)
- [ ] **AC3:** Given invalid password, when user submits form, then error message "Invalid email or password" is displayed
- [ ] **AC4:** Given rate limit exceeded, when user submits form, then 429 response with "Too many requests" message

#### Definition of Done

- [ ] Unit tests for all acceptance criteria
- [ ] Integration tests for API route
- [ ] Security tests for IDOR prevention
- [ ] Rate limiting verified

#### Technical Notes

- API Route: `POST /api/auth/login`
- Supabase Auth session management
- Rate limiting: 100 req/user/60sec

---

### Issue #3: US-3 - Logout

**Labels:** `user-story`, `auth`, `sprint-1`, `mvp`  
**Assignee:** Hemang  
**Status:** ✅ Closed (completed in Sprint 1)

#### Description

As a user, I want to log out so that I can secure my account.

#### Acceptance Criteria (Testable Specifications)

- [ ] **AC1:** Given authenticated user, when logout button is clicked, then session is terminated and user is redirected to login page
- [ ] **AC2:** Given logged out user, when accessing protected route, then middleware redirects to login
- [ ] **AC3:** Given logout request, when Supabase returns error, then user sees "Logout failed" message

#### Technical Notes

- API Route: `POST /api/auth/logout`
- Middleware protection on protected routes
- Supabase session cleanup

---

### Issue #4: US-4 - Photo Upload

**Labels:** `user-story`, `scan`, `sprint-1`, `mvp`  
**Assignee:** Feng Hua  
**Status:** ✅ Closed (completed in Sprint 1)

#### Description

As a user, I want to upload a photo of my flowers so that the app can identify them.

#### Acceptance Criteria (Testable Specifications)

- [ ] **AC1:** Given valid JPEG/PNG image (< 10MB), when user uploads photo, then image is stored in Supabase Storage
- [ ] **AC2:** Given file > 10MB, when user uploads, then error "Photo must be under 10 MB" is displayed
- [ ] **AC3:** Given non-image file, when user uploads, then error "Please upload a JPEG or PNG photo" is displayed
- [ ] **AC4:** Given upload success, when photo is stored, then scan record is created with image_url

#### Definition of Done

- [ ] Client-side validation
- [ ] Server-side validation
- [ ] Supabase Storage integration
- [ ] Progress indicator during upload

#### Technical Notes

- Component: `ImageUploader.tsx`
- Storage bucket: `flower-images`
- File path: `{user_id}/{timestamp}-{filename}`

---

### Issue #5: US-5 - Flower Identification

**Labels:** `user-story`, `scan`, `sprint-1`, `mvp`  
**Assignee:** Feng Hua  
**Status:** ✅ Closed (completed in Sprint 1)

#### Description

As a user, I want to see identified flowers with confidence scores so that I know what I'm caring for.

#### Acceptance Criteria (Testable Specifications)

- [ ] **AC1:** Given uploaded photo, when identification runs, then PlantNet API returns species names with confidence scores
- [ ] **AC2:** Given identification results, when user views scan, then each flower shows common name, scientific name, and confidence badge
- [ ] **AC3:** Given confidence < 50%, when results display, then "Low confidence" warning is shown
- [ ] **AC4:** Given identification failure, when API returns error, then user sees "Identification failed" with retry option

#### Definition of Done

- [ ] PlantNet API integration
- [ ] Confidence badge component
- [ ] Error handling for API failures
- [ ] Retry functionality

#### Technical Notes

- API Route: `POST /api/identify`
- PlantNet API: `https://my-api.plantnet.org/v2/identify`
- Response parsing with Zod validation

---

## Sprint 2 Issues

### Issue #6: US-7 - Care Tips Display

**Labels:** `user-story`, `care`, `sprint-2`, `mvp`  
**Assignee:** Feng Hua  
**Status:** ✅ Closed (completed in Sprint 2)

#### Description

As a user, I want to see care tips for my flowers so that I know how to keep them healthy.

#### Acceptance Criteria (Testable Specifications)

- [ ] **AC1:** Given identified flower, when care tips load, then Gemini generates water, light, temperature, and trim advice
- [ ] **AC2:** Given care tips, when user views scan, then tips display in organized sections
- [ ] **AC3:** Given Gemini API failure, when tips fail to load, then user sees "Care tips unavailable" with retry button
- [ ] **AC4:** Given successful tips, when user revisits scan, then cached tips are displayed (no duplicate API calls)

#### Definition of Done

- [ ] Gemini API integration
- [ ] Care tip caching
- [ ] Loading skeleton states
- [ ] Error handling with retry

#### Technical Notes

- API integration in `identify` flow
- Gemini 1.5-flash model
- Cache in `flowers` table

---

### Issue #7: US-10 - Multi-Bouquet Tracking

**Labels:** `user-story`, `bouquet`, `sprint-2`, `mvp`  
**Assignee:** Hemang  
**Status:** ✅ Closed (completed in Sprint 2)

#### Description

As a user, I want to track multiple bouquets so that I can manage different arrangements.

#### Acceptance Criteria (Testable Specifications)

- [ ] **AC1:** Given scan results, when user saves bouquet, then bouquet appears in dashboard
- [ ] **AC2:** Given multiple bouquets, when viewing dashboard, then all bouquets display with age and status
- [ ] **AC3:** Given past-peak bouquet, when viewing dashboard, then status badge shows "Past Peak"
- [ ] **AC4:** Given bouquet, when user deletes it, then bouquet is removed from dashboard and storage cleanup runs

#### Definition of Done

- [ ] Save bouquet form with validation
- [ ] Dashboard with bouquet grid
- [ ] Delete functionality with confirmation
- [ ] Storage cleanup on delete

#### Technical Notes

- Component: `SaveBouquetForm.tsx`
- API: `POST /api/bouquets`, `DELETE /api/bouquets/[id]`
- RLS: user_id scoping enforced

---

### Issue #8: US-12 - Email Reminders

**Labels:** `user-story`, `reminders`, `sprint-2`, `mvp`  
**Assignee:** Hemang  
**Status:** ✅ Closed (completed in Sprint 2)

#### Description

As a user, I want email reminders so that I don't forget to care for my flowers.

#### Acceptance Criteria (Testable Specifications)

- [ ] **AC1:** Given bouquet save with opt-in, when reminder is scheduled, then first reminder is set for 2 days later
- [ ] **AC2:** Given due reminder, when Edge Function runs, then email is sent via Resend API
- [ ] **AC3:** Given sent reminder, when processed, then next reminder is scheduled 2 days later
- [ ] **AC4:** Given user request, when canceling reminders, then all future reminders are canceled

#### Definition of Done

- [ ] Resend API integration
- [ ] Supabase Edge Function deployed
- [ ] Email template with care instructions
- [ ] Scheduling logic with UTC handling

#### Technical Notes

- Edge Function: `send-email-reminder`
- Resend API for email delivery
- Cron job or manual trigger

---

### Issue #9: US-14 - Health Visualization

**Labels:** `user-story`, `health`, `sprint-2`, `mvp`  
**Assignee:** Hemang  
**Status:** ✅ Closed (completed in Sprint 2)

#### Description

As a user, I want to see health status with hearts/droplets so that I know how my flowers are doing.

#### Acceptance Criteria (Testable Specifications)

- [ ] **AC1:** Given fresh bouquet (< 2 days), when viewing health, then 3 hearts and 5 droplets display
- [ ] **AC2:** Given missed watering (> 2 days), when viewing health, then droplets decrease to 3 and corrective tip shows
- [ ] **AC3:** Given watering logged, when action is saved, then health indicators update without page reload
- [ ] **AC4:** Given health status, when viewing detail, then AdaptiveTipCard shows status-based background

#### Definition of Done

- [ ] Health state pure function
- [ ] Heart/Droplet icons with fill states
- [ ] CareActionButtons component
- [ ] Real-time updates on action
- [ ] TDD: [RED]→[GREEN]→refactor commits

#### Technical Notes

- Module: `src/lib/health.ts`
- Components: `HeartIcon`, `DropletIcon`, `CareActionButtons`
- Derived state: never stored in DB

---

### Issue #10: US-15 - Adaptive Care Tips

**Labels:** `user-story`, `care`, `sprint-2`, `mvp`  
**Assignee:** Feng Hua  
**Status:** ✅ Closed (completed in Sprint 2)

#### Description

As a user, I want adaptive care tips based on my actions so that I get relevant advice.

#### Acceptance Criteria (Testable Specifications)

- [ ] **AC1:** Given no care actions, when viewing tip, then onboarding prompt displays
- [ ] **AC2:** Given missed watering, when requesting tip, then corrective tip is generated
- [ ] **AC3:** Given good care, when requesting tip, then positive affirmation is shown
- [ ] **AC4:** Given existing tip for today, when requesting again, then cached tip is returned (no Gemini call)
- [ ] **AC5:** Given invalid bouquet_id, when requesting tip, then 400 error is returned

#### Definition of Done

- [ ] Gemini integration for tip generation
- [ ] Caching in `adaptive_tip_cache` table
- [ ] Status-based tip selection
- [ ] API route with validation
- [ ] Component with status-based styling

#### Technical Notes

- API Route: `POST /api/adaptive-tip`
- Table: `adaptive_tip_cache`
- Component: `AdaptiveTipCard.tsx`

---

## Infrastructure Issues

### Issue #11: Set Up CI/CD Pipeline

**Labels:** `infrastructure`, `ci-cd`, `w14`, `high-priority`  
**Assignee:** Both  
**Status:** ✅ Closed (completed in Sprint 2)

#### Description

Set up GitHub Actions CI/CD pipeline with 7 stages for automated testing and deployment.

#### Acceptance Criteria (Testable Specifications)

- [ ] **AC1:** Given push to branch, when CI runs, then lint job passes with ESLint + Prettier
- [ ] **AC2:** Given push to branch, when CI runs, then typecheck job passes with tsc --noEmit
- [ ] **AC3:** Given push to branch, when CI runs, then unit tests pass with 70%+ coverage
- [ ] **AC4:** Given push to branch, when CI runs, then security audit runs (npm audit + CodeQL)
- [ ] **AC5:** Given passing tests, when CI runs, then build job produces Next.js production build
- [ ] **AC6:** Given successful build, when CI runs, then E2E tests run with Playwright
- [ ] **AC7:** Given all stages complete, when CI finishes, then summary job reports status

#### Definition of Done

- [ ] `.github/workflows/ci.yml` with 7 stages
- [ ] `.github/workflows/security.yml` with Gitleaks + CodeQL
- [ ] `.github/workflows/pr-review.yml` with AI review
- [ ] All stages green on main branch

---

### Issue #12: Parallel Development with Worktrees

**Labels:** `process`, `w12`, `git`  
**Assignee:** Hemang  
**Status:** ✅ Closed (completed in Sprint 2)

#### Description

Demonstrate parallel feature development using git worktrees for health visualization and email reminders.

#### Acceptance Criteria (Testable Specifications)

- [ ] **AC1:** Given worktree created, when listing worktrees, then two directories appear (Bloom/ and Bloom-email/)
- [ ] **AC2:** Given parallel work, when viewing git log, then commits from both branches are interleaved
- [ ] **AC3:** Given shared base commit, when viewing graph, then clear divergence from base is visible
- [ ] **AC4:** Given worktree evidence, when documenting, then WORKTREE_EVIDENCE.md is created with proof

#### Definition of Done

- [ ] Worktree evidence documented
- [ ] Interleaved commit history visible
- [ ] Both branches pushed to GitHub
- [ ] Git graph shows parallel development

---

## Completed Issues Summary

| Issue | User Story                 | Status | Sprint | Points |
| ----- | -------------------------- | ------ | ------ | ------ |
| #1    | US-1 Signup                | ✅     | 1      | 3      |
| #2    | US-2 Login                 | ✅     | 1      | 2      |
| #3    | US-3 Logout                | ✅     | 1      | 1      |
| #4    | US-4 Photo Upload          | ✅     | 1      | 5      |
| #5    | US-5 Identification        | ✅     | 1      | 5      |
| #6    | US-7 Care Tips             | ✅     | 2      | 5      |
| #7    | US-10 Bouquet Tracking     | ✅     | 2      | 3      |
| #8    | US-12 Email Reminders      | ✅     | 2      | 5      |
| #9    | US-14 Health Visualization | ✅     | 2      | 5      |
| #10   | US-15 Adaptive Tips        | ✅     | 2      | 3      |
| #11   | CI/CD Pipeline             | ✅     | 2      | -      |
| #12   | Parallel Development       | ✅     | 2      | -      |

**Total Story Points:** 37  
**Completion Rate:** 100% (12/12 issues)

---

## AI Disclosure

**Tool Used:** Claude Code (anthropic/claude-code)  
**AI-Generated:** ~70% (issue structure, acceptance criteria formatting)  
**Human Review:** ✅ Acceptance criteria derived from PRD user stories

---

_Last Updated: April 18, 2026_
