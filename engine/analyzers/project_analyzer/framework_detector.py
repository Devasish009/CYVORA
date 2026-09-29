import os
from typing import List
from engine.analyzers.project_analyzer.project_models import ProjectInventory

class FrameworkDetector:
    """Detects software frameworks by examining configuration manifests and source imports."""

    FRAMEWORK_SIGNATURES = {
        "FastAPI": ["fastapi"],
        "Django": ["django"],
        "Flask": ["flask"],
        "React": ["react", "react-dom"],
        "Next.js": ["next"],
        "Express": ["express"],
        "Vue": ["vue"],
        "Angular": ["@angular/core"],
        "Spring": ["spring-boot", "springframework"],
        "Vite": ["vite"],
    }

    def detect_frameworks(self, inventory: ProjectInventory) -> List[str]:
        frameworks = set()

        # Check config files
        for item in inventory.files:
            if item.filename in ["package.json", "requirements.txt", "pyproject.toml", "pom.xml"]:
                try:
                    with open(item.absolute_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read().lower()
                        for fw_name, sigs in self.FRAMEWORK_SIGNATURES.items():
                            if any(sig in content for sig in sigs):
                                frameworks.add(fw_name)
                except Exception:
                    pass

        return sorted(list(frameworks))

framework_detector = FrameworkDetector()
