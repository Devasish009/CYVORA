from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
import time
import uuid

class SessionState(str, Enum):
    INITIALIZED = "INITIALIZED"
    SCANNING = "SCANNING"
    ANALYZING = "ANALYZING"
    INVESTIGATING = "INVESTIGATING"
    PLANNING_FIX = "PLANNING_FIX"
    APPLYING_FIX = "APPLYING_FIX"
    VALIDATING = "VALIDATING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    ROLLING_BACK = "ROLLING_BACK"

class StateTransitionError(ValueError):
    """Raised when an invalid session state transition is attempted."""
    pass

class StateMachine:
    """Enforces strict state transitions according to CYVORA lifecycle rules."""

    ALLOWED_TRANSITIONS: Dict[SessionState, List[SessionState]] = {
        SessionState.INITIALIZED: [SessionState.SCANNING, SessionState.FAILED],
        SessionState.SCANNING: [SessionState.ANALYZING, SessionState.FAILED],
        SessionState.ANALYZING: [SessionState.INVESTIGATING, SessionState.FAILED],
        SessionState.INVESTIGATING: [SessionState.PLANNING_FIX, SessionState.FAILED],
        SessionState.PLANNING_FIX: [SessionState.APPLYING_FIX, SessionState.FAILED],
        SessionState.APPLYING_FIX: [SessionState.VALIDATING, SessionState.FAILED],
        SessionState.VALIDATING: [SessionState.SUCCESS, SessionState.FAILED],
        SessionState.FAILED: [SessionState.ROLLING_BACK],
        SessionState.ROLLING_BACK: [SessionState.INVESTIGATING, SessionState.FAILED],
        SessionState.SUCCESS: [],  # Terminal state
    }

    @classmethod
    def validate_transition(cls, current_state: SessionState, target_state: SessionState):
        allowed = cls.ALLOWED_TRANSITIONS.get(current_state, [])
        if target_state not in allowed:
            raise StateTransitionError(
                f"Invalid state transition: Cannot transition from '{current_state.value}' to '{target_state.value}'. "
                f"Allowed target states: {[s.value for s in allowed]}"
            )

class StateTransitionRecord(BaseModel):
    from_state: SessionState
    to_state: SessionState
    timestamp: float = Field(default_factory=time.time)
    reason: Optional[str] = None

class RepairSession(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_path: str
    target_error: Optional[str] = None
    current_state: SessionState = SessionState.INITIALIZED
    transition_history: List[StateTransitionRecord] = Field(default_factory=list)
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)
    context_data: Dict[str, Any] = Field(default_factory=dict)
