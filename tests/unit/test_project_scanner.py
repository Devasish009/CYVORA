import os
import pytest
from engine.analyzers.project_analyzer import project_scanner, ProjectInventory, FileCategory
from security import agent_permission_manager, AgentPermission, security_policy, FilesystemPolicy

def test_project_scanner_basic_scan():
    proj_dir = os.path.abspath("./test_scan_workspace")
    os.makedirs(os.path.join(proj_dir, "src"), exist_ok=True)

    with open(os.path.join(proj_dir, "src", "main.py"), "w") as f:
        f.write("print('hello')\n")

    with open(os.path.join(proj_dir, "requirements.txt"), "w") as f:
        f.write("fastapi==0.110.0\n")

    fs_policy = FilesystemPolicy(project_root=proj_dir)
    security_policy.set_filesystem_policy(fs_policy)

    agent_permission_manager.grant_permissions("project_scanner_agent", {AgentPermission.PROJECT_READ})

    inventory = project_scanner.scan(proj_dir, session_id="test_scan_sess")
    
    assert inventory.total_files >= 2
    assert any(item.filename == "main.py" for item in inventory.files)
    assert any(item.filename == "requirements.txt" for item in inventory.files)
    assert "requirements.txt" in inventory.config_files
