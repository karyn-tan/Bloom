# Sprint 1 Planning

**Sprint:** Sprint 1  
**Dates:** April 8 - April 14, 2026  
**Duration:** 1 week  
**Team:** Hemang Murugan, Feng Hua Tan

---

## Sprint Goal

Implement core authentication and flower identification features to establish the foundation of the Bloom application.

---

## User Stories Committed

| US   | Story                                                                                                 | Points | Assignee |
| ---- | ----------------------------------------------------------------------------------------------------- | ------ | -------- |
| US-1 | As a new user, I want to sign up with email/password so that I can create an account                  | 3      | Hemang   |
| US-2 | As a returning user, I want to log in so that I can access my saved scans                             | 2      | Hemang   |
| US-3 | As a user, I want to log out so that I can secure my account                                          | 1      | Hemang   |
| US-4 | As a user, I want to upload a photo of my flowers so that the app can identify them                   | 5      | Feng Hua |
| US-5 | As a user, I want to see identified flowers with confidence scores so that I know what I'm caring for | 5      | Feng Hua |

**Total Story Points:** 16

---

## Technical Tasks

### Authentication System (Hemang)

- [ ] Set up Supabase Auth with email/password
- [ ] Create signup API route with validation
- [ ] Create login API route with session management
- [ ] Create logout API route
- [ ] Implement rate limiting (100 req/user/60sec)
- [ ] Write unit tests for auth routes (TDD pattern)
- [ ] Add RLS policies for user data

### Photo Upload & Identification (Feng Hua)

- [ ] Set up Supabase Storage for image uploads
- [ ] Create image upload API with size/type validation
- [ ] Integrate PlantNet API for flower identification
- [ ] Parse PlantNet response and extract species names
- [ ] Store scan results in database
- [ ] Write unit tests for upload/identify flow

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests written and passing
- [ ] Integration tests for API routes
- [ ] Code reviewed by teammate
- [ ] No ESLint/Prettier errors
- [ ] RLS policies enabled on all tables
- [ ] Feature tested in browser

---

## Sprint Board

| To Do               | In Progress       | Review | Done |
| ------------------- | ----------------- | ------ | ---- |
| US-3 Logout         | US-1 Signup       |        |      |
|                     | US-2 Login        |        |      |
| US-5 Identification | US-4 Photo Upload |        |      |

---

## Async Standups

### April 9, 2026

**Hemang:** Completed Supabase Auth setup. Starting signup route with Zod validation. Blocker: None.  
**Feng Hua:** Started image upload component. Need to configure Supabase Storage bucket policies.

### April 11, 2026

**Hemang:** Signup/login routes complete with rate limiting. Writing tests now. Blocker: None.  
**Feng Hua:** Upload working, integrating PlantNet API. Need to handle API errors gracefully.

### April 13, 2026

**Hemang:** Auth system complete with tests. Ready for review. Blocker: None.  
**Feng Hua:** PlantNet integration working. Need to add loading states and error handling.

---

## Risks & Mitigation

| Risk                     | Probability | Impact | Mitigation                              |
| ------------------------ | ----------- | ------ | --------------------------------------- |
| PlantNet API rate limits | Medium      | High   | Implement caching, add error handling   |
| Supabase RLS complexity  | Low         | Medium | Test policies with integration tests    |
| Photo upload size limits | Medium      | Low    | Add client-side validation, compression |

---

## AI Disclosure

**Tool Used:** Claude Code (anthropic/claude-code)  
**AI-Generated:** ~60% (planning template, task breakdowns, documentation structure)  
**Human Review:** ✅ Both teammates reviewed and approved
