import pytest
from security.agent_security import (
    AgentPermissionManager,
    AgentPermission,
    PermissionDeniedError
)

def test_deny_by_default_permissions():
    mgr = AgentPermissionManager()
    
    # Anonymous agent has no permissions
    assert mgr.has_permission(None, AgentPermission.PROJECT_READ) is False
    assert mgr.has_permission("agent_x", AgentPermission.PROJECT_READ) is False

    with pytest.raises(PermissionDeniedError):
        mgr.validate_permission("agent_x", AgentPermission.PROJECT_WRITE)

def test_explicit_permission_grant_and_revoke():
    mgr = AgentPermissionManager()
    mgr.grant_permissions("agent_a", {AgentPermission.PROJECT_READ, AgentPermission.PROJECT_WRITE})

    assert mgr.has_permission("agent_a", AgentPermission.PROJECT_READ) is True
    assert mgr.has_permission("agent_a", AgentPermission.PROJECT_WRITE) is True
    assert mgr.has_permission("agent_a", AgentPermission.PROJECT_EXECUTE) is False

    mgr.revoke_permissions("agent_a", {AgentPermission.PROJECT_WRITE})
    assert mgr.has_permission("agent_a", AgentPermission.PROJECT_WRITE) is False
