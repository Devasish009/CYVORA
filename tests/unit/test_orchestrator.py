import pytest
import asyncio
import os
from engine.core.orchestrator import engine_orchestrator
from engine.core.state_manager import SessionState

def test_orchestrator_successful_repair_simulation():
    async def run():
        proj_dir = os.path.abspath("./example_project")
        os.makedirs(proj_dir, exist_ok=True)

        session = await engine_orchestrator.run_repair_session(
            project_path=proj_dir,
            target_error="ZeroDivisionError: division by zero",
            simulate_validation_failure=False
        )

        assert session.current_state == SessionState.SUCCESS
        assert len(session.transition_history) >= 7

    asyncio.run(run())

def test_orchestrator_failed_validation_rollback_loop():
    async def run():
        proj_dir = os.path.abspath("./example_project")
        os.makedirs(proj_dir, exist_ok=True)

        session = await engine_orchestrator.run_repair_session(
            project_path=proj_dir,
            target_error="AssertionError: expected True got False",
            simulate_validation_failure=True
        )

        # Rollback loop transitions to FAILED -> ROLLING_BACK -> INVESTIGATING
        assert session.current_state == SessionState.INVESTIGATING
        states_hit = [t.to_state for t in session.transition_history]
        assert SessionState.VALIDATING in states_hit
        assert SessionState.FAILED in states_hit
        assert SessionState.ROLLING_BACK in states_hit

    asyncio.run(run())
