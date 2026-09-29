import os
from pathlib import Path
from typing import List, Optional

class FilesystemSecurityError(PermissionError):
    """Raised when filesystem security boundary is violated."""
    pass

class FilesystemPolicy:
    """Enforces controlled filesystem access boundaries and path traversal protection."""
    
    SYSTEM_DENIED_PATHS = [
        "/etc", "/root", "/boot", "/sys", "/proc", "/dev", "/var",
        "C:\\Windows", "C:\\Program Files", "C:\\Program Files (x86)",
        "C:\\Users\\Default", "C:\\System Volume Information"
    ]

    def __init__(
        self,
        project_root: str,
        allowed_read_paths: Optional[List[str]] = None,
        allowed_write_paths: Optional[List[str]] = None,
        denied_paths: Optional[List[str]] = None
    ):
        self.project_root = os.path.abspath(project_root)
        self.allowed_read_paths = [os.path.abspath(p) for p in (allowed_read_paths or [self.project_root])]
        self.allowed_write_paths = [os.path.abspath(p) for p in (allowed_write_paths or [self.project_root])]
        
        self.denied_paths = [os.path.abspath(p) for p in (denied_paths or [])]
        for sys_path in self.SYSTEM_DENIED_PATHS:
            self.denied_paths.append(os.path.abspath(sys_path))

    def _normalize_path(self, target_path: str) -> str:
        """Normalizes and resolves target path to prevent traversal attacks."""
        if not target_path or not isinstance(target_path, str):
            raise FilesystemSecurityError("Invalid path argument provided")
        
        # Resolve symlinks and relative traversal (..)
        try:
            resolved = Path(target_path).resolve()
            return str(resolved)
        except Exception as e:
            raise FilesystemSecurityError(f"Path resolution error for {target_path}: {e}")

    def is_path_safe(self, target_path: str, mode: str = "read") -> bool:
        """Checks whether reading or writing to target_path is allowed under current policy."""
        try:
            norm_target = self._normalize_path(target_path)
        except FilesystemSecurityError:
            return False

        # 1. Check system and custom denied paths
        for denied in self.denied_paths:
            if norm_target == denied or norm_target.startswith(denied + os.sep):
                return False

        # 2. Check if inside allowed project/read/write paths
        allowed_list = self.allowed_write_paths if mode == "write" else self.allowed_read_paths
        
        for allowed in allowed_list:
            if norm_target == allowed or norm_target.startswith(allowed + os.sep):
                return True

        return False

    def validate_access(self, target_path: str, mode: str = "read") -> str:
        """Validates path access. Raises FilesystemSecurityError if boundary check fails."""
        norm_target = self._normalize_path(target_path)

        if not self.is_path_safe(norm_target, mode=mode):
            raise FilesystemSecurityError(
                f"Filesystem access DENIED: Path '{norm_target}' is outside allowed {mode} boundary "
                f"or violates security policy (project root: '{self.project_root}')"
            )

        return norm_target
