# Test-Driven Development W11

## Unit + Integration Tests (Vitest)

- **49 test files — ALL PASSED**
- **321 tests — ALL PASSED**
- **Statement coverage: 70.66%** (above 70% threshold)
- **Branch coverage: 87.32%**
- **Function coverage: 85.03%**
- Duration: 7.44s

### Test Run Output

```
 ✓ src/lib/health.test.ts (36 tests) 9ms
 ✓ src/lib/dashboard.test.ts (9 tests) 7ms
 ✓ src/lib/gemini.test.ts (16 tests) 10ms
 ✓ src/app/api/identify/route.test.ts (15 tests) 24ms
 ✓ src/app/api/adaptive-tip/route.test.ts (9 tests) 20ms
 ✓ src/app/(auth)/login/page.test.tsx (7 tests) 365ms
 ✓ src/app/(auth)/signup/page.test.tsx (7 tests) 425ms
 ✓ src/app/api/care/route.test.ts (9 tests) 16ms
 ✓ src/app/api/scans/[id]/route.test.ts (9 tests) 24ms
 ✓ src/app/api/bouquets/route.test.ts (8 tests) 11ms
 ✓ src/app/api/care-log/route.test.ts (9 tests) 10ms
 ✓ src/app/api/bouquets/[id]/route.test.ts (7 tests) 13ms
 ✓ src/components/scan/RescanButton.test.tsx (8 tests) 138ms
 ✓ src/components/dashboard/SaveBouquetForm.test.tsx (8 tests) 208ms
 ✓ src/app/api/auth/login/route.test.ts (5 tests) 23ms
 ✓ src/app/api/auth/signup/route.test.ts (6 tests) 22ms
 ✓ src/middleware.test.ts (9 tests) 11ms
 ✓ src/components/scan/CorrectFlowerForm.test.tsx (6 tests) 187ms
 ✓ src/components/dashboard/BouquetTile.test.tsx (8 tests) 252ms
 ✓ src/lib/careLog.test.ts (11 tests) 2ms
 ✓ src/components/dashboard/ProfileDropdown.test.tsx (7 tests) 227ms
 ✓ src/components/scan/CareActionButtons.test.tsx (6 tests) 182ms
 ✓ src/app/(auth)/forgot-password/page.test.tsx (5 tests) 257ms
 ✓ src/app/api/auth/reset-password/route.test.ts (5 tests) 11ms
 ✓ src/app/api/auth/forgot-password/route.test.ts (5 tests) 26ms
 ✓ src/lib/plantnet.test.ts (4 tests) 12ms
 ✓ src/components/AdaptiveTipCard.test.tsx (7 tests) 36ms
 ✓ src/lib/config.test.ts (8 tests) 5ms
 ✓ src/components/scan/FlowerCard.test.tsx (4 tests) 53ms
 ✓ src/components/dashboard/ScanGrid.test.tsx (7 tests) 130ms
 ✓ src/components/auth/GoogleSignInButton.test.tsx (4 tests) 118ms
 ✓ src/app/dashboard/page.test.tsx (2 tests) 74ms
 ✓ src/app/api/auth/callback/route.test.ts (3 tests) 10ms
 ✓ src/components/scan/ImageUploader.test.tsx (5 tests) 82ms
 ✓ src/app/api/auth/logout/route.test.ts (3 tests) 15ms
 ✓ src/lib/auth.test.ts (6 tests) 4ms
 ✓ src/lib/ratelimit.test.ts (2 tests) 7ms
 ✓ src/app/(auth)/reset-password/page.test.tsx (5 tests) 2213ms
 ✓ src/lib/flowers.test.ts (5 tests) 2ms
 ✓ src/components/dashboard/LogoutButton.test.tsx (2 tests) 145ms
 ✓ src/components/dashboard/Navbar.test.tsx (3 tests) 89ms
 ✓ src/components/dashboard/SeasonalTeaser.test.tsx (3 tests) 40ms
 ✓ src/components/dashboard/HowItWorks.test.tsx (3 tests) 97ms
 ✓ src/components/dashboard/EmptyDashboard.test.tsx (4 tests) 137ms
 ✓ src/components/scan/ConfidenceBadge.test.tsx (3 tests) 39ms
 ✓ src/components/icons/DropletIcon.test.tsx (2 tests) 22ms
 ✓ src/components/icons/HeartIcon.test.tsx (2 tests) 19ms
 ✓ src/components/dashboard/WelcomeHeader.test.tsx (2 tests) 44ms
 ✓ src/components/dashboard/ScanCTA.test.tsx (2 tests) 47ms

 Test Files  49 passed (49)
      Tests  321 passed (321)
   Duration  7.44s
```

### Coverage Report

```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   70.66 |    87.32 |   85.03 |   70.66 |
 src               |   93.54 |    85.71 |     100 |   93.54 |
  middleware.ts    |   93.54 |    85.71 |     100 |   93.54 | 30-31
 src/app/(auth)    |         |          |         |         |
  login/page.tsx   |     100 |      100 |     100 |     100 |
  signup/page.tsx  |     100 |      100 |     100 |     100 |
  forgot/page.tsx  |   94.38 |    76.92 |     100 |   94.38 |
  reset/page.tsx   |   99.41 |    83.33 |     100 |   99.41 |
 src/app/api       |         |          |         |         |
  adaptive-tip     |   89.85 |    80.64 |     100 |   89.85 |
  auth/callback    |     100 |      100 |     100 |     100 |
  auth/forgot-pw   |     100 |    83.33 |     100 |     100 |
  auth/login       |   97.43 |    85.71 |     100 |   97.43 |
  auth/logout      |     100 |      100 |     100 |     100 |
  auth/reset-pw    |     100 |      100 |     100 |     100 |
  auth/signup      |   86.48 |    71.42 |     100 |   86.48 |
  bouquets         |   91.22 |    92.85 |     100 |   91.22 |
  bouquets/[id]    |   98.41 |    94.44 |     100 |   98.41 |
  care             |     100 |      100 |     100 |     100 |
  care-log         |   90.74 |    93.33 |     100 |   90.74 |
  identify         |   98.87 |    89.58 |     100 |   98.87 |
  scans/[id]       |   97.46 |    88.46 |     100 |   97.46 |
 src/components    |         |          |         |         |
  AdaptiveTipCard  |     100 |      100 |     100 |     100 |
  BouquetTile      |   92.64 |    64.28 |     100 |   92.64 |
  EmptyDashboard   |     100 |      100 |     100 |     100 |
  HowItWorks       |     100 |      100 |     100 |     100 |
  LogoutButton     |     100 |      100 |     100 |     100 |
  Navbar           |     100 |      100 |     100 |     100 |
  ProfileDropdown  |   87.27 |      100 |      80 |   87.27 |
  SaveBouquetForm  |     100 |       90 |      75 |     100 |
  ScanCTA          |     100 |      100 |     100 |     100 |
  ScanGrid         |     100 |      100 |     100 |     100 |
  SeasonalTeaser   |     100 |      100 |     100 |     100 |
  WelcomeHeader    |     100 |      100 |     100 |     100 |
  DropletIcon      |     100 |      100 |     100 |     100 |
  HeartIcon        |     100 |      100 |     100 |     100 |
  CareActionBtns   |     100 |      100 |     100 |     100 |
  CareTipSection   |     100 |      100 |     100 |     100 |
  ConfidenceBadge  |     100 |      100 |     100 |     100 |
  CorrectFlowerFrm |     100 |    92.85 |     100 |     100 |
  FlowerCard       |     100 |      100 |     100 |     100 |
  ImageUploader    |   71.09 |    86.66 |      50 |   71.09 |
  RescanButton     |   99.19 |     90.9 |   66.66 |   99.19 |
 src/lib           |         |          |         |         |
  auth.ts          |     100 |      100 |     100 |     100 |
  careLog.ts       |   93.93 |    93.75 |     100 |   93.93 |
  config.ts        |     100 |      100 |     100 |     100 |
  dashboard.ts     |   52.59 |       56 |      60 |   52.59 |
  flowers.ts       |     100 |      100 |     100 |     100 |
  gemini.ts        |    97.5 |    92.85 |     100 |    97.5 |
  health.ts        |     100 |      100 |     100 |     100 |
  plantnet.ts      |     100 |      100 |     100 |     100 |
  ratelimit.ts     |   89.74 |    66.66 |     100 |   89.74 |
  seasonal-data.ts |     100 |      100 |     100 |     100 |
 src/hooks         |         |          |         |         |
  useForm.ts       |   93.98 |    95.45 |     100 |   93.98 |
-------------------|---------|----------|---------|---------|-------------------
```

---

## E2E Tests (Playwright)

- **5 tests — ALL PASSED**
- Duration: 2.3s

### Test Run Output

```
Running 5 tests using 4 workers

  ✓  [chromium] › e2e/adaptive-care-tips.spec.ts:83:7 › Adaptive Care Tips — /api/adaptive-tip › all_good: mocked API returns positive affirmation (943ms)
  ✓  [chromium] › e2e/adaptive-care-tips.spec.ts:23:7 › Adaptive Care Tips — /api/adaptive-tip › no_data: mocked API returns onboarding prompt (925ms)
  ✓  [chromium] › e2e/adaptive-care-tips.spec.ts:52:7 › Adaptive Care Tips — /api/adaptive-tip › missed_watering: mocked API returns corrective tip (905ms)
  ✓  [chromium] › e2e/adaptive-care-tips.spec.ts:114:7 › Adaptive Care Tips — /api/adaptive-tip › unauthenticated: middleware redirects to login (977ms)
  ✓  [chromium] › e2e/adaptive-care-tips.spec.ts:135:7 › Adaptive Care Tips — /api/adaptive-tip › invalid bouquet_id: mocked endpoint returns 400 (351ms)

  5 passed (2.3s)
```

---

## Test Files Summary

| Test File | Tests | Category |
|-----------|-------|----------|
| `src/lib/health.test.ts` | 36 | Unit — health state computation (hearts, droplets, status) |
| `src/lib/gemini.test.ts` | 16 | Unit — Gemini response parsing, Zod validation |
| `src/app/api/identify/route.test.ts` | 15 | Integration — flower identification API (auth, validation, PlantNet, Gemini, storage, rescan) |
| `src/lib/careLog.test.ts` | 11 | Unit — care log analysis (missed watering, missed trim, all good, no data) |
| `src/lib/dashboard.test.ts` | 9 | Unit — bouquet status computation, age, countdown |
| `src/app/api/adaptive-tip/route.test.ts` | 9 | Integration — adaptive tip API (auth, caching, Gemini prompt, errors) |
| `src/app/api/care-log/route.test.ts` | 9 | Integration — care log API (auth, rate limit, IDOR, DB insert) |
| `src/app/api/care/route.test.ts` | 9 | Integration — care tip API (auth, cache hit/miss, Gemini errors) |
| `src/app/api/scans/[id]/route.test.ts` | 9 | Integration — scan correction API (auth, validation, Gemini regen, bouquet sync) |
| `src/middleware.test.ts` | 9 | Integration — auth middleware redirects |
| `src/app/api/bouquets/route.test.ts` | 8 | Integration — bouquet creation API (auth, rate limit, validation) |
| `src/app/api/bouquets/[id]/route.test.ts` | 7 | Integration — bouquet deletion API (auth, IDOR, storage cleanup) |
| `src/components/scan/RescanButton.test.tsx` | 8 | Component — file validation, API errors, rescan with scanId, dismiss |
| `src/components/dashboard/BouquetTile.test.tsx` | 8 | Component — rendering, delete flow, past peak badge |
| `src/components/dashboard/SaveBouquetForm.test.tsx` | 8 | Component — form submission, validation, loading state |
| `src/lib/config.test.ts` | 8 | Unit — environment variable validation (Supabase, PlantNet, Gemini, Upstash) |
| `src/app/(auth)/login/page.test.tsx` | 7 | Component — login page rendering, form interaction |
| `src/app/(auth)/signup/page.test.tsx` | 7 | Component — signup page rendering, form interaction |
| `src/components/dashboard/ProfileDropdown.test.tsx` | 7 | Component — dropdown rendering, interactions |
| `src/components/AdaptiveTipCard.test.tsx` | 7 | Component — tip rendering (corrective, positive, onboarding) |
| `src/components/dashboard/ScanGrid.test.tsx` | 7 | Component — scan tile rendering, links, lifespan badges |
| `src/components/scan/CorrectFlowerForm.test.tsx` | 6 | Component — open/close, submit, error display, spinner |
| `src/app/api/auth/signup/route.test.ts` | 6 | Integration — signup API (validation, Supabase auth, errors) |
| `src/lib/auth.test.ts` | 6 | Unit — getAuthenticatedUserId utility |
| `src/components/scan/CareActionButtons.test.tsx` | 6 | Component — water/trim button interactions |
| `src/app/(auth)/forgot-password/page.test.tsx` | 5 | Component — forgot password page |
| `src/app/(auth)/reset-password/page.test.tsx` | 5 | Component — reset password page |
| `src/app/api/auth/login/route.test.ts` | 5 | Integration — login API |
| `src/app/api/auth/reset-password/route.test.ts` | 5 | Integration — reset password API |
| `src/app/api/auth/forgot-password/route.test.ts` | 5 | Integration — forgot password API |
| `src/components/scan/ImageUploader.test.tsx` | 5 | Component — image upload validation |
| `src/lib/flowers.test.ts` | 5 | Unit — flower name utilities |
| `src/lib/plantnet.test.ts` | 4 | Unit — PlantNet response parsing |
| `src/components/scan/FlowerCard.test.tsx` | 4 | Component — flower card rendering |
| `src/components/auth/GoogleSignInButton.test.tsx` | 4 | Component — OAuth button |
| `src/components/dashboard/EmptyDashboard.test.tsx` | 4 | Component — empty state rendering |
| `src/app/api/auth/callback/route.test.ts` | 3 | Integration — OAuth callback |
| `src/app/api/auth/logout/route.test.ts` | 3 | Integration — logout API |
| `src/components/dashboard/Navbar.test.tsx` | 3 | Component — navigation bar |
| `src/components/dashboard/HowItWorks.test.tsx` | 3 | Component — onboarding section |
| `src/components/dashboard/SeasonalTeaser.test.tsx` | 3 | Component — seasonal recommendation teaser |
| `src/components/scan/ConfidenceBadge.test.tsx` | 3 | Component — confidence score badge |
| `src/lib/ratelimit.test.ts` | 2 | Unit — rate limit key construction |
| `src/app/dashboard/page.test.tsx` | 2 | Component — dashboard page |
| `src/components/dashboard/LogoutButton.test.tsx` | 2 | Component — logout button |
| `src/components/dashboard/WelcomeHeader.test.tsx` | 2 | Component — welcome header |
| `src/components/dashboard/ScanCTA.test.tsx` | 2 | Component — scan call-to-action |
| `src/components/icons/HeartIcon.test.tsx` | 2 | Component — heart icon filled/empty |
| `src/components/icons/DropletIcon.test.tsx` | 2 | Component — droplet icon filled/empty |
| `e2e/adaptive-care-tips.spec.ts` | 5 | E2E — adaptive tip flows (Playwright) |
