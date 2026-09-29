import os
from typing import Dict, Any, Optional, List
from engine.core.state_manager import state_manager, SessionState, RepairSession, StateTransitionError
from engine.core.event_system import event_bus, EngineEvent, EventType
from engine.core.task_manager import task_manager
from engine.core.logging import logger
from security import (
    security_policy,
    FilesystemPolicy,
    agent_permission_manager,
    AgentPermission,
    audit_logger
)
from engine.analyzers.project_analyzer import (
    project_scanner,
    language_detector,
    framework_detector,
    entry_point_detector,
    ProjectInventory
)
from engine.analyzers.dependency_analyzer import dependency_analyzer
from engine.analyzers.code_analyzer import code_analyzer, CodeAnalysisResult
from engine.context.project_map import project_map_builder, ProjectMap
from engine.context.dependency_graph import dependency_graph_builder, DependencyGraph
from engine.context.code_search import code_search_engine
from engine.context.context_builder import context_builder

# Real Subsystem Engines & Hindsight Memory
from engine.analyzers.error_analyzer.traceback_parser import TracebackParser
from engine.analyzers.error_analyzer.fault_localizer import FaultLocalizer
from engine.agents.investigation_agent.investigation_agent import InvestigationAgent
from engine.agents.root_cause_agent.root_cause_agent import RootCauseAgent
from engine.agents.repair_agent.repair_agent import RepairAgent
from engine.repair.patch_manager.patch_manager import PatchManager
from engine.sandbox.sandbox_executor import sandbox_executor
from engine.validation.evidence_verifier import evidence_verifier
from engine.memory.hindsight import hindsight_memory

class EngineOrchestrator:
    """
    Central Orchestrator driving the CYVORA autonomous incident response & repair lifecycle across all phases.
    """

    def __init__(self):
        self.traceback_parser = TracebackParser()
        self.fault_localizer = FaultLocalizer()
        self.investigation_agent = InvestigationAgent()
        self.root_cause_agent = RootCauseAgent()
        self.repair_agent = RepairAgent()
        self.patch_manager = PatchManager()
        self.evidence_verifier = evidence_verifier
        self.hindsight_memory = hindsight_memory

    async def run_repair_session(
        self,
        project_path: str,
        target_error: Optional[str] = None,
        test_command: Optional[str] = None,
        simulate_validation_failure: bool = False
    ) -> RepairSession:
        abs_project_path = os.path.abspath(project_path)

        # 1. Initialize Session
        session = state_manager.create_session(abs_project_path, target_error)
        session_id = session.session_id

        # 2. Configure Security Policy for this session
        fs_policy = FilesystemPolicy(project_root=abs_project_path)
        security_policy.set_filesystem_policy(fs_policy)

        agent_id = "orchestrator_agent"
        agent_permission_manager.grant_permissions(agent_id, {
            AgentPermission.PROJECT_READ,
            AgentPermission.PROJECT_WRITE,
            AgentPermission.PROJECT_EXECUTE
        })

        await event_bus.publish(EngineEvent(
            session_id=session_id,
            event_type=EventType.SESSION_CREATED,
            sender="EngineOrchestrator",
            message=f"Initialized repair session for '{abs_project_path}'",
            payload={"project_path": abs_project_path}
        ))

        try:
            # Stage 1: SCANNING & PROJECT INTELLIGENCE
            state_manager.transition_state(session_id, SessionState.SCANNING, "Executing Project Intelligence pipeline")
            
            sec_context = {
                "session_id": session_id,
                "agent_id": agent_id,
                "permission": AgentPermission.PROJECT_READ,
                "path": abs_project_path,
                "path_mode": "read"
            }
            security_policy.validate_or_raise("stage_scanning", sec_context)

            inventory: ProjectInventory = project_scanner.scan(abs_project_path, session_id=session_id)
            inventory.languages = language_detector.detect_languages(inventory)
            inventory.frameworks = framework_detector.detect_frameworks(inventory)
            inventory.entry_points = entry_point_detector.detect_entry_points(inventory)
            deps_data = dependency_analyzer.analyze_dependencies(inventory)

            code_analyses: List[CodeAnalysisResult] = []
            for item in inventory.files:
                if item.category.value == "SOURCE":
                    an_res = code_analyzer.analyze_file(item.relative_path, item.absolute_path)
                    code_analyses.append(an_res)

            proj_map: ProjectMap = project_map_builder.build_map(inventory)
            dep_graph: DependencyGraph = dependency_graph_builder.build_graph(code_analyses)
            code_search_engine.index_project(inventory, code_analyses)

            state_manager.update_context(session_id, "project_inventory", inventory.model_dump())
            state_manager.update_context(session_id, "dependencies", deps_data)
            state_manager.update_context(session_id, "project_map", proj_map.model_dump())

            # Stage 2: ANALYZING (Error Parser & Fault Localizer & Hindsight Recall)
            state_manager.transition_state(session_id, SessionState.ANALYZING, "Parsing error & searching Hindsight persistent memory")
            raw_err_text = target_error or "TypeError: 'NoneType' object is not subscriptable\n File 'app.py', line 10, in process"
            parsed_error = self.traceback_parser.parse(raw_err_text)
            fault_loc = self.fault_localizer.localize(parsed_error)

            # HINDSIGHT RECALL OPERATION
            hindsight_recall = self.hindsight_memory.recall(
                error_type=parsed_error.error_type,
                error_message=parsed_error.message,
                affected_file=fault_loc.file_path,
                category=parsed_error.category.value
            )
            
            state_manager.update_context(session_id, "parsed_error", parsed_error.model_dump())
            state_manager.update_context(session_id, "fault_location", fault_loc.model_dump())
            state_manager.update_context(session_id, "hindsight_recall", hindsight_recall.model_dump())

            # Stage 3: INVESTIGATING
            state_manager.transition_state(session_id, SessionState.INVESTIGATING, "Agent investigating root cause")
            investigation_report = self.investigation_agent.investigate(session_id, parsed_error, fault_loc, abs_project_path)
            root_cause_diagnosis = self.root_cause_agent.diagnose(investigation_report)

            state_manager.update_context(session_id, "investigation_report", investigation_report.model_dump())
            state_manager.update_context(session_id, "root_cause_diagnosis", root_cause_diagnosis.model_dump())

            # Stage 4: PLANNING_FIX
            state_manager.transition_state(session_id, SessionState.PLANNING_FIX, "Formulating repair plan & candidates")
            repair_plan = self.repair_agent.plan_and_generate(investigation_report, root_cause_diagnosis, abs_project_path)
            state_manager.update_context(session_id, "repair_plan", repair_plan.model_dump())

            # Stage 5: APPLYING_FIX & VALIDATING CANDIDATE
            candidate = repair_plan.proposed_candidates[0] if repair_plan.proposed_candidates else None

            state_manager.transition_state(session_id, SessionState.APPLYING_FIX, "Applying candidate patch")
            if candidate:
                target_file_abs = os.path.join(abs_project_path, candidate.target_file)
                if os.path.exists(target_file_abs):
                    self.patch_manager.apply_candidate(target_file_abs, candidate)

            # Stage 6: VALIDATING
            state_manager.transition_state(session_id, SessionState.VALIDATING, "Verifying candidate patch with Evidence Verifier")
            
            is_verified = False
            if candidate:
                certificate = self.evidence_verifier.verify_candidate(
                    session_id=session_id,
                    patch=candidate,
                    project_root=abs_project_path,
                    test_command=test_command
                )
                state_manager.update_context(session_id, "verification_certificate", certificate.model_dump())
                is_verified = (certificate.status == "REPAIR VERIFIED") and not simulate_validation_failure

            if is_verified:
                # HINDSIGHT RETAIN OPERATION
                retained_record = self.hindsight_memory.retain(
                    incident_id=session_id,
                    project_path=abs_project_path,
                    error_type=parsed_error.error_type,
                    error_message=parsed_error.message,
                    category=parsed_error.category.value,
                    root_cause_summary=root_cause_diagnosis.primary_cause,
                    recommended_fix_strategy=root_cause_diagnosis.recommended_fix_strategy,
                    affected_file=fault_loc.file_path,
                    line_number=fault_loc.line_number,
                    function_name=fault_loc.function_name,
                    unified_diff=candidate.diff_text if candidate else None,
                    verification_status="REPAIR VERIFIED"
                )
                state_manager.update_context(session_id, "retained_hindsight_record", retained_record.model_dump())

                state_manager.transition_state(session_id, SessionState.SUCCESS, "Repair verified & retained in Hindsight!")
                await event_bus.publish(EngineEvent(
                    session_id=session_id,
                    event_type=EventType.STATE_TRANSITION,
                    sender="EngineOrchestrator",
                    message="Repair session completed successfully!",
                    payload={"status": "SUCCESS", "hindsight_record_id": retained_record.record_id}
                ))
            else:
                state_manager.transition_state(session_id, SessionState.FAILED, "Validation failed or simulated failure")
                state_manager.transition_state(session_id, SessionState.ROLLING_BACK, "Rolling back changes")
                self.patch_manager.rollback_all()
                state_manager.transition_state(session_id, SessionState.INVESTIGATING, "Re-investigating post-rollback")

        except Exception as e:
            logger.error(f"Error in RepairSession '{session_id}': {e}")
            if session.current_state != SessionState.FAILED:
                try:
                    state_manager.transition_state(session_id, SessionState.FAILED, f"Error: {str(e)}")
                except StateTransitionError:
                    pass
            raise e

        return session

engine_orchestrator = EngineOrchestrator()
