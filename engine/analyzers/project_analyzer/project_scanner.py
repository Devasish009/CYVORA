import os
from pathlib import Path
from typing import List, Optional
from engine.analyzers.project_analyzer.project_models import ProjectInventory, FileItem, FileCategory
from security import security_policy, FilesystemPolicy, agent_permission_manager, AgentPermission, audit_logger

class ProjectScanner:
    """Recursively scans a target software repository and outputs a structured project inventory."""

    IGNORED_DIRS = {
        ".git", "node_modules", "__pycache__", "build", "dist", "target",
        ".venv", "venv", "env", ".idea", ".vscode", ".pytest_cache", ".next"
    }

    IGNORED_EXTENSIONS = {
        ".pyc", ".pyo", ".pyd", ".so", ".dll", ".exe", ".o", ".a", ".class", ".tar", ".gz", ".zip"
    }

    CONFIG_FILENAMES = {
        "package.json", "pyproject.toml", "requirements.txt", "setup.py", "pom.xml",
        "build.gradle", "tsconfig.json", "docker-compose.yml", "dockerfile", ".env.example"
    }

    DOC_EXTENSIONS = {".md", ".rst", ".txt", ".pdf"}
    TEST_PATTERNS = {"test_", "_test", ".test.", ".spec."}

    def __init__(self, filesystem_policy: Optional[FilesystemPolicy] = None):
        self.filesystem_policy = filesystem_policy

    def scan(self, project_path: str, session_id: str = "scanner_session") -> ProjectInventory:
        abs_path = os.path.abspath(project_path)
        
        # Ensure scanner agent permissions
        agent_permission_manager.grant_permissions("project_scanner_agent", {
            AgentPermission.PROJECT_READ,
            AgentPermission.PROJECT_WRITE
        })

        # 1. Security Check
        fs_policy = self.filesystem_policy or FilesystemPolicy(project_root=abs_path)
        fs_policy.validate_access(abs_path, mode="read")

        sec_context = {
            "session_id": session_id,
            "agent_id": "project_scanner_agent",
            "permission": AgentPermission.PROJECT_READ,
            "path": abs_path,
            "path_mode": "read"
        }
        security_policy.validate_or_raise("project_scan", sec_context)

        inventory = ProjectInventory(project_path=abs_path)

        for root, dirs, files in os.walk(abs_path):
            # Prune ignored directories in place
            dirs[:] = [d for d in dirs if d not in self.IGNORED_DIRS and not d.startswith(".")]
            
            for d in dirs:
                rel_dir = os.path.relpath(os.path.join(root, d), abs_path)
                inventory.directories.append(rel_dir)
                inventory.total_directories += 1

            for f in files:
                ext = Path(f).suffix.lower()
                if ext in self.IGNORED_EXTENSIONS:
                    inventory.ignored_paths_count += 1
                    continue

                file_abs = os.path.join(root, f)
                file_rel = os.path.relpath(file_abs, abs_path)

                category = self._categorize_file(f, file_rel, ext)
                file_size = os.path.getsize(file_abs) if os.path.exists(file_abs) else 0

                item = FileItem(
                    relative_path=file_rel,
                    absolute_path=file_abs,
                    filename=f,
                    extension=ext,
                    category=category,
                    size_bytes=file_size
                )

                inventory.files.append(item)
                inventory.total_files += 1

                if category == FileCategory.CONFIG:
                    inventory.config_files.append(file_rel)
                elif category == FileCategory.TEST:
                    inventory.test_files.append(file_rel)
                elif category == FileCategory.DOCUMENTATION:
                    inventory.doc_files.append(file_rel)

        audit_logger.record_event(
            session_id=session_id,
            agent_id="project_scanner_agent",
            operation="PROJECT_SCAN",
            resource=abs_path,
            result="ALLOW",
            reason=f"Scanned {inventory.total_files} files across {inventory.total_directories} directories."
        )

        return inventory

    def _categorize_file(self, filename: str, rel_path: str, ext: str) -> FileCategory:
        fn_lower = filename.lower()
        
        if fn_lower in self.CONFIG_FILENAMES or fn_lower.startswith(".env"):
            return FileCategory.CONFIG
        
        if any(pat in fn_lower for pat in self.TEST_PATTERNS) or "tests/" in rel_path.replace("\\", "/"):
            return FileCategory.TEST
        
        if ext in self.DOC_EXTENSIONS:
            return FileCategory.DOCUMENTATION
        
        if ext in {".png", ".jpg", ".jpeg", ".svg", ".ico", ".css"}:
            return FileCategory.ASSET
        
        if ext in {".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".cpp", ".c", ".h", ".go", ".rs", ".html"}:
            return FileCategory.SOURCE
        
        return FileCategory.OTHER

project_scanner = ProjectScanner()
