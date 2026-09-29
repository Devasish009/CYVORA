import pytest
from engine.core.state_manager import (
    state_manager,
    SessionState,
    StateMachine,
    StateTransitionError
)

def test_session_creation():
    session = state_manager.create_session("/tmp/test_project")
    assert session.session_id is not None
    assert session.current_state == SessionState.INITIALIZED
    assert session.project_path == "/tmp/test_project"

def test_valid_state_transitions():
    session = state_manager.create_session("/tmp/test_project")
    sid = session.session_id

    state_manager.transition_state(sid, SessionState.SCANNING)
    assert session.current_state == SessionState.SCANNING

    state_manager.transition_state(sid, SessionState.ANALYZING)
    assert session.current_state == SessionState.ANALYZING

    state_manager.transition_state(sid, SessionState.INVESTIGATING)
    assert session.current_state == SessionState.INVESTIGATING

    state_manager.transition_state(sid, SessionState.PLANNING_FIX)
    assert session.current_state == SessionState.PLANNING_FIX

    state_manager.transition_state(sid, SessionState.APPLYING_FIX)
    assert session.current_state == SessionState.APPLYING_FIX

    state_manager.transition_state(sid, SessionState.VALIDATING)
    assert session.current_state == SessionState.VALIDATING

    state_manager.transition_state(sid, SessionState.SUCCESS)
    assert session.current_state == SessionState.SUCCESS

def test_invalid_state_transition_raises_error():
    session = state_manager.create_session("/tmp/test_project")
    sid = session.session_id

    # Trying to jump directly from INITIALIZED to SUCCESS must fail
    with pytest.raises(StateTransitionError):
        state_manager.transition_state(sid, SessionState.SUCCESS)

def test_failure_and_rollback_loop_transitions():
    session = state_manager.create_session("/tmp/test_project")
    sid = session.session_id

    state_manager.transition_state(sid, SessionState.SCANNING)
    state_manager.transition_state(sid, SessionState.ANALYZING)
    state_manager.transition_state(sid, SessionState.INVESTIGATING)
    state_manager.transition_state(sid, SessionState.PLANNING_FIX)
    state_manager.transition_state(sid, SessionState.APPLYING_FIX)
    state_manager.transition_state(sid, SessionState.VALIDATING)
    
    # Validation failure -> FAILED -> ROLLING_BACK -> INVESTIGATING
    state_manager.transition_state(sid, SessionState.FAILED)
    assert session.current_state == SessionState.FAILED

    state_manager.transition_state(sid, SessionState.ROLLING_BACK)
    assert session.current_state == SessionState.ROLLING_BACK

    state_manager.transition_state(sid, SessionState.INVESTIGATING)
    assert session.current_state == SessionState.INVESTIGATING
