import re
from typing import List, Optional
from engine.analyzers.error_analyzer.error_models import (
    ErrorCategory,
    ErrorSeverity,
    StackFrame,
    StructuredError,
)
from security.secrets import secret_redactor

class TracebackParser:
    """Parses raw console logs, stack traces, and test output into structured Error objects."""

    def __init__(self):
        # Python traceback regex pattern: File "...", line X, in Y
        self._python_frame_regex = re.compile(
            r'File "(?P<file>[^"]+)", line (?P<line>\d+)(?:, in (?P<func>\w+))?'
        )
        # JS/TS stack trace regex pattern: at Func (file:line:col) or at file:line:col
        self._js_frame_regex = re.compile(
            r'at (?:(?P<func>[\w\.<>]+) \()?(?P<file>[^\s:]+):(?P<line>\d+):(?P<col>\d+)\)?'
        )

    def parse(self, raw_output: str, project_root: Optional[str] = None) -> StructuredError:
        """Parses arbitrary raw error log text into a StructuredError."""
        clean_output = secret_redactor.redact_text(raw_output or "")
        
        # 1. Try parsing Python Traceback
        if "Traceback (most recent call last):" in clean_output or "SyntaxError" in clean_output:
            return self._parse_python_error(clean_output)
            
        # 2. Try parsing JS/TS Error
        if "Error:" in clean_output or "TypeError:" in clean_output or "ReferenceError:" in clean_output:
            return self._parse_js_error(clean_output)

        # 3. Try parsing HTTP Error Log
        if "HTTP/" in clean_output or " 500 " in clean_output or " 404 " in clean_output:
            return self._parse_http_error(clean_output)

        # 4. Fallback Generic Error
        return self._parse_generic_error(clean_output)

    def _parse_python_error(self, text: str) -> StructuredError:
        frames: List[StackFrame] = []
        lines = text.strip().split("\n")
        
        error_type = "PythonError"
        message = "Unknown Python Error"
        
        # Parse last line for ErrorType: message
        for line in reversed(lines):
            line_str = line.strip()
            if ":" in line_str and not line_str.startswith("File "):
                parts = line_str.split(":", 1)
                error_type = parts[0].strip()
                message = parts[1].strip()
                break

        # Parse stack frames
        for i, line in enumerate(lines):
            match = self._python_frame_regex.search(line)
            if match:
                file_path = match.group("file")
                line_number = int(match.group("line"))
                func = match.group("func") or "global"
                
                snippet = lines[i + 1].strip() if i + 1 < len(lines) else None
                frames.append(
                    StackFrame(
                        file_path=file_path,
                        line_number=line_number,
                        function_name=func,
                        code_snippet=snippet,
                    )
                )

        target_frame = frames[-1] if frames else None
        category = self._categorize_error(error_type, message)
        severity = self._determine_severity(category)

        return StructuredError(
            error_type=error_type,
            message=message,
            category=category,
            severity=severity,
            file_path=target_frame.file_path if target_frame else None,
            line_number=target_frame.line_number if target_frame else None,
            function_name=target_frame.function_name if target_frame else None,
            stack_trace=frames,
            raw_output=text,
        )

    def _parse_js_error(self, text: str) -> StructuredError:
        frames: List[StackFrame] = []
        lines = text.strip().split("\n")

        header = lines[0].strip() if lines else "Error: Unknown JS Failure"
        error_type = "Error"
        message = header

        if ":" in header:
            parts = header.split(":", 1)
            error_type = parts[0].strip()
            message = parts[1].strip()

        for line in lines:
            match = self._js_frame_regex.search(line)
            if match:
                file_path = match.group("file")
                line_number = int(match.group("line"))
                func = match.group("func") or "<anonymous>"
                frames.append(
                    StackFrame(
                        file_path=file_path,
                        line_number=line_number,
                        function_name=func,
                    )
                )

        target_frame = frames[0] if frames else None
        category = self._categorize_error(error_type, message)
        severity = self._determine_severity(category)

        return StructuredError(
            error_type=error_type,
            message=message,
            category=category,
            severity=severity,
            file_path=target_frame.file_path if target_frame else None,
            line_number=target_frame.line_number if target_frame else None,
            function_name=target_frame.function_name if target_frame else None,
            stack_trace=frames,
            raw_output=text,
        )

    def _parse_http_error(self, text: str) -> StructuredError:
        error_type = "HTTPServerError"
        message = text.strip().split("\n")[0]
        if "500" in text:
            error_type = "InternalServerError"
            message = "HTTP 500 Internal Server Error"

        return StructuredError(
            error_type=error_type,
            message=message,
            category=ErrorCategory.RUNTIME,
            severity=ErrorSeverity.HIGH,
            raw_output=text,
        )

    def _parse_generic_error(self, text: str) -> StructuredError:
        return StructuredError(
            error_type="GenericError",
            message=text.strip().split("\n")[0] if text else "Unknown Error",
            category=ErrorCategory.UNKNOWN,
            severity=ErrorSeverity.MEDIUM,
            raw_output=text,
        )

    def _categorize_error(self, error_type: str, message: str) -> ErrorCategory:
        err_lower = error_type.lower()
        msg_lower = message.lower()

        if "syntax" in err_lower or "indentation" in err_lower:
            return ErrorCategory.SYNTAX
        if "type" in err_lower or "cannot read properties of undefined" in msg_lower or "noneType" in msg_lower:
            return ErrorCategory.NULL_POINTER if "none" in msg_lower or "undefined" in msg_lower or "null" in msg_lower else ErrorCategory.TYPE_ERROR
        if "name" in err_lower or "attribute" in err_lower or "key" in err_lower or "index" in err_lower:
            return ErrorCategory.RUNTIME
        if "assertion" in err_lower or "pytest" in msg_lower or "failed" in msg_lower:
            return ErrorCategory.TEST_FAILURE
        if "import" in err_lower or "module" in err_lower:
            return ErrorCategory.DEPENDENCY
        
        return ErrorCategory.RUNTIME

    def _determine_severity(self, category: ErrorCategory) -> ErrorSeverity:
        if category in (ErrorCategory.SECURITY, ErrorCategory.BUILD_FAILURE, ErrorCategory.SYNTAX):
            return ErrorSeverity.CRITICAL
        if category in (ErrorCategory.NULL_POINTER, ErrorCategory.RUNTIME, ErrorCategory.TYPE_ERROR):
            return ErrorSeverity.HIGH
        if category in (ErrorCategory.TEST_FAILURE, ErrorCategory.DEPENDENCY):
            return ErrorSeverity.MEDIUM
        return ErrorSeverity.LOW
