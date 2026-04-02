from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.subscriber import Subscriber, generate_token
from app.schemas.subscriber import SubscriberCreate, SubscriberRead
from app.services.email import send_verification_email

router = APIRouter(prefix="/subscribers", tags=["subscribers"])


@router.post("/", response_model=SubscriberRead, status_code=201)
def subscribe(payload: SubscriberCreate, db: Session = Depends(get_db)):
    existing = db.query(Subscriber).filter(Subscriber.email == payload.email).first()
    if existing:
        if existing.is_active and existing.verified:
            raise HTTPException(status_code=409, detail="Already subscribed")
        # Re-subscribe or resend verification
        existing.is_active = True
        existing.verified = False
        existing.verification_token = generate_token()
        existing.name = payload.name or existing.name
        db.commit()
        db.refresh(existing)
        send_verification_email(existing.email, existing.name, existing.verification_token)
        return existing

    token = generate_token()
    subscriber = Subscriber(
        email=payload.email,
        name=payload.name,
        verification_token=token,
    )
    db.add(subscriber)
    db.commit()
    db.refresh(subscriber)
    send_verification_email(subscriber.email, subscriber.name, token)
    return subscriber


@router.get("/verify", response_class=HTMLResponse)
def verify_email(token: str, db: Session = Depends(get_db)):
    subscriber = db.query(Subscriber).filter(Subscriber.verification_token == token).first()
    if not subscriber:
        return HTMLResponse(
            content="<h2>Invalid or expired verification link.</h2>",
            status_code=400,
        )
    subscriber.verified = True
    subscriber.verification_token = None
    db.commit()
    return HTMLResponse(content="""
    <div style="max-width:500px;margin:80px auto;font-family:system-ui,-apple-system,sans-serif;text-align:center;">
        <h1 style="color:#ea580c;">You're verified!</h1>
        <p>Thanks for confirming your email. You'll receive the CLE Local weekly digest.</p>
        <a href="http://localhost:5173" style="color:#ea580c;">Back to CLE Local</a>
    </div>
    """)


@router.delete("/")
def unsubscribe(email: str, db: Session = Depends(get_db)):
    subscriber = db.query(Subscriber).filter(Subscriber.email == email).first()
    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    subscriber.is_active = False
    db.commit()
    return {"detail": "Unsubscribed"}


@router.get("/", response_model=list[SubscriberRead])
def list_subscribers(db: Session = Depends(get_db)):
    return (
        db.query(Subscriber)
        .filter(Subscriber.is_active == True, Subscriber.verified == True)
        .order_by(Subscriber.subscribed_at)
        .all()
    )
