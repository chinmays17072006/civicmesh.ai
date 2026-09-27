from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from datetime import datetime

from database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)

    report_id = Column(String, unique=True, index=True)
    incident_id = Column(String, index=True)

    description = Column(Text)
    issue_type = Column(String)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    location_text = Column(String, nullable=True)

    evidence = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)

    incident_id = Column(String, unique=True, index=True)

    title = Column(String)
    description = Column(Text)

    issue_type = Column(String)

    priority = Column(String, default="MEDIUM")
    priority_score = Column(Integer, default=0)

    fusion_confidence = Column(Float, default=0)

    semantic_similarity = Column(Float, default=0)
    geographic_proximity = Column(Float, default=0)
    contextual_consistency = Column(Float, default=0)

    evidence_summary = Column(Text, nullable=True)

    routing_department = Column(String, nullable=True)
    routing_confidence = Column(Float, default=0)

    response_plan = Column(Text, nullable=True)

    approval_status = Column(
        String,
        default="PENDING"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)

    incident_id = Column(String, index=True)

    agent_name = Column(String)
    action = Column(String)

    result = Column(Text)

    confidence = Column(Float, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )