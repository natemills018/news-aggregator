import os

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.subscriber import Subscriber, generate_token
from app.schemas.subscriber import SubscriberCreate, SubscriberRead
from app.auth import require_admin
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
    base_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    return HTMLResponse(content=f"""
    <div style="max-width:500px;margin:80px auto;font-family:Inter,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;text-align:center;">
        <h1 style="font-family:'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif;color:#1B2A4A;">You're in!</h1>
        <p style="color:#5A6578;">Thanks for confirming your email. You'll get The CLE Brief every Wednesday.</p>
        <a href="{base_url}" style="color:#E85D4A;font-weight:600;text-decoration:none;">Back to The CLE Brief</a>
    </div>
    """)


@router.get("/unsubscribe", response_class=HTMLResponse)
def unsubscribe_via_link(email: str, db: Session = Depends(get_db)):
    """Unsubscribe via email link (GET request)."""
    subscriber = db.query(Subscriber).filter(Subscriber.email == email).first()
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    if not subscriber:
        return HTMLResponse(content=f"""
        <div style="max-width:500px;margin:80px auto;font-family:Inter,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;text-align:center;">
            <h1 style="font-family:'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif;color:#1B2A4A;">Hmm, we couldn't find that email.</h1>
            <p style="color:#5A6578;">That email isn't in our subscriber list.</p>
            <a href="{frontend_url}" style="color:#E85D4A;font-weight:600;text-decoration:none;">Back to The CLE Brief</a>
        </div>
        """, status_code=404)
    subscriber.is_active = False
    db.commit()
    return HTMLResponse(content=f"""
    <div style="max-width:500px;margin:80px auto;font-family:Inter,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;text-align:center;">
        <h1 style="font-family:'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif;color:#1B2A4A;">You've been unsubscribed.</h1>
        <p style="color:#5A6578;">We're sorry to see you go. No more emails from us.</p>
        <p style="color:#5A6578;margin-top:16px;">Changed your mind? <a href="{frontend_url}/#subscribe" style="color:#E85D4A;font-weight:600;text-decoration:none;">Re-subscribe</a></p>
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


@router.get("/", response_model=list[SubscriberRead], dependencies=[Depends(require_admin)])
def list_subscribers(db: Session = Depends(get_db)):
    return (
        db.query(Subscriber)
        .filter(Subscriber.is_active == True, Subscriber.verified == True)
        .order_by(Subscriber.subscribed_at)
        .all()
    )
