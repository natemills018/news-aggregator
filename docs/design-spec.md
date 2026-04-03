# Design Spec: The CLE Brief

## 1. Product Overview

The CLE Brief is a weekly email digest that curates the best events and things to do in Cleveland, OH for locals aged 25-45. The core value proposition is curation and brevity: a 2-minute scan tells you what's worth your time this week. The newsletter is the product; the web app exists to support it (subscribe, browse past digests, eventually personalize). No account system for MVP — just an email address.

## 2. User Flows

### Subscribe
1. User lands on home page (via word of mouth, social, search)
2. Reads the value prop and sees a preview of the latest digest
3. Enters email (name optional) and submits
4. Receives confirmation email with verification link
5. Clicks link, lands on a "You're in" confirmation page
6. Receives first digest the following week

### Receive Digest
1. Email arrives weekly (target: Wednesday morning, so people can plan the weekend)
2. User scans the email in ~2 minutes
3. Taps through to events that interest them (links to source/tickets)
4. Optional: taps "View in browser" link at top of email

### Browse Web
1. User visits site directly or via "View in browser" link
2. Can browse the current digest or past digests in the archive
3. Can subscribe if not already signed up
4. Can search events on the home page

### Unsubscribe
1. User clicks "Unsubscribe" link in email footer
2. Lands on confirmation page: "You've been unsubscribed"
3. Option to re-subscribe with one click
4. No guilt trips, no "are you sure?" dark patterns

## 3. Newsletter Design

The email must render well in all major email clients (Gmail, Apple Mail, Outlook). HTML email with inline styles. Single-column layout, max-width 600px.

### Layout Structure

```
┌─────────────────────────────────────┐
│  HEADER                             │
│  Logo / "The CLE Brief"            │
│  Tagline: "Your week in Cleveland" │
│  Date: "Week of April 6, 2026"     │
├─────────────────────────────────────┤
│  INTRO                              │
│  1-2 sentence editorial opener.     │
│  Casual, sets the tone.             │
│  e.g. "Spring finally showed up.   │
│  Here's how to take advantage."     │
├─────────────────────────────────────┤
│  FEATURED EVENT                     │
│  Larger card with image (optional). │
│  The top pick of the week.          │
│  Full event card + extended         │
│  "why care" (2-3 sentences).        │
├─────────────────────────────────────┤
│  THIS WEEK (5-8 events)             │
│  Compact event cards, stacked.      │
│  Each: What / When / Where /        │
│  Why care / Link                    │
├─────────────────────────────────────┤
│  ALSO ON OUR RADAR (2-3 items)      │
│  One-liner mentions. Lower-tier     │
│  but still worth knowing about.     │
├─────────────────────────────────────┤
│  FOOTER                             │
│  - "Share with a friend" link       │
│  - View in browser link             │
│  - Unsubscribe link                 │
│  - "Made in Cleveland"              │
└─────────────────────────────────────┘
```

### Section Details

| Section | Content | Tone |
|---------|---------|------|
| Header | Brand, date, tagline | Clean, minimal |
| Intro | 1-2 sentences, editorial | Conversational, sets the mood for the week |
| Featured Event | Full event card with image and extended blurb | Enthusiastic but not hyperbolic |
| This Week | 5-8 event cards, compact | Punchy, scannable |
| Also On Our Radar | 2-3 one-liners (name + when + one-line reason) | Quick hits |
| Footer | Utility links, no clutter | Straightforward |

### Design Constraints
- No background images (poor email client support)
- System fonts with web-safe fallbacks (`-apple-system, Arial, sans-serif`)
- Minimum touch target 44x44px for mobile links
- Total event count per email: 8-12 (featured + this week + radar)
- Target reading time: under 2 minutes

## 4. Web App Pages

### Home / Landing Page

| Element | Details |
|---------|---------|
| Hero | Headline ("Cleveland, curated."), subhead explaining the product in one sentence, subscribe form |
| Social proof | Subscriber count when meaningful (e.g., "Join 500+ Clevelanders") |
| Latest digest preview | Rendered version of the most recent newsletter, truncated with "Read full digest" link |
| Subscribe CTA (repeated) | Bottom of page, same form as hero |

### Digest Archive (`/digests`)

- Reverse-chronological list of past digests
- Each entry shows: date, intro snippet, event count
- Click through to single digest view
- Simple, no pagination needed for MVP (weekly cadence = ~52/year)

### Single Digest View (`/digests/:id`)

- Full newsletter rendered as a web page
- Same structure as the email: intro, featured event, this week, radar
- Subscribe CTA at bottom for non-subscribers
- Share button (copy link)
- Previous/Next digest navigation

### About (`/about`)

- What The CLE Brief is (one paragraph)
- Who's behind it (brief, human, not corporate)
- Why it exists (the problem it solves)
- Link to subscribe

### Pages NOT in MVP

- No user accounts / login
- No settings / preferences page
- No event detail pages beyond linking to source URLs
- No venue directory (the existing `/venues` page can stay but is not a priority)

## 5. Event Card Spec

The event card is the atomic unit of content, used in both the newsletter and the web app.

### Fields

| Field | Required | Format | Example |
|-------|----------|--------|---------|
| What | Yes | Event name, plain text | "Guardians Home Opener" |
| When | Yes | Relative/casual date string | "This Saturday, 7 PM" |
| Where | Yes | Venue name, linked to Google Maps | "Progressive Field" |
| Why care | Yes | One sentence, max ~120 chars | "First home game of the season. The atmosphere is unbeatable." |
| Category | Yes | Tag/label | "Sports" |
| Link | Yes | URL to event source (tickets, info) | eventbrite.com/... |
| Image | No | URL, landscape aspect ratio ~16:9 | (used in featured card and web only) |

### Newsletter Rendering

```
CATEGORY · When
Event Name
Where (linked to map)
Why care sentence.
→ More info (linked)
```

- No images in standard cards (keeps email light and fast)
- Featured event card includes image and extended why-care (2-3 sentences)
- Divider line between cards

### Web Rendering

- Card component with optional image at top
- Category badge (colored tag)
- Date, title, venue, description visible without interaction
- Click-through links to source URL (opens in new tab, `rel="noopener noreferrer"`)
- Use casual/relative date formatting ("This Saturday" not "Apr 04, 2026")
- "Why care" field should be short and punchy
- Display category as a colored badge

## 6. Personalization (Future)

Not in MVP. Documenting for future reference.

| Feature | Description | Complexity |
|---------|-------------|------------|
| Category preferences | Subscriber picks interests (music, food, sports, family, etc.) and gets a weighted digest | Medium |
| Neighborhood | Filter by east side / west side / downtown / suburbs | Medium |
| Frequency | Option for daily quick-hit vs. weekly digest | High |
| "Save for later" | Bookmark events to a personal list (requires accounts) | High |
| Smart ranking | Events ranked by predicted relevance based on past clicks | High |

Implementation path: Start with category preferences as the first personalization feature. It requires a simple preferences form (checkboxes), a `subscriber_preferences` table, and conditional filtering in the digest generator. No account system needed — preferences can be tied to the subscriber email with a magic-link edit flow.

## 7. Tone & Voice

### Who we sound like

A friend who lives in Cleveland and actually goes to stuff. Not a marketing department, not a news desk, not a tourism board. Someone who texts you "hey, this thing is happening Saturday and it's actually good."

### Guidelines

| Do | Don't |
|----|-------|
| Be brief. One good sentence beats three okay ones. | Write marketing copy ("Don't miss this AMAZING event!") |
| Use casual time references ("This Saturday," "Friday night") | Use formal timestamps ("April 4, 2026 at 19:00 EST") |
| Have a point of view. Say why something is worth going to. | List events without commentary |
| Be occasionally funny when it's natural | Force humor or use puns in every card |
| Write like you talk | Use jargon, buzzwords, or filler ("exciting," "unique," "world-class") |
| Admit when something is niche ("If you're into jazz, this is the one") | Pretend everything is for everyone |

### Example Event Cards

**Good:**
> **Cleveland Museum of Art: Picasso & Paper**
> Through May 10 · University Circle
> The CMA is always free, and this exhibit is genuinely worth rearranging your Saturday for. Largest collection of Picasso works on paper ever shown in the US.
> [Check it out →]

**Bad:**
> **DON'T MISS: An EXCITING exhibition at the world-renowned Cleveland Museum of Art featuring the AMAZING works of Pablo Picasso! This unique and incredible event is one you won't want to miss!**

### Voice Attributes

- **Confident, not aggressive.** We make picks and stand behind them.
- **Local, not parochial.** Love for Cleveland without being defensive about it.
- **Helpful, not preachy.** Here's what's happening. Do what you want with it.
- **Brief, not lazy.** Short because we respect your time, not because we didn't try.
