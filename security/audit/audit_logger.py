import logging
from typing import List, Optional, Dict, Any
from security.audit.audit_models import AuditRecord
from security.secrets import secret_redactor

logger = logging.getLogger("CYVORA.Audit")

class AuditLogger:
    """Records immutable audit entries for security-sensitive operations with automatic secret redaction."""

    def __init__(self):
        self._records: List[AuditRecord] = []

    def record_event(
        self,
        session_id: str,
        operation: str,
        resource: str,
        result: str,
        agent_id: Optional[str] = None,
        reason: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> AuditRecord:
        # Guarantee no secrets enter audit logs
        clean_resource = secret_redactor.redact_text(resource)
        clean_reason = secret_redactor.redact_text(reason) if reason else None
        clean_metadata = secret_redactor.redact_data(metadata or {})

        record = AuditRecord(
            session_id=session_id,
            agent_id=agent_id,
            operation=operation,
            resource=clean_resource,
            result=result,
            reason=clean_reason,
            metadata=clean_metadata
        )

        self._records.append(record)
        logger.info(
            f"[AUDIT] [{record.result}] Session={record.session_id} Agent={record.agent_id or 'system'} "
            f"Op={record.operation} Res={record.resource} Reason={record.reason or 'N/A'}"
        )
        return record

    def get_records(self, session_id: Optional[str] = None) -> List[AuditRecord]:
        if session_id:
            return [r for r in self._records if r.session_id == session_id]
        return list(self._records)

audit_logger = AuditLogger()
