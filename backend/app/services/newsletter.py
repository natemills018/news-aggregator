from datetime import datetime, timedelta

from sqlalchemy.orm import Session, joinedload

from app.models import Event


def get_upcoming_events(db: Session, days: int = 7) -> list[Event]:
    """Get events happening in the next N days."""
    now = datetime.utcnow()
    cutoff = now + timedelta(days=days)
    return (
        db.query(Event)
        .options(joinedload(Event.category), joinedload(Event.venue))
        .filter(Event.start_date >= now, Event.start_date <= cutoff)
        .order_by(Event.start_date)
        .all()
    )


def format_date(dt: datetime) -> str:
    return dt.strftime("%A, %B %-d")


def build_digest_html(events: list[Event]) -> str:
    """Build an HTML email body for the weekly digest."""
    if not events:
        return "<p>No upcoming events this week. Check back soon!</p>"

    event_blocks = []
    for e in events:
        date_str = format_date(e.start_date)
        if e.end_date:
            date_str += f" – {format_date(e.end_date)}"

        venue_line = ""
        if e.venue:
            venue_line = f'<p style="color:#888;font-size:13px;margin:4px 0 0;">{e.venue.name} — {e.venue.address}</p>'

        category_badge = ""
        if e.category:
            category_badge = (
                f'<span style="background:#fff7ed;color:#ea580c;font-size:11px;'
                f'font-weight:600;padding:2px 8px;border-radius:12px;text-transform:uppercase;">'
                f"{e.category.name}</span> "
            )

        source_link = ""
        if e.source_url:
            source_link = f'<a href="{e.source_url}" style="color:#ea580c;font-size:13px;">More info &rarr;</a>'

        block = f"""
        <div style="border-bottom:1px solid #eee;padding:16px 0;">
            <div style="margin-bottom:6px;">{category_badge}<span style="color:#888;font-size:13px;">{date_str}</span></div>
            <h3 style="margin:0 0 6px;font-size:18px;color:#111;">{e.title}</h3>
            <p style="color:#555;font-size:14px;margin:0 0 6px;line-height:1.5;">{e.description or ""}</p>
            {venue_line}
            {source_link}
        </div>
        """
        event_blocks.append(block)

    events_html = "\n".join(event_blocks)

    return f"""
    <div style="max-width:600px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        <div style="background:#ea580c;padding:20px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:24px;">CLE Local Weekly Digest</h1>
        </div>
        <div style="padding:20px;">
            <p style="color:#555;font-size:15px;">Here's what's happening in Cleveland this week:</p>
            {events_html}
            <p style="color:#888;font-size:12px;margin-top:24px;text-align:center;">
                You're receiving this because you subscribed to CLE Local updates.
            </p>
        </div>
    </div>
    """


def build_digest_plain(events: list[Event]) -> str:
    """Build a plain-text version of the digest."""
    if not events:
        return "No upcoming events this week. Check back soon!"

    lines = ["CLE Local Weekly Digest", "=" * 30, "", "Here's what's happening in Cleveland this week:", ""]
    for e in events:
        date_str = format_date(e.start_date)
        if e.end_date:
            date_str += f" – {format_date(e.end_date)}"
        lines.append(f"{e.title}")
        lines.append(f"  {date_str}")
        if e.category:
            lines.append(f"  Category: {e.category.name}")
        if e.venue:
            lines.append(f"  Venue: {e.venue.name}, {e.venue.address}")
        if e.description:
            lines.append(f"  {e.description[:120]}")
        lines.append("")

    return "\n".join(lines)
