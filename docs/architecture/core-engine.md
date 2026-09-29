# Core Engine Architecture — CYVORA Phase 2

The CYVORA Core Engine provides the central orchestration framework managing session state transitions, async task execution, DAG workflows, and telemetry events.

---

## Key Modules

### 1. State Manager (`engine/core/state_manager/`)
- **`RepairSession`**: Tracks session metadata, active status, configuration, and transition history.
- **`SessionState`**: Enumerates the formal lifecycle states:
  - `INITIALIZED`
  - `SCANNING`
  - `ANALYZING`
  - `INVESTIGATING`
  - `PLANNING_FIX`
  - `APPLYING_FIX`
  - `VALIDATING`
  - `SUCCESS`
  - `FAILED`
  - `ROLLING_BACK`
- **`StateMachine`**: Enforces valid state transition paths and raises `StateTransitionError` on illegal transition attempts.

### 2. Task Manager (`engine/core/task_manager/`)
- **`TaskManager`**: Manages execution state (`PENDING`, `RUNNING`, `COMPLETED`, `FAILED`), dependency validation, execution timing, and async task execution.

### 3. Workflow DAG Engine (`engine/core/workflow/`)
- **`ExecutionDAG`**: Manages step topological sorting and cycle detection.
- **`WorkflowEngine`**: Executes DAG steps sequentially or in parallel while publishing telemetry events.

### 4. Event System (`engine/core/event_system/`)
- **`EngineEvent`**: Strongly-typed telemetry object capturing session ID, event type, sender, and payload.
- **`EventBus`**: Central pub/sub channel for streaming events to loggers and external consumers.

### 5. Engine Orchestrator (`engine/core/orchestrator/`)
- **`EngineOrchestrator`**: Coordinates session lifecycle, verifies security permissions via `SecurityPolicy`, invokes task manager actions, and drives the system from `INITIALIZED` to `SUCCESS` (or handles `FAILED` -> `ROLLING_BACK` loops).
