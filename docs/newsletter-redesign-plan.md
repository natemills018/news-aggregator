# Newsletter Redesign Plan: The Zine + Mixtape Hybrid

## Problem

The current newsletter is functional but flat — a stacked list of event cards that reads like a bulletin board. For a product where the newsletter *is* the selling point, it needs to feel like something people look forward to opening. It should have visual rhythm, editorial personality, and vibe-based curation that feels like a friend sorting your weekend.

## Design Direction

**"The Zine meets The Mixtape"** — an editorial magazine layout with vibe-based sections.

Instead of a priority-based stack (featured → this week → radar), the newsletter alternates visual treatments and groups events by vibe. Each section has its own personality. The result feels curated and intentional, not algorithmic.

## Structure: Top to Bottom

### 1. Header (keep, refine)
- "THE CLE BRIEF" with "Week of April 13" dateline
- Swap the generic "Your week in Cleveland" for a rotating editorial tagline
  - e.g., "Patio season is here and we're not mad about it"
  - Set per-digest in admin (falls back to default if empty)

### 2. Editor's Note (new)
- 2-3 sentence intro in a casual, first-person voice
- Light warm background block (`#FDF8F3`) to set it apart
- This is where the personality lives — opinionated, brief, human
- e.g., "Spring finally showed up. Here's what to do before it changes its mind."

### 3. The Big One (featured event — redesigned)
- Full-width hero image with rounded corners
- Overlay gradient at bottom (transparent → navy) with white text
- Event title large and bold over the image
- Below image: category badge, casual date, venue, why-care line
- Prominent "Get tickets →" / "Check it out →" CTA button (coral background, white text, rounded)
- Feels like a magazine cover story, not a list item

### 4. Vibe Sections (replaces "This Week" flat list)

Events grouped into 2-3 themed sections based on category mapping. Each section gets:
- A vibe header with small icon/emoji and accent color left-border
- 2-3 events per section in a compact card format

**Vibe mapping** (category → vibe):

| Vibe | Categories | Emoji | Accent Color |
|------|-----------|-------|-------------|
| Going Out | music, nightlife, festivals | `🎵` | `#5B5EE6` (indigo) |
| Culture Fix | arts & culture | `🎨` | `#8B5CC2` (purple) |
| Get Outside | outdoors, sports | `☀️` | `#1A9E8F` (teal) |
| Good Eats | food & drink | `🍽️` | `#B07A00` (amber) |
| Family Friendly | family | `👨‍👩‍👧` | `#2D8A56` (green) |

Section only appears if there are events for it. If a vibe has only 1 event, it merges into the closest related vibe or into a "More This Week" catch-all.

**Card format within sections:**
- Two-column layout on desktop (single column on mobile)
- Each card: category badge, title (bold), casual date + venue on one line, why-care text
- Subtle left border using the vibe's accent color
- "More info →" link in coral

### 5. Sleeper Pick (new — editorial callout)
- A single event that's the editor's underrated/unexpected recommendation
- Visually distinct: pulled out into a quote-style block
- Light coral background (`#FFF0ED`), left border in coral
- Heading: "Sleeper Pick" in small caps
- Short opinionated note: "You probably haven't heard of this one, but..."
- This is the most personality-forward part of the email

### 6. Quick Hits (replaces "Also On Our Radar")
- Renamed to "Quick Hits" — punchier
- 3-4 events in a minimal bullet format
- Each line: event name (bold) + casual date + arrow link
- No descriptions — just enough to click if interested
- Light gray background block to visually separate from sections above

### 7. Footer (keep, enhance)
- "Made in Cleveland" with heart or bridge icon
- Unsubscribe + Share links (keep existing)
- Add: "Know someone who'd dig this? Forward it."
- Add: subtle social links if/when applicable

## Visual Design Tokens (email-safe)

```
Background:        #F5F3F0 (warm off-white, keep)
Content bg:        #FFFFFF (white)
Navy (text/header): #1B2A4A
Coral (CTA/accent): #E85D4A
Muted text:        #5A6578
Dividers:          #E8E4DF
Editor's note bg:  #FDF8F3 (warm cream)
Sleeper pick bg:   #FFF0ED (light coral)
Quick hits bg:     #F5F3F0 (matches body)

Fonts:
  Headings: 'DM Sans', Helvetica, Arial, sans-serif
  Body:     Inter, -apple-system, 'Segoe UI', sans-serif

CTA Button:
  Background: #E85D4A
  Text: #FFFFFF
  Padding: 12px 24px
  Border-radius: 6px
  Font-weight: 600
```

## Data Model Changes

### Event model — no changes needed
Existing fields cover everything: `title`, `short_description`, `description`, `image_url`, `source_url`, `start_date`, `category`, `venue`, `is_featured`.

### New: `sleeper_pick` flag on Event
- Boolean, default false
- Only one per digest cycle (like `is_featured`)
- Admin sets this when curating

### Newsletter service changes
- `build_digest_html()` rewritten with new section structure
- New helper: `_group_events_by_vibe()` — maps categories to vibes, returns dict
- New helper: `_build_vibe_section_html()` — renders a vibe group
- New helper: `_build_sleeper_pick_html()` — renders the editorial callout
- New helper: `_build_big_one_html()` — replaces `_build_featured_html()` with hero image overlay style
- New helper: `_build_quick_hits_html()` — replaces `_build_radar_item_html()`
- Update `_wrap_email()` — add dateline to header, editorial tagline support
- Update `build_digest_plain()` — match new structure

### Admin UI changes
- Add `sleeper_pick` toggle to event curation (alongside `is_featured`)
- Add `intro_tagline` field to digest send form (the editorial header tagline)
- Add `editors_note` field to digest send form (the 2-3 sentence intro)
- Digest preview should reflect new template in real-time

## Implementation Steps

### Step 1: Database + Model
- Add `is_sleeper_pick` boolean to Event model
- Create Alembic migration
- Update Pydantic schemas to include the field
- Update admin API to support setting it

### Step 2: Vibe Grouping Logic
- Create `_group_events_by_vibe()` in newsletter.py
- Define VIBE_MAP constant (category name → vibe name + emoji + color)
- Handle edge cases: uncategorized events, single-event vibes merging
- Unit test the grouping logic

### Step 3: Rebuild Email Template — Section by Section
Work through the template top-to-bottom, testing each section in the admin preview:

1. **Header** — add dateline, editorial tagline parameter
2. **Editor's Note** — warm background block with intro text
3. **The Big One** — hero image with gradient overlay, CTA button
4. **Vibe Sections** — grouped cards with accent borders, 2-col layout
5. **Sleeper Pick** — editorial callout block
6. **Quick Hits** — minimal bullet list on gray background
7. **Footer** — add forward prompt

### Step 4: Update Plain Text Version
- Match new structure: editor's note, big one, vibe sections, sleeper pick, quick hits
- Keep it scannable and well-formatted

### Step 5: Admin UI Updates
- Add sleeper pick toggle to event curation
- Add tagline + editor's note fields to digest send
- Ensure preview iframe renders the new template accurately

### Step 6: Test + Polish
- Test in Gmail, Apple Mail, Outlook (web + desktop)
- Test mobile rendering (single column collapse, image scaling)
- Test with 0 events, 1 event, 3 events, 10+ events
- Test with/without images, with/without sleeper pick
- Verify plain text version

## Email Client Constraints

All design must respect email rendering limitations:
- **Table-based layout** — no flexbox, no grid, no CSS variables
- **Inline styles only** — no `<style>` blocks (Gmail strips them in some contexts)
- **No background images on table cells** — use `<img>` tags, VML for Outlook
- **Two-column layout** via nested tables with `align="left"` and fixed widths
- **Mobile**: use `max-width:100%` on images, let tables stack naturally at narrow widths
- **Image overlay text**: Use the image above the text rather than true overlay (email clients don't support `position: absolute`). Use a dark bottom area of the image or a color block beneath it.
- **Font stack fallbacks**: Always include web-safe fallbacks

## Out of Scope (this iteration)

- A/B testing different layouts
- Per-subscriber personalization of vibe sections
- Dynamic content based on subscriber preferences
- Animated elements or interactive email features
- Dark mode optimization (future polish)
