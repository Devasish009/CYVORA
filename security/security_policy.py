from enum import Enum
from typing import Dict, Any, Optional
from security.agent_security import AgentPermission, agent_permission_manager
from security.filesystem_security import FilesystemPolicy
from security.execution_security import execution_policy
from security.audit import audit_logger

class PolicyDecision(str, Enum):
    ALLOW = "ALLOW"
    DENY = "DENY"
    REQUIRES_APPROVAL = "REQUIRES_APPROVAL"

class SecurityPolicyError(PermissionError):
    """Raised when security policy check fails critically or is explicitly denied."""
    pass

class SecurityPolicy:
    """Central Security Policy Engine governing all CYVORA operations."""

    def __init__(self, filesystem_policy: Optional[FilesystemPolicy] = None):
        self.filesystem_policy = filesystem_policy

    def set_filesystem_policy(self, policy: FilesystemPolicy):
        self.filesystem_policy = policy

    def check(self, operation: str, context: Dict[str, Any]) -> PolicyDecision:
        """
        Evaluates a security policy request.
        Context expected parameters:
        - session_id: str (required)
        - agent_id: Optional[str]
        - path: Optional[str] (for filesystem operations)
        - path_mode: Optional[str] ('read' | 'write')
        - command: Optional[str] (for execution operations)
        - permission: Optional[AgentPermission]
        - requires_user_approval: Optional[bool]
        """
        session_id = context.get("session_id", "unknown_session")
        agent_id = context.get("agent_id")
        
        try:
            # 1. Check User Approval Requirements (e.g., destructive operations)
            if context.get("requires_user_approval", False):
                audit_logger.record_event(
                    session_id=session_id,
                    agent_id=agent_id,
                    operation=operation,
                    resource=context.get("path") or context.get("command") or operation,
                    result=PolicyDecision.REQUIRES_APPROVAL.value,
                    reason="Operation requires explicit user approval before execution."
                )
                return PolicyDecision.REQUIRES_APPROVAL

            # 2. Check Agent Permissions if permission is specified
            required_perm = context.get("permission")
            if required_perm:
                if not agent_permission_manager.has_permission(agent_id, required_perm):
                    audit_logger.record_event(
                        session_id=session_id,
                        agent_id=agent_id,
                        operation=operation,
                        resource=f"permission:{required_perm.value}",
                        result=PolicyDecision.DENY.value,
                        reason=f"Agent '{agent_id}' lacks permission '{required_perm.value}'"
                    )
                    return PolicyDecision.DENY

            # 3. Check Filesystem Access if path is specified
            target_path = context.get("path")
            if target_path:
                mode = context.get("path_mode", "read")
                if self.filesystem_policy:
                    if not self.filesystem_policy.is_path_safe(target_path, mode=mode):
                        audit_logger.record_event(
                            session_id=session_id,
                            agent_id=agent_id,
                            operation=operation,
                            resource=target_path,
                            result=PolicyDecision.DENY.value,
                            reason=f"Filesystem access violation: Path '{target_path}' outside boundary"
                        )
                        return PolicyDecision.DENY

            # 4. Check Command Execution if command is specified
            target_cmd = context.get("command")
            if target_cmd:
                try:
                    execution_policy.validate_command(target_cmd)
                except Exception as e:
                    audit_logger.record_event(
                        session_id=session_id,
                        agent_id=agent_id,
                        operation=operation,
                        resource=target_cmd,
                        result=PolicyDecision.DENY.value,
                        reason=str(e)
                    )
                    return PolicyDecision.DENY

            # If all checks pass
            audit_logger.record_event(
                session_id=session_id,
                agent_id=agent_id,
                operation=operation,
                resource=target_path or target_cmd or operation,
                result=PolicyDecision.ALLOW.value,
                reason="All security checks passed successfully."
            )
            return PolicyDecision.ALLOW

        except Exception as e:
            # Safe Failure Default: Any unhandled exception results in DENY
            audit_logger.record_event(
                session_id=session_id,
                agent_id=agent_id,
                operation=operation,
                resource="unknown",
                result=PolicyDecision.DENY.value,
                reason=f"Safe Failure Triggered: {str(e)}"
            )
            return PolicyDecision.DENY

    def validate_or_raise(self, operation: str, context: Dict[str, Any]):
        """Evaluates check() and raises SecurityPolicyError if decision is DENY."""
        decision = self.check(operation, context)
        if decision == PolicyDecision.DENY:
            raise SecurityPolicyError(
                f"Security Policy Check DENIED operation '{operation}' for session '{context.get('session_id')}'"
            )
        elif decision == PolicyDecision.REQUIRES_APPROVAL:
            raise SecurityPolicyError(
                f"Security Policy Check REQUIRES_APPROVAL for operation '{operation}'"
            )

security_policy = SecurityPolicy()
