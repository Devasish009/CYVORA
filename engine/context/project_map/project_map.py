from typing import Dict, List, Any
from pydantic import BaseModel, Field
from engine.analyzers.project_analyzer.project_models import ProjectInventory

class ProjectMapNode(BaseModel):
    name: str
    category: str
    files: List[str] = Field(default_factory=list)
    submodules: Dict[str, Any] = Field(default_factory=dict)

class ProjectMap(BaseModel):
    backend: Dict[str, List[str]] = Field(default_factory=dict)
    frontend: Dict[str, List[str]] = Field(default_factory=dict)
    engine_core: Dict[str, List[str]] = Field(default_factory=dict)
    tests: List[str] = Field(default_factory=list)
    config: List[str] = Field(default_factory=list)
    docs: List[str] = Field(default_factory=list)

class ProjectMapBuilder:
    """Builds a machine-readable structural representation of the repository architecture."""

    def build_map(self, inventory: ProjectInventory) -> ProjectMap:
        p_map = ProjectMap()

        for item in inventory.files:
            rel = item.relative_path.replace("\\", "/")
            rel_lower = rel.lower()

            if "test" in rel_lower:
                p_map.tests.append(rel)
            elif item.category.value == "CONFIG":
                p_map.config.append(rel)
            elif item.category.value == "DOCUMENTATION":
                p_map.docs.append(rel)
            elif "backend" in rel_lower or "api" in rel_lower or "services" in rel_lower or "models" in rel_lower:
                sec = rel.split("/")[1] if "/" in rel else "root"
                if sec not in p_map.backend:
                    p_map.backend[sec] = []
                p_map.backend[sec].append(rel)
            elif "frontend" in rel_lower or "ui" in rel_lower or "components" in rel_lower:
                sec = rel.split("/")[1] if "/" in rel else "root"
                if sec not in p_map.frontend:
                    p_map.frontend[sec] = []
                p_map.frontend[sec].append(rel)
            elif "engine" in rel_lower or "core" in rel_lower:
                sec = rel.split("/")[1] if "/" in rel else "root"
                if sec not in p_map.engine_core:
                    p_map.engine_core[sec] = []
                p_map.engine_core[sec].append(rel)

        return p_map

project_map_builder = ProjectMapBuilder()
