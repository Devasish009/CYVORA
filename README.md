# CYVORA - Autonomous AI Software Repair & Debugging Engine

![CYVORA Banner](https://img.shields.io/badge/CYVORA-Autonomous%20AI%20Code%20Repair-blueviolet?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Python](https://img.shields.io/badge/python-3.10%2B-blue?style=for-the-badge)
![React](https://img.shields.io/badge/frontend-React%20%2B%20Vite-cyan?style=for-the-badge)

CYVORA is an enterprise-grade multi-agent autonomous software repair system. It automatically ingests software errors, analyzes codebases, investigates root causes, formulates repair plans, generates diff patches, validates candidate fixes in isolated sandboxes, and applies verified fixes back to repositories.

---

## Architecture Blueprint

```
CYVORA/
├── apps/
│   ├── frontend/         # React + Vite Interactive Control Center & Live Visualizer
│   └── backend/          # FastAPI Backend Services, WebSocket Dispatcher & REST APIs
├── engine/
│   ├── core/             # Orchestrator, Workflow DAG Engine, Task Manager, Event System
│   ├── agents/           # Specialized AI Agents (Project, Error, Investigation, RootCause, Repair, Validation, Recovery)
│   ├── analyzers/        # Code, Error, AST, Dependency, Log, & Fault Localization Analyzers
│   ├── context/          # Context Builder, Symbol Search, Dependency & Call Graphs
│   ├── repair/           # Fix Planner, Patch Generator, Unified Diff Engine, Patch Manager
│   ├── sandbox/          # Isolated Execution Sandbox (Subprocess/Docker, Resource Limits)
│   ├── validation/       # Automated Test, Lint, Type Check & Regression Runners
│   └── memory/           # Repair History DB, Knowledge Base & Vector Retrieval
├── integrations/         # Git, GitHub, GitLab, Bitbucket, IDE & CI/CD Adapters
├── infrastructure/       # Database, Cache, Queue, Logging & Monitoring
├── security/             # Authentication, Secrets Masking, Audit Logs & Sandbox Policies
├── tests/                # Unit, Integration, Agent, and End-to-End Test Suite
└── docs/                 # System Architecture & Development Documentation
```

---

## Features

- **Multi-Agent Orchestration**: Collaborative execution pipeline with dedicated AI agent personas.
- **AST & Semantic Analysis**: Multi-language code parsing, dependency graph extraction, and call graph reconstruction.
- **Spectrum-Based & AI Fault Localization**: Pinpoint precise fault locations from error tracebacks.
- **Automated Fix Generation**: Synthesize multi-file patches adhering to project style guidelines.
- **Isolated Sandbox Execution**: Validate code candidates in subprocess or containerized environments with memory and execution timeouts.
- **Regression Checking**: Re-run existing test suites to prevent unintended breaking changes.
- **Real-Time Live UI**: Live execution telemetry, interactive diff review, agent step visualizer, and approval workflows.

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Docker (optional, for containerized sandbox execution)

### Installation

1. **Clone and Setup Python Engine & Backend**:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate

   pip install -r requirements.txt
   ```

2. **Setup Frontend**:
   ```bash
   cd apps/frontend
   npm install
   ```

3. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```

4. **Launch Application**:
   - Backend API & Engine Server:
     ```bash
     python -m apps.backend.main
     ```
   - Frontend Dashboard:
     ```bash
     cd apps/frontend
     npm run dev
     ```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
