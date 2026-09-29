import pytest
import os
from security.filesystem_security import FilesystemPolicy, FilesystemSecurityError

def test_filesystem_allowed_root_path():
    proj_root = os.path.abspath("./test_workspace")
    policy = FilesystemPolicy(project_root=proj_root)

    safe_path = os.path.join(proj_root, "src", "main.py")
    assert policy.is_path_safe(safe_path, mode="read") is True
    assert policy.is_path_safe(safe_path, mode="write") is True
    assert policy.validate_access(safe_path, mode="read") == os.path.abspath(safe_path)

def test_filesystem_path_traversal_protection():
    proj_root = os.path.abspath("./test_workspace")
    policy = FilesystemPolicy(project_root=proj_root)

    # Attempt path traversal outside project root
    traversal_path = os.path.join(proj_root, "..", "..", "etc", "passwd")
    assert policy.is_path_safe(traversal_path, mode="read") is False

    with pytest.raises(FilesystemSecurityError):
        policy.validate_access(traversal_path, mode="read")

def test_filesystem_system_denied_paths():
    proj_root = os.path.abspath("./test_workspace")
    policy = FilesystemPolicy(project_root=proj_root)

    assert policy.is_path_safe("/etc/shadow", mode="read") is False
    assert policy.is_path_safe("/root/.ssh/id_rsa", mode="read") is False
    assert policy.is_path_safe("C:\\Windows\\System32\\cmd.exe", mode="read") is False
