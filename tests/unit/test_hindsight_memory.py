import pytest
from engine.memory.hindsight import (
    hindsight_memory,
    runbook_generator,
    HindsightMemoryManager,
)

def test_hindsight_retain_and_recall():
    memory = HindsightMemoryManager()

    # Retain Incident 1
    record = memory.retain(
        incident_id="inc-101",
        project_path="/projects/checkout",
        error_type="TypeError",
        error_message="Cannot read properties of undefined (reading 'data')",
        category="NULL_POINTER",
        root_cause_summary="Payment response object was accessed before validating API response.",
        recommended_fix_strategy="Add optional chaining guard clause.",
        affected_file="checkout.js",
        line_number=87,
        function_name="processResponse",
        unified_diff="--- a/checkout.js\n+++ b/checkout.js\n@@ -87,1 +87,2 @@\n-const data = res.data;\n+const data = res?.data;\n",
        verification_status="REPAIR VERIFIED"
    )

    assert record.incident_id == "inc-101"
    assert record.runbook_id is not None

    # Recall Incident when similar error occurs
    recall_res = memory.recall(
        error_type="TypeError",
        error_message="Cannot read properties of undefined (reading 'data')",
        affected_file="checkout.js",
        category="NULL_POINTER"
    )

    assert recall_res.matches_found == 1
    assert recall_res.matched_records[0].incident_id == "inc-101"
    assert recall_res.matched_records[0].similarity_score > 0.8
    assert recall_res.suggested_runbook is not None

def test_hindsight_reflect():
    memory = HindsightMemoryManager()

    memory.retain(
        incident_id="inc-101",
        project_path="/app",
        error_type="DatabaseError",
        error_message="Connection pool exhausted",
        category="DATABASE",
        root_cause_summary="Connection leak in query worker",
        recommended_fix_strategy="Increase pool size and close idle connections",
        affected_file="db.py"
    )

    memory.retain(
        incident_id="inc-102",
        project_path="/app",
        error_type="DatabaseError",
        error_message="Connection timeout waiting for pool",
        category="DATABASE",
        root_cause_summary="Connection pool exhausted during peak load",
        recommended_fix_strategy="Adjust max_overflow settings",
        affected_file="db.py"
    )

    reflect_summary = memory.reflect()

    assert reflect_summary.total_incidents_recorded == 2
    assert reflect_summary.top_failing_categories["DATABASE"] == 2
    assert reflect_summary.top_affected_files["db.py"] == 2
    assert any("DATABASE" in p for p in reflect_summary.recurring_patterns)
