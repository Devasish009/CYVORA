import os
import time
import subprocess
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

from security.execution_security.execution_policy import execution_policy, ExecutionPolicyError
from security.filesystem_security.filesystem_policy import FilesystemPolicy, FilesystemSecurityError
from security.secrets import secret_redactor
from security.audit.audit_logger import audit_logger

class SandboxExecutionRequest(BaseModel):
    command: str
    cwd: str
    env: Dict[str, str] = Field(default_factory=dict)
    timeout_seconds: float = 30.0
    session_id: str = "sandbox-session"

class SandboxExecutionResult(BaseModel):
    exit_code: int
    stdout: str
    stderr: str
    execution_time_seconds: float
    is_timeout: bool = False
    security_allowed: bool = True
    error_message: Optional[str] = None

class SandboxExecutor:
    """Executes commands in isolated subprocess environments with strict security policies and timeouts."""

    def execute(self, request: SandboxExecutionRequest) -> SandboxExecutionResult:
        start_time = time.time()

        # 1. Check Execution Policy
        try:
            execution_policy.validate_command(request.command)
        except ExecutionPolicyError as e:
            audit_logger.record_event(
                session_id=request.session_id,
                operation="SANDBOX_EXECUTE",
                resource=request.command,
                result="DENY",
                reason=str(e)
            )
            return SandboxExecutionResult(
                exit_code=-1,
                stdout="",
                stderr=f"Execution Policy Violation: {str(e)}",
                execution_time_seconds=time.time() - start_time,
                security_allowed=False,
                error_message=str(e)
            )

        # 2. Check Filesystem Boundary Policy
        try:
            fs_policy = FilesystemPolicy(project_root=request.cwd)
            fs_policy.validate_access(request.cwd, mode="read")
        except FilesystemSecurityError as e:
            audit_logger.record_event(
                session_id=request.session_id,
                operation="SANDBOX_EXECUTE",
                resource=request.cwd,
                result="DENY",
                reason=str(e)
            )
            return SandboxExecutionResult(
                exit_code=-1,
                stdout="",
                stderr=f"Filesystem Security Violation: {str(e)}",
                execution_time_seconds=time.time() - start_time,
                security_allowed=False,
                error_message=str(e)
            )

        # Prepare environment
        run_env = os.environ.copy()
        run_env.update(request.env)

        # 3. Execute process safely avoiding shell=True where possible
        try:
            import shlex
            cmd_args = shlex.split(request.command) if isinstance(request.command, str) else request.command
            process = subprocess.run(
                cmd_args,
                cwd=request.cwd,
                env=run_env,
                shell=False,
                capture_output=True,
                text=True,
                timeout=request.timeout_seconds
            )
            exec_time = time.time() - start_time

            # Redact raw stdout and stderr
            clean_stdout = secret_redactor.redact_text(process.stdout)
            clean_stderr = secret_redactor.redact_text(process.stderr)

            audit_logger.record_event(
                session_id=request.session_id,
                operation="SANDBOX_EXECUTE",
                resource=request.command,
                result="SUCCESS" if process.returncode == 0 else "FAILURE",
                metadata={"exit_code": process.returncode, "execution_time": exec_time}
            )

            return SandboxExecutionResult(
                exit_code=process.returncode,
                stdout=clean_stdout,
                stderr=clean_stderr,
                execution_time_seconds=exec_time,
                is_timeout=False,
                security_allowed=True
            )

        except subprocess.TimeoutExpired:
            exec_time = time.time() - start_time
            audit_logger.record_event(
                session_id=request.session_id,
                operation="SANDBOX_EXECUTE",
                resource=request.command,
                result="TIMEOUT",
                reason=f"Exceeded timeout of {request.timeout_seconds}s"
            )
            return SandboxExecutionResult(
                exit_code=-1,
                stdout="",
                stderr=f"Command timed out after {request.timeout_seconds} seconds.",
                execution_time_seconds=exec_time,
                is_timeout=True,
                security_allowed=True,
                error_message="Execution Timeout"
            )
        except Exception as e:
            exec_time = time.time() - start_time
            return SandboxExecutionResult(
                exit_code=-1,
                stdout="",
                stderr=str(e),
                execution_time_seconds=exec_time,
                is_timeout=False,
                security_allowed=True,
                error_message=str(e)
            )

sandbox_executor = SandboxExecutor()
