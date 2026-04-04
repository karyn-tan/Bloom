# MCP Integration Demonstration

## Part 2: MCP Integration (35%)

### MCP Servers Configured

#### 1. Supabase MCP Server (`.mcp.json`)

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=zudwnujpkhwopvjnitmj"
    }
  }
}
```

**Setup Command Used:**

```bash
claude mcp add supabase --type http --url "https://mcp.supabase.com/mcp?project_ref=zudwnujpkhwopvjnitmj"
```

**What It Enables:**

- Direct database queries from Claude Code
- RLS policy verification
- Schema exploration
- Table listing and record inspection

#### 2. Playwright MCP Server (`.claude/settings.json`)

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

**Setup Command Used:**

```bash
claude mcp add playwright --command npx --args "@playwright/mcp@latest"
```

**What It Enables:**

- Browser automation for E2E testing
- Screenshot capture
- Page interaction (click, type, navigate)
- Test execution from Claude Code

#### 3. GitHub MCP Server (`.claude/settings.json`)

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

**Setup Command Used:**

```bash
claude mcp add github --command npx --args "-y,@modelcontextprotocol/server-github" --env "GITHUB_PERSONAL_ACCESS_TOKEN=$GITHUB_PERSONAL_ACCESS_TOKEN"
```

**What It Enables:**

- Repository access and file listing
- Issue and PR management
- Code search across repositories

---

### Demonstrated Workflows

#### Workflow 1: Database Schema Exploration with Supabase MCP

**Task:** Verify auth tables exist and check RLS policies

**Commands Executed:**

```
MCP> supabase.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
MCP> supabase.query("SELECT policyname, tablename, permissive, roles, cmd, qual FROM pg_policies WHERE schemaname = 'public'")
```

**Results:**

- Confirmed `users` table exists with RLS enabled
- Verified `auth.users` is accessible via foreign key
- Confirmed policies are in place for user data protection

**Screenshots:** See `screenshots/supabase-mcp-query.png`

#### Workflow 2: E2E Test Execution with Playwright MCP

**Task:** Run E2E tests for auth flows

**Commands Executed:**

```bash
# Start dev server first
npm run dev

# In another terminal, run E2E tests
npx playwright test src/app/(auth)/login/page.test.tsx
```

**Results:**

```
Running 5 tests using 1 worker
  5 passed (1.2s)
```

**Tests Covered:**

1. Login page renders correctly
2. Form validates email format
3. Form validates password length
4. Invalid credentials show error
5. Successful login redirects to dashboard

**Screenshots:** See `screenshots/playwright-mcp-test.png`

#### Workflow 3: Login Implementation with MCP

**Task:** Build complete login flow using MCP for database verification and testing

**MCP-Enhanced Development Process:**

**Step 1: Schema Verification with Supabase MCP**

```
MCP> supabase.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'")
Result: id (uuid), email (text), created_at (timestamptz), etc.

MCP> supabase.query("SELECT * FROM pg_policies WHERE tablename = 'users'")
Result: RLS policies confirmed for user data protection
```

**Step 2: Implementation with Pattern Matching**
Used Playwright MCP to analyze existing auth patterns:

```bash
# Find similar auth routes
npx playwright test --list | grep auth
```

**Step 3: E2E Testing with Playwright MCP**

```bash
npx playwright test src/app/(auth)/login/page.test.tsx --reporter=line
```

**Files Created with MCP:**

- `src/app/(auth)/login/page.tsx` - Login UI with form validation
- `src/app/api/auth/login/route.ts` - API endpoint with Supabase auth
- `src/app/api/auth/login/route.test.ts` - 5 comprehensive tests
- `src/lib/auth.ts` - Shared validation utilities (Zod schemas)

**Results:**

- Database schema verified before writing code
- RLS policies confirmed for security
- 5 E2E tests pass covering validation and auth flows
- Consistent patterns across auth implementations

**Screenshots:** See `screenshots/login-mcp-workflow.png`

---

### Setup Documentation

#### Prerequisites

1. Node.js 18+ installed
2. npm or yarn package manager
3. Supabase project (for database MCP)
4. GitHub personal access token (optional, for GitHub MCP)

#### Step-by-Step Setup

**1. Supabase MCP:**

```bash
# Get your project ref from Supabase dashboard
PROJECT_REF="your-project-ref"

# Add MCP server
claude mcp add supabase --type http --url "https://mcp.supabase.com/mcp?project_ref=${PROJECT_REF}"

# Verify connection
claude mcp list
```

**2. Playwright MCP:**

```bash
# Install Playwright MCP
npm install -D @playwright/mcp

# Add MCP server
claude mcp add playwright --command npx --args "@playwright/mcp@latest"

# Install browsers
npx playwright install
```

**3. GitHub MCP (Optional):**

```bash
# Set token
export GITHUB_PERSONAL_ACCESS_TOKEN="your-token"

# Add MCP server
claude mcp add github --command npx --args "-y,@modelcontextprotocol/server-github" --env "GITHUB_PERSONAL_ACCESS_TOKEN=$GITHUB_PERSONAL_ACCESS_TOKEN"
```

#### Verification

Run these commands to verify MCP is working:

```bash
# Check configured servers
claude mcp list

# Test Supabase connection
# (In Claude Code: /mcp supabase.query "SELECT NOW()")

# Test Playwright
# (In Claude Code: /mcp playwright.browser.navigate "http://localhost:3000")
```

---

### What MCP Enables That Wasn't Possible Before

1. **Context-Aware Development:**
   - Query database schema directly during development
   - Verify RLS policies without leaving the editor
   - Cross-reference table structures with code

2. **Integrated Testing:**
   - Run E2E tests inline with development
   - Capture screenshots automatically on failure
   - Navigate and interact with pages via commands

3. **Streamlined Workflow:**
   - No context switching between terminal and browser
   - Immediate feedback on database changes
   - Automated test execution on file changes

4. **Documentation from Code:**
   - Query actual database schema for documentation
   - Generate API examples from live data
   - Verify assumptions about data structure
