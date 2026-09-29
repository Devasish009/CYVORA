import time
import uuid
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from engine.memory.hindsight.hindsight_models import HindsightRecord

class Runbook(BaseModel):
    runbook_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)
    title: str
    category: str
    symptoms: List[str]
    investigation_steps: List[str]
    likely_root_cause: str
    resolution_steps: List[str]
    verification_checks: List[str]
    times_reused: int = 1

class RunbookGenerator:
    """Generates and updates operational runbooks automatically from successful incident resolutions."""

    def __init__(self):
        self._runbooks: Dict[str, Runbook] = {}

    def generate_or_update(self, record: HindsightRecord) -> Runbook:
        # Check if matching runbook already exists for this category and affected file
        existing = self._find_matching_runbook(record.category, record.affected_file)
        if existing:
            existing.updated_at = time.time()
            existing.times_reused += 1
            if record.root_cause_summary not in existing.likely_root_cause:
                existing.likely_root_cause += f" | {record.root_cause_summary}"
            return existing

        # Create new Runbook
        title = f"RUNBOOK: Resolving {record.error_type} in {record.affected_file or 'Project'}"
        runbook = Runbook(
            title=title,
            category=record.category,
            symptoms=[f"Error Type: {record.error_type}", f"Message: {record.error_message}"],
            investigation_steps=[
                f"Check stack trace for file '{record.affected_file or 'N/A'}' at line {record.line_number or 'N/A'}.",
                f"Locate symbol '{record.function_name or 'global'}' and check inputs/states."
            ],
            likely_root_cause=record.root_cause_summary,
            resolution_steps=[
                f"Apply fix strategy: {record.recommended_fix_strategy}",
                "Apply defensive null checking or boundary guard clauses where applicable."
            ],
            verification_checks=[
                "Verify functional unit tests pass.",
                "Execute security scan to confirm no hardcoded credentials.",
                "Execute regression suite."
            ]
        )

        self._runbooks[runbook.runbook_id] = runbook
        return runbook

    def _find_matching_runbook(self, category: str, affected_file: Optional[str]) -> Optional[Runbook]:
        for r in self._runbooks.values():
            if r.category == category:
                if affected_file and any(affected_file in step for step in r.investigation_steps):
                    return r
        return None

    def get_runbook(self, runbook_id: str) -> Optional[Runbook]:
        return self._runbooks.get(runbook_id)

    def list_runbooks(self) -> List[Runbook]:
        return list(self._runbooks.values())

runbook_generator = RunbookGenerator()
