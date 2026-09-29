import os
from engine.analyzers.project_analyzer import framework_detector, ProjectInventory, FileItem, FileCategory

def test_framework_detection():
    proj_dir = os.path.abspath("./test_fw_workspace")
    os.makedirs(proj_dir, exist_ok=True)
    req_file = os.path.join(proj_dir, "requirements.txt")

    with open(req_file, "w") as f:
        f.write("fastapi==0.110.0\nuvicorn\n")

    inv = ProjectInventory(project_path=proj_dir)
    inv.files.append(FileItem(
        relative_path="requirements.txt",
        absolute_path=req_file,
        filename="requirements.txt",
        extension=".txt",
        category=FileCategory.CONFIG,
        size_bytes=30
    ))

    frameworks = framework_detector.detect_frameworks(inv)
    assert "FastAPI" in frameworks
