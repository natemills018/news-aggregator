from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.db import get_db
from app.services.newsletter import get_upcoming_events, build_digest_html, build_digest_plain

router = APIRouter(prefix="/newsletter", tags=["newsletter"])


@router.get("/preview", response_class=HTMLResponse)
def preview_digest(days: int = 7, db: Session = Depends(get_db)):
    """Preview the weekly digest as rendered HTML."""
    events = get_upcoming_events(db, days=days)
    return build_digest_html(events)


@router.get("/preview/text")
def preview_digest_text(days: int = 7, db: Session = Depends(get_db)):
    """Preview the weekly digest as plain text."""
    events = get_upcoming_events(db, days=days)
    return {"text": build_digest_plain(events)}
