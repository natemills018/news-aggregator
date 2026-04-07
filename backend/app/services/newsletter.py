from datetime import datetime, timedelta

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
    """Get the short description or truncated description."""
    if event.short_description:
        return event.short_description
    if event.description:
        return event.description[:120] + ("..." if len(event.description) > 120 else "")
    return ""


def _casual_date(dt: datetime) -> str:
    """Format a date casually (This Saturday, Next Wednesday, etc.)."""
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


# ── Category colors matching the frontend design system ──

CATEGORY_COLORS = {
    "music": "#3B7FC9",
    "food & drink": "#B07A00",
    "family": "#2D8A56",
    "arts & culture": "#8B5CC2",
    "sports": "#E85D4A",
    "outdoors": "#1A9E8F",
    "festivals": "#C944A0",
    "nightlife": "#5B5EE6",
}

CATEGORY_BGS = {
    "music": "#EBF2F9",
    "food & drink": "#FDF5E6",
    "family": "#E9F5EE",
    "arts & culture": "#F3EDF9",
    "sports": "#FDF0EE",
    "outdoors": "#E6F5F3",
    "festivals": "#FAEBF5",
    "nightlife": "#EDEDFC",
}


def _category_badge_html(category_name: str) -> str:
    name_lower = category_name.lower()
    color = CATEGORY_COLORS.get(name_lower, "#5A6578")
    bg = CATEGORY_BGS.get(name_lower, "#F0F0F0")
    return (
        f'<span style="background:{bg};color:{color};font-size:11px;'
        f'font-weight:600;padding:3px 10px;border-radius:12px;'
        f'text-transform:uppercase;letter-spacing:0.06em;">'
        f'{category_name}</span>'
    )


def build_digest_html(events: list[Event], intro: str = "", subscriber_email: str = "") -> str:
    """Build the weekly digest HTML email matching the CLE Brief design system."""
    if not events:
        return _wrap_email("<p style='color:#5A6578;text-align:center;padding:32px 0;'>No upcoming events this week. Check back soon!</p>", intro)

    # Split into featured, this week, and radar
    featured = None
    rest = []
    for e in events:
        if e.is_featured and not featured:
            featured = e
        else:
            rest.append(e)

    # If no featured event flagged, use the first one
    if not featured and rest:
        featured = rest.pop(0)

    this_week = rest[:7]
    radar = rest[7:10]

    sections = []

    # Featured event
    if featured:
        sections.append(_build_featured_html(featured))

    # This Week
    if this_week:
        sections.append(
            '<h2 style="font-family:\'DM Sans\',\'Helvetica Neue\',Helvetica,Arial,sans-serif;'
            'font-size:20px;font-weight:700;color:#1B2A4A;margin:32px 0 16px;'
            'padding-bottom:8px;border-bottom:2px solid #E8E4DF;">This Week</h2>'
        )
        for e in this_week:
            sections.append(_build_event_card_html(e))

    # Also On Our Radar
    if radar:
        sections.append(
            '<h2 style="font-family:\'DM Sans\',\'Helvetica Neue\',Helvetica,Arial,sans-serif;'
            'font-size:18px;font-weight:700;color:#1B2A4A;margin:32px 0 12px;'
            'padding-bottom:8px;border-bottom:2px solid #E8E4DF;">Also On Our Radar</h2>'
        )
        for e in radar:
            sections.append(_build_radar_item_html(e))

    return _wrap_email("\n".join(sections), intro, subscriber_email)


def _wrap_email(content: str, intro: str = "", subscriber_email: str = "") -> str:
    import os
    from urllib.parse import quote

    if not intro:
        intro = "Here's what's worth checking out in Cleveland this week."

    base_url = os.getenv("BASE_URL", "http://localhost:8000")
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

    if subscriber_email:
        unsubscribe_url = f"{base_url}/subscribers/unsubscribe?email={quote(subscriber_email)}"
    else:
        unsubscribe_url = "#"

    share_url = f"mailto:?subject=Check%20out%20The%20CLE%20Brief&body=I%20found%20this%20great%20Cleveland%20events%20newsletter%3A%20{quote(frontend_url)}"

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
<!-- Preheader -->
<div style="font-size:0;line-height:0;display:none;max-height:0;overflow:hidden;">{intro}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F3F0;">
<tr><td align="center" style="padding:0;">

<!-- Email container -->
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin:0 auto;">

<!-- Header -->
<tr>
<td style="background-color:#1B2A4A;padding:24px 32px;text-align:center;">
    <h1 style="font-family:'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif;
               font-size:24px;font-weight:700;color:#FFFFFF;margin:0;letter-spacing:0.02em;">
        THE CLE BRIEF
    </h1>
    <p style="font-family:Inter,-apple-system,sans-serif;font-size:13px;
              color:rgba(255,255,255,0.6);margin:6px 0 0;">
        Your week in Cleveland
    </p>
</td>
</tr>

<!-- Intro -->
<tr>
<td style="background-color:#FFFFFF;padding:24px 32px 16px;">
    <p style="font-family:Inter,-apple-system,sans-serif;font-size:16px;
              line-height:1.6;color:#1B2A4A;margin:0;">
        {intro}
    </p>
</td>
</tr>

<!-- Content -->
<tr>
<td style="background-color:#FFFFFF;padding:0 32px 32px;">
    {content}
</td>
</tr>

<!-- Footer -->
<tr>
<td style="background-color:#1B2A4A;padding:20px 32px;text-align:center;">
    <p style="font-family:Inter,-apple-system,sans-serif;font-size:12px;
              color:rgba(255,255,255,0.5);margin:0 0 8px;">
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


def _build_featured_html(event: Event) -> str:
    why_care = _get_why_care(event)
    date_str = _casual_date(event.start_date)

    badge = ""
    if event.category:
        badge = _category_badge_html(event.category.name) + " "

    venue_line = ""
    if event.venue:
        venue_line = f'<p style="font-size:14px;color:#5A6578;margin:4px 0 0;">{event.venue.name}</p>'

    image_block = ""
    if event.image_url:
        image_block = (
            f'<img src="{event.image_url}" alt="{event.title}" width="536" '
            f'style="display:block;width:100%;max-width:536px;height:auto;border-radius:6px 6px 0 0;margin-bottom:16px;">'
        )

    source_link = ""
    if event.source_url:
        source_link = (
            f'<a href="{event.source_url}" style="display:inline-block;margin-top:12px;'
            f'font-size:14px;font-weight:600;color:#E85D4A;text-decoration:none;">'
            f'Check it out &rarr;</a>'
        )

    return f"""
    <div style="margin-top:8px;">
        {image_block}
        <div style="margin-bottom:8px;">{badge}<span style="font-size:13px;color:#5A6578;">{date_str}</span></div>
        <h2 style="font-family:'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif;
                   font-size:24px;font-weight:700;color:#1B2A4A;margin:0 0 6px;">{event.title}</h2>
        {venue_line}
        <p style="font-size:15px;line-height:1.6;color:#1B2A4A;margin:8px 0 0;">{why_care}</p>
        {source_link}
    </div>"""


def _build_event_card_html(event: Event) -> str:
    why_care = _get_why_care(event)
    date_str = _casual_date(event.start_date)

    badge = ""
    if event.category:
        badge = _category_badge_html(event.category.name) + " "

    venue_line = ""
    if event.venue:
        venue_line = f'<span style="color:#5A6578;"> &middot; {event.venue.name}</span>'

    source_link = ""
    if event.source_url:
        source_link = (
            f'<a href="{event.source_url}" style="font-size:13px;font-weight:600;'
            f'color:#E85D4A;text-decoration:none;">More info &rarr;</a>'
        )

    return f"""
    <div style="padding:16px 0;border-bottom:1px solid #E0DCD7;">
        <div style="margin-bottom:6px;">{badge}<span style="font-size:13px;color:#5A6578;">{date_str}</span></div>
        <h3 style="font-family:'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif;
                   font-size:18px;font-weight:700;color:#1B2A4A;margin:0 0 4px;">{event.title}</h3>
        <p style="font-size:14px;color:#5A6578;margin:0 0 6px;">{why_care}{venue_line}</p>
        {source_link}
    </div>"""


def _build_radar_item_html(event: Event) -> str:
    date_str = _casual_date(event.start_date)
    why_care = _get_why_care(event)
    one_liner = f"{why_care}" if why_care else ""

    link = ""
    if event.source_url:
        link = f' <a href="{event.source_url}" style="color:#E85D4A;font-size:13px;text-decoration:none;">→</a>'

    return f"""
    <div style="padding:8px 0;">
        <p style="font-size:14px;color:#1B2A4A;margin:0;">
            <strong>{event.title}</strong>
            <span style="color:#5A6578;"> &middot; {date_str}</span>
            {link}
        </p>
        <p style="font-size:13px;color:#5A6578;margin:2px 0 0;">{one_liner}</p>
    </div>"""


def build_digest_plain(events: list[Event], intro: str = "") -> str:
    """Build a plain-text version of the digest."""
    if not intro:
        intro = "Here's what's worth checking out in Cleveland this week."

    if not events:
        return "THE CLE BRIEF\n\nNo upcoming events this week. Check back soon!"

    # Split into featured, this week, radar
    featured = None
    rest = []
    for e in events:
        if e.is_featured and not featured:
            featured = e
        else:
            rest.append(e)

    if not featured and rest:
        featured = rest.pop(0)

    this_week = rest[:7]
    radar = rest[7:10]

    lines = [
        "THE CLE BRIEF",
        "Your week in Cleveland",
        "=" * 40,
        "",
        intro,
        "",
    ]

    if featured:
        lines.append("★ TOP PICK")
        lines.append(f"  {featured.title}")
        lines.append(f"  {_casual_date(featured.start_date)}")
        if featured.venue:
            lines.append(f"  {featured.venue.name}")
        lines.append(f"  {_get_why_care(featured)}")
        if featured.source_url:
            lines.append(f"  {featured.source_url}")
        lines.append("")

    if this_week:
        lines.append("THIS WEEK")
        lines.append("-" * 20)
        for e in this_week:
            cat = f"[{e.category.name}] " if e.category else ""
            lines.append(f"{cat}{e.title}")
            lines.append(f"  {_casual_date(e.start_date)}")
            if e.venue:
                lines.append(f"  {e.venue.name}")
            why = _get_why_care(e)
            if why:
                lines.append(f"  {why}")
            if e.source_url:
                lines.append(f"  {e.source_url}")
            lines.append("")

    if radar:
        lines.append("ALSO ON OUR RADAR")
        lines.append("-" * 20)
        for e in radar:
            lines.append(f"• {e.title} — {_casual_date(e.start_date)}")
            why = _get_why_care(e)
            if why:
                lines.append(f"  {why}")
        lines.append("")

    return "\n".join(lines)
