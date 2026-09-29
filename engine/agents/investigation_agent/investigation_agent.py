from typing import Dict, Any, Optional
from pydantic import BaseModel
from engine.analyzers.error_analyzer.error_models import StructuredError
from engine.analyzers.error_analyzer.fault_localizer import FaultLocation

class InvestigationReport(BaseModel):
    session_id: str
    error: StructuredError
    fault_location: FaultLocation
    investigation_summary: str
    target_code_snippet: Optional[str] = None

class InvestigationAgent:
    """Ingests error tracebacks and project context to produce an InvestigationReport."""

    def investigate(
        self,
        session_id: str,
        error: StructuredError,
        fault_location: FaultLocation,
        project_root: str
    ) -> InvestigationReport:
        code_snippet = None
        if fault_location.file_path and fault_location.file_path != "unknown":
            import os
            full_path = os.path.join(project_root, fault_location.file_path)
            if os.path.exists(full_path):
                try:
                    with open(full_path, "r", encoding="utf-8") as f:
                        lines = f.readlines()
                        if fault_location.line_number and 0 < fault_location.line_number <= len(lines):
                            start = max(0, fault_location.line_number - 5)
                            end = min(len(lines), fault_location.line_number + 5)
                            code_snippet = "".join(lines[start:end])
                except Exception:
                    pass

        summary = (
            f"Investigation complete for {error.error_type} in {fault_location.file_path}:"
            f"{fault_location.line_number or 'N/A'}. Category: {error.category.value}. "
            f"Reasoning: {fault_location.reasoning}"
        )

        return InvestigationReport(
            session_id=session_id,
            error=error,
            fault_location=fault_location,
            investigation_summary=summary,
            target_code_snippet=code_snippet
        )
