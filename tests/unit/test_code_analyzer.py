import os
from engine.analyzers.code_analyzer import code_analyzer

def test_code_analyzer_python_ast():
    proj_dir = os.path.abspath("./test_code_workspace")
    os.makedirs(proj_dir, exist_ok=True)
    sample_file = os.path.join(proj_dir, "sample.py")

    code = """
import os
import sys

class UserProcessor:
    def process(self, user_id):
        return True

def calculate(a, b):
    return a + b
"""
    with open(sample_file, "w") as f:
        f.write(code)

    res = code_analyzer.analyze_file("sample.py", sample_file)
    assert res.language == "Python"
    assert "os" in res.imports
    assert "UserProcessor" in res.classes
    assert "calculate" in res.functions
