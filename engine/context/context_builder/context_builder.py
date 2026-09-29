from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from engine.context.dependency_graph import DependencyGraph, dependency_graph_builder
from engine.context.code_search import code_search_engine
from security import prompt_security, secret_redactor

class ContextPackage(BaseModel):
    failing_symbol: Optional[str] = None
    relevant_files: List[str] = Field(default_factory=list)
    dependency_chain: List[str] = Field(default_factory=list)
    dependent_chain: List[str] = Field(default_factory=list)
    wrapped_snippets: Dict[str, str] = Field(default_factory=dict)

class ContextBuilder:
    """Assembles relevant code context for target errors and symbols while enforcing prompt boundaries."""

    def build_context_for_error(
        self,
        target_file: str,
        failing_symbol: Optional[str] = None,
        graph: Optional[DependencyGraph] = None
    ) -> ContextPackage:
        pkg = ContextPackage(failing_symbol=failing_symbol)

        clean_path = target_file.replace("\\", "/")
        pkg.relevant_files.append(clean_path)

        if graph:
            # Trace dependencies and dependents
            pkg.dependency_chain = dependency_graph_builder.trace_dependencies(graph, clean_path)
            pkg.dependent_chain = dependency_graph_builder.trace_dependents(graph, clean_path)

        # Search related symbol if provided
        if failing_symbol:
            sym_results = code_search_engine.search_symbol(failing_symbol)
            for s_res in sym_results:
                if s_res.relative_path not in pkg.relevant_files:
                    pkg.relevant_files.append(s_res.relative_path)

        return pkg

    def wrap_file_context(self, file_path: str, raw_code: str) -> str:
        """Sanitizes secrets and wraps content using PromptSecurity boundary tags."""
        clean_code = secret_redactor.redact_text(raw_code)
        return prompt_security.wrap_untrusted_content(clean_code, source_type=f"file:{file_path}")

context_builder = ContextBuilder()
