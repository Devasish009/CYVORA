from enum import Enum
from typing import Set, Dict, Optional

class AgentPermission(str, Enum):
    PROJECT_READ = "PROJECT_READ"
    PROJECT_WRITE = "PROJECT_WRITE"
    PROJECT_EXECUTE = "PROJECT_EXECUTE"
    NETWORK_ACCESS = "NETWORK_ACCESS"
    SECRET_ACCESS = "SECRET_ACCESS"
    GIT_ACCESS = "GIT_ACCESS"

class PermissionDeniedError(PermissionError):
    """Raised when an agent attempts an unauthorized operation."""
    pass

class AgentPermissionManager:
    """Manages agent permissions adhering to DENY BY DEFAULT principles."""
    
    def __init__(self):
        # Default registry mapping agent_id -> set of granted AgentPermission
        self._permissions: Dict[str, Set[AgentPermission]] = {}

    def grant_permissions(self, agent_id: str, permissions: Set[AgentPermission]):
        if agent_id not in self._permissions:
            self._permissions[agent_id] = set()
        self._permissions[agent_id].update(permissions)

    def revoke_permissions(self, agent_id: str, permissions: Set[AgentPermission]):
        if agent_id in self._permissions:
            self._permissions[agent_id].difference_update(permissions)

    def has_permission(self, agent_id: Optional[str], permission: AgentPermission) -> bool:
        if not agent_id or agent_id not in self._permissions:
            return False  # DENY BY DEFAULT
        return permission in self._permissions[agent_id]

    def validate_permission(self, agent_id: Optional[str], permission: AgentPermission):
        if not self.has_permission(agent_id, permission):
            raise PermissionDeniedError(
                f"Agent '{agent_id or 'anonymous'}' lacks required permission '{permission.value}'"
            )

agent_permission_manager = AgentPermissionManager()
