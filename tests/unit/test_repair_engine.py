import os
import pytest
from engine.repair.diff_engine.diff_engine import DiffEngine
from engine.repair.patch_manager.patch_manager import PatchManager
from engine.agents.investigation_agent.investigation_agent import InvestigationAgent, InvestigationReport
from engine.agents.root_cause_agent.root_cause_agent import RootCauseAgent
from engine.agents.repair_agent.repair_agent import RepairAgent
from engine.analyzers.error_analyzer.error_models import StructuredError, ErrorCategory
from engine.analyzers.error_analyzer.fault_localizer import FaultLocation

SAMPLE_ORIGINAL = """def process_user(user):\n    return user.name\n"""

def test_diff_engine_create_and_apply(tmp_path):
    target_file = tmp_path / "user.py"
    target_file.write_text(SAMPLE_ORIGINAL)

    patched_content = """def process_user(user):\n    if not user:\n        return None\n    return user.name\n"""

    engine = DiffEngine()
    patch = engine.create_patch(
        target_file="user.py",
        original_content=SAMPLE_ORIGINAL,
        patched_content=patched_content,
        candidate_id="cand-1"
    )

    assert "a/user.py" in patch.diff_text
    assert "+    if not user:" in patch.diff_text

    manager = PatchManager()
    success = manager.apply_candidate(str(target_file), patch)
    assert success is True
    assert target_file.read_text() == patched_content

    # Rollback
    manager.rollback_candidate(str(target_file))
    assert target_file.read_text() == SAMPLE_ORIGINAL

def test_repair_agents_workflow(tmp_path):
    target_file = tmp_path / "sample.py"
    target_file.write_text(SAMPLE_ORIGINAL)

    error = StructuredError(
        error_type="AttributeError",
        message="'NoneType' object has no attribute 'name'",
        category=ErrorCategory.NULL_POINTER,
        file_path="sample.py",
        line_number=2
    )

    loc = FaultLocation(
        file_path="sample.py",
        line_number=2,
        function_name="process_user",
        confidence=0.95
    )

    inv_agent = InvestigationAgent()
    report = inv_agent.investigate("sess-1", error, loc, str(tmp_path))

    assert "sample.py" in report.investigation_summary

    rc_agent = RootCauseAgent()
    diagnosis = rc_agent.diagnose(report)

    assert "Null/Undefined property access" in diagnosis.primary_cause

    repair_agent = RepairAgent()
    plan = repair_agent.plan_and_generate(report, diagnosis, str(tmp_path))

    assert len(plan.proposed_candidates) > 0
    assert plan.proposed_candidates[0].candidate_id == "cand-A"
