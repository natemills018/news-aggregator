from sqlalchemy.orm import Session


def seed_data(db: Session) -> None:
    """No seed data during the recipe pivot — recipes arrive via the ingestion service."""
    return
