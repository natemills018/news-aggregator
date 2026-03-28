from datetime import datetime

from sqlalchemy.orm import Session

from app.models import Category, Venue, Event


def seed_data(db: Session) -> None:
    """Insert sample Cleveland data if the database is empty."""
    if db.query(Category).first():
        return

    # Categories
    categories = [
        Category(name="Theme Parks", slug="theme-parks"),
        Category(name="Zoos & Aquariums", slug="zoos-aquariums"),
        Category(name="Museums", slug="museums"),
        Category(name="Performing Arts", slug="performing-arts"),
        Category(name="Festivals", slug="festivals"),
        Category(name="Sports", slug="sports"),
        Category(name="Food & Drink", slug="food-drink"),
    ]
    db.add_all(categories)
    db.flush()

    cat_map = {c.slug: c for c in categories}

    # Venues
    venues = [
        Venue(
            name="Cleveland Metroparks Zoo",
            address="3900 Wildlife Way, Cleveland, OH 44109",
            venue_type="zoo",
            latitude=41.4459,
            longitude=-81.7073,
            website="https://www.clevelandmetroparks.com/zoo",
        ),
        Venue(
            name="Cedar Point",
            address="1 Cedar Point Dr, Sandusky, OH 44870",
            venue_type="theme-park",
            latitude=41.4828,
            longitude=-82.6835,
            website="https://www.cedarpoint.com",
        ),
        Venue(
            name="Rock & Roll Hall of Fame",
            address="1100 E 9th St, Cleveland, OH 44114",
            venue_type="museum",
            latitude=41.5085,
            longitude=-81.6954,
            website="https://www.rockhall.com",
        ),
        Venue(
            name="Cleveland Museum of Art",
            address="11150 East Blvd, Cleveland, OH 44106",
            venue_type="museum",
            latitude=41.5090,
            longitude=-81.6119,
            website="https://www.clevelandart.org",
        ),
        Venue(
            name="Playhouse Square",
            address="1501 Euclid Ave, Cleveland, OH 44115",
            venue_type="theater",
            latitude=41.5013,
            longitude=-81.6808,
            website="https://www.playhousesquare.org",
        ),
        Venue(
            name="Progressive Field",
            address="2401 Ontario St, Cleveland, OH 44115",
            venue_type="stadium",
            latitude=41.4962,
            longitude=-81.6852,
            website="https://www.mlb.com/guardians",
        ),
    ]
    db.add_all(venues)
    db.flush()

    venue_map = {v.name: v for v in venues}

    # Sample events
    events = [
        Event(
            title="Asian Lantern Festival",
            description="Experience the magic of hundreds of illuminated lanterns at the Cleveland Metroparks Zoo. Features cultural performances, artisan markets, and Asian-inspired cuisine.",
            start_date=datetime(2026, 7, 10),
            end_date=datetime(2026, 8, 23),
            source_url="https://www.clevelandmetroparks.com/zoo",
            category=cat_map["zoos-aquariums"],
            venue=venue_map["Cleveland Metroparks Zoo"],
        ),
        Event(
            title="Cedar Point Opening Weekend 2026",
            description="The roller coaster capital of the world kicks off the 2026 season with new rides and attractions.",
            start_date=datetime(2026, 5, 9),
            end_date=datetime(2026, 5, 10),
            source_url="https://www.cedarpoint.com",
            category=cat_map["theme-parks"],
            venue=venue_map["Cedar Point"],
        ),
        Event(
            title="Rock Hall Induction Ceremony Watch Party",
            description="Watch the 2026 Rock & Roll Hall of Fame induction ceremony live at the museum with fellow music fans.",
            start_date=datetime(2026, 10, 18),
            category=cat_map["museums"],
            venue=venue_map["Rock & Roll Hall of Fame"],
        ),
        Event(
            title="CMA Friday at the Museum",
            description="Free admission every Friday at the Cleveland Museum of Art. Explore world-class galleries and rotating exhibitions.",
            start_date=datetime(2026, 4, 3),
            category=cat_map["museums"],
            venue=venue_map["Cleveland Museum of Art"],
        ),
        Event(
            title="Hamilton at Playhouse Square",
            description="The award-winning musical Hamilton returns to Cleveland's theater district for a limited engagement.",
            start_date=datetime(2026, 6, 15),
            end_date=datetime(2026, 7, 5),
            category=cat_map["performing-arts"],
            venue=venue_map["Playhouse Square"],
        ),
        Event(
            title="Guardians Home Opener",
            description="Cleveland Guardians kick off the 2026 MLB season at Progressive Field.",
            start_date=datetime(2026, 4, 6),
            category=cat_map["sports"],
            venue=venue_map["Progressive Field"],
        ),
        Event(
            title="Taste of Cleveland",
            description="Annual food festival featuring dozens of Cleveland's best restaurants, live music, and cooking demonstrations.",
            start_date=datetime(2026, 6, 20),
            end_date=datetime(2026, 6, 22),
            category=cat_map["food-drink"],
        ),
    ]
    db.add_all(events)
    db.commit()
