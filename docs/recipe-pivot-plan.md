# Recipe Pivot Plan

## Summary

The CLE Brief is pivoting from a Cleveland-events newsletter to a **weekly food/recipe newsletter**. The brand name stays the same. The newsletter mechanic stays the same — curated weekly digest, free, no spam. Only the content domain changes: instead of local events, each issue features a regionally-themed selection of American recipes pulled from a third-party recipe API, curated down to a handful of favorites, and sent as teasers that link out to the original sources.

## Why this pivot

The newsletter-first distribution strategy still applies — we want to test marketing and audience fit before investing in a full platform. Recipes are a more universal hook than Cleveland-only events, and the curation lens (a regional theme each week) gives the newsletter editorial personality without requiring local sourcing.

## Editorial concept

- **Brand:** "The CLE Brief" (unchanged)
- **Cadence:** weekly
- **Content:** ~5-6 recipes per issue, themed by US region (Southern, Northeast, Midwest, Southwest, West Coast, Pacific Northwest, etc.)
- **Format:** teaser blurb + photo + "Get the recipe →" link to source. **No full recipe text inline** — this respects API ToS and the original creators' attribution.
- **Voice:** same warm, opinionated editor's note from the existing redesign
- **Curation:** admin fetches ~10 recipe candidates from the chosen API, picks 5-6, sets one as the hero ("The Standout"), writes tagline + editor's note, sends.

## Source API

To be finalized in #13. Default candidate is **Spoonacular** (largest catalog, complete data, free tier ~150 reqs/day, allows teaser+link usage with attribution). Alternatives evaluated: Edamam Recipe Search, TheMealDB, Tasty (RapidAPI). Chosen API must satisfy:

1. Free tier supports ~10 fetches per week with cuisine/region filtering
2. ToS allows teaser-with-source-link usage
3. Image URLs are stable and high-enough quality for hero blocks
4. Some way to filter or tag by US regional cuisine

## Kept vs. Changed vs. Deleted

### Kept (no changes)
| Component | Reason |
|---|---|
| `Subscriber` model + `/subscribers` endpoints | Subscription mechanics are unchanged |
| Email send pipeline (`services/email.py`) | Transport is content-agnostic |
| `Digest` model + `/digests` endpoints | Archive concept transfers as-is |
| Design system (Tailwind tokens, navy/coral, DM Sans + Inter) | Brand stays; only domain shifts |
| Subscribe form, navigation shell, About page scaffolding | Brand-level UI |
| Admin job-polling pattern (background fetch with progress animation) | Reused for recipe fetches |

### Changed (renamed or rewritten)
| Component | Change |
|---|---|
| `Event` model → `Recipe` model | New fields (cuisine, region, source attribution, prep/cook time, difficulty); drops venue/start_date/vibe |
| `/events` router → `/recipes` router | Endpoint rename + schema swap |
| `EventCard` component → `RecipeCard` component | Recipe-shaped card (image, title, cuisine badge, source link) |
| `EventDetail` view | Likely deleted — recipes link to source; we don't host detail pages |
| `services/newsletter.py` digest builder | Rewritten for recipe layout (hero recipe, 2-col grid, attribution footer). Vibe-based grouping deleted. |
| Admin UI tabs | Same draft/approved structure; content swapped to recipes; region picker replaces vibe categories |
| `services/ticketmaster.py` | Deleted entirely |
| `FetchJob` | Reused for recipe ingestion (same polling pattern) |
| Home page copy | Recipe-centric hero copy, same layout pattern |

### Deleted
| Component | Reason |
|---|---|
| `services/ticketmaster.py` | No event ingestion needed |
| Vibe-grouping helpers (`_group_events_by_vibe`, vibe map) | Recipe digests use regional theme as the grouping lens, not multi-section vibes |
| Sleeper Pick concept | Not transferring — the regional theme already provides the editorial hook. Could be revisited later as a "Wildcard" recipe outside the theme. |
| `Venue` model + `/venues` router | Recipes have no venue concept |
| `Category` model + `/categories` router | Replaced by cuisine/region tags directly on Recipe |
| `EventDetail` view | We link out to original sources |
| `Venues` view | No venue directory |
| Event-specific admin sections (manual event creation, vibe-based curation) | Replaced by recipe equivalents |

### Unresolved (decide during build)
- **Featured flag:** keep `is_featured` on Recipe (one hero per digest), or rename to `is_standout` to match the new editorial term? Mild preference: rename for consistency with newsletter copy.
- **`Digest` model schema:** existing fields probably transfer, but verify nothing references `Event` directly.
- **Pre-launch data:** dropping the events table is fine since we're pre-launch with no real subscribers expecting events. Confirm before #14 migration runs.

## Workflow

The recipe newsletter follows the same flow as the events curation:

```
admin picks region          → POST /admin/fetch-recipes { region, count: 10 }
       ↓
background job fetches      → Spoonacular API call, normalize, insert as drafts
       ↓
admin reviews drafts        → /admin Drafts tab, thumbnails, approve/skip each
       ↓
admin sets hero + writes    → mark one as Standout, set tagline + editor's note
copy
       ↓
admin previews + sends      → /newsletter/preview → /newsletter/send
       ↓
subscribers receive digest  → email with teasers linking to source recipes
```

## Implementation order

Tracked as tickets #11-#19. Critical path:

1. **#11** — this doc (scoping)
2. **#13** — pick the API (parallel-able with #12)
3. **#12** — tear out Ticketmaster
4. **#14** — Recipe model + migration
5. **#15** — Recipe ingestion service
6. **#16** — Admin curation UI for recipes
7. **#17** — Newsletter template redesign (parallel with #16)
8. **#18** — Frontend rebrand (parallel with #16/#17)
9. **#19** — End-to-end test + first send

## Out of scope (this pivot)

- User accounts, login, personalized recipe preferences
- Storing full recipe text (we link out only)
- Multiple regions per issue (one theme per week)
- Recipe rating/review by subscribers
- Recipe collections or saved-recipes feature
- Multi-API fallback (start with one, swap later if needed)
- Migrating any existing events data (clean break — drop and recreate)
