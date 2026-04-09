import os
from datetime import datetime, timedelta

import httpx
from sqlalchemy.orm import Session

from app.models import Event, Category, Venue

TICKETMASTER_API_KEY = os.getenv("TICKETMASTER_API_KEY", "")
BASE_URL = "https://app.ticketmaster.com/discovery/v2"

# Cleveland coordinates + radius (matches Eventbrite approach)
CLEVELAND_LAT = "41.4993"
CLEVELAND_LON = "-81.6944"
SEARCH_RADIUS = "30"
SEARCH_UNIT = "miles"

# Map Ticketmaster genre names to our category slugs
GENRE_MAP = {
    "Music": "music",
    "Sports": "sports",
    "Arts & Theatre": "arts-culture",
    "Film": "arts-culture",
    "Family": "family",
    "Comedy": "nightlife",
    "Dance": "arts-culture",
}


def fetch_cleveland_events(db: Session, days: int = 14) -> dict:
    """Fetch events from Ticketmaster for the Cleveland area.

    Returns a summary dict with counts of new, skipped (duplicate), and failed events.
    """
    if not TICKETMASTER_API_KEY:
        return {"error": "TICKETMASTER_API_KEY not configured", "fetched": 0, "duplicates": 0}

    now = datetime.utcnow()
    start = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    end = (now + timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")

    params = {
        "apikey": TICKETMASTER_API_KEY,
        "latlong": f"{CLEVELAND_LAT},{CLEVELAND_LON}",
        "radius": SEARCH_RADIUS,
        "unit": SEARCH_UNIT,
        "startDateTime": start,
        "endDateTime": end,
        "size": 50,
        "sort": "date,asc",
    }

    try:
        resp = httpx.get(f"{BASE_URL}/events.json", params=params, timeout=15)
        resp.raise_for_status()
    except httpx.HTTPError as e:
        return {"error": str(e), "fetched": 0, "duplicates": 0}

    data = resp.json()
    raw_events = data.get("_embedded", {}).get("events", [])

    fetched = 0
    duplicates = 0

    for raw in raw_events:
        external_id = f"tm_{raw['id']}"

        # Skip if already in DB
        existing = db.query(Event).filter(Event.external_id == external_id).first()
        if existing:
            duplicates += 1
            continue

        # Parse date
        start_date_str = raw.get("dates", {}).get("start", {}).get("dateTime")
        if not start_date_str:
            continue
        start_date = datetime.fromisoformat(start_date_str.replace("Z", "+00:00"))

        end_date_str = raw.get("dates", {}).get("end", {}).get("dateTime")
        end_date = datetime.fromisoformat(end_date_str.replace("Z", "+00:00")) if end_date_str else None

        # Get venue
        venues_data = raw.get("_embedded", {}).get("venues", [])
        venue = None
        if venues_data:
            v = venues_data[0]
            venue_name = v.get("name", "")
            venue = db.query(Venue).filter(Venue.name == venue_name).first()
            if not venue:
                address_parts = []
                addr = v.get("address", {})
                if addr.get("line1"):
                    address_parts.append(addr["line1"])
                city = v.get("city", {}).get("name", "")
                state = v.get("state", {}).get("stateCode", "")
                if city:
                    address_parts.append(city)
                if state:
                    address_parts.append(state)

                venue = Venue(
                    name=venue_name,
                    address=", ".join(address_parts) if address_parts else "Cleveland, OH",
                    venue_type="venue",
                    latitude=float(v["location"]["latitude"]) if v.get("location", {}).get("latitude") else None,
                    longitude=float(v["location"]["longitude"]) if v.get("location", {}).get("longitude") else None,
                    website=v.get("url"),
                )
                db.add(venue)
                db.flush()

        # Get category
        category = None
        classifications = raw.get("classifications", [])
        if classifications:
            genre_name = classifications[0].get("genre", {}).get("name", "")
            segment_name = classifications[0].get("segment", {}).get("name", "")
            cat_slug = GENRE_MAP.get(genre_name) or GENRE_MAP.get(segment_name)
            if cat_slug:
                category = db.query(Category).filter(Category.slug == cat_slug).first()

        # Get image
        images = raw.get("images", [])
        image_url = None
        if images:
            # Prefer 16:9 ratio images
            for img in images:
                if img.get("ratio") == "16_9" and img.get("width", 0) >= 500:
                    image_url = img["url"]
                    break
            if not image_url:
                image_url = images[0].get("url")

        # Get ticket/source URL
        source_url = raw.get("url", "")

        # Build description from info or pleaseNote
        description = raw.get("info", "") or raw.get("pleaseNote", "")

        event = Event(
            title=raw.get("name", ""),
            description=description or None,
            image_url=image_url,
            source_url=source_url,
            start_date=start_date,
            end_date=end_date,
            status="draft",
            external_id=external_id,
            source="ticketmaster",
            category_id=category.id if category else None,
            venue_id=venue.id if venue else None,
        )
        db.add(event)
        fetched += 1

    db.commit()
    return {"fetched": fetched, "duplicates": duplicates, "source": "ticketmaster"}
