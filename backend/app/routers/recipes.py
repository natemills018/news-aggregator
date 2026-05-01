from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import SessionLocal, get_db
from app.auth import require_admin
from app.models import Recipe, FetchJob
from app.schemas.recipe import RecipeRead, RecipeUpdate
from app.services.spoonacular import REGION_CUISINES, fetch_recipes_for_region

public_router = APIRouter(prefix="/recipes", tags=["recipes"])
admin_router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@public_router.get("/", response_model=list[RecipeRead])
def list_recipes(
    region: str | None = None,
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db),
):
    """Public: approved recipes only, optionally filtered by region."""
    query = db.query(Recipe).filter(Recipe.status == "approved")
    if region:
        query = query.filter(Recipe.region == region)
    return query.order_by(Recipe.created_at.desc()).limit(limit).all()


def _run_spoonacular_fetch(job_id: int, region: str, count: int) -> None:
    """Background worker: pull recipes for a region and update the job row."""
    db = SessionLocal()
    try:
        job = db.query(FetchJob).filter(FetchJob.id == job_id).first()
        if not job:
            return
        try:
            result = fetch_recipes_for_region(db, region=region, count=count)
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


@admin_router.get("/regions")
def list_regions():
    """Available regions for the curation UI dropdown."""
    return [{"name": name, "cuisines": cuisines} for name, cuisines in REGION_CUISINES.items()]


@admin_router.post("/fetch-recipes")
def fetch_recipes(
    background_tasks: BackgroundTasks,
    region: str = Query(..., description="Regional theme — see /admin/regions"),
    count: int = Query(default=10, ge=1, le=25),
    db: Session = Depends(get_db),
):
    """Kick off a Spoonacular fetch in the background. Returns a job id to poll."""
    if region not in REGION_CUISINES:
        raise HTTPException(status_code=400, detail=f"Unknown region: {region}")

    job = FetchJob(status="running", source="spoonacular")
    db.add(job)
    db.commit()
    db.refresh(job)
    background_tasks.add_task(_run_spoonacular_fetch, job.id, region, count)
    return {"job_id": job.id, "status": job.status, "region": region}


@admin_router.get("/fetch-recipes/{job_id}")
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


@admin_router.get("/drafts", response_model=list[RecipeRead])
def list_drafts(db: Session = Depends(get_db)):
    """All draft recipes for curation."""
    return (
        db.query(Recipe)
        .filter(Recipe.status == "draft")
        .order_by(Recipe.created_at.desc())
        .all()
    )


@admin_router.get("/recipes", response_model=list[RecipeRead])
def list_all_recipes(status: str | None = None, db: Session = Depends(get_db)):
    """List recipes, optionally filtered by status."""
    query = db.query(Recipe)
    if status:
        query = query.filter(Recipe.status == status)
    return query.order_by(Recipe.created_at.desc()).all()


@admin_router.patch("/recipes/{recipe_id}", response_model=RecipeRead)
def update_recipe(recipe_id: int, payload: RecipeUpdate, db: Session = Depends(get_db)):
    """Edit a recipe — approve, skip, mark as standout, tweak fields."""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    update_data = payload.model_dump(exclude_unset=True)

    # Only one featured (standout) recipe at a time
    if update_data.get("is_featured"):
        db.query(Recipe).filter(
            Recipe.is_featured.is_(True), Recipe.id != recipe_id
        ).update({"is_featured": False})

    for key, value in update_data.items():
        if key in {"image_url"} and value is not None:
            value = str(value)
        setattr(recipe, key, value)

    db.commit()
    db.refresh(recipe)
    return recipe


@admin_router.delete("/recipes/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    """Permanently delete a recipe."""
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    db.delete(recipe)
    db.commit()
    return {"detail": "Deleted"}
