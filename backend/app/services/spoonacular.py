import os

import httpx
from sqlalchemy.orm import Session

from app.models import Recipe

SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY", "")
BASE_URL = "https://api.spoonacular.com"

# Spoonacular cuisine -> our region label.
# The API's `cuisine` param accepts comma-separated values; we send all cuisines
# that map to a region and tag the resulting Recipe with that region.
REGION_CUISINES: dict[str, list[str]] = {
    "Southern": ["Southern", "Cajun", "Creole"],
    "Southwest": ["Southwestern", "Mexican"],
    "Northeast": ["Jewish"],
    "Midwest": ["American"],
    "West Coast": ["American"],
    "Pacific Northwest": ["American"],
}


def fetch_recipes_for_region(db: Session, region: str, count: int = 10) -> dict:
    """Fetch recipes from Spoonacular filtered by the cuisines mapped to `region`.

    Inserts new recipes as drafts. Returns counts of fetched/duplicates and
    `error` if the API call failed.
    """
    if not SPOONACULAR_API_KEY:
        return {"error": "SPOONACULAR_API_KEY not configured", "fetched": 0, "duplicates": 0}

    cuisines = REGION_CUISINES.get(region)
    if not cuisines:
        return {"error": f"Unknown region: {region}", "fetched": 0, "duplicates": 0}

    params = {
        "apiKey": SPOONACULAR_API_KEY,
        "cuisine": ",".join(cuisines),
        "number": count,
        "addRecipeInformation": "true",
        "fillIngredients": "true",
        "instructionsRequired": "true",
        "sort": "popularity",
    }

    try:
        resp = httpx.get(f"{BASE_URL}/recipes/complexSearch", params=params, timeout=20)
        resp.raise_for_status()
    except httpx.HTTPError as e:
        return {"error": str(e), "fetched": 0, "duplicates": 0}

    raw_recipes = resp.json().get("results", [])

    fetched = 0
    duplicates = 0

    for raw in raw_recipes:
        external_id = str(raw.get("id"))
        if not external_id:
            continue

        existing = (
            db.query(Recipe)
            .filter(Recipe.source == "spoonacular", Recipe.external_id == external_id)
            .first()
        )
        if existing:
            duplicates += 1
            continue

        source_url = raw.get("sourceUrl") or raw.get("spoonacularSourceUrl")
        if not source_url:
            continue

        cuisines_list = raw.get("cuisines") or []
        cuisine = cuisines_list[0] if cuisines_list else None

        rating = None
        spoon_score = raw.get("spoonacularScore")
        if isinstance(spoon_score, (int, float)):
            rating = round(spoon_score / 20, 2)  # 0-100 -> 0-5

        full_summary = _strip_html(raw.get("summary"))
        ingredients = [
            ing["original"].strip()
            for ing in (raw.get("extendedIngredients") or [])
            if isinstance(ing, dict) and ing.get("original")
        ]

        recipe = Recipe(
            external_id=external_id,
            source="spoonacular",
            source_url=source_url,
            source_attribution=raw.get("sourceName") or raw.get("creditsText"),
            title=raw.get("title", "").strip(),
            short_description=_truncate(full_summary, 240),
            summary=full_summary,
            ingredients=ingredients or None,
            image_url=raw.get("image"),
            cuisine=cuisine,
            region=region,
            prep_time_minutes=None,
            cook_time_minutes=raw.get("readyInMinutes"),
            difficulty=None,
            rating=rating,
            status="draft",
            is_featured=False,
        )
        db.add(recipe)
        fetched += 1

    db.commit()
    return {"fetched": fetched, "duplicates": duplicates, "source": "spoonacular"}


def _truncate(text: str | None, max_len: int) -> str | None:
    if not text:
        return None
    if len(text) <= max_len:
        return text
    return text[: max_len - 1].rstrip() + "…"


def _strip_html(text: str | None) -> str | None:
    if not text:
        return None
    # Spoonacular summaries embed <a>/<b> tags; keep it simple — strip everything
    # between angle brackets. Good enough for a teaser blurb.
    out = []
    in_tag = False
    for ch in text:
        if ch == "<":
            in_tag = True
            continue
        if ch == ">":
            in_tag = False
            continue
        if not in_tag:
            out.append(ch)
    cleaned = "".join(out).strip()
    return cleaned or None
