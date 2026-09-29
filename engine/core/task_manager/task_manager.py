import time
import asyncio
from typing import Dict, List, Optional, Callable, Awaitable, Any
from engine.core.task_manager.task_models import Task, TaskStatus, TaskResult
from engine.core.event_system import event_bus, EngineEvent, EventType
from engine.core.logging import logger

class TaskManager:
    """Manages creation, state tracking, dependency validation, and execution of engine tasks."""

    def __init__(self):
        self._tasks: Dict[str, Task] = {}

    def create_task(
        self,
        session_id: str,
        name: str,
        assigned_agent_id: Optional[str] = None,
        dependencies: Optional[List[str]] = None,
        payload: Optional[Dict[str, Any]] = None
    ) -> Task:
        task = Task(
            session_id=session_id,
            name=name,
            assigned_agent_id=assigned_agent_id,
            dependencies=dependencies or [],
            payload=payload or {}
        )
        self._tasks[task.task_id] = task
        logger.info(f"Created Task: ID={task.task_id} Name='{name}' Session={session_id}")
        return task

    def get_task(self, task_id: str) -> Optional[Task]:
        return self._tasks.get(task_id)

    def can_execute_task(self, task_id: str) -> bool:
        task = self.get_task(task_id)
        if not task or task.status != TaskStatus.PENDING:
            return False
        
        # Check all dependency tasks are completed
        for dep_id in task.dependencies:
            dep_task = self.get_task(dep_id)
            if not dep_task or dep_task.status != TaskStatus.COMPLETED:
                return False

        return True

    async def execute_task(
        self,
        task_id: str,
        action: Callable[[Task], Awaitable[Dict[str, Any]]]
    ) -> TaskResult:
        task = self.get_task(task_id)
        if not task:
            raise ValueError(f"Task '{task_id}' does not exist.")

        if not self.can_execute_task(task_id):
            raise RuntimeError(f"Task '{task_id}' cannot execute. Status={task.status} or dependencies pending.")

        start_time = time.time()
        task.status = TaskStatus.RUNNING
        task.started_at = start_time

        await event_bus.publish(EngineEvent(
            session_id=task.session_id,
            event_type=EventType.TASK_STARTED,
            sender="TaskManager",
            message=f"Started execution of task '{task.name}'",
            payload={"task_id": task.task_id, "name": task.name}
        ))

        try:
            output = await action(task)
            exec_time = time.time() - start_time
            
            result = TaskResult(
                success=True,
                output=output or {},
                execution_time_seconds=exec_time
            )
            task.status = TaskStatus.COMPLETED
            task.completed_at = time.time()
            task.result = result

            await event_bus.publish(EngineEvent(
                session_id=task.session_id,
                event_type=EventType.TASK_COMPLETED,
                sender="TaskManager",
                message=f"Completed task '{task.name}'",
                payload={"task_id": task.task_id, "result": output}
            ))
            return result

        except Exception as e:
            exec_time = time.time() - start_time
            err_msg = str(e)
            
            result = TaskResult(
                success=False,
                output={},
                error_message=err_msg,
                execution_time_seconds=exec_time
            )
            task.status = TaskStatus.FAILED
            task.completed_at = time.time()
            task.result = result

            logger.error(f"Task '{task.name}' (ID={task_id}) failed: {err_msg}")
            
            await event_bus.publish(EngineEvent(
                session_id=task.session_id,
                event_type=EventType.TASK_FAILED,
                sender="TaskManager",
                message=f"Failed task '{task.name}': {err_msg}",
                payload={"task_id": task.task_id, "error": err_msg}
            ))
            return result

task_manager = TaskManager()
