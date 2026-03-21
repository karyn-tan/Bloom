# Bloom — Product Requirements Document

**Version:** 1.1
**Status:** Draft
**Last updated:** March 2026
**Author:** Feng Hua Tan, Hemang Murugan

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [User Personas](#2-user-personas)
3. [User Stories and Acceptance Criteria](#3-user-stories-and-acceptance-criteria)
4. [Features and Requirements](#4-features-and-requirements)
5. [Security Requirements](#5-security-requirements)
6. [Out of Scope](#6-out-of-scope)
7. [Goals and Success Metrics](#7-goals-and-success-metrics)
8. [Tech Stack and Architecture Decisions](#8-tech-stack-and-architecture-decisions)
9. [Coding Conventions](#9-coding-conventions)
10. [Testing Strategy and TDD Workflow](#10-testing-strategy-and-tdd-workflow)
11. [Project Do's and Don'ts](#11-project-dos-and-donts)

---

## 1. Problem Statement

People who buy cut flowers — particularly casual, low-frequency buyers — routinely watch their bouquets die faster than expected and feel like they did something wrong. They care enough about the waste to search for answers, but the information they find is not usable: it is scattered, species-specific, and assumes the reader already knows what flowers they have.

The root failure is identification. A buyer who cannot name the flowers in their bouquet cannot act on any species-specific care advice, no matter how good that advice is.

**Interview evidence:**

Maya searched "how to make flowers last longer" after a bouquet died quickly. She found useful information but could not apply it: "The article was kind of long and had a lot of specific stuff like 'for roses do this, for tulips do that' and I didn't actually know what I had so I just did the general tips and hoped for the best." She described hitting this same wall "probably every time."

Priya, a more experienced buyer, still encounters the same friction every time she tries a new variety: she bought ranunculus for the first time and lost the whole bunch because she did not know they need cold water. "Looked it up after the fact, which was too late obviously." Even expertise does not eliminate the new-variety problem.

**The problem Bloom solves:** A casual flower buyer cannot act on care information because they do not know what they have. Even if they find advice, it assumes knowledge they do not have. Bloom closes the gap between "I have flowers I can't identify" and "I know exactly what to do right now." It also helps users build flower literacy over time through their own purchase history, and guides them toward smarter seasonal buying.

---

## 2. User Personas

### Persona 1: The Casual Buyer

**Name:** Maya
**Age:** 26, grad student
**One-line quote:** "I paid $7 and they lasted four days. I feel like I did something wrong but I don't know what."

**Goals:**
- Get value out of a cheap bouquet by keeping it alive longer
- Understand what she bought without having to research each flower herself
- Find care advice that is specific to what she actually has, not generic

**Frustrations:**
- Generic care advice assumes species knowledge she does not have
- She takes partial action (cut stems, forgot about sunlight) but information does not stick
- Feels financial guilt when flowers die fast, but lacks motivation to invest heavily in research

**Behaviors:**
- Buys by vibe and color, not by species name
- Will Google a problem reactively but does not research proactively
- Takes partial action on advice she finds; does not follow through completely
- Has searched for flower care information at least once but the advice was not actionable without knowing her flower names

---

### Persona 2: The Motivated Hobbyist

**Name:** Priya
**Age:** 34, manages the household
**One-line quote:** "There are things I've been curious about for a while that I keep putting off because I don't want to waste them."

**Goals:**
- Confidently experiment with new flower varieties she has never worked with before
- Know what a flower needs before she buys it, not after it dies
- Spend her farmers market budget more effectively

**Frustrations:**
- Still kills new varieties despite months of experience (ranunculus example)
- Information is scattered across YouTube, blogs, and vendor conversations — nothing consolidates it
- Self-limits her experimentation because of fear of failure and wasted money

**Behaviors:**
- Shops weekly at farmers market; has built vendor relationships over a year
- Researches after failures, not before purchases
- Willing to seek out and absorb detailed information when motivated
- Would experiment more if she had upfront care guidance for unfamiliar varieties
- Maintains multiple arrangements simultaneously at home

---

## 3. User Stories and Acceptance Criteria

Each user story follows the format: **As a [user], I want [action] so that [outcome].**

Each story includes:
- Acceptance Criteria (the specific conditions that must be true for the story to be complete)
- Definition of Done (the engineering checklist that must be satisfied before the story is closed)

---

### Authentication

---

**US-1:** As a new user, I want to create an account with my email and password so that my scan history is saved and accessible across sessions.

_Signal: Saving history requires an identity. Account-required-before-scanning is a deliberate product decision to enable this._

**Acceptance Criteria:**
- Given I am on the signup page, when I submit a valid email and password (min 8 characters), then my account is created and I am redirected to the dashboard
- Given I submit an email that is already registered, then I see an inline error: "An account with this email already exists"
- Given I submit a password shorter than 8 characters, then I see an inline error before the form is submitted
- Given signup succeeds, then a Supabase session is persisted and I remain logged in on refresh

**Definition of Done:**
- [ ] Unit test: form validation logic (password length, email format)
- [ ] Integration test: Supabase Auth signup call succeeds with valid input, returns session
- [ ] Integration test: duplicate email returns expected error shape
- [ ] E2E test: full signup flow completes and redirects to dashboard
- [ ] RLS verified: newly created user cannot query another user's rows
- [ ] Code reviewed and formatted

---

**US-2:** As a new user, I want to sign in with Google so that I do not have to remember a separate password.

_Product decision: Google OAuth via Supabase reduces signup friction for casual users like Maya._

**Acceptance Criteria:**
- Given I click "Continue with Google," then I am redirected to Google's OAuth consent screen
- Given I complete Google OAuth successfully, then I am redirected back to the dashboard as an authenticated user
- Given I sign in with a Google account that matches an existing email/password account, then the accounts are merged under one identity via Supabase Auth

**Definition of Done:**
- [ ] Integration test: OAuth redirect URL is correctly constructed
- [ ] E2E test: Google OAuth flow completes and lands on dashboard (use a test Google account)
- [ ] RLS verified: OAuth-created user is subject to the same row-level policies as email/password users
- [ ] Code reviewed and formatted

---

**US-3:** As a returning user, I want to log in and immediately see my dashboard so that I can reference care tips for bouquets I already have.

_Signal: Maya's partial follow-through ("I forgot about the sunlight thing until right now") suggests she would benefit from revisiting tips after the initial scan._

**Acceptance Criteria:**
- Given I am logged out and visit any protected route, then I am redirected to the login page with the intended route preserved
- Given I log in successfully, then I am redirected to my dashboard showing my active bouquets and recent scan history
- Given my session has expired, then I am prompted to log in again without losing my place

**Definition of Done:**
- [ ] Unit test: redirect logic preserves the originally requested route
- [ ] E2E test: login redirects to dashboard; protected routes redirect to login when unauthenticated
- [ ] Code reviewed and formatted

---

### Scanning and Identification

---

**US-4:** As a user, I want to upload a photo of my whole bouquet so that I do not have to photograph each flower individually.

_Signal: Maya and Marcus both described not knowing what was in their bouquets. The scan flow needs to match casual behavior — one photo, not a cropping session._

**Acceptance Criteria:**
- Given I am on the scan page, I can select a JPEG or PNG file from my device (max 10 MB)
- Given I select a valid file, then a preview of the image is shown before I submit
- Given I select a file over 10 MB, then I see an error: "Photo must be under 10 MB"
- Given I select a non-image file type, then I see an error: "Please upload a JPEG or PNG photo"
- Given I submit the photo, then a loading state is shown while the API runs

**Definition of Done:**
- [ ] Unit test: file type and size validation functions
- [ ] Integration test: valid image is uploaded to Supabase Storage and the URL is returned correctly
- [ ] Integration test: oversized file returns the expected error without calling PlantNet
- [ ] E2E test: upload flow from file selection to loading state
- [ ] Supabase Storage bucket scoped to authenticated user via RLS policy
- [ ] Code reviewed and formatted

---

**US-5:** As a user, I want to see the names of the flowers identified in my bouquet so that I know what I actually have.

_Signal: Maya: "Sometimes I'll see something at the store and I'm like, what even is that, is it good, will it last? And I just... guess."_

**Acceptance Criteria:**
- Given PlantNet returns results, then each identified flower displays its common name and scientific name
- Given PlantNet returns a confidence score below 50% for a result, then a warning badge ("We're not sure about this one") is shown on that card
- Given PlantNet returns no results or errors, then I see: "We couldn't identify your flowers. Try a photo in natural light with the flowers clearly visible"
- Given identification succeeds, then the scan is saved to my history

**Definition of Done:**
- [ ] Unit test: confidence threshold logic (below 50% triggers warning, at or above does not)
- [ ] Unit test: PlantNet response parser extracts common name, scientific name, and score correctly
- [ ] Integration test: `/api/identify` returns correct shape for a valid PlantNet mock response
- [ ] Integration test: `/api/identify` returns sanitized error when PlantNet fails
- [ ] E2E test: scan completes and flower names are visible on the results page
- [ ] Code reviewed and formatted

---

**US-6:** As a user, I want to correct a misidentified flower so that my care tips are based on the right species.

_Signal: PlantNet's top result is not always correct. Wrong identification produces wrong care advice, which is a trust-destroying failure mode based on Maya's experience._

**Acceptance Criteria:**
- Given a flower card is showing a low-confidence result, then an "Edit" or "This isn't right" button is visible
- Given I tap the edit button, then I can type a flower name and see autocomplete suggestions
- Given I select a corrected species, then the care card and fun facts regenerate using the corrected species name via a new Gemini call
- Given I save the correction, then the scan record in Supabase is updated with the corrected species and regenerated care data

**Definition of Done:**
- [ ] Unit test: autocomplete suggestion filtering logic
- [ ] Integration test: `/api/care` is called with the corrected species name and returns the updated card
- [ ] Integration test: Supabase scan record is updated correctly after a correction
- [ ] E2E test: user corrects a flower, card regenerates with new data
- [ ] Code reviewed and formatted

---

### Care Tips, Lifespan, and Fun Facts

---

**US-7:** As a user, I want to see a structured care card for each identified flower so that I can act on the advice immediately without reading a long article.

_Signal: Maya found a long article with species-specific sections and could not use it because she did not know her species. A structured card per identified flower solves both the format and the identification problem._

**Acceptance Criteria:**
- Given identification succeeds, then each flower card shows four labeled rows: Water, Light, Temperature, and Trim
- Given the Gemini call for a flower resolves, then that card is displayed immediately without waiting for other flowers to load
- Given the Gemini call fails or returns unparseable JSON, then the card shows: "Care tips unavailable for this flower" rather than a broken or blank UI
- All four care rows must be non-empty for a card to be considered complete

**Definition of Done:**
- [ ] Unit test: Gemini JSON response parser produces the expected care card shape
- [ ] Unit test: Zod schema rejects a Gemini response missing any required care field
- [ ] Integration test: `/api/care` returns a complete care card for a valid species name mock
- [ ] Integration test: `/api/care` returns the fallback error shape when Gemini returns malformed JSON
- [ ] E2E test: care cards render progressively (first card visible before all cards are loaded)
- [ ] Code reviewed and formatted

---

**US-8:** As a user, I want to see a lifespan estimate for each flower so that I know what to expect and can manage my vase accordingly.

_Signal: Maya: "I paid $7 and they lasted four days. I feel like I did something wrong." A lifespan estimate sets honest expectations._

**Acceptance Criteria:**
- Given identification succeeds, then each flower card shows a lifespan range formatted as "Lasts X–Y days in a vase"
- Given the bouquet is saved as an active bouquet, then a countdown ("X days remaining") is shown based on the date the bouquet was added and the shortest lifespan in the bouquet

**Definition of Done:**
- [ ] Unit test: lifespan countdown calculation from `added_at` date and `lifespan_days.min`
- [ ] Unit test: lifespan display formatter ("Lasts 7–10 days in a vase")
- [ ] E2E test: lifespan is visible on the care card and the countdown appears on the bouquet detail page
- [ ] Code reviewed and formatted

---

**US-9:** As a user, I want to see one or two fun facts about each flower so that the experience feels engaging, not just functional.

_Product decision: Adds delight without adding cognitive load. Delivered via Gemini alongside care tips in the same API call._

**Acceptance Criteria:**
- Given a care card is rendered, then 1–2 fun facts are displayed below the care rows in a visually distinct section
- Given Gemini returns fewer than one fun fact, then the fun facts section is hidden entirely rather than showing an empty block

**Definition of Done:**
- [ ] Unit test: fun facts section is hidden when the array is empty
- [ ] E2E test: fun facts section is visible on a successfully rendered care card
- [ ] Code reviewed and formatted

---

### Bouquet Management

---

**US-10:** As a user, I want to track multiple active bouquets at the same time so that I can manage what I have across different rooms.

_Signal: Priya maintains multiple arrangements simultaneously ("The one by the window is from Monday... The one on the table I redid yesterday"). Multiple bouquets is a real behavior for regular buyers._

**Acceptance Criteria:**
- Given I complete a scan, then I can save it as a named active bouquet (e.g., "Kitchen table," "Bedroom")
- Given I have multiple active bouquets, then my dashboard lists all of them with their name, age in days, and a lifespan countdown
- Given a bouquet's lifespan countdown reaches zero, then it is visually marked as "Likely past peak" and moved to the bottom of the list
- Given I delete a bouquet, then its record and associated image are removed from Supabase

**Definition of Done:**
- [ ] Unit test: bouquet age calculation from `added_at` to today
- [ ] Integration test: bouquet is written to the `bouquets` table scoped to the authenticated user
- [ ] Integration test: fetching bouquets returns only the current user's records (RLS verified)
- [ ] E2E test: user saves a scan as a named bouquet, it appears on the dashboard
- [ ] E2E test: user deletes a bouquet, it is removed from the dashboard
- [ ] Code reviewed and formatted

---

### Scan History

---

**US-11:** As a user, I want to see a list of my past scans so that I can reference care tips for bouquets I have already looked up.

_Signal: Maya forgot half the advice she found. Persistent history makes the advice available at the moment she needs it, not just at scan time._

**Acceptance Criteria:**
- Given I navigate to my history page, then I see all past scans ordered by most recent, each showing a thumbnail, date, and list of identified flower names
- Given I tap a past scan, then the full care cards are displayed from the stored database record without re-calling PlantNet or Gemini
- Given I have more than 20 scans, then history is paginated at 20 per page

**Definition of Done:**
- [ ] Integration test: fetching scan history returns only the authenticated user's records
- [ ] Integration test: scan detail view reads from the `flowers` JSONB column and does not trigger any external API calls
- [ ] E2E test: returning user opens a past scan and sees the full care card
- [ ] Code reviewed and formatted

---

### Reminders

---

**US-12:** As a user, I want to receive email reminders to change the water and trim the stems on my active bouquets so that I do not forget mid-week.

_Signal: Maya: "I cut the stems, yeah. I forgot about the sunlight thing until right now." The gap between knowing and doing is the core behavioral problem. Reminders address it directly._

**Acceptance Criteria:**
- Given I have an active bouquet, then I can opt in to reminders at the time of saving the bouquet
- Given I opt in, then I receive an email reminder every 2 days with the bouquet name and a simple care prompt (change water, retrim stems)
- Given a bouquet is deleted or marked past peak, then its reminders stop automatically
- Given I do not opt in, then no reminder emails are sent

**Definition of Done:**
- [ ] Unit test: reminder scheduling logic calculates the correct send dates from `added_at`
- [ ] Integration test: opting in creates a reminder schedule record in Supabase
- [ ] Integration test: deleting a bouquet removes its associated reminder schedule
- [ ] E2E test: user opts in during bouquet save; reminder record is visible in the database
- [ ] Code reviewed and formatted

---

### Seasonal Recommendations

---

**US-13:** As a user, I want to see what flowers are in season right now and recommendations based on what I have bought before so that I can make a smarter choice at the store.

_Signal: Marcus avoided trying new flowers entirely because of past failures. Priya self-limited her experimentation out of fear of waste. Both would benefit from guided, confidence-building recommendations._

**Acceptance Criteria:**
- Given I have at least one past scan, then a "What to buy this season" section is visible on my dashboard
- Given I have no past scans, then the section shows general seasonal recommendations for the current month without personalization
- Given the recommendation is generated, then each suggested flower shows: common name, why it is in season now, and a one-line care preview
- Given I tap a recommendation, then I am taken to a pre-filled care card for that species (generated via the existing `/api/care` endpoint)
- Recommendations refresh at most once per day (cached per user in Supabase)

**Acceptance Criteria — Security:**
- Given I am authenticated, then the recommendations endpoint only uses my own scan history to personalize results (no cross-user data)

**Definition of Done:**
- [ ] Unit test: season detection from current month (Spring: March–May, Summer: June–August, Autumn: September–November, Winter: December–February)
- [ ] Unit test: recommendation cache freshness check (returns cached result if generated within 24 hours)
- [ ] Integration test: `/api/recommendations` calls Gemini with the correct season and the authenticated user's flower history only
- [ ] Integration test: result is cached in Supabase and the cached version is returned on subsequent calls within 24 hours
- [ ] Integration test: unauthenticated request to `/api/recommendations` returns 401
- [ ] E2E test: dashboard shows the seasonal recommendation section after first scan
- [ ] RLS verified: recommendation cache rows are scoped to `user_id = auth.uid()`
- [ ] Code reviewed and formatted

---

## 4. Features and Requirements

### F1 — Authentication: Email/Password and Google OAuth (MVP)

**Description:** Supabase Auth handles both email/password and Google OAuth. Users must be signed in before accessing any feature. Auth state is persisted via Supabase session management. All protected routes redirect to login if the session is absent or expired.

**Requirements:**
- Sign up and log in with email and password
- Sign in with Google via Supabase OAuth provider
- Password reset via email link
- Redirect to login on access to any protected route; preserve the intended route and redirect back after login
- Session persisted across browser refreshes

**Acceptance Criteria:** See US-1, US-2, US-3
**MVP:** Yes

---

### F2 — Bouquet Photo Upload (MVP)

**Description:** User uploads a single JPEG or PNG photo of their bouquet (max 10 MB). Image is stored in Supabase Storage under the authenticated user's folder path. File input only; no camera capture in v1.

**Requirements:**
- JPEG and PNG accepted; all other types rejected with an error
- 10 MB size limit enforced client-side before upload
- Preview shown before submission
- Loading state shown during identification
- Upload failure shows a clear inline error

**Acceptance Criteria:** See US-4
**MVP:** Yes

---

### F3 — Flower Identification via PlantNet (MVP)

**Description:** The uploaded image is sent to the PlantNet `/identify` API endpoint. The highest-confidence species result is extracted and surfaced per plant detected in the image. Confidence scores are shown to the user.

**Requirements:**
- Call PlantNet with the uploaded image
- Extract the top-ranked species result (common name, scientific name, confidence score)
- Display confidence as a percentage on each flower card
- Show a low-confidence warning badge if confidence is below 50%
- Show a graceful error state with a photography tip if PlantNet returns no results or fails
- The scan record is written to Supabase only after successful identification, not on upload

**Acceptance Criteria:** See US-5
**MVP:** Yes

---

### F4 — Care Tips, Lifespan, and Fun Facts via Gemini (MVP)

**Description:** For each species name confirmed by PlantNet, one Gemini call is made. The call passes the species name and requests a structured JSON response. Responses are validated with Zod before rendering. Cards load progressively as each Gemini call resolves.

**Requirements:**

Gemini prompt must request this JSON structure:
```json
{
  "common_name": "string",
  "lifespan_days": { "min": number, "max": number },
  "care": {
    "water": "string",
    "light": "string",
    "temperature": "string",
    "trim": "string"
  },
  "fun_facts": ["string", "string"]
}
```

- One Gemini call per identified species
- Zod validates response before render; malformed response shows fallback error card
- Lifespan displayed as: "Lasts 7–10 days in a vase"
- Care card displayed as four labeled rows: Water, Light, Temperature, Trim
- Fun facts displayed in a visually distinct section below the care rows
- Cards render progressively; do not wait for all species to resolve
- Gemini results are stored in the scan's `flowers` JSONB column on first generation; subsequent views read from the database

**Acceptance Criteria:** See US-7, US-8, US-9
**MVP:** Yes

---

### F5 — Multi-Bouquet Management (MVP)

**Description:** After a scan, users can save the result as a named active bouquet. Multiple bouquets can be active simultaneously. The dashboard displays all active bouquets with lifespan countdowns. Bouquets can be deleted individually.

**Requirements:**
- Named bouquet created from a scan result (user provides a label; default: today's date)
- Dashboard lists all active bouquets ordered by most recently added
- Each bouquet tile shows: name, thumbnail, age in days, lifespan countdown
- Bouquets whose countdown has expired are labeled "Likely past peak" and sorted to the bottom
- Bouquet deletion removes the record and the image from Supabase Storage

**Acceptance Criteria:** See US-10
**MVP:** Yes

---

### F6 — Scan History (MVP)

**Description:** All completed scans are persisted per user. History is accessible as a paginated list with thumbnails. Opening a past scan displays the full stored care cards without re-calling any external API.

**Requirements:**
- Scan history list: thumbnail, date, comma-separated flower names
- Paginated at 20 items per page
- Opening a scan reads from the stored `flowers` JSONB; no external API calls on re-open
- Scans can be deleted from history (record and image removed)

**Acceptance Criteria:** See US-11
**MVP:** Yes

---

### F7 — Re-identification / Manual Override (MVP)

**Description:** Users can correct a misidentified flower by searching for and selecting the correct species. The care card and fun facts regenerate for the corrected species via a new Gemini call. The scan record is updated in Supabase.

**Requirements:**
- Edit button visible on any flower card, not just low-confidence ones
- Species search input with autocomplete (search against a static list of common cut flower species for v1)
- Selecting a corrected species triggers a new `/api/care` call
- Scan record in Supabase updated with corrected species and new care data
- Correction is persisted; re-opening the scan shows the corrected version

**Acceptance Criteria:** See US-6
**MVP:** Yes

---

### F8 — Bouquet Care Reminders (MVP)

**Description:** Users can opt in to email reminders when saving an active bouquet. Reminders are sent every 2 days prompting a water change and stem trim. Reminders stop when the bouquet is deleted or marked past peak.

**Requirements:**
- Opt-in checkbox shown at bouquet save time (opt-in is not the default)
- Reminder emails sent every 2 days via Supabase Edge Functions and a transactional email provider (Resend recommended)
- Email content: bouquet name, simple care prompt, link back to the bouquet in the app
- Reminder schedule stored in a `reminders` table; deleted alongside the bouquet

**Acceptance Criteria:** See US-12
**MVP:** Yes

---

### F9 — Seasonal Buying Recommendations (MVP)

**Description:** The dashboard shows a "What to buy this season" section driven by Gemini. The prompt includes the current season and the user's past scan history (list of species names). Recommendations are cached per user for 24 hours in Supabase to avoid excessive API calls.

**Requirements:**
- Season derived from current calendar month (Spring: March–May, Summer: June–August, Autumn: September–November, Winter: December–February)
- Gemini prompt includes: current season, user's past flower history (species names only, no image data), and a request for 3–5 recommended flowers
- Each recommendation shows: common name, why it is in season, one-line care preview
- Tapping a recommendation navigates to a pre-populated care card page (calls `/api/care` for that species)
- Recommendations are cached in Supabase per user; cache invalidated after 24 hours
- New users with no history receive general seasonal recommendations without personalization
- Recommendation generation is only triggered server-side; user's flower history is never sent to the client in full

**Acceptance Criteria:** See US-13
**MVP:** Yes

---

## 5. Security Requirements

This section is non-negotiable. Every item here must be verified before any feature is considered shipped.

---

### 5.1 Rate Limiting

All API routes are rate limited to **100 requests per user per 60-second window.**

**Implementation:** Use Upstash Redis with `@upstash/ratelimit` (sliding window algorithm). Rate limit is keyed by authenticated user ID, not IP address, since all routes require authentication.

Every API route handler must include this check before any business logic runs:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '60 s'),
});

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { success } = await ratelimit.limit(userId);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      { status: 429 },
    );
  }

  // ... business logic
}
```

A 429 response must always include the `Retry-After` header set to 60 seconds.

**Routes that must be rate limited:**
- `POST /api/identify`
- `POST /api/care`
- `POST /api/recommendations`
- `POST /api/bouquets`
- `DELETE /api/bouquets/[id]`
- `PATCH /api/scans/[id]` (correction flow)

---

### 5.2 Row Level Security (RLS) and No Insecure Direct Object References

**All Supabase tables must have RLS enabled. There are no exceptions.**

RLS is the last line of defense against insecure direct object references (IDOR). Even if an application bug passes the wrong user's ID into a query, RLS at the database layer prevents a user from reading or writing another user's data.

**The application layer must also enforce ownership.** Never query a resource by ID alone. Always include `user_id = auth.uid()` in every query, even though RLS would catch it. Defense in depth.

---

#### RLS Policies

```sql
-- ============================================================
-- scans
-- ============================================================
alter table scans enable row level security;

create policy "Users can select their own scans"
  on scans for select
  using (auth.uid() = user_id);

create policy "Users can insert their own scans"
  on scans for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own scans"
  on scans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own scans"
  on scans for delete
  using (auth.uid() = user_id);

-- ============================================================
-- bouquets
-- ============================================================
alter table bouquets enable row level security;

create policy "Users can select their own bouquets"
  on bouquets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own bouquets"
  on bouquets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own bouquets"
  on bouquets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own bouquets"
  on bouquets for delete
  using (auth.uid() = user_id);

-- ============================================================
-- reminders
-- ============================================================
alter table reminders enable row level security;

create policy "Users can select their own reminders"
  on reminders for select
  using (auth.uid() = user_id);

create policy "Users can insert their own reminders"
  on reminders for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own reminders"
  on reminders for delete
  using (auth.uid() = user_id);

-- ============================================================
-- recommendation_cache
-- ============================================================
alter table recommendation_cache enable row level security;

create policy "Users can select their own recommendation cache"
  on recommendation_cache for select
  using (auth.uid() = user_id);

create policy "Users can upsert their own recommendation cache"
  on recommendation_cache for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own recommendation cache"
  on recommendation_cache for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

---

#### Supabase Storage RLS

The image storage bucket must be scoped to the authenticated user. Images are stored under the path `{user_id}/{scan_id}.jpg`. The bucket policy must prevent any user from reading or writing to another user's folder.

```sql
-- Storage bucket: flower-images
create policy "Users can upload to their own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'flower-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read their own images"
  on storage.objects for select
  using (
    bucket_id = 'flower-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own images"
  on storage.objects for delete
  using (
    bucket_id = 'flower-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

#### IDOR Prevention in Application Code

Every API route that operates on a resource by ID must verify ownership explicitly before performing any read, write, or delete operation. Never trust the client-provided ID alone.

**Required pattern for all resource-by-ID routes:**

```typescript
// CORRECT: always scope the query to the authenticated user
const { data, error } = await supabase
  .from('scans')
  .select('*')
  .eq('id', scanId)
  .eq('user_id', userId)  // <-- ownership check, always required
  .single();

if (!data) {
  // Return 404, not 403 — do not confirm the resource exists
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
```

**Return 404, not 403, when a resource is not found or does not belong to the requesting user.** Returning 403 confirms the resource exists and leaks information.

---

### 5.3 Authentication Enforcement

Every API route must verify the authenticated session before running any logic. Use a shared `getAuthenticatedUserId` utility that extracts and verifies the Supabase session from the request. Routes must return 401 immediately if the session is absent or invalid.

```typescript
// lib/auth.ts
export async function getAuthenticatedUserId(
  request: Request,
): Promise<string | null> {
  const supabase = createServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}
```

No route may skip this call. This is enforced in code review.

---

### 5.4 Database Schema

```
scans
  id              uuid        primary key default gen_random_uuid()
  user_id         uuid        not null references auth.users on delete cascade
  created_at      timestamptz not null default now()
  image_url       text        not null
  flowers         jsonb       not null

bouquets
  id              uuid        primary key default gen_random_uuid()
  user_id         uuid        not null references auth.users on delete cascade
  scan_id         uuid        not null references scans(id) on delete cascade
  name            text        not null
  added_at        timestamptz not null default now()
  reminder_opt_in boolean     not null default false

reminders
  id              uuid        primary key default gen_random_uuid()
  user_id         uuid        not null references auth.users on delete cascade
  bouquet_id      uuid        not null references bouquets(id) on delete cascade
  next_send_at    timestamptz not null
  created_at      timestamptz not null default now()

recommendation_cache
  id              uuid        primary key default gen_random_uuid()
  user_id         uuid        not null references auth.users on delete cascade
  season          text        not null
  generated_at    timestamptz not null default now()
  recommendations jsonb       not null
```

All foreign keys include `on delete cascade` to prevent orphaned records when a parent is deleted.

---

## 6. Out of Scope

**Purchasing or shopping integration:** Bloom does not link to florists, online stores, or product recommendations. The interviews gave no signal that purchase assistance is a pain point.

**Dried or artificial flowers:** PlantNet is trained on living plants. Scope is limited to fresh cut flowers only.

**Potted plant care:** The product is scoped to cut flowers. Potted plant care is a different behavioral context and a different market.

**Social features (sharing, following, community):** No interview signal supported social behavior as a motivator. Maya and Priya both solve problems individually.

**Native mobile app (iOS or Android):** Out of scope for v1. The product is a web app built with Next.js.

**In-app camera capture:** File upload is sufficient for v1. Camera capture requires additional browser permissions handling and testing overhead that is not justified yet.

**Admin or moderation tooling:** No multi-tenant or admin role is needed for v1. All users have the same access scope.

---

## 7. Goals and Success Metrics

**M1 — Identification success rate**
At least 75% of scans result in at least one flower identified with confidence above 50% within 30 days of launch.

**M2 — Care card completion rate**
At least 80% of successful identifications result in a fully rendered care card (Gemini call succeeds and Zod validation passes).

**M3 — Return within 7 days**
At least 40% of users who complete their first scan return to the app within 7 days. This tests whether the history feature and care tips create pull back into the product.

**M4 — History re-open rate**
At least 30% of returning sessions involve opening a past scan. This validates whether scan history provides real utility.

**M5 — Scan completion rate**
At least 70% of users who upload a photo reach the care card results view. Measures pipeline reliability for a low-patience user.

**M6 — Active bouquet save rate**
At least 50% of users who complete a scan save it as a named active bouquet. This is the primary signal that the multi-bouquet feature is providing value beyond one-shot lookups.

---

## 8. Tech Stack and Architecture Decisions

### Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) with TypeScript | Server components reduce client bundle; App Router enables co-located API routes; API keys never reach the client |
| Styling | Tailwind CSS | Fast iteration; consistent design tokens without a separate CSS layer |
| Auth and DB | Supabase | Auth, Postgres, Storage, and Edge Functions in one service; native RLS support |
| Flower ID | PlantNet API | Domain-specific plant identification with confidence scores; more accurate on real-world photos than general-purpose vision |
| Care tips | Gemini API (gemini-1.5-flash) | Fast and cost-effective for short structured JSON outputs from a known species name |
| Rate limiting | Upstash Redis + @upstash/ratelimit | Serverless-compatible, persistent sliding window rate limiting across Vercel function instances |
| Email | Resend | Transactional email for care reminders; simple API, good deliverability |
| Deployment | Vercel | Native Next.js deployment; zero-config for App Router and Edge Functions |

---

### Key Architecture Decision: Two-Step PlantNet then Gemini Flow

Identification and advice generation are intentionally two separate API calls.

**Step 1:** The user's photo goes to PlantNet. PlantNet returns a species name and confidence score. This is the only step that involves the image.

**Step 2:** The confirmed species name (e.g., "Ranunculus asiaticus") is passed as text to Gemini. Gemini generates the care card, lifespan estimate, and fun facts from the species name alone.

**Why not use Gemini Vision to do both in one step?**

PlantNet is a domain-specific model trained on millions of plant images with a curated taxonomy. Its identification accuracy on real-world cut flower photos is significantly higher than a general-purpose vision model. Collapsing identification and advice into one Gemini Vision call introduces identification errors that silently propagate into wrong care advice — a worse failure mode than an explicit low-confidence warning. Separating the steps means identification errors are surfaced and actionable before any advice is generated.

---

### Rate Limiting Architecture

Rate limiting runs at the API route layer using Upstash Redis with a sliding window algorithm. It is keyed by authenticated user ID. IP-based rate limiting is not used because all routes require authentication, and per-user limiting is more precise and fairer across shared networks.

Upstash Redis is used rather than in-memory limiting because Vercel deploys multiple serverless function instances; in-memory counters are not shared across instances and would make the limit ineffective.

---

## 9. Coding Conventions

### Test-Driven Development Workflow

Bloom follows TDD. No feature code is written before a failing test exists for it. The workflow for every user story is:

1. **Red:** Write a failing test that describes the behavior defined in the acceptance criteria
2. **Green:** Write the minimum code needed to make the test pass
3. **Refactor:** Clean up the implementation without breaking the tests
4. **Repeat** for the next acceptance criterion

A story is not considered in progress until at least one failing test exists. A story is not considered complete until all acceptance criteria have passing tests and the Definition of Done checklist is fully checked off.

---

### Definition of Done (Global Checklist)

Every user story, regardless of feature area, must satisfy all of the following before it is considered done:

- [ ] All acceptance criteria have corresponding passing tests
- [ ] Unit tests written and passing (Vitest)
- [ ] Integration tests written and passing (Vitest)
- [ ] E2E test written and passing for the critical path (Playwright)
- [ ] RLS verified: no query can return data belonging to a different user
- [ ] IDOR check: all resource-by-ID queries include ownership scope (`user_id = auth.uid()`)
- [ ] Rate limiting applied to any new API route
- [ ] No `any` types introduced
- [ ] Zod validation on all external API responses
- [ ] Prettier pre-commit hook passed (no manual bypasses)
- [ ] `.env.example` updated if any new environment variable was introduced
- [ ] Code reviewed by at least one other person

---

### TypeScript

- Strict mode enabled (`"strict": true` in `tsconfig.json`)
- No `any`; use `unknown` with type narrowing for genuinely uncertain shapes
- All external API response shapes defined as TypeScript types before use
- Use `zod` for runtime validation of PlantNet, Gemini, and any other external API responses

---

### File and Folder Naming

```
src/
  app/
    (auth)/              # Route group: login, signup, password reset
    dashboard/           # Active bouquets + seasonal recommendations
    scan/                # Upload and results flow
    history/             # Scan history list and detail
    api/
      identify/
        route.ts         # POST: PlantNet identification
      care/
        route.ts         # POST: Gemini care card by species name
      recommendations/
        route.ts         # POST: Gemini seasonal recommendations
      bouquets/
        route.ts         # POST: create bouquet
        [id]/
          route.ts       # PATCH, DELETE: update or delete bouquet by ID
      scans/
        [id]/
          route.ts       # PATCH: update scan (correction flow), DELETE
  components/
    FlowerCard.tsx
    BouquetTile.tsx
    ScanHistoryItem.tsx
    SeasonalRecommendation.tsx
  lib/
    plantnet.ts
    gemini.ts
    supabase.ts
    auth.ts              # getAuthenticatedUserId utility
    ratelimit.ts         # Upstash ratelimit instance
  types/
    scan.ts
    flower.ts
    bouquet.ts
    recommendation.ts
```

- Pages and layouts: lowercase with hyphens (Next.js convention)
- React components: PascalCase filename, named export
- Utility modules: camelCase filename
- No barrel `index.ts` files unless the module has more than five exports

---

### Component Structure

Each component file should follow this order:

1. Imports
2. Type definitions local to the component
3. The component function (named export, not default)
4. Any sub-components used only within this file

Do not put data-fetching logic inside components. Fetch in Server Components or in dedicated `lib/` functions.

---

### API Route Patterns

- All API routes live under `src/app/api/`
- Each route: authenticate first, rate limit second, then business logic
- Export only the HTTP methods the route handles
- Return `NextResponse.json()` for all responses
- Consistent error shape: `{ "error": "string" }`
- Return 404 (not 403) when a resource is not found or does not belong to the requesting user
- Never expose raw third-party API errors to the client; log server-side, return sanitized message
- API keys for PlantNet and Gemini accessed in server-side routes only, never in client components

---

### Prettier Configuration

**.prettierrc**
```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

**.prettierignore**
```
.next/
node_modules/
public/
*.md
*.json
```

**package.json scripts**
```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

**Pre-commit hook**

Install:
```bash
npm install --save-dev lint-staged husky
npx husky init
```

**.husky/pre-commit**
```bash
npx lint-staged
```

**lint-staged in package.json**
```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx,css}": ["prettier --write"]
  }
}
```

No unformatted code can be committed. The hook runs Prettier on all staged files. Do not bypass with `--no-verify`.

---

### Git Conventions

#### Commit Message Format

```
<type>(<scope>): <short description>

[optional body — what and why, not how]
```

**Types:**
- `feat` — new feature or user-facing behavior
- `fix` — bug fix
- `test` — adding or updating tests with no production code change
- `refactor` — production code change that is not a feature or fix
- `chore` — tooling, config, dependencies

**Scope** is the feature area: `auth`, `scan`, `care`, `bouquet`, `history`, `recommendations`, `reminders`, `rls`, `ratelimit`.

**Examples:**
```
feat(scan): render flower cards progressively as Gemini calls resolve
fix(care): return fallback error card when Gemini JSON fails Zod validation
test(bouquet): add unit tests for lifespan countdown calculator
refactor(auth): extract getAuthenticatedUserId into shared lib/auth utility
chore(config): add Prettier pre-commit hook via lint-staged
```

---

#### TDD Commit Pattern

The red-green-refactor cycle must be visible in git history. Each cycle produces at least three commits in this order:

```
test(<scope>): [RED] <describe the behavior being tested>
feat(<scope>): [GREEN] <describe the minimum implementation>
refactor(<scope>): <describe what was cleaned up>
```

**Example sequence for the confidence threshold feature:**
```
test(scan): [RED] confidence below 50% returns low-confidence warning flag
feat(scan): [GREEN] add threshold check in parsePlantNetResponse
refactor(scan): extract confidence threshold into named constant
```

The `[RED]` commit must contain only the failing test. The `[GREEN]` commit must contain only the minimum code to make it pass. Mixing test and implementation code in the same commit breaks the audit trail and will be flagged in review.

---

#### Four-Phase Workflow Commits (Claude Code)

When using Claude Code's explore-plan-implement-commit workflow, the commit message for the implement phase must reference the plan. Use the body to note what was explored and what the plan decided:

```
feat(recommendations): implement seasonal recommendation caching

Explored: recommendation_cache table schema, /api/care route pattern
Plan: cache per user per season, invalidate after 24h, read cache before calling Gemini
```

This creates a readable git history that shows the reasoning behind each implementation decision.

---

## 10. Testing Strategy and TDD Workflow

### TDD Principles for This Project

- Tests are written before implementation, not after
- A failing test must exist before any feature code is written
- Tests describe behavior defined in acceptance criteria — not implementation details
- Mocks are used for external APIs (PlantNet, Gemini, Upstash) but not for Supabase in integration tests (use a dedicated Supabase test project)

---

### Unit Tests — Vitest

**What to test:**

- PlantNet response parser: extracts species name, confidence, and common name correctly from a raw API response
- Confidence threshold logic: correctly flags results below 50%
- Gemini JSON response parser: produces the expected `FlowerCard` shape from a valid response
- Zod schemas: valid and invalid response shapes from both PlantNet and Gemini pass and fail as expected
- Lifespan display formatter: "Lasts 7–10 days in a vase"
- Lifespan countdown calculator: given `added_at` date and `lifespan_days.min`, returns correct days remaining
- Season detection: given a month number, returns the correct season string
- Recommendation cache freshness: returns true if `generated_at` is within 24 hours
- Rate limit key construction: returns the correct user-scoped key

**What not to test:**

- React component rendering (covered by integration tests)
- The PlantNet, Gemini, or Upstash APIs themselves (external, not under our control)
- Supabase client behavior (covered by integration tests against a test project)

---

### Integration Tests — Vitest

**What boundaries to test:**

- `POST /api/identify`: mock PlantNet HTTP call; verify the route returns the correct shape on success and a sanitized error on failure; verify rate limit returns 429 after 100 requests
- `POST /api/care`: mock Gemini HTTP call; verify valid JSON produces the correct card shape; verify malformed JSON produces the fallback error card; verify 401 on unauthenticated request
- `POST /api/recommendations`: mock Gemini; verify the prompt includes the current season and only the requesting user's flower history; verify caching behavior
- `POST /api/bouquets`: verify insert to Supabase is scoped to `user_id`; verify a second user cannot read the first user's bouquets
- `DELETE /api/bouquets/[id]`: verify that a user cannot delete another user's bouquet (expect 404)
- `PATCH /api/scans/[id]`: verify correction updates the correct scan; verify another user's scan ID returns 404
- Supabase Storage: verify upload path includes `user_id` prefix; verify that fetching another user's image URL returns an access denied error

---

### End-to-End Tests — Playwright

**Flow 1 — New user scans a bouquet and saves it**
1. User visits the app unauthenticated; is redirected to login
2. User creates an account with email and password
3. User uploads a bouquet photo
4. At least one flower card is displayed with a care card, lifespan, and fun fact
5. User saves the bouquet with a custom name
6. Named bouquet appears on the dashboard with a lifespan countdown

**Flow 2 — Returning user accesses scan history**
1. User logs in via Google OAuth
2. User navigates to history
3. User opens a past scan
4. Full care cards are displayed without any loading spinner (reads from DB, no API calls)

**Flow 3 — Low-confidence identification is handled**
1. User uploads a photo that returns a sub-50% confidence result
2. Low-confidence warning badge is visible
3. Care card is still shown
4. User taps "Edit," searches for a species, selects it, care card regenerates

**Flow 4 — PlantNet failure is handled gracefully**
1. PlantNet returns an error (mocked via Playwright network interception)
2. User sees the photography tip error message
3. No broken or empty cards are shown

**Flow 5 — IDOR: User cannot access another user's scan**
1. User A creates an account and scans a bouquet; scan ID is recorded
2. User A logs out
3. User B creates an account and sends a direct request to `/api/scans/{user_A_scan_id}`
4. Response is 404 (not 403, not 200)

**Flow 6 — Rate limiting**
1. Authenticated user sends 101 consecutive requests to `/api/identify`
2. The 101st request returns 429 with a `Retry-After` header

---

## 11. Project Do's and Don'ts

### Do's

**Do write the failing test before writing the implementation.** No feature code exists without a corresponding failing test. This is not optional.

**Do run RLS and IDOR checks as part of every story's Definition of Done.** These are not post-launch concerns. They are acceptance criteria.

**Do target Maya's attention span.** The UI must deliver actionable information within one scroll. A care card that requires reading a paragraph has failed.

**Do cache Gemini results in the database.** Once a care card is generated and saved to Supabase, never regenerate it. Re-opening a scan reads from the database, not from Gemini.

**Do show progressive loading.** Render each flower card as soon as its Gemini call resolves. Do not block the entire results view on all flowers finishing.

**Do validate all external API responses with Zod at runtime.** Gemini does not guarantee a stable schema. A silent parse failure that renders a blank card is worse than a visible fallback error.

**Do keep API keys server-side only.** PlantNet, Gemini, and Upstash keys must never reach the client. All third-party calls happen in Next.js API routes.

**Do return 404 instead of 403 for unauthorized resource access.** Returning 403 confirms the resource exists and is an information leak.

**Do document every environment variable in `.env.example`.** No developer should have to ask what keys are needed to run the project.

---

### Don'ts

**Don't query a resource by ID without scoping it to the authenticated user.** Always include `user_id = auth.uid()` in every query, even though RLS would catch it. Defense in depth is not optional.

**Don't ask Gemini to identify and advise in the same step.** The two-step architecture exists because PlantNet's domain-specific accuracy prevents wrong care advice from propagating silently. Collapsing the steps is a regression, not a simplification.

**Don't disable or bypass RLS on any table.** If a feature seems to require disabling RLS, the feature design is wrong. Fix the design.

**Don't use `any` in TypeScript.** Use `unknown` and narrow it. `any` converts type errors into runtime failures.

**Don't show a blank screen on API failure.** Every error state must include a specific, actionable next step for the user.

**Don't skip the Prettier pre-commit hook.** Format discipline is enforced at commit time. Do not use `--no-verify` except in a genuine emergency, and reformat immediately after.

**Don't store secrets in `.env.local` without a corresponding `.env.example` entry.** If you add a new environment variable, you update `.env.example` in the same commit.

**Don't merge a story without all items on the Definition of Done checklist checked off.** Partial completion is not done.
