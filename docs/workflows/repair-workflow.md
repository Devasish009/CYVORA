# Repair Workflow Lifecycle — CYVORA Phase 2

This document details the state lifecycle, stage progression, and security checks executed during a repair session.

---

## State Transition Diagram

```
[INITIALIZED]
     │
     ▼
[SCANNING]
     │
     ▼
[ANALYZING]
     │
     ▼
[INVESTIGATING] <──────────────┐ (Rollback Recovery Loop)
     │                         │
     ▼                         │
[PLANNING_FIX]                 │
     │                         │
     ▼                         │
[APPLYING_FIX]                 │
     │                         │
     ▼                         │
[VALIDATING] ────► [FAILED] ───┴──► [ROLLING_BACK]
     │
     ▼
 [SUCCESS]
```

---

## Security Verification Gateways

Before transitioning into any stage, `EngineOrchestrator` invokes `SecurityPolicy.validate_or_raise(...)`:
1. **SCANNING**: Requires `PROJECT_READ` & `FilesystemPolicy` read boundary check.
2. **APPLYING_FIX**: Requires `PROJECT_WRITE` & `FilesystemPolicy` write boundary check.
3. **VALIDATING**: Requires `PROJECT_EXECUTE` & `ExecutionPolicy` command validation.
