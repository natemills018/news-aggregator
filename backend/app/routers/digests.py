from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.digest import Digest
from app.schemas.digest import DigestSummary, DigestDetail

router = APIRouter(prefix="/digests", tags=["digests"])


@router.get("/", response_model=list[DigestSummary])
def list_digests(
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    """List past digests in reverse chronological order."""
    return (
        db.query(Digest)
        .order_by(Digest.sent_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/{digest_id}", response_model=DigestDetail)
def get_digest(digest_id: int, db: Session = Depends(get_db)):
    """Get a single digest by ID with full content."""
    digest = db.query(Digest).filter(Digest.id == digest_id).first()
    if not digest:
        raise HTTPException(status_code=404, detail="Digest not found")
    return digest
