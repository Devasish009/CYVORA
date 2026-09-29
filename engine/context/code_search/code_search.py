import re
from typing import List, Dict, Any
from pydantic import BaseModel
from engine.analyzers.code_analyzer import CodeAnalysisResult
from engine.analyzers.project_analyzer.project_models import ProjectInventory

class SearchResult(BaseModel):
    relative_path: str
    match_type: str  # filename | symbol | text | import
    matched_term: str
    line_number: int = 1

class CodeSearchEngine:
    """Multi-index code search engine for symbols, filenames, imports, and text patterns."""

    def __init__(self):
        self._analyses: Dict[str, CodeAnalysisResult] = {}
        self._inventory: ProjectInventory = None

    def index_project(self, inventory: ProjectInventory, analyses: List[CodeAnalysisResult]):
        self._inventory = inventory
        self._analyses = {a.relative_path.replace("\\", "/"): a for a in analyses}

    def search_filename(self, query: str) -> List[SearchResult]:
        results = []
        if not self._inventory:
            return results

        q_lower = query.lower()
        for item in self._inventory.files:
            rel = item.relative_path.replace("\\", "/")
            if q_lower in item.filename.lower() or q_lower in rel.lower():
                results.append(SearchResult(
                    relative_path=rel,
                    match_type="filename",
                    matched_term=item.filename
                ))
        return results

    def search_symbol(self, query: str) -> List[SearchResult]:
        results = []
        q_lower = query.lower()

        for rel, analysis in self._analyses.items():
            for sym in analysis.symbols:
                if q_lower == sym.name.lower() or q_lower in sym.name.lower():
                    results.append(SearchResult(
                        relative_path=rel,
                        match_type=f"symbol:{sym.symbol_type}",
                        matched_term=sym.name,
                        line_number=sym.line_number
                    ))
        return results

    def search_imports(self, module_name: str) -> List[SearchResult]:
        results = []
        q_lower = module_name.lower()

        for rel, analysis in self._analyses.items():
            for imp in analysis.imports:
                if q_lower in imp.lower():
                    results.append(SearchResult(
                        relative_path=rel,
                        match_type="import",
                        matched_term=imp
                    ))
        return results

code_search_engine = CodeSearchEngine()
