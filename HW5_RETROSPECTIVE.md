# HW5 Retrospective: Custom Skill + MCP Integration

## Overview

This assignment involved extending Claude Code with a custom skill for Test-Driven Development (TDD) workflows and integrating Model Context Protocol (MCP) servers for Supabase and Playwright. The goal was to improve development velocity and code quality through automation and direct tool integration.

---

## Part 1: Custom Skill Impact

### How the TDD Feature Skill Changed My Workflow

**Before the Skill:**

- Inconsistent commit message formats
- Sometimes mixed test and implementation in single commits
- Manual remembering of TDD cycle steps
- Varied test coverage depending on time pressure

**After the Skill:**

- Strict adherence to 3-commit pattern (RED → GREEN → REFACTOR)
- Consistent, descriptive commit messages
- Predictable workflow that enforces best practices
- Higher confidence in code changes

### What Tasks Became Easier

**1. Starting New Features**
Previously, I'd hesitate when starting a feature, unsure where to begin. The skill provides a clear path:

1. Write test describing expected behavior
2. Commit with `[RED]` tag
3. Implement minimum code
4. Commit with `[GREEN]` tag
5. Refactor and commit improvements

**2. Maintaining Commit Discipline**
The commit message format (`test(scope): [RED] description`) is now automatic. I no longer need to think about commit conventions or accidentally skip the separate test commit.

**3. Pattern Matching**
By requiring analysis of similar files before starting, the skill ensures consistency with existing code patterns. For the logout endpoint, I studied the login route first, resulting in matching structure and error handling.

**4. Documentation**
The automatic session logging creates a development diary that's useful for:

- Understanding past decisions
- Debugging issues ("what did I change last?")
- Demonstrating completed work

### Iteration from v1 to v2

**v1 Limitations Discovered:**

- Scope had to be manually specified every time
- No automatic pattern detection
- Manual logging was easily forgotten
- No formatting enforcement

**v2 Improvements:**

- Auto-extract scope from file paths and descriptions
- Find and analyze similar files for pattern matching
- Automatic SESSION_LOG.md entries
- Prettier formatting as part of REFACTOR phase

**Example:** The logout endpoint task used v1 patterns, but the flower validation task benefited from auto-detection of similar patterns in `src/lib/auth.ts`.

---

## Part 2: MCP Integration Impact

### What MCP Integration Enabled

**1. Database-Aware Development (Supabase MCP)**

Without MCP:

- Switch to Supabase Studio browser tab
- Run SQL queries
- Copy results back to code
- Context switching breaks flow

With MCP:

- Query schema directly in Claude Code: `supabase.query("SELECT ...")`
- Immediate results inline with conversation
- RLS policy verification without leaving editor

**Example:** Verifying user tables and RLS policies during auth implementation was seamless.

**2. Integrated E2E Testing (Playwright MCP)**

Without MCP:

- Run tests in separate terminal
- Switch to browser for debugging
- Manual screenshot capture for documentation

With MCP:

- Run tests from within Claude Code
- Automated screenshot capture on failures
- Navigate pages to verify behavior

**Example:** Testing auth flows with automated screenshots for documentation.

**3. Codebase Exploration (GitHub MCP)**

Enabled quick cross-referencing with other repositories and code search across the entire codebase without manual file navigation.

### Tasks Made Possible

**Real-time Schema Verification:**
During auth implementation, I verified the `users` table schema existed and RLS policies were properly configured. This prevented runtime errors from misconfigured database permissions.

**Pattern Matching Across Files:**
With MCP's file listing and search capabilities, finding similar implementations (e.g., all API routes with error handling) became trivial rather than manual grep/ navigation.

**Documentation with Live Data:**
Created accurate documentation showing actual database schema and test results rather than static examples.

---

## Part 3: What to Build Next

### Immediate Priorities

**1. Pre-commit Hooks Skill**
A `/pre-commit` skill that:

- Runs lint and format checks
- Executes relevant tests based on changed files
- Blocks commits with errors
- Suggests fixes automatically

**2. PR Review Skill**
A `/review-pr` skill that:

- Analyzes diffs against CLAUDE.md conventions
- Checks for IDOR vulnerabilities (missing user_id scopes)
- Verifies test coverage for new code
- Validates commit message format

**3. Migration Skill**
A `/create-migration` skill that:

- Analyzes code changes to detect schema needs
- Generates Supabase migration files
- Validates migration syntax
- Tests migration against local database

### Long-term Vision

**1. Sub-agents for Specialized Tasks**

- **Security Agent:** Continuously monitors for IDOR, SQL injection, XSS
- **Testing Agent:** Maintains test coverage, suggests edge cases
- **Performance Agent:** Identifies N+1 queries, suggests caching

**2. GitHub Actions Integration**

- Trigger skill execution from PR comments
- `/claude review` in PR comments runs review skill
- Automatic PR summaries based on commit history

**3. Knowledge Graph**

- Build relationships between files, tests, and features
- "What depends on this change?" queries
- Automated impact analysis
