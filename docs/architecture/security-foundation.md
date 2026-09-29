# Security Foundation Architecture — CYVORA Phase 2

CYVORA enforces security as a cross-cutting foundation integrated directly into the core orchestrator and all engine operations.

---

## Security Layers

### 1. Filesystem Security (`security/filesystem_security/`)
- **`FilesystemPolicy`**: Normalizes all paths using absolute resolution (`Path.resolve()`) to prevent directory traversal (`..`).
- Restricts operations to the designated project root.
- Blocks system directories (`/etc`, `/root`, `/sys`, `C:\Windows`, etc.) and returns structured `FilesystemSecurityError` on violations.

### 2. Secret Protection (`security/secrets/`)
- **`SecretRedactor`**: Redacts sensitive API keys, tokens, credentials, and private keys from strings, logs, dicts, and exception messages (`API_KEY=[REDACTED]`).

### 3. Agent Permission Model (`security/agent_security/`)
- **`AgentPermissionManager`**: Adheres to **DENY BY DEFAULT**.
- Defines explicit permissions: `PROJECT_READ`, `PROJECT_WRITE`, `PROJECT_EXECUTE`, `NETWORK_ACCESS`, `SECRET_ACCESS`, `GIT_ACCESS`.

### 4. Execution Security (`security/execution_security/`)
- **`ExecutionPolicy`**: Enforces executable whitelists and blocks malicious command patterns (`rm -rf /`, `curl | sh`, etc.).

### 5. Prompt Security (`security/prompt_security/`)
- **`PromptSecurity`**: Treats repository files, comments, and logs as **UNTRUSTED DATA** and wraps content in XML boundary tags to prevent prompt injection.

### 6. Audit System (`security/audit/`)
- **`AuditLogger`**: Records immutable `AuditRecord` entries for all security checks without recording raw secrets.

### 7. Central Policy Engine (`security/security_policy.py`)
- **`SecurityPolicy.check(operation, context)`**: Evaluates requests and returns `ALLOW`, `DENY`, or `REQUIRES_APPROVAL`.
