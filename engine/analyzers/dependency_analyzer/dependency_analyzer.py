import os
import json
import re
from typing import Dict, List, Any
from engine.analyzers.project_analyzer.project_models import ProjectInventory

class DependencyAnalyzer:
    """Parses project package manifests and extracts direct dependencies."""

    def analyze_dependencies(self, inventory: ProjectInventory) -> Dict[str, Any]:
        result = {
            "python_packages": [],
            "node_packages": [],
            "java_packages": [],
            "total_dependencies": 0
        }

        for item in inventory.files:
            fn_lower = item.filename.lower()

            # 1. Python requirements.txt
            if fn_lower == "requirements.txt":
                pkgs = self._parse_requirements_txt(item.absolute_path)
                result["python_packages"].extend(pkgs)

            # 2. Node package.json
            elif fn_lower == "package.json":
                pkgs = self._parse_package_json(item.absolute_path)
                result["node_packages"].extend(pkgs)

            # 3. Java pom.xml / build.gradle
            elif fn_lower in ["pom.xml", "build.gradle"]:
                pkgs = self._parse_java_manifest(item.absolute_path)
                result["java_packages"].extend(pkgs)

        result["total_dependencies"] = (
            len(result["python_packages"]) +
            len(result["node_packages"]) +
            len(result["java_packages"])
        )
        return result

    def _parse_requirements_txt(self, file_path: str) -> List[Dict[str, str]]:
        packages = []
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    clean_line = line.strip()
                    if clean_line and not clean_line.startswith("#"):
                        parts = re.split(r'[==|>=|<=|>|<|~=]', clean_line)
                        name = parts[0].strip()
                        ver = parts[1].strip() if len(parts) > 1 else "latest"
                        packages.append({"name": name, "version": ver})
        except Exception:
            pass
        return packages

    def _parse_package_json(self, file_path: str) -> List[Dict[str, str]]:
        packages = []
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                data = json.load(f)
                deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
                for name, ver in deps.items():
                    packages.append({"name": name, "version": str(ver)})
        except Exception:
            pass
        return packages

    def _parse_java_manifest(self, file_path: str) -> List[Dict[str, str]]:
        packages = []
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                deps = re.findall(r'<artifactId>([^<]+)</artifactId>', content)
                for dep in deps:
                    packages.append({"name": dep, "version": "unknown"})
        except Exception:
            pass
        return packages

dependency_analyzer = DependencyAnalyzer()
