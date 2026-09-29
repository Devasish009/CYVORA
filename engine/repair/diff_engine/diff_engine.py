import os
import shutil
import difflib
from typing import List, Dict, Optional
from pydantic import BaseModel, Field

class UnifiedDiffPatch(BaseModel):
    candidate_id: str
    target_file: str
    original_content: str
    patched_content: str
    diff_text: str
    description: str = ""

class DiffEngine:
    """Generates, applies, and reverts Unified Diff patches on project source files."""

    def create_patch(
        self,
        target_file: str,
        original_content: str,
        patched_content: str,
        candidate_id: str = "cand-1",
        description: str = ""
    ) -> UnifiedDiffPatch:
        diff_lines = list(
            difflib.unified_diff(
                original_content.splitlines(keepends=True),
                patched_content.splitlines(keepends=True),
                fromfile=f"a/{target_file}",
                tofile=f"b/{target_file}"
            )
        )
        diff_text = "".join(diff_lines)

        return UnifiedDiffPatch(
            candidate_id=candidate_id,
            target_file=target_file,
            original_content=original_content,
            patched_content=patched_content,
            diff_text=diff_text,
            description=description
        )

    def apply_patch(self, abs_file_path: str, patched_content: str) -> str:
        """Applies patched content to file, creating backup of original."""
        backup_path = f"{abs_file_path}.cyvora.bak"
        shutil.copyfile(abs_file_path, backup_path)

        with open(abs_file_path, "w", encoding="utf-8") as f:
            f.write(patched_content)

        return backup_path

    def rollback_patch(self, abs_file_path: str, backup_path: Optional[str] = None):
        """Restores file from backup or original state."""
        actual_backup = backup_path or f"{abs_file_path}.cyvora.bak"
        if os.path.exists(actual_backup):
            shutil.copyfile(actual_backup, abs_file_path)
            os.remove(actual_backup)
