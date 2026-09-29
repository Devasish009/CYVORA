import time
from typing import Dict, Any, Optional
from engine.core.workflow.dag import ExecutionDAG
from engine.core.workflow.workflow_models import WorkflowStepResult
from engine.core.event_system import event_bus, EngineEvent, EventType
from engine.core.logging import logger

class WorkflowEngine:
    """Executes workflow steps in DAG order and reports stage progression."""

    def __init__(self, dag: ExecutionDAG):
        self.dag = dag

    async def execute_workflow(
        self,
        session_id: str,
        initial_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        context = dict(initial_context or {})
        execution_order = self.dag.get_execution_order()
        
        logger.info(f"Executing workflow for Session '{session_id}'. Steps: {execution_order}")

        for step_name in execution_order:
            step = self.dag.steps[step_name]
            start_time = time.time()

            await event_bus.publish(EngineEvent(
                session_id=session_id,
                event_type=EventType.WORKFLOW_STEP_COMPLETED,
                sender="WorkflowEngine",
                message=f"Starting workflow step '{step_name}'",
                payload={"step": step_name}
            ))

            try:
                output = await step.action(context)
                exec_time = time.time() - start_time
                
                context[f"{step_name}_output"] = output
                context["last_completed_step"] = step_name
                
                logger.info(f"Completed workflow step '{step_name}' in {exec_time:.3f}s")
            except Exception as e:
                exec_time = time.time() - start_time
                logger.error(f"Workflow step '{step_name}' failed after {exec_time:.3f}s: {e}")
                context["failed_step"] = step_name
                context["error_message"] = str(e)
                raise e

        return context
