from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class TicketType(str, Enum):
    BUG = "bug"
    FEATURE = "feature"
    STORY = "story"
    EPIC = "epic"

class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Phase(str, Enum):
    ANALYSIS = "analysis"
    TODO = "todo"
    ON_HOLD = "on_hold"
    IN_DEVELOPMENT = "in_development"
    DEV_TESTING = "dev_testing"
    QA_TESTING = "qa_testing"
    DONE = "done"

class AcceptanceCriteria(BaseModel):
    id: str
    text: str
    completed: bool = False

class Comment(BaseModel):
    id: str
    author_id: str
    author_name: str
    content: str
    created_at: str

class ActivityLog(BaseModel):
    id: str
    user_id: str
    user_name: str
    action: str
    created_at: str

class TicketCreate(BaseModel):
    title: str
    ticket_type: TicketType
    priority: Priority
    phase: Phase = Phase.ANALYSIS
    user_story: Optional[str] = None
    acceptance_criteria: Optional[List[AcceptanceCriteria]] = []
    developer_id: Optional[str] = None
    assignee_id: Optional[str] = None
    qa_required: bool = False
    qa_tester_id: Optional[str] = None
    time_taken: Optional[float] = None
    time_unit: Optional[str] = "hours"
    sprint: Optional[str] = None
    fix_version: Optional[str] = None

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    ticket_type: Optional[TicketType] = None
    priority: Optional[Priority] = None
    phase: Optional[Phase] = None
    user_story: Optional[str] = None
    acceptance_criteria: Optional[List[AcceptanceCriteria]] = None
    developer_id: Optional[str] = None
    assignee_id: Optional[str] = None
    qa_required: Optional[bool] = None
    qa_tester_id: Optional[str] = None
    time_taken: Optional[float] = None
    time_unit: Optional[str] = None
    sprint: Optional[str] = None
    fix_version: Optional[str] = None
    comment: Optional[str] = None

class TicketResponse(TicketCreate):
    id: str
    ticket_number: str
    comments: List[Comment] = []
    activity_log: List[ActivityLog] = []
    created_at: str
    updated_at: str
    created_by: str