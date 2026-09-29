from engine.context.dependency_graph import dependency_graph_builder
from engine.analyzers.code_analyzer import CodeAnalysisResult

def test_dependency_graph_building_and_tracing():
    res1 = CodeAnalysisResult(relative_path="app.py", language="Python", line_count=10, imports=["service"])
    res2 = CodeAnalysisResult(relative_path="service.py", language="Python", line_count=10, imports=["db"])
    res3 = CodeAnalysisResult(relative_path="db.py", language="Python", line_count=10, imports=[])

    graph = dependency_graph_builder.build_graph([res1, res2, res3])
    
    deps = dependency_graph_builder.trace_dependencies(graph, "app.py")
    assert "service.py" in deps

    dependents = dependency_graph_builder.trace_dependents(graph, "db.py")
    assert "service.py" in dependents
