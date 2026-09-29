import os
from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from engine.repair.diff_engine.diff_engine import DiffEngine, UnifiedDiffPatch

class PatchCandidateResult(BaseModel):
    candidate: UnifiedDiffPatch
    applied: bool = False
    tests_passed: bool = False
    security_passed: bool = False
    regression_passed: bool = False
    is_verified: bool = False
    failure_reason: Optional[str] = None

class PatchManager:
    """Manages candidate patch evaluation, application, rollback, and verification lifecycle."""

    def __init__(self):
        self.diff_engine = DiffEngine()
        self.active_backups: Dict[str, str] = {}  # file_path -> backup_path

    def apply_candidate(self, abs_file_path: str, patch: UnifiedDiffPatch) -> bool:
        """Applies candidate patch to filesystem and records backup location."""
        try:
            backup_path = self.diff_engine.apply_patch(abs_file_path, patch.patched_content)
            self.active_backups[abs_file_path] = backup_path
            return True
        except Exception as e:
            return False

    def rollback_candidate(self, abs_file_path: str):
        """Rolls back applied candidate patch using active backup."""
        backup_path = self.active_backups.pop(abs_file_path, None)
        self.diff_engine.rollback_patch(abs_file_path, backup_path)

    def rollback_all(self):
        """Rolls back all active candidates."""
        for file_path, backup_path in list(self.active_backups.items()):
            self.diff_engine.rollback_patch(file_path, backup_path)
        self.active_backups.clear()
