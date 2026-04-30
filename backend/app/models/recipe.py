from datetime import datetime

from sqlalchemy import Integer, String, Text, DateTime, Boolean, Float, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Recipe(Base):
    __tablename__ = "recipes"
    __table_args__ = (
        UniqueConstraint("source", "external_id", name="uq_recipes_source_external_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    external_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    source_url: Mapped[str] = mapped_column(String(2000), nullable=False)
    source_attribution: Mapped[str | None] = mapped_column(String(200), nullable=True)

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    short_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(2000), nullable=True)

    cuisine: Mapped[str | None] = mapped_column(String(100), nullable=True)
    region: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)

    prep_time_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cook_time_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    difficulty: Mapped[str | None] = mapped_column(String(20), nullable=True)
    rating: Mapped[float | None] = mapped_column(Float, nullable=True)

    status: Mapped[str] = mapped_column(String(20), default="draft", nullable=False, index=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<Recipe {self.title}>"
