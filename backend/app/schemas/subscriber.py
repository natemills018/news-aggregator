from datetime import datetime

from pydantic import BaseModel, EmailStr


class SubscriberCreate(BaseModel):
    email: EmailStr
    name: str | None = None


class SubscriberRead(BaseModel):
    id: int
    email: str
    name: str | None
    is_active: bool
    verified: bool
    subscribed_at: datetime

    model_config = {"from_attributes": True}
