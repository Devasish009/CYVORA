# Project Intelligence Architecture — CYVORA Phase 3

The Project Intelligence engine provides CYVORA with deep, multi-layered repository inspection capabilities prior to error investigation or code repair.

---

## Intelligence Sub-Systems

### 1. Project Scanner (`engine/analyzers/project_analyzer/project_scanner.py`)
- Recursively inspects file trees while strictly enforcing `FilesystemPolicy` access boundaries.
- Ignores build outputs, virtual environments, `.git`, `node_modules`, and cache directories.
- Categorizes items into `SOURCE`, `CONFIG`, `TEST`, `DOCUMENTATION`, `ASSET`, and `OTHER`.

### 2. Language & Framework Detection
- **`LanguageDetector`**: Extension and manifest based deterministic identification (Python, JavaScript, TypeScript, Java, C++, Go, Rust, HTML, CSS).
- **`FrameworkDetector`**: Manifest & code signature inspection for FastAPI, Django, Flask, React, Next.js, Express, Spring, Vue, Angular, Vite.
- **`EntryPointDetector`**: Identifies main application files (`main.py`, `app.py`, `server.js`, `index.tsx`, `FastAPI()`).

### 3. Dependency Analyzer (`engine/analyzers/dependency_analyzer/`)
- Parses `requirements.txt`, `pyproject.toml`, `package.json`, `pom.xml`, and `build.gradle` to map direct package dependencies.

### 4. AST Code Analyzer (`engine/analyzers/code_analyzer/`)
- Uses Python `ast` module and regex static analysis for JS/TS/Java to extract functions, methods, classes, imports, variables, line numbers, and definitions.

### 5. Architectural Mapping & Dependency Graph (`engine/context/`)
- **`ProjectMap`**: Reconstructs structural module layout (Backend, Frontend, Core Engine, Tests, Config, Docs).
- **`DependencyGraph`**: Reconstructs file-level import relationships (`A` -> `B` -> `C`) and provides reverse lookup for dependent component tracing.

### 6. Code Search & Context Builder (`engine/context/`)
- **`CodeSearchEngine`**: Multi-index search engine supporting filename, symbol (class/function), import, and text pattern queries.
- **`ContextBuilder`**: Assembles targeted contextual packages for failing symbols, wrapping raw code with `PromptSecurity` boundary tags.

---

## Security Compliance

All Project Intelligence operations run within the Phase 2 Security Foundation:
- Reads are validated via `FilesystemPolicy`.
- `AgentPermission.PROJECT_READ` is enforced by `AgentPermissionManager`.
- Secrets found in project manifests are scrubbed via `SecretRedactor`.
- File content is wrapped in `<untrusted_content_boundary>` tags before passing to any reasoning components.
- All scan activities emit immutable `AuditRecord` logs.
