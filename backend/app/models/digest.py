from datetime import datetime

from sqlalchemy import Integer, String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Digest(Base):
    __tablename__ = "digests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    sent_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    subject: Mapped[str] = mapped_column(String(500), nullable=False)
    intro_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    html_content: Mapped[str] = mapped_column(Text, nullable=False)
    plain_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    item_count: Mapped[int] = mapped_column(Integer, default=0)

    def __repr__(self) -> str:
        return f"<Digest {self.subject}>"
