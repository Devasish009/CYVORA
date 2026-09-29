import logging
import json
import time
from typing import Any, Dict
from security.secrets import secret_redactor

class SecretRedactingFormatter(logging.Formatter):
    """Logging formatter that automatically redacts sensitive patterns from output."""

    def format(self, record: logging.LogRecord) -> str:
        original_msg = super().format(record)
        return secret_redactor.redact_text(original_msg)

class StructuredJsonFormatter(logging.Formatter):
    """Structured JSON formatter for production logs."""

    def format(self, record: logging.LogRecord) -> str:
        log_data: Dict[str, Any] = {
            "timestamp": time.time(),
            "level": record.levelname,
            "logger": record.name,
            "message": secret_redactor.redact_text(record.getMessage()),
        }
        if hasattr(record, "session_id"):
            log_data["session_id"] = getattr(record, "session_id")
        if record.exc_info:
            log_data["exception"] = secret_redactor.redact_text(self.formatException(record.exc_info))
        return json.dumps(log_data)

def setup_logger(name: str = "CYVORA", level: str = "INFO") -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper(), logging.INFO))

    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(SecretRedactingFormatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s"))
        logger.addHandler(handler)

    return logger

logger = setup_logger()
