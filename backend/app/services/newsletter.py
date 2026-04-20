from datetime import datetime, timedelta
from html import escape

from sqlalchemy.orm import Session, joinedload

from app.models import Event


def get_upcoming_events(db: Session, days: int = 7) -> list[Event]:
    """Get events happening in the next N days, featured first."""
    now = datetime.utcnow()
    cutoff = now + timedelta(days=days)
    return (
        db.query(Event)
        .options(joinedload(Event.category), joinedload(Event.venue))
        .filter(Event.start_date >= now, Event.start_date <= cutoff, Event.status == "approved")
        .order_by(Event.is_featured.desc(), Event.start_date)
        .all()
    )


def _get_why_care(event: Event) -> str:
    if event.short_description:
        return event.short_description
    if event.description:
        return event.description[:120] + ("..." if len(event.description) > 120 else "")
    return ""


def _casual_date(dt: datetime) -> str:
    now = datetime.utcnow()
    diff = (dt.date() - now.date()).days

    if diff == 0:
        return "Today"
    if diff == 1:
        return "Tomorrow"

    day_name = dt.strftime("%A")
    if 2 <= diff <= 6:
        return f"This {day_name}"
    if 7 <= diff <= 13:
        return f"Next {day_name}"

    return dt.strftime("%b %-d")


def _dateline(now: datetime | None = None) -> str:
    """Human dateline for the header, e.g. 'Week of April 13'."""
    now = now or datetime.utcnow()
    monday = now - timedelta(days=now.weekday())
    return f"Week of {monday.strftime('%B %-d')}"


# ── Vibe grouping ──
# Maps a category to one of five vibes. Keyed by both slug and lowercase name
# so we survive whichever shape the Ticketmaster pipeline or seed data produces.

VIBE_ORDER = ["going_out", "culture_fix", "get_outside", "good_eats", "family_friendly"]

VIBES = {
    "going_out": {
        "label": "Going Out",
        "emoji": "🎵",
        "color": "#5B5EE6",
        "bg": "#EDEDFC",
    },
    "culture_fix": {
        "label": "Culture Fix",
        "emoji": "🎨",
        "color": "#8B5CC2",
        "bg": "#F3EDF9",
    },
    "get_outside": {
        "label": "Get Outside",
        "emoji": "☀️",
        "color": "#1A9E8F",
        "bg": "#E6F5F3",
    },
    "good_eats": {
        "label": "Good Eats",
        "emoji": "🍽️",
        "color": "#B07A00",
        "bg": "#FDF5E6",
    },
    "family_friendly": {
        "label": "Family Friendly",
        "emoji": "👨‍👩‍👧",
        "color": "#2D8A56",
        "bg": "#E9F5EE",
    },
}

CATEGORY_TO_VIBE = {
    # Going Out
    "music": "going_out",
    "nightlife": "going_out",
    "festivals": "going_out",
    "comedy": "going_out",
    # Culture Fix
    "arts & culture": "culture_fix",
    "arts-culture": "culture_fix",
    "arts & theatre": "culture_fix",
    "performing arts": "culture_fix",
    "performing-arts": "culture_fix",
    "museums": "culture_fix",
    "film": "culture_fix",
    # Get Outside
    "outdoors": "get_outside",
    "sports": "get_outside",
    "theme parks": "get_outside",
    "theme-parks": "get_outside",
    "zoos & aquariums": "get_outside",
    "zoos-aquariums": "get_outside",
    # Good Eats
    "food & drink": "good_eats",
    "food-drink": "good_eats",
    # Family Friendly
    "family": "family_friendly",
}


def _event_vibe(event: Event) -> str | None:
    if not event.category:
        return None
    name = (event.category.name or "").lower().strip()
    slug = (event.category.slug or "").lower().strip()
    return CATEGORY_TO_VIBE.get(slug) or CATEGORY_TO_VIBE.get(name)


def _group_events_by_vibe(events: list[Event]) -> tuple[dict[str, list[Event]], list[Event]]:
    """Group events into vibe buckets.

    Singletons merge back into a 'more' catch-all so we never render a section
    of one. Events without a recognized category also fall into 'more'.
    """
    buckets: dict[str, list[Event]] = {vibe: [] for vibe in VIBE_ORDER}
    uncategorized: list[Event] = []

    for e in events:
        vibe = _event_vibe(e)
        if vibe and vibe in buckets:
            buckets[vibe].append(e)
        else:
            uncategorized.append(e)

    # Merge singleton vibes into 'more' so sections always have 2+
    more: list[Event] = list(uncategorized)
    for vibe in VIBE_ORDER:
        if len(buckets[vibe]) == 1:
            more.extend(buckets[vibe])
            buckets[vibe] = []

    return buckets, more


# ── HTML helpers ──


def _safe(s: str | None) -> str:
    return escape(s or "")


def _cta_button(url: str, label: str = "Get tickets") -> str:
    return (
        f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">'
        f'<tr><td style="background-color:#E85D4A;border-radius:6px;">'
        f'<a href="{_safe(url)}" style="display:inline-block;padding:11px 22px;'
        f'font-family:Inter,-apple-system,sans-serif;font-size:14px;font-weight:600;'
        f'color:#FFFFFF;text-decoration:none;">{label} &rarr;</a>'
        f'</td></tr></table>'
    )


def _link(url: str, label: str) -> str:
    return (
        f'<a href="{_safe(url)}" style="font-size:13px;font-weight:600;'
        f'color:#E85D4A;text-decoration:none;">{label} &rarr;</a>'
    )


def build_digest_html(
    events: list[Event],
    intro: str = "",
    subscriber_email: str = "",
    tagline: str = "",
    editors_note: str = "",
) -> str:
    """Build the weekly digest HTML email — Zine + Mixtape layout."""
    if not events:
        return _wrap_email(
            "<p style=\"color:#5A6578;text-align:center;padding:32px 0;\">"
            "No upcoming events this week. Check back soon!</p>",
            intro=intro,
            tagline=tagline,
            subscriber_email=subscriber_email,
        )

    # Pull featured (Big One) out of the pool
    big_one: Event | None = next((e for e in events if e.is_featured), None)
    remaining = [e for e in events if e is not big_one]
    if big_one is None and remaining:
        big_one = remaining.pop(0)

    # Pull sleeper pick out (must not be the Big One)
    sleeper: Event | None = next((e for e in remaining if e.is_sleeper_pick), None)
    if sleeper:
        remaining = [e for e in remaining if e is not sleeper]

    # Vibe sections take up to 8 events; the rest become Quick Hits
    vibe_pool = remaining[:8]
    quick_hits = remaining[8:12]

    buckets, more = _group_events_by_vibe(vibe_pool)
    # Anything that spilled to 'more' joins quick_hits
    quick_hits = more + quick_hits

    sections: list[str] = []

    if editors_note.strip():
        sections.append(_build_editors_note_html(editors_note))

    if big_one:
        sections.append(_build_big_one_html(big_one))

    for vibe in VIBE_ORDER:
        items = buckets[vibe]
        if len(items) >= 2:
            sections.append(_build_vibe_section_html(vibe, items))

    if sleeper:
        sections.append(_build_sleeper_pick_html(sleeper))

    if quick_hits:
        sections.append(_build_quick_hits_html(quick_hits))

    return _wrap_email(
        "\n".join(sections),
        intro=intro,
        tagline=tagline,
        subscriber_email=subscriber_email,
    )


def _wrap_email(
    content: str,
    intro: str = "",
    tagline: str = "",
    subscriber_email: str = "",
) -> str:
    import os
    from urllib.parse import quote

    preheader = intro or "Here's what's worth checking out in Cleveland this week."
    tagline_text = tagline.strip() or "Your week in Cleveland"
    dateline = _dateline()

    base_url = os.getenv("BASE_URL", "http://localhost:8000")
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

    if subscriber_email:
        unsubscribe_url = f"{base_url}/subscribers/unsubscribe?email={quote(subscriber_email)}"
    else:
        unsubscribe_url = "#"

    share_url = (
        "mailto:?subject=Check%20out%20The%20CLE%20Brief"
        f"&body=I%20found%20this%20great%20Cleveland%20events%20newsletter%3A%20{quote(frontend_url)}"
    )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>The CLE Brief</title>
</head>
<body style="margin:0;padding:0;background-color:#F5F3F0;font-family:Inter,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="font-size:0;line-height:0;display:none;max-height:0;overflow:hidden;">{_safe(preheader)}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F3F0;">
<tr><td align="center" style="padding:0;">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin:0 auto;">

<!-- Header -->
<tr>
<td style="background-color:#1B2A4A;padding:28px 32px 22px;text-align:center;">
    <p style="font-family:Inter,-apple-system,sans-serif;font-size:11px;
              font-weight:600;letter-spacing:0.18em;text-transform:uppercase;
              color:rgba(255,255,255,0.55);margin:0 0 8px;">{_safe(dateline)}</p>
    <h1 style="font-family:'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif;
               font-size:28px;font-weight:700;color:#FFFFFF;margin:0;letter-spacing:0.02em;">
        THE CLE BRIEF
    </h1>
    <p style="font-family:Inter,-apple-system,sans-serif;font-size:13px;
              font-style:italic;color:rgba(255,255,255,0.7);margin:8px 0 0;">
        {_safe(tagline_text)}
    </p>
</td>
</tr>

<!-- Content -->
<tr>
<td style="background-color:#FFFFFF;padding:24px 32px 32px;">
    {content}
</td>
</tr>

<!-- Footer -->
<tr>
<td style="background-color:#1B2A4A;padding:22px 32px;text-align:center;">
    <p style="font-family:Inter,-apple-system,sans-serif;font-size:12px;
              color:rgba(255,255,255,0.6);margin:0 0 6px;">
        Know someone who'd dig this? Forward it.
    </p>
    <p style="font-family:Inter,-apple-system,sans-serif;font-size:12px;
              color:rgba(255,255,255,0.5);margin:0 0 10px;">
        Made in Cleveland
    </p>
    <p style="font-family:Inter,-apple-system,sans-serif;font-size:12px;margin:0;">
        <a href="{unsubscribe_url}" style="color:rgba(255,255,255,0.5);text-decoration:underline;">Unsubscribe</a>
        <span style="color:rgba(255,255,255,0.3);"> &middot; </span>
        <a href="{share_url}" style="color:rgba(255,255,255,0.5);text-decoration:underline;">Share with a friend</a>
    </p>
</td>
</tr>

</table>
</td></tr></table>
</body>
</html>"""


def _build_editors_note_html(note: str) -> str:
    # Preserve paragraph breaks, escape the rest
    paragraphs = [p.strip() for p in note.strip().split("\n\n") if p.strip()]
    body = "".join(
        f'<p style="font-family:Inter,-apple-system,sans-serif;font-size:15px;'
        f'line-height:1.65;color:#1B2A4A;margin:0 0 10px;">{_safe(p)}</p>'
        for p in paragraphs
    )
    return (
        f'<div style="background-color:#FDF8F3;border-radius:8px;padding:18px 22px;margin:4px 0 24px;">'
        f'<p style="font-family:\'DM Sans\',sans-serif;font-size:11px;font-weight:700;'
        f'letter-spacing:0.14em;text-transform:uppercase;color:#E85D4A;margin:0 0 8px;">'
        f'Editor\'s Note</p>'
        f'{body}'
        f'</div>'
    )


def _build_big_one_html(event: Event) -> str:
    why_care = _get_why_care(event)
    date_str = _casual_date(event.start_date)

    badge = ""
    if event.category:
        badge = (
            f'<span style="background:#FDF0ED;color:#E85D4A;font-size:10px;'
            f'font-weight:700;padding:4px 10px;border-radius:12px;'
            f'text-transform:uppercase;letter-spacing:0.1em;">'
            f'{_safe(event.category.name)}</span>'
        )

    image_block = ""
    if event.image_url:
        # Dark overlay block beneath image mimics the magazine-cover feel
        # without relying on CSS positioning (email-safe).
        image_block = (
            f'<img src="{_safe(event.image_url)}" alt="{_safe(event.title)}" width="536" '
            f'style="display:block;width:100%;max-width:536px;height:auto;'
            f'border-radius:8px 8px 0 0;">'
            f'<div style="background:linear-gradient(to bottom, rgba(27,42,74,0.92), #1B2A4A);'
            f'padding:18px 22px;border-radius:0 0 8px 8px;margin-bottom:18px;">'
            f'<h2 style="font-family:\'DM Sans\',sans-serif;font-size:24px;font-weight:700;'
            f'color:#FFFFFF;margin:0;line-height:1.2;">{_safe(event.title)}</h2>'
            f'</div>'
        )

    venue_line = ""
    if event.venue:
        venue_line = f'<p style="font-size:14px;color:#5A6578;margin:4px 0 0;">{_safe(event.venue.name)}</p>'

    title_fallback = ""
    if not event.image_url:
        title_fallback = (
            f'<h2 style="font-family:\'DM Sans\',sans-serif;font-size:24px;font-weight:700;'
            f'color:#1B2A4A;margin:0 0 6px;line-height:1.25;">{_safe(event.title)}</h2>'
        )

    cta = ""
    if event.source_url:
        cta = _cta_button(event.source_url, "Get tickets")

    why_block = ""
    if why_care:
        why_block = (
            f'<p style="font-size:15px;line-height:1.6;color:#1B2A4A;margin:10px 0 0;">'
            f'{_safe(why_care)}</p>'
        )

    return f"""
    <div style="margin:0 0 28px;">
        {image_block}
        <div style="margin-bottom:6px;">{badge} <span style="font-size:13px;color:#5A6578;">{_safe(date_str)}</span></div>
        {title_fallback}
        {venue_line}
        {why_block}
        {cta}
    </div>"""


def _build_vibe_section_html(vibe_key: str, events: list[Event]) -> str:
    vibe = VIBES[vibe_key]
    color = vibe["color"]
    emoji = vibe["emoji"]
    label = vibe["label"]

    header = (
        f'<div style="border-left:4px solid {color};padding:2px 0 2px 12px;margin:28px 0 14px;">'
        f'<h3 style="font-family:\'DM Sans\',sans-serif;font-size:18px;font-weight:700;'
        f'color:#1B2A4A;margin:0;">{emoji} {label}</h3>'
        f'</div>'
    )

    # Two-column layout using nested tables. On narrow widths they stack.
    cells: list[str] = []
    for e in events:
        cells.append(_build_vibe_card_html(e, color))

    # Build rows of two
    rows: list[str] = []
    for i in range(0, len(cells), 2):
        left = cells[i]
        right = cells[i + 1] if i + 1 < len(cells) else '<td style="width:50%;">&nbsp;</td>'
        rows.append(
            f'<tr>'
            f'<td width="50%" valign="top" style="padding:0 6px 12px 0;width:50%;">{left}</td>'
            f'<td width="50%" valign="top" style="padding:0 0 12px 6px;width:50%;">{right}</td>'
            f'</tr>'
        )

    grid = (
        f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
        f'style="width:100%;border-collapse:separate;">'
        f'{"".join(rows)}</table>'
    )

    return header + grid


def _build_vibe_card_html(event: Event, accent: str) -> str:
    why_care = _get_why_care(event)
    date_str = _casual_date(event.start_date)

    venue_line = ""
    if event.venue:
        venue_line = f' &middot; {_safe(event.venue.name)}'

    link = ""
    if event.source_url:
        link = f'<div style="margin-top:8px;">{_link(event.source_url, "More info")}</div>'

    why_block = ""
    if why_care:
        why_block = (
            f'<p style="font-size:13px;line-height:1.5;color:#5A6578;margin:6px 0 0;">'
            f'{_safe(why_care)}</p>'
        )

    return (
        f'<div style="background:#FFFFFF;border-left:3px solid {accent};'
        f'padding:12px 14px;border-radius:0 6px 6px 0;'
        f'box-shadow:0 1px 2px rgba(27,42,74,0.04);">'
        f'<p style="font-size:12px;color:#5A6578;margin:0 0 3px;">{_safe(date_str)}{venue_line}</p>'
        f'<h4 style="font-family:\'DM Sans\',sans-serif;font-size:15px;font-weight:700;'
        f'color:#1B2A4A;margin:0;line-height:1.3;">{_safe(event.title)}</h4>'
        f'{why_block}'
        f'{link}'
        f'</div>'
    )


def _build_sleeper_pick_html(event: Event) -> str:
    why_care = _get_why_care(event)
    date_str = _casual_date(event.start_date)

    venue_line = ""
    if event.venue:
        venue_line = f' &middot; {_safe(event.venue.name)}'

    link = ""
    if event.source_url:
        link = f'<div style="margin-top:10px;">{_link(event.source_url, "Check it out")}</div>'

    note = why_care or "You probably haven't heard of this one, but it's worth a look."

    return (
        f'<div style="background:#FFF0ED;border-left:4px solid #E85D4A;'
        f'padding:18px 22px;border-radius:0 8px 8px 0;margin:28px 0 4px;">'
        f'<p style="font-family:\'DM Sans\',sans-serif;font-size:11px;font-weight:700;'
        f'letter-spacing:0.14em;text-transform:uppercase;color:#E85D4A;margin:0 0 10px;">'
        f'Sleeper Pick</p>'
        f'<h3 style="font-family:\'DM Sans\',sans-serif;font-size:18px;font-weight:700;'
        f'color:#1B2A4A;margin:0 0 4px;line-height:1.3;">{_safe(event.title)}</h3>'
        f'<p style="font-size:13px;color:#5A6578;margin:0 0 8px;">{_safe(date_str)}{venue_line}</p>'
        f'<p style="font-size:14px;line-height:1.6;color:#1B2A4A;margin:0;font-style:italic;">'
        f'"{_safe(note)}"</p>'
        f'{link}'
        f'</div>'
    )


def _build_quick_hits_html(events: list[Event]) -> str:
    items: list[str] = []
    for e in events:
        date_str = _casual_date(e.start_date)
        arrow = ""
        if e.source_url:
            arrow = (
                f' <a href="{_safe(e.source_url)}" '
                f'style="color:#E85D4A;text-decoration:none;font-weight:600;">&rarr;</a>'
            )
        items.append(
            f'<tr><td style="padding:8px 0;border-bottom:1px solid #E8E4DF;">'
            f'<span style="font-family:\'DM Sans\',sans-serif;font-size:14px;font-weight:700;'
            f'color:#1B2A4A;">{_safe(e.title)}</span>'
            f'<span style="font-size:13px;color:#5A6578;"> &middot; {_safe(date_str)}</span>'
            f'{arrow}'
            f'</td></tr>'
        )

    return (
        f'<div style="background:#F5F3F0;border-radius:8px;padding:16px 20px;margin:28px 0 4px;">'
        f'<h3 style="font-family:\'DM Sans\',sans-serif;font-size:16px;font-weight:700;'
        f'color:#1B2A4A;margin:0 0 6px;">Quick Hits</h3>'
        f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0">'
        f'{"".join(items)}</table>'
        f'</div>'
    )


# ── Plain text version ──


def build_digest_plain(
    events: list[Event],
    intro: str = "",
    tagline: str = "",
    editors_note: str = "",
) -> str:
    if not events:
        return "THE CLE BRIEF\n\nNo upcoming events this week. Check back soon!"

    big_one: Event | None = next((e for e in events if e.is_featured), None)
    remaining = [e for e in events if e is not big_one]
    if big_one is None and remaining:
        big_one = remaining.pop(0)

    sleeper: Event | None = next((e for e in remaining if e.is_sleeper_pick), None)
    if sleeper:
        remaining = [e for e in remaining if e is not sleeper]

    vibe_pool = remaining[:8]
    quick_hits = remaining[8:12]
    buckets, more = _group_events_by_vibe(vibe_pool)
    quick_hits = more + quick_hits

    tagline_text = tagline.strip() or "Your week in Cleveland"
    dateline = _dateline()

    lines = [
        "THE CLE BRIEF",
        dateline,
        tagline_text,
        "=" * 40,
        "",
    ]

    if editors_note.strip():
        lines.append("EDITOR'S NOTE")
        lines.append("-" * 20)
        lines.append(editors_note.strip())
        lines.append("")

    if big_one:
        lines.append("★ THE BIG ONE")
        lines.append("-" * 20)
        lines.append(big_one.title)
        lines.append(f"  {_casual_date(big_one.start_date)}")
        if big_one.venue:
            lines.append(f"  {big_one.venue.name}")
        why = _get_why_care(big_one)
        if why:
            lines.append(f"  {why}")
        if big_one.source_url:
            lines.append(f"  {big_one.source_url}")
        lines.append("")

    for vibe in VIBE_ORDER:
        items = buckets[vibe]
        if len(items) < 2:
            continue
        v = VIBES[vibe]
        lines.append(f"{v['label'].upper()}")
        lines.append("-" * 20)
        for e in items:
            lines.append(f"• {e.title}")
            extra = _casual_date(e.start_date)
            if e.venue:
                extra += f" — {e.venue.name}"
            lines.append(f"  {extra}")
            why = _get_why_care(e)
            if why:
                lines.append(f"  {why}")
            if e.source_url:
                lines.append(f"  {e.source_url}")
        lines.append("")

    if sleeper:
        lines.append("SLEEPER PICK")
        lines.append("-" * 20)
        lines.append(sleeper.title)
        lines.append(f"  {_casual_date(sleeper.start_date)}")
        if sleeper.venue:
            lines.append(f"  {sleeper.venue.name}")
        why = _get_why_care(sleeper)
        if why:
            lines.append(f"  {why}")
        if sleeper.source_url:
            lines.append(f"  {sleeper.source_url}")
        lines.append("")

    if quick_hits:
        lines.append("QUICK HITS")
        lines.append("-" * 20)
        for e in quick_hits:
            lines.append(f"• {e.title} — {_casual_date(e.start_date)}")
            if e.source_url:
                lines.append(f"  {e.source_url}")
        lines.append("")

    return "\n".join(lines)
