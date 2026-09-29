import time
import uuid
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class AuditRecord(BaseModel):
    audit_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: float = Field(default_factory=time.time)
    session_id: str
    agent_id: Optional[str] = None
    operation: str
    resource: str
    result: str  # ALLOW | DENY | REQUIRES_APPROVAL | SUCCESS | FAILURE
    reason: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
