from fastapi import APIRouter, Depends
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.db import get_db
from app.auth import require_admin
from app.models.subscriber import Subscriber
from app.services.newsletter import get_upcoming_events, build_digest_html, build_digest_plain
from app.services.email import send_digest_email

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


@router.post("/send", dependencies=[Depends(require_admin)])
def send_digest(days: int = 7, db: Session = Depends(get_db)):
    """Send the weekly digest to all verified, active subscribers."""
    events = get_upcoming_events(db, days=days)
    html = build_digest_html(events)

    subscribers = (
        db.query(Subscriber)
        .filter(Subscriber.is_active == True, Subscriber.verified == True)
        .all()
    )

    sent_count = 0
    errors = []
    for sub in subscribers:
        try:
            send_digest_email(sub.email, html)
            sent_count += 1
        except Exception as e:
            errors.append({"email": sub.email, "error": str(e)})

    return {
        "sent": sent_count,
        "total_subscribers": len(subscribers),
        "events_included": len(events),
        "errors": errors,
    }
