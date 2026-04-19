# Individual Reflection - Feng Hua Tan

## Project 3: Production Application with Claude Code Mastery

**Word Count:** ~510 words

---

## Overview

Working on "Bloom" with Hemang was an intensive but rewarding experience. This project pushed me to master production engineering practices while leveraging AI-assisted development tools. We built a complete flower care application with 15 MVP features, demonstrating mastery of Claude Code's extensibility features and professional software engineering workflows.

## Key Learnings

### Parallel Development with Worktrees

The git worktree approach was revolutionary for our workflow. While Hemang worked on health visualization in the main directory, I developed email reminders in a separate worktree. This eliminated constant stashing and branch switching. The evidence in `git log --graph` shows our commits interleaved from the same base - clear proof of parallel development.

### Supabase and Edge Functions

Implementing the email reminders feature required learning Supabase Edge Functions. Deploying serverless code that runs close to the database taught me about edge computing architectures. The `send-email-reminder` function integrates with the Resend API and schedules reminders based on care logs. Testing this required understanding Deno runtime and managing secrets securely.

### Adaptive Care Tips with Gemini

The adaptive care tips feature (US-15) was technically challenging. Caching tips per day required designing a `adaptive_tip_cache` table with proper RLS policies. The integration with Gemini for generating contextual tips taught me about:

- Prompt engineering for consistent responses
- Caching strategies to reduce API costs
- Status-based UI rendering (onboarding vs. corrective vs. positive)

The caching logic ensures we don't call Gemini multiple times for the same user on the same day, saving costs and improving response times.

## Challenges and Solutions

### Database Schema Design

Designing schemas that support features while maintaining RLS policies was tricky. For the adaptive tips feature, I needed to:

1. Link tips to bouquets
2. Ensure users can only see their own tips
3. Handle cache invalidation

The solution involved careful foreign key relationships and RLS policies that check `auth.uid()` against `user_id`.

### CI/CD Integration

Getting the CI/CD pipeline green required persistence. My initial pushes had formatting issues and test failures. Key fixes:

- Running `npx prettier --write` before committing
- Adding proper type casting in tests
- Using `vi.hoisted()` for mock setup to avoid hoisting issues

Seeing all 7 stages turn green was satisfying - it validated our testing strategy.

### API Integration Complexity

Integrating PlantNet for flower identification and Gemini for care tips meant managing multiple external APIs. Each had different:

- Authentication methods (API keys vs. service accounts)
- Rate limits
- Error response formats

Creating Zod schemas for validation ensured type safety. The `identify` route validates PlantNet responses before storing results.

## Team Collaboration

### Async Standups

Our async standup format (documented in sprint retrospectives) worked well. Daily Slack updates kept us synchronized without meetings. Example from April 16: I shared my progress on adaptive tips and blockers, while Hemang updated on health visualization.

### Code Review with C.L.E.A.R.

Applying the C.L.E.A.R. framework to PR reviews improved our code quality. When reviewing Hemang's health module, I checked:

- **Context:** Does this fit the health tracking feature?
- **Logic:** Are the heart/droplet calculations correct?
- **Evidence:** Are there tests for edge cases?
- **Architecture:** Does it follow the pure function pattern?
- **Risk:** Could this expose user data?

This caught an issue where health state calculation wasn't using UTC consistently.

## Skills Developed

### Technical

- **Next.js App Router:** Server components, API routes, caching
- **Supabase:** RLS policies, Edge Functions, storage
- **TypeScript:** Strict typing, generics for reusable components
- **Testing:** Vitest for unit, Playwright for E2E

### Process

- **TDD:** Writing tests first (RED → GREEN → REFACTOR)
- **CI/CD:** GitHub Actions, security gates
- **Git:** Worktrees, rebase workflows
- **Documentation:** CLAUDE.md as living documentation

## AI-Assisted Development

Claude Code wasn't just a code generator - it was a collaborative partner. Key benefits:

1. **Context retention:** Understanding our conventions from CLAUDE.md
2. **Skill system:** Automated TDD workflow enforcement
3. **MCP integration:** Database queries and GitHub actions without context switching
4. **Code review:** Security and pattern suggestions

The 30% productivity improvement mentioned in our retrospective feels accurate. Tasks that would take hours (like setting up the CI/CD pipeline) were completed in minutes with Claude's guidance.

## Conclusion

This project demonstrated that modern software engineering combines AI tools with solid fundamentals. TDD, CI/CD, documentation, and security aren't replaced by AI - they're enhanced. The 169/200 score reflects solid execution. Missing points are procedural (deployment, blog, video), not technical.

The practices we established - custom skills, parallel development, MCP usage - are transferable to any engineering team. I'm confident these skills make me a better developer, ready for industry challenges.
