import os
import pytest
from engine.core.orchestrator import engine_orchestrator
from engine.core.state_manager import SessionState

def test_full_project_intelligence_pipeline_integration():
    import asyncio
    async def run():
        proj_dir = os.path.abspath("./test_intel_project")
        os.makedirs(os.path.join(proj_dir, "app"), exist_ok=True)

        with open(os.path.join(proj_dir, "app", "main.py"), "w") as f:
            f.write("from app.auth import authenticate\napp = 'FastAPI()'\n")

        with open(os.path.join(proj_dir, "app", "auth.py"), "w") as f:
            f.write("def authenticate(): return True\n")

        with open(os.path.join(proj_dir, "requirements.txt"), "w") as f:
            f.write("fastapi==0.110.0\n")

        session = await engine_orchestrator.run_repair_session(
            project_path=proj_dir,
            target_error="ImportError: cannot import name 'authenticate'",
            simulate_validation_failure=False
        )

        assert session.current_state == SessionState.SUCCESS
        assert "project_inventory" in session.context_data
        inv_data = session.context_data["project_inventory"]
        assert inv_data["total_files"] >= 3
        assert "Python" in inv_data["languages"]

    asyncio.run(run())
