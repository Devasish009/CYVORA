import time
import uuid
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class HindsightRecord(BaseModel):
    record_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: float = Field(default_factory=time.time)
    incident_id: str
    project_path: str
    error_type: str
    error_message: str
    category: str
    affected_file: Optional[str] = None
    line_number: Optional[int] = None
    function_name: Optional[str] = None
    root_cause_summary: str
    recommended_fix_strategy: str
    unified_diff: Optional[str] = None
    verification_status: str  # REPAIR VERIFIED | REPAIR REJECTED
    build_passed: bool = True
    tests_passed: bool = True
    security_passed: bool = True
    regression_passed: bool = True
    runbook_id: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    similarity_score: float = 0.0

class HindsightRecallResult(BaseModel):
    query: str
    matches_found: int
    matched_records: List[HindsightRecord]
    suggested_runbook: Optional[Dict[str, Any]] = None

class HindsightReflectSummary(BaseModel):
    total_incidents_recorded: int
    successful_repairs_count: int
    top_failing_categories: Dict[str, int]
    top_affected_files: Dict[str, int]
    recurring_patterns: List[str]
