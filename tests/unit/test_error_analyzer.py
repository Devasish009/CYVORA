import pytest
from engine.analyzers.error_analyzer.error_models import (
    ErrorCategory,
    ErrorSeverity,
    StructuredError,
)
from engine.analyzers.error_analyzer.traceback_parser import TracebackParser
from engine.analyzers.error_analyzer.fault_localizer import FaultLocalizer, FaultLocation

PYTHON_TRACEBACK = """
Traceback (most recent call last):
  File "apps/backend/services/user_service.py", line 42, in process_user
    result = self.database.fetch_user(user_id)
  File "apps/backend/database/db.py", line 105, in fetch_user
    return self.connection.execute(query, API_KEY="secret_key_12345")
TypeError: 'NoneType' object is not callable
"""

JS_STACKTRACE = """
TypeError: Cannot read properties of undefined (reading 'data')
    at processResponse (checkout.js:87:12)
    at handlePayment (paymentService.js:45:5)
    at HTMLButtonElement.onclick (index.html:12:1)
"""

def test_python_traceback_parser():
    parser = TracebackParser()
    error = parser.parse(PYTHON_TRACEBACK)

    assert error.error_type == "TypeError"
    assert error.message == "'NoneType' object is not callable"
    assert error.category == ErrorCategory.NULL_POINTER
    assert error.severity == ErrorSeverity.HIGH
    assert error.file_path == "apps/backend/database/db.py"
    assert error.line_number == 105
    assert len(error.stack_trace) == 2
    # Ensure secret is redacted from raw output
    assert "secret_key_12345" not in error.raw_output
    assert "[REDACTED]" in error.raw_output

def test_js_stacktrace_parser():
    parser = TracebackParser()
    error = parser.parse(JS_STACKTRACE)

    assert error.error_type == "TypeError"
    assert error.message == "Cannot read properties of undefined (reading 'data')"
    assert error.category == ErrorCategory.NULL_POINTER
    assert error.file_path == "checkout.js"
    assert error.line_number == 87
    assert len(error.stack_trace) == 3

def test_fault_localizer():
    parser = TracebackParser()
    error = parser.parse(PYTHON_TRACEBACK)
    
    localizer = FaultLocalizer()
    location = localizer.localize(error)

    assert location.file_path == "apps/backend/database/db.py"
    assert location.line_number == 105
    assert location.function_name == "fetch_user"
    assert location.confidence >= 0.9
