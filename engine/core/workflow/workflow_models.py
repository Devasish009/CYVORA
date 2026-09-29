from typing import Dict, Any, Optional, List, Callable, Awaitable
from pydantic import BaseModel, Field

class WorkflowStepResult(BaseModel):
    step_name: str
    success: bool
    output_data: Dict[str, Any] = Field(default_factory=dict)
    error_message: Optional[str] = None
    execution_time_seconds: float = 0.0

class WorkflowStep:
    def __init__(
        self,
        name: str,
        action: Callable[[Dict[str, Any]], Awaitable[Dict[str, Any]]],
        dependencies: Optional[List[str]] = None,
        target_state: Optional[str] = None
    ):
        self.name = name
        self.action = action
        self.dependencies = dependencies or []
        self.target_state = target_state
