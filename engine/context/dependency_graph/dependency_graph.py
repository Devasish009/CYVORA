from typing import Dict, List, Set, Any
from pydantic import BaseModel, Field
from engine.analyzers.code_analyzer import CodeAnalysisResult

class DependencyGraph(BaseModel):
    # file -> list of imported files/modules
    forward_graph: Dict[str, List[str]] = Field(default_factory=dict)
    # file -> list of files that import it
    reverse_graph: Dict[str, List[str]] = Field(default_factory=dict)

class DependencyGraphBuilder:
    """Reconstructs import relationships and file dependency graphs across the codebase."""

    def build_graph(self, code_analyses: List[CodeAnalysisResult]) -> DependencyGraph:
        graph = DependencyGraph()

        # Map file paths and symbol modules
        path_set = {res.relative_path.replace("\\", "/"): res for res in code_analyses}

        for res in code_analyses:
            src_file = res.relative_path.replace("\\", "/")
            graph.forward_graph[src_file] = []
            if src_file not in graph.reverse_graph:
                graph.reverse_graph[src_file] = []

            for imp in res.imports:
                # Resolve import string to relative file path candidate
                matched_target = self._resolve_import_to_file(imp, path_set.keys())
                if matched_target and matched_target != src_file:
                    if matched_target not in graph.forward_graph[src_file]:
                        graph.forward_graph[src_file].append(matched_target)
                    
                    if matched_target not in graph.reverse_graph:
                        graph.reverse_graph[matched_target] = []
                    if src_file not in graph.reverse_graph[matched_target]:
                        graph.reverse_graph[matched_target].append(src_file)

        return graph

    def _resolve_import_to_file(self, import_str: str, known_files: Set[str]) -> str:
        clean_imp = import_str.replace(".", "/")
        for k in known_files:
            if clean_imp in k or k.startswith(clean_imp):
                return k
        return ""

    def trace_dependencies(self, graph: DependencyGraph, target_file: str) -> List[str]:
        """Returns all upstream dependencies required by target_file."""
        visited: Set[str] = set()

        def dfs(node: str):
            for dep in graph.forward_graph.get(node, []):
                if dep not in visited:
                    visited.add(dep)
                    dfs(dep)

        dfs(target_file)
        return list(visited)

    def trace_dependents(self, graph: DependencyGraph, target_file: str) -> List[str]:
        """Returns all downstream files that depend on target_file."""
        visited: Set[str] = set()

        def dfs(node: str):
            for dep in graph.reverse_graph.get(node, []):
                if dep not in visited:
                    visited.add(dep)
                    dfs(dep)

        dfs(target_file)
        return list(visited)

dependency_graph_builder = DependencyGraphBuilder()
