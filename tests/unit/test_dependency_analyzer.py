import os
from engine.analyzers.dependency_analyzer import dependency_analyzer
from engine.analyzers.project_analyzer import ProjectInventory, FileItem, FileCategory

def test_dependency_analyzer():
    proj_dir = os.path.abspath("./test_dep_workspace")
    os.makedirs(proj_dir, exist_ok=True)
    req_file = os.path.join(proj_dir, "requirements.txt")

    with open(req_file, "w") as f:
        f.write("pytest==8.1.1\npydantic>=2.6.0\n")

    inv = ProjectInventory(project_path=proj_dir)
    inv.files.append(FileItem(
        relative_path="requirements.txt",
        absolute_path=req_file,
        filename="requirements.txt",
        extension=".txt",
        category=FileCategory.CONFIG,
        size_bytes=30
    ))

    deps = dependency_analyzer.analyze_dependencies(inv)
    assert deps["total_dependencies"] == 2
    pkg_names = [p["name"] for p in deps["python_packages"]]
    assert "pytest" in pkg_names
    assert "pydantic" in pkg_names
