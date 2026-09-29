import time
import uuid
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ErrorCategory(str, Enum):
    SYNTAX = "SYNTAX"
    RUNTIME = "RUNTIME"
    TYPE_ERROR = "TYPE_ERROR"
    NULL_POINTER = "NULL_POINTER"
    LOGIC = "LOGIC"
    TEST_FAILURE = "TEST_FAILURE"
    BUILD_FAILURE = "BUILD_FAILURE"
    DEPENDENCY = "DEPENDENCY"
    CONFIGURATION = "CONFIGURATION"
    SECURITY = "SECURITY"
    UNKNOWN = "UNKNOWN"

class ErrorSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class StackFrame(BaseModel):
    file_path: str
    line_number: int
    function_name: Optional[str] = None
    code_snippet: Optional[str] = None
    is_project_code: bool = True

class StructuredError(BaseModel):
    error_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: float = Field(default_factory=time.time)
    error_type: str
    message: str
    category: ErrorCategory = ErrorCategory.UNKNOWN
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
    file_path: Optional[str] = None
    line_number: Optional[int] = None
    function_name: Optional[str] = None
    stack_trace: List[StackFrame] = Field(default_factory=list)
    raw_output: str = ""
    metadata: Dict[str, Any] = Field(default_factory=dict)
