import pytest
import os
from security.security_policy import SecurityPolicy, PolicyDecision, SecurityPolicyError
from security.filesystem_security import FilesystemPolicy
from security.agent_security import agent_permission_manager, AgentPermission

def test_security_policy_decisions():
    proj_root = os.path.abspath("./test_workspace")
    fs_policy = FilesystemPolicy(project_root=proj_root)
    sec_policy = SecurityPolicy(filesystem_policy=fs_policy)

    agent_id = "test_agent_1"
    agent_permission_manager.grant_permissions(agent_id, {AgentPermission.PROJECT_READ})

    # Allow valid read path
    ctx_allow = {
        "session_id": "sess_1",
        "agent_id": agent_id,
        "permission": AgentPermission.PROJECT_READ,
        "path": os.path.join(proj_root, "app.py"),
        "path_mode": "read"
    }
    assert sec_policy.check("read_file", ctx_allow) == PolicyDecision.ALLOW

    # Deny write path due to lacking write permission
    ctx_deny_perm = {
        "session_id": "sess_1",
        "agent_id": agent_id,
        "permission": AgentPermission.PROJECT_WRITE
    }
    assert sec_policy.check("write_file", ctx_deny_perm) == PolicyDecision.DENY

    # Deny filesystem access outside project root
    ctx_deny_fs = {
        "session_id": "sess_1",
        "agent_id": agent_id,
        "permission": AgentPermission.PROJECT_READ,
        "path": "/etc/shadow"
    }
    assert sec_policy.check("read_etc", ctx_deny_fs) == PolicyDecision.DENY

    # Requires user approval check
    ctx_approval = {
        "session_id": "sess_1",
        "requires_user_approval": True
    }
    assert sec_policy.check("destructive_op", ctx_approval) == PolicyDecision.REQUIRES_APPROVAL

def test_security_policy_validate_or_raise():
    sec_policy = SecurityPolicy()
    ctx_deny = {
        "session_id": "sess_2",
        "agent_id": "unauthorized_agent",
        "permission": AgentPermission.PROJECT_EXECUTE
    }

    with pytest.raises(SecurityPolicyError):
        sec_policy.validate_or_raise("exec_op", ctx_deny)
