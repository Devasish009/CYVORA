from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from engine.analyzers.error_analyzer.error_models import StructuredError, StackFrame
from engine.context.dependency_graph.dependency_graph import DependencyGraph

class FaultLocation(BaseModel):
    file_path: str
    line_number: Optional[int] = None
    function_name: Optional[str] = None
    confidence: float = 1.0  # 0.0 to 1.0
    affected_dependents: List[str] = []
    reasoning: str = ""

class FaultLocalizer:
    """Pinpoints fault location and traces upstream callers and downstream dependents."""

    def __init__(self, dependency_graph: Optional[DependencyGraph] = None):
        self.dependency_graph = dependency_graph or DependencyGraph()

    def localize(self, error: StructuredError) -> FaultLocation:
        """Determines the primary fault location from a StructuredError."""
        if not error.stack_trace:
            if error.file_path:
                dependents = self.dependency_graph.reverse_graph.get(error.file_path, []) if self.dependency_graph else []
                return FaultLocation(
                    file_path=error.file_path,
                    line_number=error.line_number,
                    function_name=error.function_name,
                    confidence=0.7,
                    affected_dependents=dependents,
                    reasoning=f"Localized via direct error file path: {error.file_path}"
                )
            return FaultLocation(
                file_path="unknown",
                confidence=0.0,
                reasoning="No stack trace or file path present in error."
            )

        # 1. Primary candidate is the innermost frame belonging to project code
        primary_frame: Optional[StackFrame] = None
        for frame in reversed(error.stack_trace):
            if frame.is_project_code:
                primary_frame = frame
                break

        if not primary_frame:
            primary_frame = error.stack_trace[-1]

        file_path = primary_frame.file_path
        dependents = []
        if self.dependency_graph:
            dependents = self.dependency_graph.reverse_graph.get(file_path, [])

        reasoning = (
            f"Localized fault to line {primary_frame.line_number} in function "
            f"'{primary_frame.function_name or 'global'}' of '{file_path}' "
            f"based on innermost stack frame."
        )

        return FaultLocation(
            file_path=file_path,
            line_number=primary_frame.line_number,
            function_name=primary_frame.function_name,
            confidence=0.95,
            affected_dependents=dependents,
            reasoning=reasoning
        )
