from engine.context.project_map import project_map_builder
from engine.analyzers.project_analyzer import ProjectInventory, FileItem, FileCategory

def test_project_map_building():
    inv = ProjectInventory(project_path="/tmp")
    inv.files.append(FileItem(
        relative_path="apps/backend/api/users.py", absolute_path="/tmp/users.py", filename="users.py", extension=".py", category=FileCategory.SOURCE, size_bytes=10
    ))
    inv.files.append(FileItem(
        relative_path="apps/frontend/components/Button.tsx", absolute_path="/tmp/Button.tsx", filename="Button.tsx", extension=".tsx", category=FileCategory.SOURCE, size_bytes=10
    ))

    p_map = project_map_builder.build_map(inv)
    assert "backend" in p_map.backend
    assert "frontend" in p_map.frontend
