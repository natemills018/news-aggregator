from datetime import datetime

from pydantic import BaseModel


class DigestSummary(BaseModel):
    id: int
    subject: str
    intro_text: str | None = None
    item_count: int
    sent_at: datetime

    model_config = {"from_attributes": True}


class DigestDetail(DigestSummary):
    html_content: str
    plain_content: str | None = None

    model_config = {"from_attributes": True}
