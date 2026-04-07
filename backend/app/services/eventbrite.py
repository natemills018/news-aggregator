import os
from datetime import datetime, timedelta

import httpx
from sqlalchemy.orm import Session

from app.models import Event, Category, Venue

EVENTBRITE_TOKEN = os.getenv("EVENTBRITE_TOKEN", "")
BASE_URL = "https://www.eventbriteapi.com/v3"

# Cleveland coordinates
CLEVELAND_LAT = "41.4993"
CLEVELAND_LON = "-81.6944"
SEARCH_RADIUS = "25mi"

# Map Eventbrite category IDs to our category slugs
# These are Eventbrite's standard category IDs
CATEGORY_MAP = {
    "103": "music",          # Music
    "110": "food",           # Food & Drink
    "105": "arts-culture",   # Performing & Visual Arts
    "113": "family",         # Community & Culture (closest to family)
    "101": "sports",         # Business (no direct sports category in EB - we filter by keywords)
    "109": "outdoors",       # Travel & Outdoor
    "108": "festivals",      # Film, Media & Entertainment
    "107": "nightlife",      # Health & Wellness
}


def fetch_cleveland_events(db: Session, days: int = 14) -> dict:
    """Fetch events from Eventbrite for the Cleveland area.

    Returns a summary dict with counts of new, skipped (duplicate), and failed events.
    """
    if not EVENTBRITE_TOKEN:
        return {"error": "EVENTBRITE_TOKEN not configured", "fetched": 0, "duplicates": 0}

    now = datetime.utcnow()
    start = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    end = (now + timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")

    headers = {"Authorization": f"Bearer {EVENTBRITE_TOKEN}"}
    params = {
        "location.latitude": CLEVELAND_LAT,
        "location.longitude": CLEVELAND_LON,
        "location.within": SEARCH_RADIUS,
        "start_date.range_start": start,
        "start_date.range_end": end,
        "expand": "venue",
        "page_size": 50,
    }

    try:
        resp = httpx.get(f"{BASE_URL}/events/search/", params=params, headers=headers, timeout=15)
        resp.raise_for_status()
    except httpx.HTTPError as e:
        return {"error": str(e), "fetched": 0, "duplicates": 0}

    data = resp.json()
    raw_events = data.get("events", [])

    fetched = 0
    duplicates = 0

    for raw in raw_events:
        external_id = f"eb_{raw['id']}"

        # Skip if already in DB
        existing = db.query(Event).filter(Event.external_id == external_id).first()
        if existing:
            duplicates += 1
            continue

        # Parse dates
        start_obj = raw.get("start", {})
        start_date_str = start_obj.get("utc")
        if not start_date_str:
            continue
        start_date = datetime.fromisoformat(start_date_str.replace("Z", "+00:00"))

        end_obj = raw.get("end", {})
        end_date_str = end_obj.get("utc")
        end_date = datetime.fromisoformat(end_date_str.replace("Z", "+00:00")) if end_date_str else None

        # Get venue
        venue = None
        venue_data = raw.get("venue")
        if venue_data:
            venue_name = venue_data.get("name", "")
            if venue_name:
                venue = db.query(Venue).filter(Venue.name == venue_name).first()
                if not venue:
                    addr = venue_data.get("address", {})
                    address_parts = []
                    if addr.get("address_1"):
                        address_parts.append(addr["address_1"])
                    if addr.get("city"):
                        address_parts.append(addr["city"])
                    if addr.get("region"):
                        address_parts.append(addr["region"])

                    venue = Venue(
                        name=venue_name,
                        address=", ".join(address_parts) if address_parts else "Cleveland, OH",
                        venue_type="venue",
                        latitude=float(venue_data["latitude"]) if venue_data.get("latitude") else None,
                        longitude=float(venue_data["longitude"]) if venue_data.get("longitude") else None,
                    )
                    db.add(venue)
                    db.flush()

        # Get category
        category = None
        cat_id = raw.get("category_id")
        if cat_id:
            cat_slug = CATEGORY_MAP.get(str(cat_id))
            if cat_slug:
                category = db.query(Category).filter(Category.slug == cat_slug).first()

        # Get image
        logo = raw.get("logo")
        image_url = logo.get("url") if logo else None

        # Description — strip HTML for our plain description
        description_data = raw.get("description", {})
        description = description_data.get("text", "") if isinstance(description_data, dict) else ""

        # Source URL
        source_url = raw.get("url", "")

        event = Event(
            title=raw.get("name", {}).get("text", "") if isinstance(raw.get("name"), dict) else raw.get("name", ""),
            description=description[:500] if description else None,
            image_url=image_url,
            source_url=source_url,
            start_date=start_date,
            end_date=end_date,
            status="draft",
            external_id=external_id,
            source="eventbrite",
            category_id=category.id if category else None,
            venue_id=venue.id if venue else None,
        )
        db.add(event)
        fetched += 1

    db.commit()
    return {"fetched": fetched, "duplicates": duplicates, "source": "eventbrite"}
