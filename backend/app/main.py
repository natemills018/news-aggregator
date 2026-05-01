from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine, SessionLocal
from app.models import FetchJob
from app.routers import subscribers, digests, recipes
from app.seed import seed_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_data(db)
        # Mark any job left running from a prior process as errored.
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


app = FastAPI(title="The CLE Brief", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(subscribers.router)
app.include_router(digests.router)
app.include_router(recipes.public_router)
app.include_router(recipes.admin_router)


@app.get("/health")
def health():
    return {"status": "ok"}
