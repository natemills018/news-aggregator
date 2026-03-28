from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Venue
from app.schemas import VenueCreate, VenueRead

router = APIRouter(prefix="/venues", tags=["venues"])


@router.get("/", response_model=list[VenueRead])
def list_venues(venue_type: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Venue)
    if venue_type:
        query = query.filter(Venue.venue_type == venue_type)
    return query.order_by(Venue.name).all()


@router.get("/{venue_id}", response_model=VenueRead)
def get_venue(venue_id: int, db: Session = Depends(get_db)):
    return db.query(Venue).filter(Venue.id == venue_id).first()


@router.post("/", response_model=VenueRead, status_code=201)
def create_venue(payload: VenueCreate, db: Session = Depends(get_db)):
    venue = Venue(**payload.model_dump())
    db.add(venue)
    db.commit()
    db.refresh(venue)
    return venue
