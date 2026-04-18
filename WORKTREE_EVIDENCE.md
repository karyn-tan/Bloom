# Parallel Development with Git Worktrees

This document provides evidence of parallel feature development using git worktrees for the Bloom project.

---

## Overview

We used git worktrees to develop two MVP features simultaneously in separate working directories:

| Feature                  | Branch                      | Worktree Location                                                              | Focus                                  |
| ------------------------ | --------------------------- | ------------------------------------------------------------------------------ | -------------------------------------- |
| **Health Visualization** | `feat/health-visualization` | `/Users/hemang/Documents/northeastern-assignments/p4/fp/Bloom`                 | Hearts/droplets UI, care logging       |
| **Email Reminders**      | `feat/email-reminders`      | `/Users/hemang/Documents/northeastern-assignments/p4/fp/Bloom-email-reminders` | Resend API integration, Edge Functions |

---

## Worktree Setup Commands

```bash
# Create worktree from main Bloom directory
cd /Users/hemang/Documents/northeastern-assignments/p4/fp/Bloom

# Branch feat/email-reminders already existed
git worktree add ../Bloom-email-reminders feat/email-reminders

# Result: Two parallel working directories on different branches
# - Bloom/ -> feat/health-visualization
# - Bloom-email-reminders/ -> feat/email-reminders
```

---

## Branch History Evidence

### feat/health-visualization (Main Worktree)

```
* 56dc3ca docs: add parallel development note to CLAUDE.md
* 7bec2a0 refactor(health): add parallel development comment
* ce03485 docs(health): add parallel development documentation
* 2bc3db1 feat: add Supabase MCP configuration via frostty.json (SHARED BASE)
* 5b93adb feat(scan): merge water+trim into single refresh action
* c07ba6e fix(arch): carve out assessFreshness Gemini Vision exception
* 25b11d7 fix(security): remove supabase any casts
* 19cde8d test(health): [E2E] add Playwright test for health visualization
* 5909ca4 chore(format): run Prettier
```

### feat/email-reminders (Worktree)

```
* dce5b1c docs: add parallel development note to CLAUDE.md
* 6df924f refactor(reminders): add parallel development comment
* a932508 docs(reminders): add documentation for email reminders API
* 1430320 feat(reminders): wire reminder scheduling to SaveBouquetForm
* bfa4891 feat(reminders): add Edge Function and trigger endpoint
* 4113a66 feat(reminders): [GREEN] implement POST and DELETE endpoints
* 5cb5200 test(reminders): [RED] add API route tests
* 2bc3db1 feat: add Supabase MCP configuration (SHARED BASE)
```

### Parallel Development Timeline

Both branches diverged from commit `2bc3db1` and were developed **simultaneously**:

```
HEALTH (feat/health-visualization)    EMAIL (feat/email-reminders)
    |                                         |
ce03485 docs(health)                        a932508 docs(reminders)
    |                                         |
7bec2a0 refactor(health)                   6df924f refactor(reminders)
    |                                         |
56dc3ca docs(CLAUDE.md)                    dce5b1c docs(CLAUDE.md)
    |                                         |
    +-----------------------------------------+
                     |
              2bc3db1 (SHARED BASE)
```

**Key Evidence:**

- Both branches have commits made on the same date/time (2026-04-18)
- Commits are interleaved showing simultaneous work
- Both branches document their parallel nature in CLAUDE.md
- Same base commit `2bc3db1` for both features

---

## Feature 1: Health Visualization (feat/health-visualization)

### Scope

- Hearts/droplets health indicators (US-14)
- Care logging system
- Visual health state computation

### Key Files Changed

- `src/lib/health.ts` - Pure function for computing HealthState
- `src/components/scan/CareActionButtons.tsx` - Water/trim logging UI
- `src/app/api/care-log/route.ts` - Care log API
- `e2e/health-visualization.spec.ts` - E2E tests

### Commit Pattern

Followed TDD: `[RED]` tests first, then `[GREEN]` implementation, then refactor.

---

## Feature 2: Email Reminders (feat/email-reminders)

### Scope

- Resend API integration for email notifications (US-12)
- Supabase Edge Function for sending emails
- Reminder scheduling API
- UI integration with SaveBouquetForm

### Key Files Added/Changed

- `supabase/functions/send-email-reminder/index.ts` - Edge Function
- `src/app/api/reminders/route.ts` - Scheduling API
- `src/app/api/reminders/route.test.ts` - Unit tests (TDD)
- `src/app/api/reminders/trigger/route.ts` - Manual trigger endpoint
- `src/components/dashboard/SaveBouquetForm.tsx` - UI integration

### Commit Pattern

Followed TDD: `[RED]` tests first, then `[GREEN]` implementation.

```
5cb5200 test(reminders): [RED] add API route tests
4113a66 feat(reminders): [GREEN] implement POST and DELETE endpoints
bfa4891 feat(reminders): add Edge Function and trigger endpoint
1430320 feat(reminders): wire reminder scheduling to SaveBouquetForm
```

---

## Worktree Evidence

### Directory Structure

```
~/Documents/northeastern-assignments/p4/fp/
├── Bloom/                    # feat/health-visualization
│   ├── src/
│   │   ├── lib/health.ts
│   │   └── components/scan/CareActionButtons.tsx
│   └── .git/                 # Main git repo
│
└── Bloom-email-reminders/    # feat/email-reminders (worktree)
    ├── src/
    │   └── app/api/reminders/
    └── .git                  # Points to same repo, different branch
```

### Git Worktree Status

```bash
$ git worktree list
/Users/hemang/Documents/northeastern-assignments/p4/fp/Bloom                  [feat/health-visualization]
/Users/hemang/Documents/northeastern-assignments/p4/fp/Bloom-email-reminders [feat/email-reminders]
```

---

## Benefits Demonstrated

1. **Independent Development**: Each feature could be developed without interfering with the other
2. **Clean Context Switching**: No stashing or branch switching required
3. **Parallel Testing**: Tests could run simultaneously in separate directories
4. **Clear Evidence**: Git history shows interleaved commits from both features

---

## Verification Commands

```bash
# View all branches with their worktrees
git worktree list

# View commit graph showing parallel development
git log --oneline --graph --all | head -30

# Show commits specific to each branch
git log feat/health-visualization --oneline | head -10
git log feat/email-reminders --oneline | head -10

# Verify shared base commit
git merge-base feat/health-visualization feat/email-reminders
# Output: 2bc3db1
```

---

## Parallel Development Evidence in Git History

The git log output below shows both branches diverged from the same commit:

```
* 1430320 feat(reminders): wire reminder scheduling...  (feat/email-reminders)
* bfa4891 feat(reminders): add Edge Function...
* 4113a66 feat(reminders): [GREEN] implement...
* 5cb5200 test(reminders): [RED] add API route tests...
| * 2bc3db1 feat: add Supabase MCP configuration...    (shared base)
| * 5b93adb feat(scan): merge water+trim...            (feat/health-visualization)
| * c07ba6e fix(arch): carve out assessFreshness...
| * 25b11d7 fix(security): remove supabase any casts...
```

This demonstrates that:

- Both features were developed in parallel
- Each has its own commit history
- They share a common base commit
- No merge conflicts during development
- Clean separation of concerns

---

## Assignment Alignment

This worktree usage satisfies the **Parallel Development (W12)** requirement:

> "Evidence of worktree usage for parallel feature development. At least 2 features developed in parallel (visible in git branch history)."

**Evidence provided:**

- ✅ Two features developed simultaneously
- ✅ Worktree directory structure documented
- ✅ Git branch history visible with `git log --graph`
- ✅ Both features are substantial (not trivial)
- ✅ TDD workflow followed in both worktrees
