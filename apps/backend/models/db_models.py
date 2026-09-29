import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from infrastructure.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=True)
    role = Column(String, default="developer")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLogModel", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("NotificationModel", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    project_path = Column(String, nullable=False)
    language = Column(String, default="python")
    framework = Column(String, default="fastapi")
    health_score = Column(Integer, default=94)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="projects")
    repositories = relationship("Repository", back_populates="project", cascade="all, delete-orphan")
    repair_sessions = relationship("RepairSession", back_populates="project", cascade="all, delete-orphan")
    repair_history = relationship("RepairHistoryModel", back_populates="project", cascade="all, delete-orphan")


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    repo_url = Column(String, nullable=False)
    branch = Column(String, default="main")
    is_connected = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="repositories")


class RepairSession(Base):
    __tablename__ = "repair_sessions"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    status = Column(String, default="QUEUED", index=True)  # QUEUED, ANALYZING, RECALLING_MEMORY, GENERATING_PATCH, VALIDATING, RETRYING, SUCCESS, FAILED
    target_error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="repair_sessions")
    errors = relationship("ErrorModel", back_populates="session", cascade="all, delete-orphan")


class ErrorModel(Base):
    __tablename__ = "errors"

    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("repair_sessions.id"), nullable=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    error_type = Column(String, nullable=False, index=True)
    file_path = Column(String, nullable=False)
    line_number = Column(Integer, nullable=True)
    message = Column(Text, nullable=False)
    severity = Column(String, default="HIGH", index=True)
    status = Column(String, default="Detected", index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("RepairSession", back_populates="errors")
    analyses = relationship("AnalysisModel", back_populates="error", cascade="all, delete-orphan")


class AnalysisModel(Base):
    __tablename__ = "analyses"

    id = Column(String, primary_key=True, index=True)
    error_id = Column(String, ForeignKey("errors.id"), nullable=False, index=True)
    root_cause_summary = Column(Text, nullable=False)
    reasoning = Column(Text, nullable=True)
    affected_files = Column(JSON, default=list)
    confidence = Column(Float, default=0.95)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    error = relationship("ErrorModel", back_populates="analyses")
    candidates = relationship("RepairCandidate", back_populates="analysis", cascade="all, delete-orphan")


class RepairCandidate(Base):
    __tablename__ = "repair_candidates"

    id = Column(String, primary_key=True, index=True)
    analysis_id = Column(String, ForeignKey("analyses.id"), nullable=False, index=True)
    patch_code = Column(Text, nullable=False)
    strategy = Column(String, nullable=True)
    status = Column(String, default="PENDING")
    validation_result = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    analysis = relationship("AnalysisModel", back_populates="candidates")
    test_runs = relationship("TestRunModel", back_populates="candidate", cascade="all, delete-orphan")


class TestRunModel(Base):
    __tablename__ = "test_runs"

    id = Column(String, primary_key=True, index=True)
    candidate_id = Column(String, ForeignKey("repair_candidates.id"), nullable=False, index=True)
    total_tests = Column(Integer, default=0)
    passed_tests = Column(Integer, default=0)
    failed_tests = Column(Integer, default=0)
    test_output = Column(Text, nullable=True)
    status = Column(String, default="PASSED")  # PASSED, FAILED, NOT_VERIFIED, TIMEOUT, ERROR
    execution_time_s = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    candidate = relationship("RepairCandidate", back_populates="test_runs")


class RepairHistoryModel(Base):
    __tablename__ = "repair_history"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    error_type = Column(String, nullable=False)
    root_cause = Column(Text, nullable=False)
    unified_diff = Column(Text, nullable=False)
    status = Column(String, default="SUCCESS")
    duration_s = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="repair_history")
    memory_references = relationship("MemoryReferenceModel", back_populates="repair_history", cascade="all, delete-orphan")


class MemoryReferenceModel(Base):
    __tablename__ = "memory_references"

    id = Column(String, primary_key=True, index=True)
    repair_history_id = Column(String, ForeignKey("repair_history.id"), nullable=False, index=True)
    hindsight_record_id = Column(String, nullable=False)
    relevance_score = Column(Float, default=0.9)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    repair_history = relationship("RepairHistoryModel", back_populates="memory_references")


class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String, nullable=False)
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")


class NotificationModel(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")
