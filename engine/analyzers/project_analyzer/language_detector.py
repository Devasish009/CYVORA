from typing import List, Dict
from engine.analyzers.project_analyzer.project_models import ProjectInventory

class LanguageDetector:
    """Detects programming languages used in the project based on file extensions and configs."""

    EXTENSION_MAP = {
        ".py": "Python",
        ".js": "JavaScript",
        ".jsx": "JavaScript",
        ".ts": "TypeScript",
        ".tsx": "TypeScript",
        ".java": "Java",
        ".cpp": "C++",
        ".cc": "C++",
        ".cxx": "C++",
        ".h": "C/C++",
        ".hpp": "C++",
        ".c": "C",
        ".go": "Go",
        ".rs": "Rust",
        ".rb": "Ruby",
        ".php": "PHP",
        ".cs": "C#",
        ".kt": "Kotlin",
        ".swift": "Swift",
        ".scala": "Scala",
        ".sh": "Shell",
        ".sql": "SQL",
        ".lua": "Lua",
        ".dart": "Dart",
        ".ex": "Elixir",
        ".exs": "Elixir",
        ".r": "R",
        ".html": "HTML",
        ".css": "CSS",
    }

    def detect_languages(self, inventory: ProjectInventory) -> List[str]:
        detected = set()

        for item in inventory.files:
            lang = self.EXTENSION_MAP.get(item.extension.lower())
            if lang:
                detected.add(lang)

        # Config fallback detection
        for cfg in inventory.config_files:
            cfg_lower = cfg.lower()
            if "requirements.txt" in cfg_lower or "pyproject.toml" in cfg_lower or "setup.py" in cfg_lower:
                detected.add("Python")
            elif "package.json" in cfg_lower or "tsconfig.json" in cfg_lower:
                if not any(f.extension in [".ts", ".tsx"] for f in inventory.files):
                    detected.add("JavaScript")
            elif "pom.xml" in cfg_lower or "build.gradle" in cfg_lower:
                detected.add("Java")
            elif "cargo.toml" in cfg_lower:
                detected.add("Rust")
            elif "gemfile" in cfg_lower:
                detected.add("Ruby")
            elif "composer.json" in cfg_lower:
                detected.add("PHP")

        return sorted(list(detected)) if detected else ["Universal"]

language_detector = LanguageDetector()
