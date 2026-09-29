import time
from typing import Dict, Optional, Any
from engine.core.state_manager.session_models import (
    RepairSession,
    SessionState,
    StateMachine,
    StateTransitionRecord,
    StateTransitionError
)
from engine.core.logging import logger

class StateManager:
    """Manages active repair sessions and transition persistence."""

    def __init__(self):
        self._sessions: Dict[str, RepairSession] = {}

    def create_session(self, project_path: str, target_error: Optional[str] = None) -> RepairSession:
        session = RepairSession(
            project_path=project_path,
            target_error=target_error
        )
        self._sessions[session.session_id] = session
        logger.info(f"Created RepairSession: ID={session.session_id} Path={project_path}")
        return session

    def get_session(self, session_id: str) -> Optional[RepairSession]:
        return self._sessions.get(session_id)

    def transition_state(self, session_id: str, target_state: SessionState, reason: Optional[str] = None) -> RepairSession:
        session = self.get_session(session_id)
        if not session:
            raise ValueError(f"RepairSession with ID '{session_id}' not found.")

        # Enforce state machine rules
        StateMachine.validate_transition(session.current_state, target_state)

        record = StateTransitionRecord(
            from_state=session.current_state,
            to_state=target_state,
            reason=reason
        )
        
        logger.info(f"[SESSION {session_id}] State transition: {session.current_state.value} -> {target_state.value} (Reason: {reason or 'N/A'})")
        
        session.current_state = target_state
        session.transition_history.append(record)
        session.updated_at = time.time()
        return session

    def update_context(self, session_id: str, key: str, value: Any):
        session = self.get_session(session_id)
        if session:
            session.context_data[key] = value
            session.updated_at = time.time()

state_manager = StateManager()
