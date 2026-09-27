from pydantic import BaseModel
from typing import Optional


class ReportCreate(BaseModel):
    description: str

    issue_type: Optional[str] = "Unknown"

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    location_text: Optional[str] = None

    evidence: Optional[str] = None


class ReportResponse(BaseModel):
    report_id: str
    incident_id: Optional[str]

    description: str
    issue_type: str

    latitude: Optional[float]
    longitude: Optional[float]

    location_text: Optional[str]
    evidence: Optional[str]

    class Config:
        from_attributes = True


class ApprovalRequest(BaseModel):
    approved: bool

    reviewer: Optional[str] = "Human Operator"

    note: Optional[str] = None