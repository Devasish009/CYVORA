import os
import pytest
from fastapi.testclient import TestClient
from apps.backend.main import app

client = TestClient(app)

def test_api_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "Hindsight" in data["memory_layer"]

def test_start_session_endpoint():
    proj_dir = os.path.abspath("./example_project")
    os.makedirs(proj_dir, exist_ok=True)

    response = client.post(
        "/api/sessions/start",
        json={
            "project_path": proj_dir,
            "target_error": "TypeError: 'NoneType' object is not subscriptable"
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert data["status"] == "INITIALIZED"

def test_hindsight_api_endpoints():
    # 1. GET /api/hindsight/records
    rec_res = client.get("/api/hindsight/records")
    assert rec_res.status_code == 200
    assert "records" in rec_res.json()

    # 2. POST /api/hindsight/recall
    recall_res = client.post(
        "/api/hindsight/recall",
        json={
            "error_type": "TypeError",
            "category": "NULL_POINTER"
        }
    )
    assert recall_res.status_code == 200
    assert "matches_found" in recall_res.json()

    # 3. GET /api/hindsight/reflect
    reflect_res = client.get("/api/hindsight/reflect")
    assert reflect_res.status_code == 200
    assert "recurring_patterns" in reflect_res.json()

    # 4. GET /api/runbooks
    runbook_res = client.get("/api/runbooks")
    assert runbook_res.status_code == 200
    assert "runbooks" in runbook_res.json()
