from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.auth import require_admin
from app.models import Event, Category, Venue
from app.schemas import EventCreate, EventRead, EventUpdate
from app.services.ticketmaster import fetch_cleveland_events as fetch_ticketmaster
from app.services.eventbrite import fetch_cleveland_events as fetch_eventbrite

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.post("/fetch-events")
def fetch_events(days: int = 14, db: Session = Depends(get_db)):
    """Fetch events from Ticketmaster and Eventbrite into the draft queue."""
    tm_result = fetch_ticketmaster(db, days=days)
    eb_result = fetch_eventbrite(db, days=days)
    return {
        "ticketmaster": tm_result,
        "eventbrite": eb_result,
    }


@router.get("/drafts", response_model=list[EventRead])
def list_drafts(db: Session = Depends(get_db)):
    """List all draft events for curation."""
    return (
        db.query(Event)
        .options(joinedload(Event.category), joinedload(Event.venue))
        .filter(Event.status == "draft")
        .order_by(Event.start_date)
        .all()
    )


@router.get("/events", response_model=list[EventRead])
def list_all_events(status: str | None = None, db: Session = Depends(get_db)):
    """List events, optionally filtered by status."""
    query = db.query(Event).options(joinedload(Event.category), joinedload(Event.venue))
    if status:
        query = query.filter(Event.status == status)
    return query.order_by(Event.start_date).all()


@router.patch("/events/{event_id}", response_model=EventRead)
def update_event(event_id: int, payload: EventUpdate, db: Session = Depends(get_db)):
    """Update an event (edit fields, approve, skip, feature)."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = payload.model_dump(exclude_unset=True)

    # If marking as featured, unfeature all others
    if update_data.get("is_featured"):
        db.query(Event).filter(Event.is_featured == True, Event.id != event_id).update({"is_featured": False})

    for key, value in update_data.items():
        setattr(event, key, value)

    db.commit()
    db.refresh(event)
    return (
        db.query(Event)
        .options(joinedload(Event.category), joinedload(Event.venue))
        .filter(Event.id == event.id)
        .first()
    )


@router.post("/events", response_model=EventRead, status_code=201)
def create_event(payload: EventCreate, db: Session = Depends(get_db)):
    """Manually create an event (for things APIs don't cover)."""
    event = Event(**payload.model_dump(), source="manual")
    db.add(event)
    db.commit()
    db.refresh(event)
    return (
        db.query(Event)
        .options(joinedload(Event.category), joinedload(Event.venue))
        .filter(Event.id == event.id)
        .first()
    )


@router.delete("/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    """Permanently delete an event."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"detail": "Deleted"}


@router.get("/categories", response_model=list)
def list_categories(db: Session = Depends(get_db)):
    """List all categories for the admin dropdown."""
    cats = db.query(Category).order_by(Category.name).all()
    return [{"id": c.id, "name": c.name, "slug": c.slug} for c in cats]
