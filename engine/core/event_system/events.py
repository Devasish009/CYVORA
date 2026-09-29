from enum import Enum
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
import time
import uuid

class EventType(str, Enum):
    SESSION_CREATED = "SESSION_CREATED"
    STATE_TRANSITION = "STATE_TRANSITION"
    TASK_CREATED = "TASK_CREATED"
    TASK_STARTED = "TASK_STARTED"
    TASK_COMPLETED = "TASK_COMPLETED"
    TASK_FAILED = "TASK_FAILED"
    SECURITY_CHECK_PASSED = "SECURITY_CHECK_PASSED"
    SECURITY_CHECK_FAILED = "SECURITY_CHECK_FAILED"
    WORKFLOW_STEP_COMPLETED = "WORKFLOW_STEP_COMPLETED"
    AUDIT_EVENT = "AUDIT_EVENT"

class EngineEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: float = Field(default_factory=time.time)
    session_id: str
    event_type: EventType
    sender: str
    message: str
    payload: Dict[str, Any] = Field(default_factory=dict)
