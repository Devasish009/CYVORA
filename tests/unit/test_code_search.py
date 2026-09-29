from engine.context.code_search import code_search_engine
from engine.analyzers.code_analyzer import CodeAnalysisResult, SymbolInfo
from engine.analyzers.project_analyzer import ProjectInventory, FileItem, FileCategory

def test_code_search_symbols_and_files():
    inv = ProjectInventory(project_path="/tmp")
    inv.files.append(FileItem(
        relative_path="auth.py", absolute_path="/tmp/auth.py", filename="auth.py", extension=".py", category=FileCategory.SOURCE, size_bytes=10
    ))

    analysis = CodeAnalysisResult(
        relative_path="auth.py",
        language="Python",
        line_count=20,
        symbols=[SymbolInfo(name="login_user", symbol_type="function", line_number=5)]
    )

    code_search_engine.index_project(inv, [analysis])

    fn_res = code_search_engine.search_filename("auth")
    assert len(fn_res) == 1
    assert fn_res[0].relative_path == "auth.py"

    sym_res = code_search_engine.search_symbol("login_user")
    assert len(sym_res) == 1
    assert sym_res[0].matched_term == "login_user"
