---
name: create-pr
description: Create a GitHub PR with auto-generated description mapped to PRD user stories, DoD checklist verification, and test results
version: 1.0.0
---

# Create PR Skill

## Instructions

When the user invokes `/create-pr`, follow this workflow:

### Phase 1: Branch Analysis

1. Run `git log main..HEAD --oneline` to read all commits on the current branch
2. Parse commit messages to extract:
   - Scopes used (auth, scan, care, bouquet, history, etc.)
   - Types used (feat, fix, test, refactor, chore)
   - TDD cycle markers ([RED], [GREEN], REFACTOR)
3. Run `git diff main...HEAD --name-only` to list all changed files
4. Identify the base branch (default: `main`)

### Phase 2: Map Commits to PRD User Stories

Match scopes and feature descriptions to user stories from the PRD:

| Scope           | User Stories                                                  |
| --------------- | ------------------------------------------------------------- |
| auth            | US-1 (signup), US-2 (Google OAuth), US-3 (login/redirect)     |
| scan            | US-4 (photo upload), US-5 (identification), US-6 (correction) |
| care            | US-7 (care card), US-8 (lifespan), US-9 (fun facts)           |
| bouquet         | US-10 (multi-bouquet management)                              |
| history         | US-11 (scan history)                                          |
| reminders       | US-12 (email reminders)                                       |
| recommendations | US-13 (seasonal recommendations)                              |
| health          | US-14 (hearts + droplets)                                     |
| careLog         | US-15 (adaptive care tips)                                    |
| rls             | Security requirement 5.2                                      |
| ratelimit       | Security requirement 5.1                                      |

### Phase 3: Definition of Done Verification

Run each DoD check and record pass/fail:

1. **Tests passing** — run `npm test` and capture result
2. **No `any` types** — `grep -r ": any" src/` on changed files
3. **Prettier clean** — run `npm run format:check`
4. **`.env.example` updated** — check if any new `process.env` or config access was added to changed files; if so verify `.env.example` has the key
5. **RLS on new tables** — if any migration files changed, check they include `enable row level security`
6. **Rate limiting on new routes** — if new `route.ts` files were added, check they import from `src/lib/ratelimit.ts`
7. **Auth check on new routes** — if new `route.ts` files were added, check they call `getAuthenticatedUserId`

Mark each item as ✅ (pass), ⚠️ (needs review), or ❌ (fail).

### Phase 4: Draft PR Body

Generate a PR body using this template:

```
## Summary

<bullet list of what was built, one line per scope>

## User Stories

<list matched US numbers with one-line description each>

## Definition of Done

- [x/space] All acceptance criteria have passing tests
- [x/space] Unit tests written and passing
- [x/space] Integration tests written and passing
- [x/space] No `any` types introduced
- [x/space] Prettier formatting passed
- [x/space] `.env.example` updated (if new env vars)
- [x/space] RLS enabled on new tables (if applicable)
- [x/space] Rate limiting on new API routes (if applicable)
- [x/space] Auth check on new API routes (if applicable)

## Test Results

<paste npm test output summary — X passed, Y failed>

## Changed Files

<list from git diff --name-only, grouped by area>

---
🤖 Generated with [Claude Code](https://claude.ai/claude-code)
```

### Phase 5: Open the PR

1. Check if branch has a remote: `git status -sb`
2. If not pushed, push first: `git push -u origin <branch>`
3. Create PR: `gh pr create --title "<type>(<scope>): <short description>" --base main --body "<drafted body>"`
4. Print the PR URL
5. Log to SESSION_LOG.md

## PR Title Format

Follow the project commit convention:

- `feat(auth): add forgot-password and reset-password flow`
- `feat(scan): implement flower identification with PlantNet`
- `fix(care): return fallback card when Gemini JSON fails validation`

Derive the title from the most significant `feat` or `fix` commit on the branch. If multiple scopes, use the primary one.

## Session Log Format

Append to `.claude/skills/create-pr/SESSION_LOG.md`:

```
## YYYY-MM-DD HH:MM - <branch-name>

- **PR**: <GitHub URL>
- **Title**: <PR title>
- **Stories**: <US numbers covered>
- **DoD**: X/9 checks passed
- **Tests**: X passed
- **Notes**: <any DoD failures or warnings>
```

## Constraints

- NEVER create a PR if `npm test` has failures — report the failures and stop
- NEVER push to `main` directly — always use a feature branch
- If DoD has ❌ failures (not just ⚠️ warnings), report them and ask the user whether to proceed
- PR targets `main` by default; if the user specifies a different base, use that

## Example Usage

```
/create-pr
/create-pr --base staging
```

## Expected Output

- PR opened on GitHub with structured description
- DoD checklist pre-filled based on automated checks
- Session log entry created
- PR URL printed to terminal
