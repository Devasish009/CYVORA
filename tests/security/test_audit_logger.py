from security.audit import AuditLogger

def test_audit_logger_event_creation_and_redaction():
    logger = AuditLogger()
    record = logger.record_event(
        session_id="session_001",
        operation="FILE_WRITE",
        resource="/tmp/proj/config.py?key=sk-1234567890abcdef",
        result="ALLOW",
        agent_id="agent_1",
        reason="Writing file with API_KEY=secret_val_99"
    )

    assert record.session_id == "session_001"
    assert record.operation == "FILE_WRITE"
    assert record.result == "ALLOW"
    assert "sk-1234567890abcdef" not in record.resource
    assert "secret_val_99" not in record.reason
    assert "[REDACTED]" in record.reason
