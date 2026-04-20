from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.db import Base, engine, SessionLocal
from app.models import FetchJob
from app.routers import events, venues, categories, subscribers, newsletter, digests, admin
from app.seed import seed_data


def _apply_lightweight_migrations() -> None:
    """Add columns to existing tables that create_all can't evolve.

    Keeps dev schema in sync without an Alembic setup — each statement is
    idempotent via IF NOT EXISTS so restarts are safe.
    """
    with engine.begin() as conn:
        conn.execute(text(
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS is_sleeper_pick BOOLEAN NOT NULL DEFAULT FALSE"
        ))


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables and seed on startup
    Base.metadata.create_all(bind=engine)
    _apply_lightweight_migrations()
    db = SessionLocal()
    try:
        seed_data(db)
        # Any job still marked "running" at startup is orphaned from a prior process.
        stale = db.query(FetchJob).filter(FetchJob.status == "running").all()
        for job in stale:
            job.status = "error"
            job.error = "Backend restarted before fetch completed"
            job.finished_at = datetime.utcnow()
        if stale:
            db.commit()
    finally:
        db.close()
    yield


app = FastAPI(title="CLE Local", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events.router)
app.include_router(venues.router)
app.include_router(categories.router)
app.include_router(subscribers.router)
app.include_router(newsletter.router)
app.include_router(digests.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"status": "ok"}
