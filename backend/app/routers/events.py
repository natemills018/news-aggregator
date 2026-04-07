from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.models import Event
from app.schemas import EventCreate, EventRead

router = APIRouter(prefix="/events", tags=["events"])


@router.get("/", response_model=list[EventRead])
def list_events(
    search: str | None = None,
    category_id: int | None = None,
    venue_id: int | None = None,
    from_date: datetime | None = None,
    to_date: datetime | None = None,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(Event).options(joinedload(Event.category), joinedload(Event.venue))
    query = query.filter(Event.status == "approved")

    if search:
        query = query.filter(Event.title.ilike(f"%{search}%"))
    if category_id:
        query = query.filter(Event.category_id == category_id)
    if venue_id:
        query = query.filter(Event.venue_id == venue_id)
    if from_date:
        query = query.filter(Event.start_date >= from_date)
    if to_date:
        query = query.filter(Event.start_date <= to_date)

    return query.order_by(Event.start_date).offset(offset).limit(limit).all()


@router.get("/{event_id}", response_model=EventRead)
def get_event(event_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Event)
        .options(joinedload(Event.category), joinedload(Event.venue))
        .filter(Event.id == event_id)
        .first()
    )


@router.post("/", response_model=EventRead, status_code=201)
def create_event(payload: EventCreate, db: Session = Depends(get_db)):
    event = Event(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return db.query(Event).options(joinedload(Event.category), joinedload(Event.venue)).filter(Event.id == event.id).first()
