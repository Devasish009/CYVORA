import ast
import re
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class SymbolInfo(BaseModel):
    name: str
    symbol_type: str  # function | class | method | import | variable
    line_number: int = 1
    args: List[str] = Field(default_factory=list)

class CodeAnalysisResult(BaseModel):
    relative_path: str
    language: str
    line_count: int
    symbols: List[SymbolInfo] = Field(default_factory=list)
    imports: List[str] = Field(default_factory=list)
    classes: List[str] = Field(default_factory=list)
    functions: List[str] = Field(default_factory=list)

class CodeAnalyzer:
    """Performs static code structure analysis using AST parsing and pattern regexes."""

    def analyze_file(self, relative_path: str, absolute_path: str) -> CodeAnalysisResult:
        ext = relative_path.split(".")[-1].lower() if "." in relative_path else ""
        
        try:
            with open(absolute_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
        except Exception as e:
            return CodeAnalysisResult(relative_path=relative_path, language="unknown", line_count=0)

        lines = content.splitlines()

        if ext == "py":
            return self._analyze_python(relative_path, content, len(lines))
        elif ext in ["js", "jsx", "ts", "tsx"]:
            return self._analyze_js_ts(relative_path, content, len(lines), ext)
        else:
            return self._analyze_generic(relative_path, content, len(lines), ext)

    def _analyze_python(self, rel_path: str, content: str, line_count: int) -> CodeAnalysisResult:
        symbols: List[SymbolInfo] = []
        imports: List[str] = []
        classes: List[str] = []
        functions: List[str] = []

        try:
            tree = ast.parse(content)
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    fn_name = node.name
                    args = [arg.arg for arg in node.args.args]
                    functions.append(fn_name)
                    symbols.append(SymbolInfo(
                        name=fn_name,
                        symbol_type="function",
                        line_number=node.lineno,
                        args=args
                    ))
                elif isinstance(node, ast.ClassDef):
                    cls_name = node.name
                    classes.append(cls_name)
                    symbols.append(SymbolInfo(
                        name=cls_name,
                        symbol_type="class",
                        line_number=node.lineno
                    ))
                elif isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.append(alias.name)
                        symbols.append(SymbolInfo(name=alias.name, symbol_type="import", line_number=node.lineno))
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        imports.append(node.module)
                        symbols.append(SymbolInfo(name=node.module, symbol_type="import", line_number=node.lineno))
        except Exception:
            pass

        return CodeAnalysisResult(
            relative_path=rel_path,
            language="Python",
            line_count=line_count,
            symbols=symbols,
            imports=list(set(imports)),
            classes=classes,
            functions=functions
        )

    def _analyze_js_ts(self, rel_path: str, content: str, line_count: int, ext: str) -> CodeAnalysisResult:
        symbols: List[SymbolInfo] = []
        imports: List[str] = []
        classes: List[str] = []
        functions: List[str] = []

        # Extract imports
        imp_matches = re.findall(r'import\s+.*?\s+from\s+["\']([^"\']+)["\']', content)
        imports.extend(imp_matches)

        # Extract functions
        func_matches = re.findall(r'function\s+([a-zA-Z0-9_]+)|const\s+([a-zA-Z0-9_]+)\s*=\s*\(', content)
        for m in func_matches:
            name = m[0] or m[1]
            if name:
                functions.append(name)
                symbols.append(SymbolInfo(name=name, symbol_type="function"))

        # Extract classes
        cls_matches = re.findall(r'class\s+([a-zA-Z0-9_]+)', content)
        classes.extend(cls_matches)
        for c in cls_matches:
            symbols.append(SymbolInfo(name=c, symbol_type="class"))

        return CodeAnalysisResult(
            relative_path=rel_path,
            language="TypeScript" if "ts" in ext else "JavaScript",
            line_count=line_count,
            symbols=symbols,
            imports=list(set(imports)),
            classes=classes,
            functions=functions
        )

    def _analyze_generic(self, rel_path: str, content: str, line_count: int, ext: str) -> CodeAnalysisResult:
        return CodeAnalysisResult(
            relative_path=rel_path,
            language=ext.upper() if ext else "Text",
            line_count=line_count
        )

code_analyzer = CodeAnalyzer()
