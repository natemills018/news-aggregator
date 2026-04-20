from datetime import datetime

from sqlalchemy import Boolean, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    short_description: Mapped[str | None] = mapped_column(String(300), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_sleeper_pick: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default="false")
    status: Mapped[str] = mapped_column(String(20), default="approved", nullable=False)  # draft, approved, skipped
    external_id: Mapped[str | None] = mapped_column(String(200), nullable=True, unique=True)  # for deduplication
    source: Mapped[str | None] = mapped_column(String(50), nullable=True)  # ticketmaster, manual
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    category_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("categories.id"), nullable=True)
    venue_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("venues.id"), nullable=True)

    category: Mapped["Category | None"] = relationship("Category", back_populates="events")
    venue: Mapped["Venue | None"] = relationship("Venue", back_populates="events")

    def __repr__(self) -> str:
        return f"<Event {self.title}>"
