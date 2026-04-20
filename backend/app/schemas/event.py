from datetime import datetime

from pydantic import BaseModel

from .category import CategoryRead
from .venue import VenueRead


class EventCreate(BaseModel):
    title: str
    description: str | None = None
    short_description: str | None = None
    image_url: str | None = None
    source_url: str | None = None
    start_date: datetime
    end_date: datetime | None = None
    is_featured: bool = False
    is_sleeper_pick: bool = False
    status: str = "approved"
    category_id: int | None = None
    venue_id: int | None = None


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    short_description: str | None = None
    image_url: str | None = None
    source_url: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    is_featured: bool | None = None
    is_sleeper_pick: bool | None = None
    status: str | None = None
    category_id: int | None = None
    venue_id: int | None = None


class EventRead(BaseModel):
    id: int
    title: str
    description: str | None
    short_description: str | None
    image_url: str | None
    source_url: str | None
    start_date: datetime
    end_date: datetime | None
    is_featured: bool
    is_sleeper_pick: bool
    status: str
    source: str | None
    created_at: datetime
    category: CategoryRead | None
    venue: VenueRead | None

    model_config = {"from_attributes": True}
