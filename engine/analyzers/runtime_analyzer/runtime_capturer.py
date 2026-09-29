import os
from typing import Optional, Tuple
from pydantic import BaseModel
from engine.sandbox.sandbox_executor import sandbox_executor, SandboxExecutionRequest, SandboxExecutionResult
from engine.analyzers.error_analyzer.traceback_parser import TracebackParser
from engine.analyzers.error_analyzer.fault_localizer import FaultLocalizer, FaultLocation
from engine.analyzers.error_analyzer.error_models import StructuredError

class ReproductionResult(BaseModel):
    command: str
    reproduced: bool
    execution_result: SandboxExecutionResult
    structured_error: Optional[StructuredError] = None
    fault_location: Optional[FaultLocation] = None

class RuntimeCapturer:
    """Executes target code/tests in sandbox and captures runtime evidence for error reproduction."""

    def __init__(self):
        self.parser = TracebackParser()
        self.localizer = FaultLocalizer()

    def reproduce_error(
        self,
        command: str,
        cwd: str,
        session_id: str = "reproduction-session",
        timeout: float = 30.0
    ) -> ReproductionResult:
        request = SandboxExecutionRequest(
            command=command,
            cwd=cwd,
            timeout_seconds=timeout,
            session_id=session_id
        )
        res = sandbox_executor.execute(request)

        # Failure occurred if exit code != 0 or timeout
        reproduced = res.exit_code != 0 or res.is_timeout

        if not reproduced:
            return ReproductionResult(
                command=command,
                reproduced=False,
                execution_result=res
            )

        raw_error_text = res.stderr if res.stderr else res.stdout
        structured_error = self.parser.parse(raw_error_text)
        fault_loc = self.localizer.localize(structured_error)

        return ReproductionResult(
            command=command,
            reproduced=True,
            execution_result=res,
            structured_error=structured_error,
            fault_location=fault_loc
        )
