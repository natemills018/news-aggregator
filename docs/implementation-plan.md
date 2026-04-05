# Implementation Plan: The CLE Brief MVP

## Overview

The codebase already has functional event browsing, filtering, newsletter digest generation, and subscriber management. This plan focuses on reshaping the existing app to match the design spec and design system — rebranding to "The CLE Brief," applying the new visual identity, restructuring the web app around the newsletter-first strategy, and polishing the newsletter email template.

## What Exists vs. What Changes

| Area | Current State | Target State |
|------|--------------|--------------|
| Branding | "CLE Local" generic styling | The CLE Brief identity, DM Sans + Inter, navy/coral palette |
| Home page | Event browsing grid | Newsletter-first landing page (hero, signup, latest digest preview) |
| Newsletter email | Basic HTML template | Designed template matching design spec (featured event, this week, on our radar) |
| Web pages | Home, Venues, EventDetail, Admin | Home/Landing, Digest Archive, Single Digest, About |
| Event cards | Functional but generic | Redesigned per design system (category badges, casual dates, "why care" field) |
| Navigation | Basic header | Minimal sticky nav with subscribe CTA |
| Signup form | Exists, basic | Redesigned inline form with "Free. Weekly. No spam." |
| Admin | Basic admin page | Keep as-is (internal tool, not user-facing) |
| Backend API | Functional CRUD + newsletter | Add digest archive endpoints, minor schema updates |

## Implementation Order

Work is sequenced so each ticket builds on the previous, with the newsletter-first strategy driving priority.

### Phase 1: Foundation (design system + branding)
1. Apply design system to Tailwind config (colors, fonts, spacing)
2. Update global styles, layout shell, and navigation

### Phase 2: Core Pages (newsletter-first web experience)
3. Rebuild Home as a newsletter landing page
4. Build Digest Archive page + Single Digest view
5. Build About page
6. Redesign Event Card component per design system

### Phase 3: Newsletter Email (the actual product)
7. Rebuild newsletter HTML email template to match design spec
8. Add "featured event" support (backend flag + template section)
9. Add "Also On Our Radar" section to digest

### Phase 4: Backend Adjustments
10. Add digest archive API endpoints (list past digests, get single digest)
11. Add "why care" / short description field to Event model
12. Add "featured" flag to events for the weekly top pick

### Phase 5: Polish & Verify
13. Responsive testing (mobile, tablet, desktop)
14. Email client testing (Gmail, Apple Mail, Outlook)
15. End-to-end flow test (subscribe → verify → receive digest)

## Out of Scope (MVP)

- User accounts / login
- Personalization / category preferences
- Event detail pages (link to external source)
- Venue directory (existing page deprioritized)
- Monetization features
- Data scraping / automated event ingestion
