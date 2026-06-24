# LocalSEOBot — Complete Product Design Document

> Version 1.0 | June 2026 | $99/month Starter Plan
> This document is the single source of truth for building LocalSEOBot end-to-end.

---

## 1. What We Are Building

LocalSEOBot is a **fully autonomous local SEO agent** for small businesses. The user connects their Google Business Profile once. The bot then handles everything — writing and publishing weekly GBP posts, building citations across 200+ directories, responding to reviews within 2 hours, tracking local keyword rankings, and sending a Monday morning report — all on autopilot, forever.

The business model: **$99/month** for 1 location. No agency. No manual work. No dashboard the user needs to log into.

---

## 2. Target User

**Primary:** Local service business owner. Dentists, HVAC companies, plumbers, restaurants, salons, gyms, law firms, realtors. They are time-poor, already paying or have paid an SEO agency, and deeply skeptical but willing to try if the result is concrete.

**Their mental model:** "I just want more calls from Google. Handle it."

**Technical skill level:** Low. They can connect a Google account. That's it.

**Decision:** Solo credit card decision. No procurement. No IT. Signs up directly.

---

## 3. Core Value Proposition

One sentence the user must believe immediately: **"Connect your Google account. The bot handles local SEO forever."**

Three things the bot does that agencies do manually:
1. Posts to Google Business Profile every week (agencies charge for this)
2. Builds citations on 200+ directories (agencies charge for this)
3. Responds to every review within 2 hours (agencies charge for this)

---

## 4. User Journey (End-to-End)

### 4.1 Discovery → Signup

```
User lands on localSEObot.com
→ Sees headline: "Your local SEO, running itself"
→ Clicks "Start 14-day free trial"
→ Email + password signup (or Google OAuth)
→ Redirect to /onboarding
```

### 4.2 Onboarding (7 steps, must complete in one session)

```
Step 1: Enter business name + website URL
Step 2: Enter business address + phone + category
Step 3: Connect Google Business Profile (OAuth popup)
Step 4: Bot runs instant audit (30-second wait screen)
Step 5: Show audit results — "We found X issues"
Step 6: User reviews bot's content plan (first 3 posts shown)
Step 7: Enter credit card (14-day free trial starts)
→ Redirect to /dashboard
→ Bot starts running immediately
```

**Onboarding philosophy:** User should see the bot doing something real within 5 minutes of sign-up. The audit results and first content plan make it feel like it's already working before they've paid.

### 4.3 Ongoing Experience (what the user sees weekly)

```
Monday 8am: Email report arrives in inbox
  → "Here's what your bot did this week"
  → New GBP post published (with link)
  → X reviews responded to
  → Y new citations submitted
  → Ranking changes for top keywords

User does nothing. Bot runs.

Optional: User logs into dashboard to see pipeline
Optional: User logs in to approve/edit posts before publishing
```

### 4.4 Full Dashboard Flow

```
/dashboard           → Overview: metrics, activity feed, quick actions
/dashboard/posts     → All GBP posts (published, scheduled, drafts)
/dashboard/citations → Citation directory status (submitted, live, pending)
/dashboard/reviews   → All reviews + bot responses
/dashboard/rankings  → Keyword ranking table + weekly changes
/dashboard/reports   → All past Monday reports (PDF/view)
/dashboard/settings  → Business info, bot preferences, integrations, billing
```

---

## 5. Feature Specifications

### 5.1 Google Business Profile (GBP) Automation

**What it does:**
- Publishes 1 post per week to the business's GBP
- Post types rotate: offer posts, update posts, event posts, product posts
- Posts include a call-to-action button (e.g., "Call now", "Learn more", "Book")
- AI writes posts in the business's niche tone (dental ≠ HVAC ≠ restaurant)
- Pulls in seasonal context (holidays, local events, weather)
- Includes a royalty-free image sourced from Unsplash API

**What the user controls:**
- Post tone (professional / casual / friendly)
- Topics to avoid
- Approval mode ON/OFF (if ON, user approves each post via email before it goes live)
- Post frequency (weekly default, can change to biweekly)

**GBP API actions used:**
- `accounts.locations.localPosts.create` — publish new post
- `accounts.locations.localPosts.list` — fetch existing posts
- `accounts.locations.patch` — update business info
- `accounts.locations.media.create` — upload photos
- `accounts.locations.questions.answers.upsert` — respond to Q&A

**Post generation prompt (sent to Claude API):**
```
You are a local SEO content writer for [BUSINESS_NAME], a [CATEGORY] business in [CITY].

Write a Google Business Profile post for this week. The post should:
- Be 150-250 words
- Sound like a local, real business owner wrote it (not a corporation)
- Include a reference to [CURRENT_SEASON/MONTH] naturally
- Include one clear call to action
- Mention [CITY] naturally at least once
- Focus this week on: [ROTATING_TOPIC from: services, team, customer story, tip, promotion]

Business details:
- Services: [SERVICES]
- Tone: [USER_SELECTED_TONE]
- Avoid: [USER_AVOIDANCES]

Do not use emojis. Do not use hashtags. Write in plain English.
Output only the post text. No commentary.
```

---

### 5.2 Citation Building Engine

**What it is:** Submitting the business's NAP (Name, Address, Phone) to local directory websites so Google sees consistent signals across the web.

**Citation targets (Priority 1 — top 50):**
Yelp, Yellow Pages, Bing Places, Apple Maps, Foursquare, Facebook Business, BBB, Angi, HomeAdvisor, TripAdvisor, Thumbtack, Google Maps (already connected), Alignable, Merchant Circle, Manta, Citysearch, Superpages, Whitepages, MapQuest, Chamber of Commerce, Nextdoor Business, Hotfrog, ezlocal, BrownBook, 2FindLocal, LocalStack, n49, ChamberofCommerce.com, Cylex, Fyple, GetFave, GoLocal247, iGlobal, Infobel, InsiderPages, LocalDatabase, MojoPages, MyHuckleberry, Opendi, ShowMeLocal, SureCritic, Tuugo, USCity.net, WhereTo, YellowMoxie, YellowBot, YP.com, ZipLeaf

**Citation targets (Priority 2 — niche-specific):**
- Medical: Healthgrades, ZocDoc, Vitals, WebMD, RateMDs, CareDash
- Legal: Avvo, Martindale, FindLaw, Justia, Lawyers.com
- Restaurant: OpenTable, Grubhub, DoorDash, Yelp Eat24, Zomato
- Home Services: Angi, Houzz, Porch, Thumbtack, HomeAdvisor
- Beauty: StyleSeat, Vagaro, MindBody, Booksy
- Fitness: Mindbody, ClassPass, Yelp Fitness

**How citation submission works:**

For each directory, one of three submission methods:
1. **API submission** (Yelp, Bing Places, Apple Maps have APIs) — fully automated
2. **Form automation** (Puppeteer/Playwright headless browser fills and submits directory forms) — semi-automated
3. **Manual queue** (some directories require human verification — these go to a manual queue handled by the team) — flagged for ops

**Citation status tracking:**
Each citation has a status: `pending` → `submitted` → `live` → `verified`

Citation data stored per directory:
```
directory_name, url, submission_date, status, listing_url, last_verified, nap_match_score
```

**NAP consistency check:** Bot checks all live citations monthly. If any show wrong phone/address (due to a move or edit), flags them for correction.

---

### 5.3 Review Management System

**Review monitoring:**
- Polls Google My Business API every 30 minutes for new reviews
- On new review detected: triggers response generation job immediately

**Review response generation:**

Bot reads the review text and classifies it:
- 5-star positive → grateful, warm response, invite them back
- 4-star with mild complaint → acknowledge complaint specifically, invite them to reach out directly
- 3-star mixed → empathetic response, address specific concerns, offer to make it right
- 1-2 star negative → calm, professional, non-defensive, invite private resolution

**Review response prompt (sent to Claude API):**
```
You are responding to a Google review on behalf of [BUSINESS_NAME], a [CATEGORY] in [CITY].

Review (star rating: [STARS]):
"[REVIEW_TEXT]"

Reviewer name: [REVIEWER_NAME]

Write a response that:
- Opens with the reviewer's first name
- Is 50-100 words
- Sounds like the owner wrote it, not a corporation
- Addresses the specific content of the review (not generic)
- If positive: expresses genuine gratitude, references something specific they mentioned
- If negative: acknowledges their experience without being defensive, invites them to contact [OWNER_EMAIL/PHONE] to resolve it, does NOT offer discounts publicly
- Does NOT say "Thank you for your review" as the first sentence (too generic)
- Does NOT use exclamation marks more than once

Business owner name: [OWNER_NAME]
Tone: [USER_SELECTED_TONE]

Output only the response text. No commentary.
```

**Approval workflow (optional):**
- Default: bot posts response immediately
- If approval mode ON: sends email to owner with the draft response + "Approve" and "Edit" buttons
- Approval timeout: if owner doesn't respond in 4 hours, bot auto-posts anyway (prevents reviews going unanswered)

**Review request campaigns:**
- Bot identifies customers who can be asked for reviews (from integration with POS or manual upload of customer list)
- Sends SMS (via Twilio) or email asking for a Google review
- 2-touch sequence: initial ask + 1 follow-up 7 days later if no review
- Link goes to Google review URL for the business

---

### 5.4 Keyword Tracking

**What's tracked:**
At onboarding, bot auto-generates 20 target keywords based on business category + city:
- "[category] [city]" — "dentist Austin"
- "[category] near me" — "dentist near me"
- "best [category] [city]" — "best dentist Austin"
- "emergency [category] [city]" — "emergency dentist Austin"
- "[specific service] [city]" — "teeth whitening Austin"
- Variations across neighboring cities if the business serves them

**How rankings are pulled:**
- DataForSEO Local Rankings API (`serp/google/maps/task_get`)
- Pull ranks for each keyword, targeting the business's city coordinates
- Stores: rank position, map pack position (if in top 3), organic position
- Frequency: weekly (every Monday morning before report sends)

**Data stored:**
```
keyword, date_checked, maps_rank, organic_rank, competitor_appearing_above
```

**Report format (in Monday email):**
- Keywords moved up ↑ (green)
- Keywords moved down ↓ (red)
- Keywords stable → (gray)
- New keywords entering top 10 (highlighted)

---

### 5.5 Competitor Monitoring

**At onboarding:**
Bot searches Google Maps for top 5 competitors in the same category + city. Stores their GBP IDs.

**Weekly competitor checks:**
- Review count and average rating changes
- New GBP posts published
- New photos added
- Ranking position vs our business

**Alerts sent to dashboard + email:**
- "Competitor [NAME] posted a new promotion — you might want to respond"
- "Competitor [NAME] just got 10 new reviews this week (unusual spike)"
- "You moved from #4 to #2 for 'dentist Austin' — [NAME] dropped"

---

### 5.6 Monday Morning Report

Sent every Monday at 8am (user's local time).

**Report contents:**
```
Subject: Your LocalSEOBot report — week of [DATE]

[BUSINESS_NAME] | Week of [DATE]

THIS WEEK'S WORK
✓ 1 Google post published → [LINK]
✓ [X] new citations submitted ([TOTAL] total live)
✓ [X] reviews responded to
✓ Rankings checked for [N] keywords

RANKING HIGHLIGHTS
↑ "dentist Austin" — moved from #6 to #4
↑ "teeth whitening Austin" — entered top 10 for first time
→ "best dentist Austin" — holding at #3

REVIEW SUMMARY
New this week: [X] reviews | Average: [STARS]
[Latest 2 reviews shown with bot responses]

CITATION PROGRESS
[Progress bar: 67/200 directories live]
New this week: Yellow Pages, Yelp, Foursquare (3 submitted, awaiting verification)

COMPETITOR INTEL
[COMPETITOR] added 8 new reviews this week. Their average rating dropped to 4.1.

See full dashboard → [LINK]
```

---

## 6. Technical Architecture

### 6.1 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR + React, best SEO, great DX |
| Styling | Tailwind CSS + shadcn/ui | Fastest UI development |
| Language | TypeScript throughout | Type safety across full stack |
| Database | PostgreSQL via Supabase | Managed, auth built-in, real-time |
| ORM | Prisma | Type-safe queries, migrations |
| Background jobs | BullMQ + Redis (Upstash) | Reliable job queues for bot tasks |
| Auth | NextAuth.js v5 | Google OAuth + email/password |
| AI | Anthropic Claude API (claude-3-5-haiku) | Content generation (fast + cheap) |
| Email | Resend | Transactional email (reports, alerts) |
| SMS | Twilio | Review request SMS campaigns |
| Payments | Stripe | Subscriptions, trial management |
| Browser automation | Playwright (for citation form fills) | Headless form submission |
| Keyword tracking | DataForSEO API | Local SERP data |
| Image sourcing | Unsplash API | Free GBP post images |
| File storage | Cloudflare R2 | Cheap, fast S3-compatible |
| Hosting | Vercel (Next.js) + Railway (workers) | Vercel for web, Railway for long-running jobs |
| Monitoring | Sentry | Error tracking |
| Analytics | PostHog | Product analytics |

### 6.2 System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   NEXT.JS APP (Vercel)               │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐                │
│  │   Frontend   │  │   API Routes │                │
│  │  (React UI)  │  │  /api/...    │                │
│  └──────────────┘  └──────┬───────┘                │
│                           │                         │
└───────────────────────────┼─────────────────────────┘
                            │
                ┌───────────▼────────────┐
                │      PostgreSQL        │
                │      (Supabase)        │
                └───────────┬────────────┘
                            │
                ┌───────────▼────────────┐
                │    Redis (Upstash)     │
                │    Job Queue (BullMQ) │
                └───────────┬────────────┘
                            │
         ┌──────────────────▼──────────────────┐
         │          WORKER PROCESSES            │
         │            (Railway)                │
         │                                     │
         │  ┌──────────┐  ┌────────────────┐  │
         │  │ GBP Bot  │  │ Citation Bot   │  │
         │  │ (weekly) │  │ (daily)        │  │
         │  └──────────┘  └────────────────┘  │
         │                                     │
         │  ┌──────────┐  ┌────────────────┐  │
         │  │ Review   │  │ Ranking Bot    │  │
         │  │ Bot(30m) │  │ (weekly)       │  │
         │  └──────────┘  └────────────────┘  │
         │                                     │
         │  ┌──────────────────────────────┐  │
         │  │   Report Generator (Monday)  │  │
         │  └──────────────────────────────┘  │
         └──────────────────────────────────────┘
                            │
         ┌──────────────────▼──────────────────┐
         │         EXTERNAL APIS               │
         │                                     │
         │  Google Business Profile API        │
         │  DataForSEO API                     │
         │  Anthropic Claude API               │
         │  Twilio API                         │
         │  Resend API                         │
         │  Unsplash API                       │
         │  Stripe API                         │
         └─────────────────────────────────────┘
```

### 6.3 Background Job System

All bot work runs as BullMQ jobs on Railway workers. Jobs are:

| Job Name | Trigger | What it does |
|---|---|---|
| `gbp.post.generate` | Every Monday 6am | Generates GBP post content via Claude |
| `gbp.post.publish` | After generate (or after approval) | Posts to GBP via API |
| `gbp.photos.upload` | Monthly | Fetches royalty-free images, uploads to GBP |
| `citation.submit.batch` | Daily, 9am | Submits 5-10 new citations per business |
| `citation.verify.live` | Monthly | Re-checks live citations for NAP accuracy |
| `review.poll` | Every 30 minutes | Checks for new reviews |
| `review.respond` | Triggered by review.poll | Generates + posts (or queues) response |
| `ranking.check` | Every Monday 5am | Pulls DataForSEO rankings for all keywords |
| `competitor.monitor` | Weekly | Checks competitor GBP status |
| `report.generate` | Every Monday 7am | Compiles all week's data into report |
| `report.send` | Every Monday 8am | Sends report email via Resend |

**Job failure handling:**
- Failed jobs retry up to 3 times with exponential backoff
- After 3 failures: job flagged as `failed`, Sentry alert sent, ops team notified
- Failed GBP posts: attempt next day
- Failed review responses: attempt in 2 hours, escalate to manual queue at 8 hours

---

## 7. Database Schema

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  google_id VARCHAR(255),
  name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### businesses
```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  website_url VARCHAR(500),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  country VARCHAR(50) DEFAULT 'US',
  phone VARCHAR(30),
  category VARCHAR(100),   -- e.g. "dentist", "plumber", "restaurant"
  niche_tags TEXT[],       -- ["dental", "cosmetic dentistry", "teeth whitening"]
  timezone VARCHAR(50),
  gbp_location_id VARCHAR(255),   -- Google location ID
  gbp_account_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',  -- active, paused, cancelled
  plan VARCHAR(50) DEFAULT 'starter',
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### google_connections
```sql
CREATE TABLE google_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### bot_settings
```sql
CREATE TABLE bot_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  post_tone VARCHAR(50) DEFAULT 'professional',  -- professional, casual, friendly
  post_frequency VARCHAR(50) DEFAULT 'weekly',   -- weekly, biweekly
  post_approval_required BOOLEAN DEFAULT FALSE,
  review_approval_required BOOLEAN DEFAULT FALSE,
  review_auto_post_after_hours INTEGER DEFAULT 4,
  report_day VARCHAR(20) DEFAULT 'monday',
  report_time VARCHAR(10) DEFAULT '08:00',
  avoid_topics TEXT[],
  custom_instructions TEXT,
  review_request_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### gbp_posts
```sql
CREATE TABLE gbp_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  post_type VARCHAR(50),       -- STANDARD, OFFER, EVENT
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  cta_type VARCHAR(50),        -- CALL, LEARN_MORE, BOOK, ORDER, SIGN_UP
  cta_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'draft',  -- draft, pending_approval, published, failed
  gbp_post_id VARCHAR(255),    -- ID returned from Google API
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  approval_sent_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by VARCHAR(50),     -- 'user' or 'auto'
  week_of DATE,                -- which week this post is for
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### citation_directories
```sql
CREATE TABLE citation_directories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500),
  submission_type VARCHAR(50),  -- api, form, manual
  category VARCHAR(100),        -- general, medical, legal, restaurant, etc.
  priority INTEGER DEFAULT 2,   -- 1 = high priority, 2 = standard, 3 = niche
  domain_authority INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  api_endpoint VARCHAR(500),
  form_url VARCHAR(500)
);
```

### citations
```sql
CREATE TABLE citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  directory_id UUID REFERENCES citation_directories(id),
  status VARCHAR(50) DEFAULT 'pending',  -- pending, submitted, live, failed, rejected
  listing_url VARCHAR(500),
  submitted_at TIMESTAMPTZ,
  went_live_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,
  nap_match BOOLEAN,           -- does the live listing match current NAP?
  submission_method VARCHAR(50),  -- api, form, manual
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### reviews
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  google_review_id VARCHAR(255) UNIQUE,
  reviewer_name VARCHAR(255),
  reviewer_photo_url VARCHAR(500),
  star_rating INTEGER CHECK (star_rating BETWEEN 1 AND 5),
  review_text TEXT,
  review_date TIMESTAMPTZ,
  response_text TEXT,
  response_status VARCHAR(50) DEFAULT 'pending',  -- pending, draft, pending_approval, posted, failed
  response_generated_at TIMESTAMPTZ,
  response_posted_at TIMESTAMPTZ,
  approval_sent_at TIMESTAMPTZ,
  responded_by VARCHAR(50),    -- 'bot' or 'user'
  sentiment VARCHAR(20),       -- positive, neutral, negative
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### keywords
```sql
CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  is_auto_generated BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### keyword_rankings
```sql
CREATE TABLE keyword_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  maps_rank INTEGER,           -- position in Google Maps pack (null if not in top 20)
  organic_rank INTEGER,        -- position in organic results (null if not in top 20)
  search_volume INTEGER,
  competitor_above VARCHAR(255)  -- name of whoever is ranked above us
);
```

### competitors
```sql
CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255),
  gbp_location_id VARCHAR(255),
  website_url VARCHAR(500),
  address VARCHAR(500),
  is_manually_added BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### competitor_snapshots
```sql
CREATE TABLE competitor_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE,
  snapshot_date DATE,
  review_count INTEGER,
  avg_rating DECIMAL(3,2),
  post_count_this_week INTEGER,
  photo_count INTEGER
);
```

### weekly_reports
```sql
CREATE TABLE weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  week_of DATE,
  posts_published INTEGER DEFAULT 0,
  citations_submitted INTEGER DEFAULT 0,
  citations_live INTEGER DEFAULT 0,
  reviews_responded INTEGER DEFAULT 0,
  avg_rating_this_week DECIMAL(3,2),
  keywords_improved INTEGER DEFAULT 0,
  keywords_declined INTEGER DEFAULT 0,
  report_html TEXT,
  sent_at TIMESTAMPTZ,
  email_opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  plan VARCHAR(50) DEFAULT 'starter',
  status VARCHAR(50),          -- trialing, active, past_due, cancelled
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### audit_logs
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  job_type VARCHAR(100),
  status VARCHAR(50),          -- success, failed, skipped
  details JSONB,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. API Routes

### Authentication
```
POST /api/auth/signup              → Create account
POST /api/auth/signin              → Sign in (NextAuth)
GET  /api/auth/callback/google     → Google OAuth callback
POST /api/auth/signout             → Sign out
```

### Onboarding
```
POST /api/onboarding/business      → Save business info (steps 1-2)
GET  /api/onboarding/gbp/connect   → Start Google OAuth for GBP
GET  /api/onboarding/gbp/callback  → Handle OAuth callback, save tokens
POST /api/onboarding/audit/run     → Trigger instant audit job
GET  /api/onboarding/audit/result  → Poll for audit completion
POST /api/onboarding/complete      → Mark onboarding done, start bot
```

### Dashboard
```
GET  /api/dashboard/overview       → Metrics: citations live, reviews total, avg rank
GET  /api/dashboard/activity       → Recent activity feed (last 20 actions)
```

### Posts
```
GET  /api/posts                    → List all GBP posts (paginated)
GET  /api/posts/:id                → Single post detail
POST /api/posts/:id/approve        → Approve a pending post
PUT  /api/posts/:id                → Edit draft/pending post content
POST /api/posts/generate           → Manually trigger post generation
DELETE /api/posts/:id              → Delete a draft post
```

### Citations
```
GET  /api/citations                → List citations with status
GET  /api/citations/stats          → Counts by status
GET  /api/citations/directories    → All available directories
POST /api/citations/retry/:id      → Retry a failed citation
```

### Reviews
```
GET  /api/reviews                  → List reviews (paginated, filterable by star)
GET  /api/reviews/:id              → Single review + response
POST /api/reviews/:id/approve      → Approve pending response
PUT  /api/reviews/:id/response     → Edit and approve response
POST /api/reviews/request          → Trigger review request campaign
```

### Rankings
```
GET  /api/rankings                 → Current rankings for all keywords
GET  /api/rankings/history         → Historical rankings (for charts)
POST /api/rankings/keywords        → Add custom keyword
DELETE /api/rankings/keywords/:id  → Remove keyword
```

### Reports
```
GET  /api/reports                  → List all past reports
GET  /api/reports/:id              → Single report (HTML)
GET  /api/reports/latest           → Most recent report
```

### Settings
```
GET  /api/settings                 → All bot settings
PUT  /api/settings                 → Update settings
GET  /api/settings/business        → Business profile info
PUT  /api/settings/business        → Update business info
POST /api/settings/gbp/reconnect   → Re-connect Google account
POST /api/settings/bot/pause       → Pause the bot
POST /api/settings/bot/resume      → Resume the bot
```

### Billing
```
GET  /api/billing/portal           → Stripe billing portal redirect
POST /api/billing/webhook          → Stripe webhook handler
GET  /api/billing/subscription     → Current subscription info
```

### Webhooks (internal)
```
POST /api/webhooks/reviews/approve → Email approval link handler
POST /api/webhooks/posts/approve   → Email approval link handler
```

---

## 9. External API Integrations

### 9.1 Google Business Profile API

**OAuth Scopes needed:**
```
https://www.googleapis.com/auth/business.manage
```

**Key endpoints:**
```
GET  https://mybusinessaccountmanagement.googleapis.com/v1/accounts
GET  https://mybusiness.googleapis.com/v4/{account}/locations
POST https://mybusiness.googleapis.com/v4/{account}/{location}/localPosts
GET  https://mybusiness.googleapis.com/v4/{account}/{location}/reviews
POST https://mybusiness.googleapis.com/v4/{account}/{location}/reviews/{review}/reply
PATCH https://mybusiness.googleapis.com/v4/{account}/{location}
```

**Token refresh:** Refresh token stored encrypted in `google_connections`. Refresh when `token_expires_at` is < 5 minutes away.

**Rate limits:** 
- 10 QPS per user for GBP API
- Implement exponential backoff on 429 responses

---

### 9.2 DataForSEO API (Keyword Rankings)

**Endpoint:** `POST https://api.dataforseo.com/v3/serp/google/maps/live/regular`

**Request body:**
```json
{
  "keyword": "dentist Austin",
  "location_code": 1023191,
  "language_code": "en",
  "device": "desktop",
  "os": "windows"
}
```

**Response parsing:**
- Find our business in `items` array by matching `title` or `place_id`
- Extract `rank_group` (position in maps pack)
- If not found in top 20: rank = null

**Cost:** ~$0.003 per keyword check. 20 keywords × weekly = $0.06/business/week = $0.24/month/business. Well within budget at $99/month pricing.

---

### 9.3 Anthropic Claude API

**Model:** `claude-haiku-4-5` (fast, cheap — ideal for bulk content generation)

**Use cases:**
- GBP post generation (~500 tokens per post)
- Review response generation (~300 tokens per response)
- Post audit and quality check
- Weekly report narrative summary

**Cost estimate:**
- 4 GBP posts/month × 500 tokens = 2,000 tokens input + 400 tokens output = ~$0.001/business/month
- 20 review responses/month × 300 tokens = ~$0.001/business/month
- Total Claude cost: ~$0.002/business/month. Negligible.

**API call pattern:**
```typescript
const response = await anthropic.messages.create({
  model: "claude-haiku-4-5-20251001",
  max_tokens: 500,
  messages: [{ role: "user", content: prompt }]
});
const content = response.content[0].type === 'text' ? response.content[0].text : '';
```

---

### 9.4 Stripe (Billing)

**Products/Prices:**
```
Product: LocalSEOBot Starter
Price: $99/month (recurring)
Trial: 14 days

Product: LocalSEOBot Growth  
Price: $199/month (recurring)
Trial: 14 days
```

**Webhook events to handle:**
- `customer.subscription.created` → activate business
- `customer.subscription.updated` → update plan
- `customer.subscription.deleted` → pause bot, send cancellation email
- `invoice.payment_failed` → send dunning email, pause after 3 failures
- `customer.subscription.trial_will_end` → send trial ending reminder (3 days before)

---

### 9.5 Resend (Email)

**Transactional emails:**

| Email | Trigger | Template |
|---|---|---|
| Welcome | After signup | welcome.html |
| GBP Connected | After OAuth | gbp_connected.html |
| Onboarding Complete | After step 7 | onboarding_complete.html |
| Post Approval Request | If approval ON | post_approval.html |
| Review Response Approval | If approval ON | review_approval.html |
| Monday Report | Every Monday 8am | weekly_report.html |
| Trial Ending | 3 days before trial ends | trial_ending.html |
| Trial Ended | Day trial expires | trial_ended.html |
| Payment Failed | On failed payment | payment_failed.html |

---

## 10. UI/UX Specifications

### 10.1 Page Routes

```
/ (marketing site)
/pricing
/login
/signup
/onboarding             → Wizard (steps 1-7)
/dashboard              → Overview
/dashboard/posts        → GBP Posts
/dashboard/citations    → Citation tracker
/dashboard/reviews      → Reviews + responses
/dashboard/rankings     → Keyword rankings
/dashboard/reports      → Past reports
/dashboard/settings     → All settings
/dashboard/settings/business   → Business info
/dashboard/settings/bot        → Bot preferences
/dashboard/settings/billing    → Billing
```

### 10.2 Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│  [LocalSEOBot logo]    [Business name ▼]  [Avatar] │  ← Top nav
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ Overview │         Main content area               │
│ Posts    │                                          │
│ Citations│                                          │
│ Reviews  │                                          │
│ Rankings │                                          │
│ Reports  │                                          │
│          │                                          │
│ Settings │                                          │
│ Billing  │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

### 10.3 Dashboard Overview Page

**Metric cards row (top):**
- Citations live (e.g., "67 / 200")
- Total reviews (e.g., "142 reviews | 4.6 avg")
- Average keyword rank (e.g., "#4.2 avg")
- Bot status (e.g., "Active — running since 34 days")

**Activity feed (main):**
Chronological list of every bot action:
```
✓ [Today 9:02am]  Review responded to — Sarah M. (5 stars)
✓ [Today 6:00am]  Weekly report sent to your email
✓ [Monday 6:30am] GBP post published — "Spring dental checkup season..."
✓ [Sunday 3:00am] Citation submitted — Foursquare
✓ [Saturday 11am] Review responded to — James T. (3 stars)
```

**Next action preview:**
"Next GBP post: Tuesday. Preview → [DRAFT TEXT] | Approve now | Edit"

### 10.4 Key UI States

**Bot status states:**
- `running` — green dot, "Running"
- `paused` — yellow dot, "Paused"
- `needs_attention` — red dot, "Action required" (e.g., Google token expired)
- `trial` — blue dot, "Trial — X days left"

**Citation card states:**
- Pending (gray)
- Submitted (blue, animated spinner)
- Live (green checkmark)
- Failed (red, retry button)
- Needs manual (orange, "Our team is handling this")

**Review response states:**
- Pending generation (spinner)
- Pending approval (yellow, approve/edit buttons)
- Posted (green, show response text)
- Failed (red, retry button)

---

## 11. Business Logic Details

### 11.1 Onboarding Audit Logic

When user completes step 3 (connects GBP), bot immediately runs:

1. Fetch current GBP profile completeness score
   - Does it have: photos, hours, description, website, services?
   - Score = (fields filled / total fields) × 100
2. Count existing reviews and average rating
3. Run a Google Maps search for "[category] [city]" — what rank do they appear at?
4. Check top 5 competitors and their review counts/ratings
5. Check if business appears in top 10 citation directories

Show results as: "We found X issues with your Google presence" with specific list.

### 11.2 GBP Post Topic Rotation

Posts rotate through these topics over 8 weeks, then repeat:
1. Weekly tip (relevant to their niche)
2. Service spotlight (highlight one specific service)
3. Customer success/testimonial (fictional but plausible until they provide real ones)
4. Seasonal / timely update
5. About the team / owner story
6. FAQ (answer a common customer question)
7. Promotion / offer
8. Community / local connection

### 11.3 Citation Submission Rate Limiting

- Submit max 10 new citations per business per day
- Stagger submissions: not all at once (looks unnatural to Google)
- Priority order: highest domain authority first
- Never submit the same directory twice
- If submission fails 3 times: move to manual queue

### 11.4 Keyword Auto-Generation

At onboarding, generate keywords using:
```typescript
const baseKeywords = [
  `${category} ${city}`,
  `${category} near me`,
  `best ${category} ${city}`,
  `${category} in ${city}`,
  `${category} ${city} ${state}`,
];

const serviceKeywords = services.map(s => `${s} ${city}`);

const emergencyKeyword = isEmergencyCategory(category) 
  ? [`emergency ${category} ${city}`, `24 hour ${category} ${city}`]
  : [];

const nearbyKeywords = nearbyAreas.map(a => `${category} ${a}`);
```

---

## 12. Security & Compliance

### Token Security
- Google OAuth tokens encrypted at rest using AES-256 (libsodium)
- Tokens never exposed in API responses
- Refresh tokens stored separately from access tokens
- Token rotation logged in audit_logs

### Data Isolation
- Every database query includes `business_id` filter tied to authenticated user
- Row-level security (RLS) enabled in Supabase
- Users can only access their own business data

### PII Handling
- Reviewer names from Google Reviews are public — stored as-is
- Customer phone numbers for SMS campaigns: stored encrypted, deleted on cancellation
- GDPR: user can request data export or deletion from Settings → Account

### Rate Limit Protection
- All bot jobs check Google API rate limits before executing
- Implements circuit breaker: if Google returns 503 × 5 in a row, pause all jobs for 1 hour
- API keys stored in environment variables, never in code

---

## 13. Key Metrics to Track

### Product Health
- % of businesses with active Google connection (should be > 95%)
- GBP post success rate (should be > 98%)
- Review response time (target: < 2 hours from review)
- Citation submission success rate (target: > 90%)
- Monday report delivery rate (should be 100%)

### Business Metrics
- MRR, churn rate, trial-to-paid conversion
- Time to first value (when does user see first bot action?)
- DAU/WAU (how often users log in to dashboard)
- Support tickets per customer (health indicator)

### Bot Performance
- Avg keyword rank improvement at 30/60/90 days
- Avg review response rate improvement
- Citations live at 30/60/90 days

---

## 14. Development Phases

### Phase 1 — MVP (4-6 weeks) — Ship this first
- [ ] Auth (signup, signin, Google OAuth)
- [ ] Onboarding flow (all 7 steps)
- [ ] GBP post generation + publishing (weekly)
- [ ] Review polling + response generation + posting
- [ ] Basic dashboard (activity feed, metrics)
- [ ] Monday email report (basic version)
- [ ] Stripe billing (trial + subscription)
- [ ] 50 top citation directories (API + form)

### Phase 2 — Core Completion (2-3 weeks)
- [ ] Full 200 citation directory coverage
- [ ] Keyword tracking (DataForSEO integration)
- [ ] Competitor monitoring
- [ ] Approval workflows (posts + reviews)
- [ ] Full dashboard (posts, citations, reviews, rankings pages)

### Phase 3 — Polish (1-2 weeks)
- [ ] PDF reports
- [ ] Review request campaigns
- [ ] GBP photo management
- [ ] Niche-specific citation directories
- [ ] Better onboarding audit UI
- [ ] Admin panel (internal ops view)

---

## 15. Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...  # Supabase direct connection

# Auth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://localseobot.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Google Business Profile API
GOOGLE_GBP_CLIENT_ID=...
GOOGLE_GBP_CLIENT_SECRET=...

# AI
ANTHROPIC_API_KEY=...

# Data
DATAFORSEO_LOGIN=...
DATAFORSEO_PASSWORD=...

# Email
RESEND_API_KEY=...
RESEND_FROM_EMAIL=bot@localseobot.com

# SMS
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# Payments
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_STARTER_PRICE_ID=...

# Jobs
UPSTASH_REDIS_URL=...
UPSTASH_REDIS_TOKEN=...

# Images
UNSPLASH_ACCESS_KEY=...

# Storage
CLOUDFLARE_R2_ENDPOINT=...
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_BUCKET=...

# Monitoring
SENTRY_DSN=...
POSTHOG_KEY=...
```

---

## 16. Starter Prompt for Claude Code

When handing this to an AI coding assistant, use this as the context block:

```
We are building LocalSEOBot — a $99/month SaaS that fully automates local SEO 
for small businesses. 

Tech stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, 
PostgreSQL (Supabase), Prisma ORM, BullMQ + Redis (Upstash), NextAuth.js v5, 
Anthropic Claude API (claude-haiku), Resend, Twilio, Stripe, DataForSEO API, 
Google Business Profile API.

The product does 5 things automatically:
1. Publishes 1 GBP post per week (written by Claude AI, posted via Google API)
2. Submits the business to 200+ citation directories (Yelp, YellowPages, etc.)
3. Responds to Google reviews within 2 hours (written by Claude AI)
4. Tracks local keyword rankings weekly (via DataForSEO)
5. Sends a Monday morning email report summarizing all activity

The user connects their Google Business Profile once at onboarding. After that, 
the bot runs everything in the background. No manual work required from the user.

Refer to the full product design document at LocalSEOBot_Product_Design.md for 
complete database schema, API routes, job specifications, and business logic.

Always follow the existing patterns in the codebase. Use TypeScript strictly. 
All background jobs go in /workers. All API routes go in /app/api. 
Database models are in /prisma/schema.prisma.
```

---

*LocalSEOBot Product Design Document v1.0 — June 2026*
*All specs subject to change during development. Ship MVP fast, iterate based on user feedback.*

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
