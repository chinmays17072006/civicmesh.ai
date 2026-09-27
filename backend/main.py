from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import Report, Incident, AuditLog
from schemas import (
    ReportCreate,
    ReportResponse,
    ApprovalRequest
)

from datetime import datetime
import json
import math
import uuid


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="CivicMesh API",
    description="Evidence-First Civic Incident Intelligence",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DEMO AGENTS
# ============================================================

AGENTS = [
    "Intake Agent",
    "Evidence Agent",
    "Fusion Agent",
    "Priority Agent",
    "Routing Agent",
    "Response Planner",
    "Review Agent"
]


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def generate_report_id():
    return "RPT-" + uuid.uuid4().hex[:6].upper()


def calculate_distance(lat1, lon1, lat2, lon2):

    if None in [lat1, lon1, lat2, lon2]:
        return None

    lat1 = math.radians(lat1)
    lat2 = math.radians(lat2)

    dlat = lat2 - lat1
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2
        +
        math.cos(lat1)
        * math.cos(lat2)
        * math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )

    return 6371 * c


def add_audit(
    db,
    incident_id,
    agent_name,
    action,
    result,
    confidence=None
):

    log = AuditLog(
        incident_id=incident_id,
        agent_name=agent_name,
        action=action,
        result=result,
        confidence=confidence
    )

    db.add(log)
    db.commit()


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "name": "CivicMesh",
        "status": "online",
        "version": "1.0.0",
        "message": "Evidence-First Civic Incident Intelligence API"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health():

    return {
        "status": "healthy",
        "system": "CivicMesh",
        "agents_online": 7,
        "timestamp": datetime.utcnow().isoformat()
    }


# ============================================================
# GET AGENTS
# ============================================================

@app.get("/api/agents")
def get_agents():

    return {
        "agents": [
            {
                "id": 1,
                "name": "Intake Agent",
                "purpose": "Normalize citizen reports"
            },
            {
                "id": 2,
                "name": "Evidence Agent",
                "purpose": "Extract evidence and uncertainty"
            },
            {
                "id": 3,
                "name": "Fusion Agent",
                "purpose": "Find related reports"
            },
            {
                "id": 4,
                "name": "Priority Agent",
                "purpose": "Assess operational risk"
            },
            {
                "id": 5,
                "name": "Routing Agent",
                "purpose": "Determine responsible civic function"
            },
            {
                "id": 6,
                "name": "Response Planner",
                "purpose": "Create actionable response sequence"
            },
            {
                "id": 7,
                "name": "Review Agent",
                "purpose": "Check consistency and require human approval"
            }
        ]
    }


# ============================================================
# CREATE REPORT
# ============================================================

@app.post(
    "/api/reports",
    response_model=ReportResponse
)
def create_report(
    report: ReportCreate,
    db: Session = Depends(get_db)
):

    report_id = generate_report_id()

    new_report = Report(
        report_id=report_id,
        incident_id=None,
        description=report.description,
        issue_type=report.issue_type,
        latitude=report.latitude,
        longitude=report.longitude,
        location_text=report.location_text,
        evidence=report.evidence
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return new_report


# ============================================================
# GET ALL REPORTS
# ============================================================

@app.get("/api/reports")
def get_reports(
    db: Session = Depends(get_db)
):

    reports = (
        db.query(Report)
        .order_by(Report.created_at.desc())
        .all()
    )

    return {
        "count": len(reports),
        "reports": [
            {
                "report_id": r.report_id,
                "incident_id": r.incident_id,
                "description": r.description,
                "issue_type": r.issue_type,
                "location_text": r.location_text,
                "latitude": r.latitude,
                "longitude": r.longitude,
                "evidence": r.evidence,
                "created_at": r.created_at.isoformat()
                if r.created_at else None
            }
            for r in reports
        ]
    }


# ============================================================
# GET ALL INCIDENTS
# ============================================================

@app.get("/api/incidents")
def get_incidents(
    db: Session = Depends(get_db)
):

    incidents = (
        db.query(Incident)
        .order_by(Incident.created_at.desc())
        .all()
    )

    return {
        "count": len(incidents),
        "incidents": [
            {
                "incident_id": i.incident_id,
                "title": i.title,
                "description": i.description,
                "issue_type": i.issue_type,
                "priority": i.priority,
                "priority_score": i.priority_score,
                "fusion_confidence": i.fusion_confidence,
                "routing_department": i.routing_department,
                "routing_confidence": i.routing_confidence,
                "approval_status": i.approval_status
            }
            for i in incidents
        ]
    }


# ============================================================
# GET SINGLE INCIDENT
# ============================================================

@app.get("/api/incidents/{incident_id}")
def get_incident(
    incident_id: str,
    db: Session = Depends(get_db)
):

    incident = (
        db.query(Incident)
        .filter(
            Incident.incident_id == incident_id
        )
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    report_count = (
        db.query(Report)
        .filter(
            Report.incident_id == incident_id
        )
        .count()
    )

    return {
        "incident_id": incident.incident_id,
        "title": incident.title,
        "description": incident.description,
        "issue_type": incident.issue_type,

        "priority": {
            "level": incident.priority,
            "score": incident.priority_score
        },

        "fusion": {
            "confidence": incident.fusion_confidence,
            "semantic_similarity": incident.semantic_similarity,
            "geographic_proximity": incident.geographic_proximity,
            "contextual_consistency": incident.contextual_consistency,
            "reports_fused": report_count
        },

        "evidence": incident.evidence_summary,

        "routing": {
            "department": incident.routing_department,
            "confidence": incident.routing_confidence
        },

        "response_plan": json.loads(
            incident.response_plan
        )
        if incident.response_plan
        else [],

        "approval": {
            "status": incident.approval_status
        },

        "created_at": incident.created_at.isoformat()
        if incident.created_at else None,

        "updated_at": incident.updated_at.isoformat()
        if incident.updated_at else None
    }


# ============================================================
# CREATE DEMO INCIDENT
# ============================================================

@app.post("/api/demo/setup")
def setup_demo(
    db: Session = Depends(get_db)
):

    existing = (
        db.query(Incident)
        .filter(
            Incident.incident_id == "CM-0142"
        )
        .first()
    )

    if existing:

        return {
            "message": "Demo incident already exists",
            "incident_id": "CM-0142"
        }

    incident = Incident(
        incident_id="CM-0142",
        title="Deep pothole near University Gate",
        description=(
            "Deep pothole near the university gate. "
            "Water is collecting inside and vehicles are swerving."
        ),
        issue_type="Road Damage",

        priority="HIGH",
        priority_score=82,

        fusion_confidence=94,
        semantic_similarity=94,
        geographic_proximity=91,
        contextual_consistency=88,

        evidence_summary=(
            "Road damage detected. Water accumulation reported. "
            "Vehicle swerving indicates a safety signal. "
            "Multiple related citizen observations support the incident."
        ),

        routing_department="Road Maintenance",
        routing_confidence=96,

        response_plan=json.dumps([
            "Verify incident location",
            "Inspect reported road damage",
            "Coordinate maintenance response",
            "Reassess after intervention"
        ]),

        approval_status="PENDING"
    )

    db.add(incident)
    db.commit()

    # --------------------------------------------------------
    # DEMO REPORTS
    # --------------------------------------------------------

    demo_reports = [
        (
            "Deep pothole near university gate",
            "Road Damage",
            "University Gate",
            "Visible deep road depression"
        ),
        (
            "Water collecting inside pothole",
            "Road Damage",
            "University Gate",
            "Standing water"
        ),
        (
            "Cars swerving around damaged road",
            "Road Safety",
            "University Gate",
            "Vehicle swerving"
        ),
        (
            "Large road damage near gate",
            "Road Damage",
            "University Gate",
            "Road surface damage"
        ),
        (
            "Pothole causing traffic disruption",
            "Road Safety",
            "University Gate",
            "Traffic obstruction"
        ),
        (
            "Waterlogged section of road",
            "Waterlogging",
            "University Gate",
            "Water accumulation"
        ),
        (
            "Unsafe road condition near campus",
            "Road Safety",
            "University Gate",
            "Safety concern"
        )
    ]

    for index, item in enumerate(demo_reports, start=1):

        demo = Report(
            report_id=f"RPT-{index:04d}",
            incident_id="CM-0142",
            description=item[0],
            issue_type=item[1],
            location_text=item[2],
            evidence=item[3]
        )

        db.add(demo)

    db.commit()

    add_audit(
        db,
        "CM-0142",
        "System",
        "Demo initialized",
        "7 related citizen reports created",
        94
    )

    return {
        "message": "CivicMesh demo initialized",
        "incident_id": "CM-0142",
        "reports_created": 7
    }


# ============================================================
# RUN AGENT PIPELINE
# ============================================================

@app.post("/api/incidents/{incident_id}/run")
def run_pipeline(
    incident_id: str,
    db: Session = Depends(get_db)
):

    incident = (
        db.query(Incident)
        .filter(
            Incident.incident_id == incident_id
        )
        .first()
    )

    if not incident:

        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    reports = (
        db.query(Report)
        .filter(
            Report.incident_id == incident_id
        )
        .all()
    )

    # ========================================================
    # 1. INTAKE AGENT
    # ========================================================

    add_audit(
        db,
        incident_id,
        "Intake Agent",
        "Normalize reports",
        f"{len(reports)} observations structured",
        97
    )

    # ========================================================
    # 2. EVIDENCE AGENT
    # ========================================================

    evidence_items = []

    for report in reports:

        if report.evidence:
            evidence_items.append(
                report.evidence
            )

        if report.description:
            description = report.description.lower()

            if "water" in description:
                evidence_items.append(
                    "Water accumulation"
                )

            if "swer" in description:
                evidence_items.append(
                    "Vehicle swerving"
                )

            if "pothole" in description:
                evidence_items.append(
                    "Road damage"
                )

    evidence_items = list(
        dict.fromkeys(evidence_items)
    )

    incident.evidence_summary = (
        "Evidence signals: "
        + ", ".join(evidence_items)
        + "."
    )

    db.commit()

    add_audit(
        db,
        incident_id,
        "Evidence Agent",
        "Extract evidence",
        incident.evidence_summary,
        92
    )

    # ========================================================
    # 3. FUSION AGENT
    # ========================================================

    report_count = len(reports)

    if report_count >= 7:
        semantic = 94
        geographic = 91
        contextual = 88
        fusion = 94
    elif report_count >= 4:
        semantic = 89
        geographic = 86
        contextual = 83
        fusion = 88
    else:
        semantic = 76
        geographic = 72
        contextual = 70
        fusion = 73

    incident.semantic_similarity = semantic
    incident.geographic_proximity = geographic
    incident.contextual_consistency = contextual
    incident.fusion_confidence = fusion

    db.commit()

    add_audit(
        db,
        incident_id,
        "Fusion Agent",
        "Fuse related reports",
        f"{report_count} reports → 1 probable incident",
        fusion
    )

    # ========================================================
    # 4. PRIORITY AGENT
    # ========================================================

    severity = 80
    safety_signal = 90
    repetition = min(
        100,
        report_count * 14
    )
    evidence_consistency = 88

    priority_score = round(
        (
            severity * 0.30
            +
            safety_signal * 0.30
            +
            repetition * 0.20
            +
            evidence_consistency * 0.20
        )
    )

    if priority_score >= 75:
        priority = "HIGH"
    elif priority_score >= 50:
        priority = "MEDIUM"
    else:
        priority = "LOW"

    incident.priority_score = priority_score
    incident.priority = priority

    db.commit()

    add_audit(
        db,
        incident_id,
        "Priority Agent",
        "Assess operational risk",
        f"Priority {priority} • {priority_score}/100",
        90
    )

    # ========================================================
    # 5. ROUTING AGENT
    # ========================================================

    incident.routing_department = "Road Maintenance"
    incident.routing_confidence = 96

    db.commit()

    add_audit(
        db,
        incident_id,
        "Routing Agent",
        "Determine civic function",
        "Road Maintenance • 96%",
        96
    )

    # ========================================================
    # 6. RESPONSE PLANNER
    # ========================================================

    plan = [
        "Verify incident location",
        "Inspect reported road damage",
        "Coordinate maintenance response",
        "Reassess after intervention"
    ]

    incident.response_plan = json.dumps(plan)

    db.commit()

    add_audit(
        db,
        incident_id,
        "Response Planner",
        "Generate response plan",
        "Reviewable response sequence generated",
        91
    )

    # ========================================================
    # 7. REVIEW AGENT
    # ========================================================

    incident.approval_status = "PENDING"

    db.commit()

    add_audit(
        db,
        incident_id,
        "Review Agent",
        "Review consistency",
        "Human approval required before consequential action",
        95
    )

    return {
        "success": True,
        "incident_id": incident_id,

        "pipeline": [
            {
                "step": 1,
                "agent": "Intake Agent",
                "status": "complete"
            },
            {
                "step": 2,
                "agent": "Evidence Agent",
                "status": "complete"
            },
            {
                "step": 3,
                "agent": "Fusion Agent",
                "status": "complete"
            },
            {
                "step": 4,
                "agent": "Priority Agent",
                "status": "complete"
            },
            {
                "step": 5,
                "agent": "Routing Agent",
                "status": "complete"
            },
            {
                "step": 6,
                "agent": "Response Planner",
                "status": "complete"
            },
            {
                "step": 7,
                "agent": "Review Agent",
                "status": "complete"
            }
        ],

        "result": {
            "reports_fused": report_count,
            "fusion_confidence": fusion,
            "priority": priority,
            "priority_score": priority_score,
            "department": incident.routing_department,
            "routing_confidence": incident.routing_confidence,
            "approval_status": incident.approval_status
        }
    }


# ============================================================
# APPROVE / REJECT INCIDENT
# ============================================================

@app.post("/api/incidents/{incident_id}/approve")
def approve_incident(
    incident_id: str,
    request: ApprovalRequest,
    db: Session = Depends(get_db)
):

    incident = (
        db.query(Incident)
        .filter(
            Incident.incident_id == incident_id
        )
        .first()
    )

    if not incident:

        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    if request.approved:

        incident.approval_status = "APPROVED"

        action = "Human approval granted"

        result = (
            f"Approved by {request.reviewer}"
        )

    else:

        incident.approval_status = "REJECTED"

        action = "Human approval rejected"

        result = (
            f"Rejected by {request.reviewer}"
        )

    db.commit()

    add_audit(
        db,
        incident_id,
        "Human Operator",
        action,
        result,
        100
    )

    return {
        "success": True,
        "incident_id": incident_id,
        "approval_status": incident.approval_status,
        "reviewer": request.reviewer,
        "note": request.note
    }


# ============================================================
# AUDIT TRAIL
# ============================================================

@app.get("/api/incidents/{incident_id}/audit")
def get_audit(
    incident_id: str,
    db: Session = Depends(get_db)
):

    logs = (
        db.query(AuditLog)
        .filter(
            AuditLog.incident_id == incident_id
        )
        .order_by(
            AuditLog.created_at.asc()
        )
        .all()
    )

    return {
        "incident_id": incident_id,
        "count": len(logs),

        "audit": [
            {
                "id": log.id,
                "agent": log.agent_name,
                "action": log.action,
                "result": log.result,
                "confidence": log.confidence,
                "timestamp": log.created_at.isoformat()
                if log.created_at
                else None
            }
            for log in logs
        ]
    }


# ============================================================
# DASHBOARD SUMMARY
# ============================================================

@app.get("/api/dashboard")
def dashboard_summary(
    db: Session = Depends(get_db)
):

    incidents = db.query(Incident).all()
    reports = db.query(Report).all()

    high = len([
        i for i in incidents
        if i.priority == "HIGH"
    ])

    medium = len([
        i for i in incidents
        if i.priority == "MEDIUM"
    ])

    low = len([
        i for i in incidents
        if i.priority == "LOW"
    ])

    pending = len([
        i for i in incidents
        if i.approval_status == "PENDING"
    ])

    avg_confidence = 0

    if incidents:

        avg_confidence = round(
            sum(
                i.fusion_confidence
                for i in incidents
            )
            / len(incidents)
        )

    return {

        "active_incidents": len(incidents),

        "reports_fused": len(reports),

        "high_priority": high,

        "medium_priority": medium,

        "low_priority": low,

        "average_confidence": avg_confidence,

        "pending_approvals": pending,

        "agents_online": 7
    }


# ============================================================
# SERVER ENTRY
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )