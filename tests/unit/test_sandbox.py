import os
import pytest
from engine.sandbox import sandbox_executor, SandboxExecutionRequest
from engine.analyzers.runtime_analyzer.runtime_capturer import RuntimeCapturer

PROJECT_ROOT = os.path.abspath(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

def test_sandbox_execution_success():
    req = SandboxExecutionRequest(
        command="py --version",
        cwd=PROJECT_ROOT,
        timeout_seconds=10.0
    )
    res = sandbox_executor.execute(req)

    assert res.security_allowed is True
    assert res.exit_code == 0
    assert "Python 3." in res.stdout or "Python 3." in res.stderr

def test_sandbox_execution_blocked_command():
    req = SandboxExecutionRequest(
        command="rm -rf /",
        cwd=PROJECT_ROOT,
        timeout_seconds=5.0
    )
    res = sandbox_executor.execute(req)

    assert res.security_allowed is False
    assert res.exit_code == -1
    assert "Execution Policy Violation" in res.stderr

def test_runtime_reproduction():
    capturer = RuntimeCapturer()
    # Execute python inline script that throws a TypeError
    cmd = 'py -c "raise TypeError(\'Test runtime reproduction failure\')"'
    result = capturer.reproduce_error(command=cmd, cwd=PROJECT_ROOT)

    assert result.reproduced is True
    assert result.structured_error is not None
    assert result.structured_error.error_type == "TypeError"
    assert "Test runtime reproduction failure" in result.structured_error.message
