from pydantic import BaseModel


class VenueCreate(BaseModel):
    name: str
    address: str
    venue_type: str
    latitude: float | None = None
    longitude: float | None = None
    website: str | None = None


class VenueRead(BaseModel):
    id: int
    name: str
    address: str
    venue_type: str
    latitude: float | None
    longitude: float | None
    website: str | None

    model_config = {"from_attributes": True}
