from typing import TypedDict, Annotated, Optional, List, Dict, Any
from langgraph.graph.message import add_messages
from pydantic import BaseModel
import enum


class Domain(str, enum.Enum):
    LEGAL = "legal"
    CYBER = "cyber"
    SAFETY = "safety"
    BUSINESS = "business"
    UNKNOWN = "unknown"


class Urgency(str, enum.Enum):
    EMERGENCY = "emergency"   # file today, active incident
    HIGH = "high"             # within 48 hours
    NORMAL = "normal"         # standard turnaround
    LOW = "low"               # research only


class HumanGateStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    REVISION_REQUESTED = "revision_requested"


# ─── Core Graph State ────────────────────────────────────────────────────────

class GraphState(TypedDict):
    # Identity
    session_id: str
    user_id: Optional[str]
    thread_id: str

    # Input
    query: str
    domain: Optional[str]           # Domain enum value
    urgency: Optional[str]          # Urgency enum value

    # Extracted entities (Intake node output)
    entities: Optional[Dict[str, Any]]      # names, dates, courts, statutes
    case_summary: Optional[str]

    # Research (Research node output)
    research_memo: Optional[str]
    citations: Optional[List[str]]
    similar_cases: Optional[List[Dict]]

    # Analysis outputs
    constitutional_memo: Optional[str]      # Legal: Charter analysis
    threat_profile: Optional[Dict]          # Cyber: enriched threat data
    incident_report: Optional[Dict]         # Safety: triage report

    # Strategy
    strategy_options: Optional[List[Dict]]  # [{approach, pros, cons, recommendation}]
    recommended_strategy: Optional[str]

    # Draft
    draft_document: Optional[str]
    document_type: Optional[str]    # motion, affidavit, demand_letter, incident_report, etc.

    # Review
    review_memo: Optional[str]
    red_flags: Optional[List[str]]
    compliance_score: Optional[float]       # 0.0 - 1.0

    # Human gate
    human_gate_status: Optional[str]        # HumanGateStatus value
    human_feedback: Optional[str]
    human_approved_by: Optional[str]
    human_approved_at: Optional[str]

    # Delivery
    final_document: Optional[str]
    delivery_log: Optional[List[str]]

    # Self-improvement
    self_review: Optional[str]
    lessons_learned: Optional[List[str]]

    # Error handling
    error: Optional[str]
    retry_count: int

    # Message history (LangGraph managed)
    messages: Annotated[List, add_messages]


# ─── API Request / Response Models ───────────────────────────────────────────

class RunRequest(BaseModel):
    query: str
    user_id: Optional[str] = None
    domain_hint: Optional[str] = None      # override auto-classification
    urgency: Optional[str] = "normal"


class RunResponse(BaseModel):
    thread_id: str
    session_id: str
    status: str                             # running, paused, complete, error
    current_node: Optional[str] = None
    message: Optional[str] = None


class HumanGateInput(BaseModel):
    action: str                             # approve, reject, revision
    feedback: Optional[str] = None
    edited_document: Optional[str] = None
    approved_by: str


class StateResponse(BaseModel):
    thread_id: str
    status: str
    domain: Optional[str]
    current_node: Optional[str]
    draft_document: Optional[str]
    human_gate_status: Optional[str]
    error: Optional[str]
    complete: bool
