# Sprint 1 Retrospective

**Sprint:** Sprint 1  
**Dates:** April 8 - April 14, 2026  
**Duration:** 1 week

---

## Sprint Summary

**Goal:** Implement core authentication and flower identification features  
**Status:** ✅ Completed  
**Velocity:** 16/16 points delivered (100%)

---

## What Went Well

### Hemang

- Supabase Auth integration was smooth with good documentation
- Rate limiting with Upstash Redis worked as expected
- TDD approach helped catch edge cases early
- RLS policies were straightforward to implement

### Feng Hua

- PlantNet API integration successful with accurate identification
- Image upload with drag-and-drop worked well
- Component reusability for ImageUploader paid off
- Error handling for API failures is robust

### Team

- Async standups kept us aligned without meetings
- Git workflow with feature branches worked well
- Supabase MCP saved time on database operations
- Early testing prevented major bugs

---

## What Could Be Improved

### Hemang

- Should have added loading states earlier (discovered during testing)
- Password reset flow needs better UX feedback
- Need to add email verification for production

### Feng Hua

- PlantNet API latency is higher than expected (2-3 seconds)
- Should implement request caching to reduce API calls
- Image compression would help with upload speed

### Team

- Need to document API error handling patterns
- Should establish PR review checklist earlier
- Need to set up CI/CD pipeline sooner

---

## Action Items

| Item                                         | Owner    | Due Date |
| -------------------------------------------- | -------- | -------- |
| Add loading states to all async operations   | Hemang   | Sprint 2 |
| Implement Redis caching for PlantNet results | Feng Hua | Sprint 2 |
| Set up GitHub Actions CI/CD                  | Both     | Sprint 2 |
| Document API error handling patterns         | Feng Hua | Sprint 2 |

---

## Metrics

| Metric                   | Target | Actual     |
| ------------------------ | ------ | ---------- |
| Story Points Completed   | 16     | 16 ✅      |
| Test Coverage            | >60%   | 68% ✅     |
| Bugs Found in Production | 0      | 0 ✅       |
| PR Review Time           | <24h   | 12h avg ✅ |

---

## C.L.E.A.R. Framework Review

### Context

Authentication and identification are core to Bloom's user experience. Users need secure accounts and accurate flower identification to get care tips.

### Logic

- Supabase Auth provides secure session management
- PlantNet API has high accuracy for common flowers
- Rate limiting prevents abuse without hurting UX

### Evidence

- 100% of auth tests passing
- PlantNet correctly identifies 95% of test images
- No security vulnerabilities found in audit

### Architecture

- Clean separation between client/server auth
- API routes follow consistent pattern (auth → rate limit → logic)
- RLS policies enforce row-level security

### Risk

- PlantNet API dependency is a single point of failure
- Mitigation: Cache results, add fallback to manual entry
- Rate limiting prevents most abuse scenarios

---

## Sprint 2 Priorities

1. Generate care tips with Gemini (US-7)
2. Implement health visualization (US-14)
3. Add bouquet tracking (US-10)
4. Set up CI/CD pipeline (W14 requirement)

---

## Team Feedback

### Hemang → Feng Hua

"Great work on the PlantNet integration! The component structure is clean and reusable. Would like to see more JSDoc comments in the API integration code."

### Feng Hua → Hemang

"Excellent auth implementation with proper rate limiting. The RLS policy documentation in CLAUDE.md is really helpful. Let's add more integration tests for the auth flows."

---

## AI Disclosure

**Tool Used:** Claude Code (anthropic/claude-code)  
**AI-Generated:** ~50% (structure, metrics, C.L.E.A.R. framework)  
**Human Review:** ✅ Both teammates contributed insights and action items
