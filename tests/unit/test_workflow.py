import pytest
import asyncio
from engine.core.workflow import ExecutionDAG, WorkflowStep, WorkflowEngine

def test_workflow_dag_topological_execution():
    async def run():
        dag = ExecutionDAG()

        async def step1(ctx):
            return {"step1": "done"}

        async def step2(ctx):
            return {"step2": "done"}

        dag.add_step(WorkflowStep(name="step1", action=step1))
        dag.add_step(WorkflowStep(name="step2", action=step2, dependencies=["step1"]))

        order = dag.get_execution_order()
        assert order == ["step1", "step2"]

        engine = WorkflowEngine(dag)
        res = await engine.execute_workflow("session_123")
        assert res.get("step1_output") == {"step1": "done"}
        assert res.get("step2_output") == {"step2": "done"}

    asyncio.run(run())

def test_workflow_dag_cycle_detection():
    dag = ExecutionDAG()
    
    async def dummy(ctx):
        return {}

    dag.add_step(WorkflowStep(name="a", action=dummy, dependencies=["b"]))
    dag.add_step(WorkflowStep(name="b", action=dummy, dependencies=["a"]))

    with pytest.raises(ValueError, match="Cyclic dependency detected"):
        dag.get_execution_order()
