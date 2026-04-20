from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.db import SessionLocal, get_db
from app.auth import require_admin
from app.models import Event, Category, Venue, FetchJob
from app.schemas import EventCreate, EventRead, EventUpdate
from app.services.ticketmaster import fetch_cleveland_events as fetch_ticketmaster

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


def _run_ticketmaster_fetch(job_id: int) -> None:
    """Run the Ticketmaster fetch in the background and update the job row."""
    db = SessionLocal()
    try:
        job = db.query(FetchJob).filter(FetchJob.id == job_id).first()
        if not job:
            return
        try:
            result = fetch_ticketmaster(db, days=14)
            if result.get("error"):
                job.status = "error"
                job.error = result["error"]
            else:
                job.status = "done"
                job.fetched = result.get("fetched", 0)
                job.duplicates = result.get("duplicates", 0)
        except Exception as exc:
            job.status = "error"
            job.error = str(exc)
        job.finished_at = datetime.utcnow()
        db.commit()
    finally:
        db.close()


@router.post("/fetch-events")
def fetch_events(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Kick off a Ticketmaster fetch in the background. Returns a job id to poll."""
    job = FetchJob(status="running", source="ticketmaster")
    db.add(job)
    db.commit()
    db.refresh(job)
    background_tasks.add_task(_run_ticketmaster_fetch, job.id)
    return {"job_id": job.id, "status": job.status}


@router.get("/fetch-events/{job_id}")
def get_fetch_job(job_id: int, db: Session = Depends(get_db)):
    """Check the status of a background fetch job."""
    job = db.query(FetchJob).filter(FetchJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "job_id": job.id,
        "status": job.status,
        "source": job.source,
        "fetched": job.fetched,
        "duplicates": job.duplicates,
        "error": job.error,
        "started_at": job.started_at.isoformat() if job.started_at else None,
        "finished_at": job.finished_at.isoformat() if job.finished_at else None,
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

    # Only one sleeper pick at a time
    if update_data.get("is_sleeper_pick"):
        db.query(Event).filter(Event.is_sleeper_pick == True, Event.id != event_id).update({"is_sleeper_pick": False})

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
