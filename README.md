# Bloom - Assignment Submission

**Students**: Hemang Murugan | Feng Hua Tan  
**Assignment**: HW4 Claude Code Workflow & TDD  
**Date**: March 21, 2026  

---

## Quick Start for Graders

This repository contains the complete submission for the **Claude Code Workflow & TDD Assignment**.

| Part       | Deliverable                            | Location                                                                 | Status      |
| ---------- | -------------------------------------- | ------------------------------------------------------------------------ | ----------- |
| **Part 1** | CLAUDE.md & Project Setup              | [`CLAUDE.md`](./CLAUDE.md) and see [more on setting up project](#more-on-setting-up-project) below  | ✅ Complete |
| **Part 2** | Explore→Plan→Implement→Commit Workflow | See [Git History](#git-history) below                                    | ✅ Complete |
| **Part 3** | TDD Process (RED→GREEN→REFACTOR)       | See [TDD Cycles](#tdd-cycles) below                                      | ✅ Complete |
| **Part 4** | Reflection & Session Log               | [`REFLECTION.md`](./REFLECTION.md), [`SESSION_LOG.md`](./SESSION_LOG.md) | ✅ Complete |

---

## Part 1: CLAUDE.md & Project Setup

**File**: [`CLAUDE.md`](./CLAUDE.md)

**Contents**:

- Project overview (Bloom flower care app)
- Tech stack (Next.js 14, TypeScript, Supabase, Tailwind, Zod, Vitest)
- Architecture decisions (two-step PlantNet→Gemini flow, caching, RLS)
- Coding conventions (no `any`, Zod validation, Prettier, commit format)
- Testing strategy (TDD with Vitest, Playwright E2E)
- Project-specific Do's and Don'ts
- Reference to `@project_memory/bloom_prd.md` and `@project_memory/bloom_mom_tests.md`

**Key Features**:

- `@project_memory/bloom_prd.md` and `@project_memory/bloom_mom_tests.md` import reference
- Commit message format: `<type>(<scope>): <description>`
- TDD commit pattern: `[RED]`, `[GREEN]` markers

### More on setting up project
- [`Configure permissions`](.claude/settings.json) 
- [`Use /init on CLAUDE.md`](screenshots/use_init_and_iterate_claude_markdown.png) 
- [`Use --continue for context management`](screenshots/use_continue_for_context_management.png) 
- [`Use --clear for context management`](screenshots/use_clear_after_project_setup_for_context_management.png)                   

---

## Part 2 & 3: Feature Implementation with TDD

### Feature Implemented

**Authentication Login Screen** (US-1, US-2, US-3 from PRD)

- Email/password validation
- Login API route with Supabase
- Login UI with form validation
- Google OAuth placeholder

### Git History

```bash
# View complete TDD workflow
git log --oneline -14
```

**Output**:

```
c841fda docs: add reflection and annotated session log for assignment
e21cebb refactor(auth): extract LoginForm, GoogleSignInButton, and Auth components
887f167 feat(auth): [GREEN] implement login page with form validation
6fd6d33 test(auth): [RED] login form displays validation errors and handles submission
27de1fa refactor(auth): extract cookie handlers and add Zod env validation
364c5f1 feat(auth): [GREEN] implement login API route with Supabase
c407262 test(auth): [RED] login API route returns 400/401 for invalid input
d027ba2 refactor(auth): extract validation logic into Zod schemas
9b3499a feat(auth): [GREEN] implement email and password validation functions
98bf62a test(auth): [RED] validate email format and password minimum length
25c9040 chore(config): add Claude Code settings and context screenshots
672ce83 chore(docs): setup project with CLAUDE.md and configure permissions
4635fce docs: add prd and mom test interview notes
19bdba6 Initial commit
```

### TDD Cycles

#### **Cycle 1: Validation Logic**

| Phase        | Commit    | Description                                      |
| ------------ | --------- | ------------------------------------------------ |
| **RED**      | `98bf62a` | Tests for `validateEmail` and `validatePassword` |
| **GREEN**    | `9b3499a` | Minimum implementation with regex                |
| **REFACTOR** | `d027ba2` | Replace regex with Zod schemas                   |

**Files**:

- `src/lib/auth.test.ts` - Unit tests
- `src/lib/auth.ts` - Validation functions with Zod

#### **Cycle 2: Login API Route**

| Phase        | Commit    | Description                                 |
| ------------ | --------- | ------------------------------------------- |
| **RED**      | `c407262` | Tests for 400/401/500 responses             |
| **GREEN**    | `364c5f1` | POST handler with Supabase integration      |
| **REFACTOR** | `27de1fa` | Extract cookie handlers, Zod env validation |

**Files**:

- `src/app/api/auth/login/route.test.ts` - API tests
- `src/app/api/auth/login/route.ts` - API implementation
- `src/lib/supabase.ts` - Supabase client with cookie handling

#### **Cycle 3: Login UI**

| Phase        | Commit    | Description                                         |
| ------------ | --------- | --------------------------------------------------- |
| **RED**      | `6fd6d33` | Component tests with React Testing Library          |
| **GREEN**    | `887f167` | LoginForm component, useForm hook, page             |
| **REFACTOR** | `e21cebb` | Extract GoogleSignInButton, AuthDivider, AuthFooter |

**Files**:

- `src/app/(auth)/login/page.test.tsx` - Component tests
- `src/app/(auth)/login/page.tsx` - Login page
- `src/components/auth/LoginForm.tsx` - Form component
- `src/components/auth/GoogleSignInButton.tsx` - OAuth button
- `src/hooks/useForm.ts` - Generic form hook

### Source Code Structure

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       ├── page.tsx          # Login page component
│   │       └── page.test.tsx     # Component tests
│   ├── api/
│   │   └── auth/
│   │       └── login/
│   │           ├── route.ts      # API route handler
│   │           └── route.test.ts # API tests
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/
│   └── auth/
│       ├── LoginForm.tsx         # Login form
│       └── GoogleSignInButton.tsx # OAuth button
├── hooks/
│   └── useForm.ts                # Generic form hook
├── lib/
│   ├── auth.ts                   # Validation logic
│   ├── auth.test.ts              # Validation tests
│   └── supabase.ts               # Supabase client
└── test/
    └── setup.ts                  # Vitest setup
```

### Configuration Files

- `package.json` - Dependencies (Next.js, Supabase, Zod, Vitest, Testing Library)
- `tsconfig.json` - TypeScript strict mode
- `tailwind.config.ts` - Tailwind CSS
- `vitest.config.ts` - Vitest + React plugin
- `.prettierrc` - Prettier configuration
- `.env.example` - Environment variables template

---

## Part 4: Reflection & Session Log

### Reflection Document

**File**: [`REFLECTION.md`](./REFLECTION.md)

**Contents** (850 words):

- Comparison of Claude Code workflow vs. previous approach
- Context management strategies that worked best
- TDD experience with three complete cycles
- Key improvements observed (reduced rework, clearer intent, better git history)
- Challenges encountered and solutions
- Conclusion with future recommendations

### Annotated Session Log

**File**: [`SESSION_LOG.md`](./SESSION_LOG.md)

**Contents**:

- Timestamped transcript of entire Claude Code session
- Phase markers (EXPLORE, PLAN, IMPLEMENT, VERIFY)
- All commands executed
- Commit messages and descriptions
- Key decisions and adaptations
- Session statistics
- Workflow compliance checklist

---

## Verification Commands

```bash
# Verify TDD commit pattern
git log --oneline | grep -E "\[RED\]|\[GREEN\]|refactor"

# Count test files
find . -name "*.test.ts" -o -name "*.test.tsx" | grep -v node_modules | wc -l
# Output: 3

# View specific TDD cycle
git show 98bf62a  # RED: Validation tests
git show 9b3499a  # GREEN: Validation implementation
git show d027ba2  # REFACTOR: Zod schemas

# Verify file structure
find src -type f | sort
```

---

## Rubric Compliance

| Criterion                         | Weight | Evidence                                                                                                                                       |
| --------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **CLAUDE.md & Project Setup**     | 25%    | [`CLAUDE.md`](./CLAUDE.md) with tech stack, architecture, conventions, testing strategy, do's/don'ts, `@project_memory/bloom_prd.md` and `@project_memory/bloom_mom_tests.md` reference |
| **Explore→Plan→Implement→Commit** | 30%    | Git history shows 3 TDD cycles with [RED]→[GREEN]→refactor commits; [`SESSION_LOG.md`](./SESSION_LOG.md) documents workflow                    |
| **TDD Process**                   | 30%    | 3 complete cycles (validation, API route, UI); tests written before implementation; 9 atomic commits                                           |
| **Reflection & Session Log**      | 15%    | [`REFLECTION.md`](./REFLECTION.md) (850 words), [`SESSION_LOG.md`](./SESSION_LOG.md) (annotated transcript)                                    |

---

## Additional Documentation

- **PRD**: [`project_memory/bloom_prd.md`](./project_memory/bloom_prd.md) - Full product requirements
- **User Research**: [`project_memory/bloom_mom_tests.md`](./project_memory/bloom_mom_tests.md) - Mom Test interviews
- **Screenshots**: [`screenshots/`](./screenshots/) - Visual proof of using built-in claude commands

---

## Notes for Graders

1. **Supabase**: The implementation uses `@supabase/ssr` with cookie handling for Next.js App Router. Cloud connection is ready via `.env.example` variables.

2. **Testing**: All tests use Vitest with React Testing Library. Run `npm test` to execute (requires `npm install` first).

3. **Prettier**: Configuration follows CLAUDE.md conventions (single quotes, 2-space tabs, trailing commas).

4. **TypeScript**: Strict mode enabled. No `any` types used.

---

**Submission Complete**: All parts (1-4) are ready for grading.
