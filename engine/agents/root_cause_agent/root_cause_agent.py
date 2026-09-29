from pydantic import BaseModel
from engine.agents.investigation_agent.investigation_agent import InvestigationReport

class RootCauseAnalysis(BaseModel):
    session_id: str
    primary_cause: str
    contributing_factors: list[str] = []
    recommended_fix_strategy: str

class RootCauseAgent:
    """Analyzes InvestigationReport to form diagnostic hypothesis of failure root cause."""

    def diagnose(self, report: InvestigationReport) -> RootCauseAnalysis:
        category = report.error.category.value
        msg = report.error.message

        if category == "NULL_POINTER":
            primary = f"Null/Undefined property access in {report.fault_location.file_path}: {msg}"
            strategy = "Add optional chaining (?.) or defensive null check guard clause."
        elif category == "SYNTAX":
            primary = f"Syntax error in {report.fault_location.file_path}: {msg}"
            strategy = "Correct invalid language syntax or indentation."
        elif category == "TYPE_ERROR":
            primary = f"Type mismatch or invalid operation: {msg}"
            strategy = "Ensure proper type checking and explicit conversion before method call."
        else:
            primary = f"Unhandled exception ({report.error.error_type}): {msg}"
            strategy = "Wrap risky execution block in try-except/catch and handle boundary state."

        return RootCauseAnalysis(
            session_id=report.session_id,
            primary_cause=primary,
            contributing_factors=[f"File: {report.fault_location.file_path}", f"Line: {report.fault_location.line_number}"],
            recommended_fix_strategy=strategy
        )
