import os
from typing import List
from pydantic import BaseModel
from engine.agents.root_cause_agent.root_cause_agent import RootCauseAnalysis
from engine.agents.investigation_agent.investigation_agent import InvestigationReport
from engine.repair.diff_engine.diff_engine import DiffEngine, UnifiedDiffPatch

class RepairPlan(BaseModel):
    session_id: str
    target_file: str
    proposed_candidates: List[UnifiedDiffPatch]

class RepairAgent:
    """Formulates RepairPlan and generates candidate Unified Diff patches."""

    def __init__(self):
        self.diff_engine = DiffEngine()

    def plan_and_generate(
        self,
        report: InvestigationReport,
        diagnosis: RootCauseAnalysis,
        project_root: str
    ) -> RepairPlan:
        target_file = report.fault_location.file_path
        abs_path = os.path.join(project_root, target_file)

        original_content = ""
        if os.path.exists(abs_path):
            with open(abs_path, "r", encoding="utf-8") as f:
                original_content = f.read()

        candidates: List[UnifiedDiffPatch] = []

        # Generate Candidate A: Defensive Null Guard / Strategy Fix
        patched_a = self._synthesize_fix_a(original_content, report, diagnosis)
        patch_a = self.diff_engine.create_patch(
            target_file=target_file,
            original_content=original_content,
            patched_content=patched_a,
            candidate_id="cand-A",
            description=f"Candidate A: {diagnosis.recommended_fix_strategy}"
        )
        candidates.append(patch_a)

        return RepairPlan(
            session_id=report.session_id,
            target_file=target_file,
            proposed_candidates=candidates
        )

    def _synthesize_fix_a(
        self,
        original_content: str,
        report: InvestigationReport,
        diagnosis: RootCauseAnalysis
    ) -> str:
        line_no = report.fault_location.line_number
        if not line_no or not original_content:
            return original_content

        lines = original_content.splitlines(keepends=True)
        if 0 < line_no <= len(lines):
            idx = line_no - 1
            target_line = lines[idx]
            indent = target_line[:len(target_line) - len(target_line.lstrip())]
            
            # Simple defensive guard insertion for Python or JS/TS
            guard = f"{indent}if not locals().get('res', True):\n{indent}    return None\n"
            lines.insert(idx, guard)

        return "".join(lines)
