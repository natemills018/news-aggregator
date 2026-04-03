# Research: CLE Local

## Problem

Cleveland has no shortage of things to do — zoo events, concerts at the Rock Hall, Cedar Point openings, art walks, food festivals — but finding out what's happening *this week* is scattered across dozens of websites, social pages, and event calendars. By the time you dig through it all, you've already spent more time researching than you would at the event.

People don't want a deep dive. They want a quick hit: **what's worth checking out this week?**

## Target Audience

- Cleveland residents (25–45) who want to stay plugged into what's happening locally without doing the legwork
- Transplants and newer residents still learning the city
- Busy professionals who'd read a 2-minute email but won't browse 5 event sites
- Couples/friend groups looking for weekend plans

## Core Insight

> People don't need more information — they need less, better information delivered at the right time.

The value isn't aggregation for its own sake. It's **curation + brevity**. A personalized local news digest that respects your time.

## Distribution Strategy

**Newsletter-first.** A weekly email is the lowest-friction way to:
- Test whether people actually want this (signups = demand signal)
- Validate the editorial voice and format before building a full product
- Build an audience that can be migrated to a richer platform later
- Measure engagement (open rates, click-throughs) cheaply

The web app exists to support the newsletter: sign up, browse current/past digests, and eventually personalize what you see.

## Data Sources

| Source | Type | Notes |
|--------|------|-------|
| Cleveland Metroparks Zoo | Venue calendar | Seasonal events, special exhibits |
| Cedar Point | Theme park schedule | Opening day, special events, new rides |
| Rock & Roll Hall of Fame | Exhibits + events | Concerts, inductions, special exhibits |
| Cleveland Museum of Art | Free exhibits + events | Always free admission — strong draw |
| Playhouse Square | Performing arts | Broadway shows, concerts, comedy |
| Local festivals | Seasonal | Feast of the Assumption, Ingenuity Fest, etc. |
| Eventbrite API | Aggregator | Public events in Cleveland metro |
| Google Places API | Venue data | Hours, ratings, descriptions |

## Content Format

Each event/attraction in the digest should be **scannable in ~5 seconds**:
- **What** — event name
- **When** — date/time, kept simple ("This Saturday" not "April 5, 2026 at 2:00 PM EST")
- **Where** — venue name (link to map)
- **Why care** — one punchy sentence on why it's worth your time
- **Link** — go deeper if you want

No walls of text. No "click here to read more about our 10 favorite things." Just the signal.

## Key Risks

- **Data freshness**: Events change, get canceled. Stale data kills trust fast.
- **Editorial voice**: Generic aggregation is boring. The digest needs personality to retain subscribers.
- **Cold start**: Need enough events to feel useful from day one, but Cleveland is mid-size — the volume is manageable.
- **Monetization**: Not the focus yet, but eventually: sponsored placements, affiliate links to ticket sales, or premium tiers.

## Success Metrics (MVP)

| Metric | Target | Why it matters |
|--------|--------|---------------|
| Email signups | 100 in first month | Validates demand |
| Open rate | >40% | Content resonates |
| Click-through rate | >10% | Events are actionable |
| Unsubscribe rate | <2% per send | Not annoying people |
