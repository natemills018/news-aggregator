from datetime import datetime

from pydantic import BaseModel, HttpUrl


class RecipeBase(BaseModel):
    title: str
    short_description: str | None = None
    summary: str | None = None
    ingredients: list[str] | None = None
    image_url: HttpUrl | None = None
    source_url: HttpUrl
    source_attribution: str | None = None
    cuisine: str | None = None
    region: str | None = None
    prep_time_minutes: int | None = None
    cook_time_minutes: int | None = None
    difficulty: str | None = None
    rating: float | None = None


class RecipeCreate(RecipeBase):
    external_id: str
    source: str


class RecipeUpdate(BaseModel):
    title: str | None = None
    short_description: str | None = None
    image_url: HttpUrl | None = None
    cuisine: str | None = None
    region: str | None = None
    prep_time_minutes: int | None = None
    cook_time_minutes: int | None = None
    difficulty: str | None = None
    rating: float | None = None
    status: str | None = None
    is_featured: bool | None = None


class RecipeRead(RecipeBase):
    id: int
    external_id: str
    source: str
    status: str
    is_featured: bool
    created_at: datetime

    model_config = {"from_attributes": True}
