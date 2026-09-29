from engine.analyzers.project_analyzer import language_detector, ProjectInventory, FileItem, FileCategory

def test_language_detection():
    inv = ProjectInventory(project_path="/tmp")
    inv.files.append(FileItem(
        relative_path="main.py", absolute_path="/tmp/main.py", filename="main.py", extension=".py", category=FileCategory.SOURCE, size_bytes=10
    ))
    inv.files.append(FileItem(
        relative_path="app.tsx", absolute_path="/tmp/app.tsx", filename="app.tsx", extension=".tsx", category=FileCategory.SOURCE, size_bytes=10
    ))

    langs = language_detector.detect_languages(inv)
    assert "Python" in langs
    assert "TypeScript" in langs
