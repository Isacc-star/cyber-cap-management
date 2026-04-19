"""SQLAlchemy ORM models."""

from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, JSON, Boolean

from app.database import Base


class User(Base):
    __tablename__ = "users"

    username = Column(String, primary_key=True, index=True)
    hashed_password = Column(String, nullable=False)
    display_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    must_change_password = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Device(Base):
    __tablename__ = "devices"

    device_id = Column(String, primary_key=True, index=True)
    readable_name = Column(String, unique=True, nullable=False, index=True)
    serial_id = Column(String, nullable=True)
    registered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    calibration_status = Column(String, default="pending")
    calibration_date = Column(DateTime, nullable=True)
    status = Column(String, default="active")
    firmware_version = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    calibration = Column(JSON, nullable=True)
