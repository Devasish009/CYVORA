from typing import Dict, List, Set
from engine.core.workflow.workflow_models import WorkflowStep

class ExecutionDAG:
    """Manages DAG graph topology, cycle detection, and topological execution order."""

    def __init__(self):
        self.steps: Dict[str, WorkflowStep] = {}

    def add_step(self, step: WorkflowStep):
        self.steps[step.name] = step

    def get_execution_order(self) -> List[str]:
        """Calculates topological order of execution for steps."""
        visited: Set[str] = set()
        visiting: Set[str] = set()
        order: List[str] = []

        def dfs(node_name: str):
            if node_name in visiting:
                raise ValueError(f"Cyclic dependency detected in Workflow DAG at step '{node_name}'")
            if node_name not in visited:
                visiting.add(node_name)
                step = self.steps.get(node_name)
                if not step:
                    raise KeyError(f"Step '{node_name}' referenced in dependencies does not exist in DAG.")
                for dep in step.dependencies:
                    dfs(dep)
                visiting.remove(node_name)
                visited.add(node_name)
                order.append(node_name)

        for step_name in self.steps:
            if step_name not in visited:
                dfs(step_name)

        return order
