import os
import re
from typing import List
from engine.analyzers.project_analyzer.project_models import ProjectInventory

class EntryPointDetector:
    """Detects primary application entry points."""

    ENTRY_FILENAMES = {
        "main.py", "app.py", "manage.py", "wsgi.py", "asgi.py",
        "server.js", "index.js", "index.ts", "main.tsx", "index.tsx", "main.go"
    }

    ENTRY_PATTERNS = [
        r'if\s+__name__\s*==\s*["\']__main__["\']',
        r'app\s*=\s*FastAPI\(',
        r'app\s*=\s*Flask\(',
        r'public\s+static\s+void\s+main',
        r'func\s+main\(\)',
    ]

    def detect_entry_points(self, inventory: ProjectInventory) -> List[str]:
        entry_points = set()

        for item in inventory.files:
            fn_lower = item.filename.lower()
            
            # Check standard filename conventions
            if fn_lower in self.ENTRY_FILENAMES:
                entry_points.add(item.relative_path)
                continue

            # Check pattern signatures inside source files
            if item.extension.lower() in [".py", ".js", ".ts", ".java", ".go"]:
                try:
                    with open(item.absolute_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                        if any(re.search(pat, content) for pat in self.ENTRY_PATTERNS):
                            entry_points.add(item.relative_path)
                except Exception:
                    pass

        return sorted(list(entry_points))

entry_point_detector = EntryPointDetector()
