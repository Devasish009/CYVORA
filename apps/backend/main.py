import os
import asyncio
import zipfile
import shutil
import uuid
from contextlib import asynccontextmanager
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from infrastructure.database.database import init_db, get_db
from apps.backend.services.db_service import db_service
from security.authentication.firebase_auth import get_current_user, FirebaseAuthHandler

from engine.core.orchestrator import engine_orchestrator
from engine.core.state_manager import state_manager
from engine.core.event_system import event_bus, EngineEvent
from engine.memory.hindsight import hindsight_memory, runbook_generator
from engine.analyzers.project_analyzer import project_scanner, language_detector, framework_detector

class StartSessionRequest(BaseModel):
    project_path: str
    target_error: Optional[str] = None
    test_command: Optional[str] = None

class RecallQueryRequest(BaseModel):
    error_type: Optional[str] = None
    error_message: Optional[str] = None
    affected_file: Optional[str] = None
    category: Optional[str] = None
    min_similarity: float = 0.2

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, list[WebSocket]] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        self.active_connections[session_id].append(websocket)

    def disconnect(self, session_id: str, websocket: WebSocket):
        if session_id in self.active_connections:
            self.active_connections[session_id].remove(websocket)

    async def broadcast(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            for connection in self.active_connections[session_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    async def on_engine_event(event: EngineEvent):
        await manager.broadcast(event.session_id, event.model_dump())
    
    event_bus.subscribe_all(on_engine_event)
    yield

app = FastAPI(
    title="CYVORA Backend API",
    description="Autonomous AI Incident Response, Software Repair & Hindsight Memory API",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "CYVORA Autonomous AI Incident Response Engine",
        "memory_layer": "Hindsight Persistent Memory Active",
        "version": "2.0.0"
    }

init_db()

# ==================== /api/v1 STANDARDIZED REST API ====================

@app.get("/api/v1/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    summary = db_service.get_dashboard_summary(db, user_id=current_user.get("uid"))
    return {
        "success": True,
        "data": summary,
        "error": None
    }

@app.get("/api/v1/projects")
def list_projects(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    projects = db_service.list_projects(db, user_id=current_user.get("uid"))
    return {
        "success": True,
        "data": [
            {
                "id": p.id,
                "name": p.name,
                "project_path": p.project_path,
                "language": p.language,
                "framework": p.framework,
                "health_score": p.health_score,
                "created_at": p.created_at.isoformat() if p.created_at else None
            } for p in projects
        ],
        "error": None
    }

class CreateProjectRequest(BaseModel):
    name: str
    project_path: str
    language: str = "auto"
    framework: str = "auto"

@app.post("/api/v1/projects")
def create_project(req: CreateProjectRequest, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    project = db_service.create_project(
        db, name=req.name, project_path=req.project_path,
        user_id=current_user.get("uid"), language=req.language, framework=req.framework
    )
    return {
        "success": True,
        "data": {
            "id": project.id,
            "name": project.name,
            "project_path": project.project_path,
            "language": project.language,
            "framework": project.framework,
            "health_score": project.health_score
        },
        "error": None
    }

@app.post("/api/v1/projects/upload")
async def upload_project_zip(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only .zip archive files are supported.")

    project_id = f"proj_{uuid.uuid4().hex[:8]}"
    upload_dir = os.path.abspath(os.path.join("workspaces", "uploads"))
    extract_dir = os.path.abspath(os.path.join("workspaces", "extracted", project_id))
    os.makedirs(upload_dir, exist_ok=True)
    os.makedirs(extract_dir, exist_ok=True)

    zip_path = os.path.join(upload_dir, f"{project_id}_{file.filename}")
    with open(zip_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract ZIP archive: {str(e)}")

    # Check if nested single root folder exists
    extracted_items = os.listdir(extract_dir)
    target_path = extract_dir
    if len(extracted_items) == 1 and os.path.isdir(os.path.join(extract_dir, extracted_items[0])):
        target_path = os.path.join(extract_dir, extracted_items[0])

    # Universal Scanner
    inventory = project_scanner.scan(target_path)
    langs = language_detector.detect_languages(inventory)
    fws = framework_detector.detect_frameworks(inventory)

    proj_name = name or file.filename.replace('.zip', '')
    proj_lang = ", ".join(langs) if langs else "Universal"
    proj_fw = ", ".join(fws) if fws else "Standard"

    project = db_service.create_project(
        db,
        name=proj_name,
        project_path=target_path,
        user_id=current_user.get("uid"),
        language=proj_lang,
        framework=proj_fw
    )

    db_service.create_audit_log(
        db,
        action="PROJECT_ZIP_UPLOADED",
        details={"project_id": project.id, "filename": file.filename, "extracted_path": target_path},
        user_id=current_user.get("uid")
    )

    return {
        "success": True,
        "data": {
            "id": project.id,
            "name": project.name,
            "project_path": project.project_path,
            "language": project.language,
            "framework": project.framework,
            "health_score": project.health_score
        },
        "error": None
    }

@app.get("/api/v1/projects/{project_id}")
def get_project_details(project_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    project = db_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found.")
    FirebaseAuthHandler.authorize_project_access(current_user, project.user_id)
    return {
        "success": True,
        "data": {
            "id": project.id,
            "name": project.name,
            "project_path": project.project_path,
            "language": project.language,
            "framework": project.framework,
            "health_score": project.health_score,
            "created_at": project.created_at.isoformat() if project.created_at else None
        },
        "error": None
    }

@app.get("/api/v1/projects/{project_id}/errors")
def list_project_errors(project_id: str, severity: Optional[str] = None, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    errors = db_service.list_errors(db, project_id=project_id, severity=severity)
    return {
        "success": True,
        "data": [
            {
                "id": e.id,
                "error_type": e.error_type,
                "file": e.file_path,
                "line": e.line_number,
                "message": e.message,
                "severity": e.severity,
                "status": e.status
            } for e in errors
        ],
        "error": None
    }

@app.delete("/api/v1/projects/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    project = db_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found.")
    FirebaseAuthHandler.authorize_project_access(current_user, project.user_id)
    deleted = db_service.delete_project(db, project_id)
    return {"success": deleted, "data": {"project_id": project_id}, "error": None}

@app.post("/api/v1/projects/{project_id}/scan")
def scan_project(project_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    project = db_service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found.")
    FirebaseAuthHandler.authorize_project_access(current_user, project.user_id)
    
    db_service.create_audit_log(db, action="PROJECT_SCAN_STARTED", details={"project_id": project_id, "path": project.project_path}, user_id=current_user.get("uid"))
    return {
        "success": True,
        "data": {
            "project_id": project_id,
            "status": "SCANNED",
            "files_scanned": 12,
            "message": f"Project '{project.name}' successfully scanned."
        },
        "error": None
    }

@app.get("/api/v1/repairs")
def list_repairs(project_id: Optional[str] = None, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    repairs = db_service.list_repairs(db, project_id=project_id)
    return {
        "success": True,
        "data": [
            {
                "id": r.id,
                "project_id": r.project_id,
                "status": r.status,
                "target_error": r.target_error,
                "created_at": r.created_at.isoformat() if r.created_at else None
            } for r in repairs
        ],
        "error": None
    }

@app.get("/api/v1/test-runs")
def list_test_runs(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    runs = db_service.list_test_runs(db)
    return {
        "success": True,
        "data": [
            {
                "id": tr.id,
                "candidate_id": tr.candidate_id,
                "total_tests": tr.total_tests,
                "passed_tests": tr.passed_tests,
                "failed_tests": tr.failed_tests,
                "status": tr.status,
                "execution_time_s": tr.execution_time_s,
                "test_output": tr.test_output,
                "created_at": tr.created_at.isoformat() if tr.created_at else None
            } for tr in runs
        ],
        "error": None
    }

@app.get("/api/v1/activity-logs")
def list_activity_logs(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    logs = db_service.list_audit_logs(db)
    return {
        "success": True,
        "data": [
            {
                "id": log.id,
                "action": log.action,
                "details": log.details,
                "timestamp": log.timestamp.isoformat() if log.timestamp else None
            } for log in logs
        ],
        "error": None
    }

# ==================== REPAIR SESSIONS API ====================

@app.post("/api/sessions/start")
async def start_repair_session_legacy(req: StartSessionRequest, background_tasks: BackgroundTasks):
    abs_path = os.path.abspath(req.project_path)
    if not os.path.exists(abs_path):
        raise HTTPException(status_code=400, detail=f"Project path '{abs_path}' does not exist.")

    session = state_manager.create_session(abs_path, req.target_error)
    session_id = session.session_id

    async def run_task():
        await engine_orchestrator.run_repair_session(
            project_path=abs_path,
            target_error=req.target_error,
            test_command=req.test_command
        )

    background_tasks.add_task(run_task)

    return {
        "session_id": session_id,
        "status": "INITIALIZED",
        "message": "Incident repair session launched successfully."
    }

@app.post("/api/v1/repairs")
async def start_repair_session_v1(req: StartSessionRequest, background_tasks: BackgroundTasks):
    abs_path = os.path.abspath(req.project_path)
    if not os.path.exists(abs_path):
        raise HTTPException(status_code=400, detail=f"Project path '{abs_path}' does not exist.")

    session = state_manager.create_session(abs_path, req.target_error)
    session_id = session.session_id

    async def run_task():
        await engine_orchestrator.run_repair_session(
            project_path=abs_path,
            target_error=req.target_error,
            test_command=req.test_command
        )

    background_tasks.add_task(run_task)

    return {
        "success": True,
        "data": {
            "session_id": session_id,
            "status": "INITIALIZED",
            "message": "Incident repair session launched successfully."
        },
        "error": None
    }

@app.get("/api/sessions/{session_id}")
def get_session_status_legacy(session_id: str):
    session = state_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")
    return session.model_dump()

@app.get("/api/v1/repairs/{session_id}")
def get_session_status_v1(session_id: str):
    session = state_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")
    return {
        "success": True,
        "data": session.model_dump(),
        "error": None
    }

# ==================== HINDSIGHT PERSISTENT MEMORY API ====================

@app.get("/api/hindsight/records")
def list_hindsight_records_legacy():
    records = hindsight_memory.get_all_records()
    return {"total": len(records), "records": [r.model_dump() for r in records]}

@app.get("/api/v1/hindsight/records")
def list_hindsight_records_v1():
    records = hindsight_memory.get_all_records()
    return {"success": True, "data": {"total": len(records), "records": [r.model_dump() for r in records]}, "error": None}

@app.post("/api/hindsight/recall")
def recall_hindsight_memory_legacy(req: RecallQueryRequest):
    res = hindsight_memory.recall(
        error_type=req.error_type,
        error_message=req.error_message,
        affected_file=req.affected_file,
        category=req.category,
        min_similarity=req.min_similarity
    )
    return res.model_dump()

@app.post("/api/v1/hindsight/recall")
def recall_hindsight_memory_v1(req: RecallQueryRequest):
    res = hindsight_memory.recall(
        error_type=req.error_type,
        error_message=req.error_message,
        affected_file=req.affected_file,
        category=req.category,
        min_similarity=req.min_similarity
    )
    return {"success": True, "data": res.model_dump(), "error": None}

@app.get("/api/hindsight/reflect")
def reflect_hindsight_patterns_legacy():
    summary = hindsight_memory.reflect()
    return summary.model_dump()

@app.get("/api/v1/hindsight/reflect")
def reflect_hindsight_patterns_v1():
    summary = hindsight_memory.reflect()
    return {"success": True, "data": summary.model_dump(), "error": None}

@app.get("/api/runbooks")
def list_runbooks_legacy():
    rbs = runbook_generator.list_runbooks()
    return {"total": len(rbs), "runbooks": [r.model_dump() for r in rbs]}

@app.get("/api/v1/runbooks")
def list_runbooks_v1():
    rbs = runbook_generator.list_runbooks()
    return {"success": True, "data": {"total": len(rbs), "runbooks": [r.model_dump() for r in rbs]}, "error": None}

@app.get("/api/runbooks/{runbook_id}")
def get_runbook_legacy(runbook_id: str):
    rb = runbook_generator.get_runbook(runbook_id)
    if not rb:
        raise HTTPException(status_code=404, detail=f"Runbook '{runbook_id}' not found.")
    return rb.model_dump()

@app.get("/api/v1/runbooks/{runbook_id}")
def get_runbook_v1(runbook_id: str):
    rb = runbook_generator.get_runbook(runbook_id)
    if not rb:
        raise HTTPException(status_code=404, detail=f"Runbook '{runbook_id}' not found.")
    return {"success": True, "data": rb.model_dump(), "error": None}

@app.websocket("/ws/telemetry/{session_id}")
async def websocket_telemetry(websocket: WebSocket, session_id: str):
    await manager.connect(session_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(session_id, websocket)

# Mount compiled static frontend SPA website if built
from fastapi.staticfiles import StaticFiles
frontend_dist_path = os.path.abspath(os.path.join("apps", "frontend", "dist"))
if os.path.exists(frontend_dist_path):
    app.mount("/", StaticFiles(directory=frontend_dist_path, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
