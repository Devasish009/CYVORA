import uuid
import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from apps.backend.models.db_models import (
    User, Project, Repository, RepairSession, ErrorModel,
    AnalysisModel, RepairCandidate, TestRunModel, RepairHistoryModel,
    AuditLogModel, NotificationModel
)

class DBService:
    """Database Service Layer handling SQL CRUD Operations."""

    # ================= USER CRUD =================
    @staticmethod
    def get_or_create_user(db: Session, email: str, display_name: Optional[str] = None, firebase_uid: Optional[str] = None) -> User:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                id=f"usr_{uuid.uuid4().hex[:8]}",
                firebase_uid=firebase_uid,
                email=email,
                display_name=display_name or email.split("@")[0],
                role="developer"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    # ================= PROJECT CRUD =================
    @staticmethod
    def list_projects(db: Session, user_id: Optional[str] = None) -> List[Project]:
        query = db.query(Project)
        if user_id:
            query = query.filter(Project.user_id == user_id)
        return query.all()

    @staticmethod
    def create_project(db: Session, name: str, project_path: str, user_id: Optional[str] = None, language: str = "python", framework: str = "fastapi") -> Project:
        project = Project(
            id=f"proj_{uuid.uuid4().hex[:8]}",
            name=name,
            project_path=project_path,
            user_id=user_id,
            language=language,
            framework=framework,
            health_score=94
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def get_project(db: Session, project_id: str) -> Optional[Project]:
        return db.query(Project).filter(Project.id == project_id).first()

    # ================= ERROR CRUD =================
    @staticmethod
    def list_errors(db: Session, project_id: str, severity: Optional[str] = None) -> List[ErrorModel]:
        query = db.query(ErrorModel).filter(ErrorModel.project_id == project_id)
        if severity and severity != "ALL":
            query = query.filter(ErrorModel.severity == severity)
        return query.all()

    @staticmethod
    def create_error(db: Session, project_id: str, error_type: str, file_path: str, message: str, line_number: Optional[int] = None, severity: str = "HIGH", session_id: Optional[str] = None) -> ErrorModel:
        error = ErrorModel(
            id=f"err_{uuid.uuid4().hex[:8]}",
            session_id=session_id,
            project_id=project_id,
            error_type=error_type,
            file_path=file_path,
            line_number=line_number,
            message=message,
            severity=severity,
            status="Detected"
        )
        db.add(error)
        db.commit()
        db.refresh(error)
        return error

    # ================= DASHBOARD SUMMARY =================
    @staticmethod
    def get_dashboard_summary(db: Session, user_id: Optional[str] = None) -> Dict[str, Any]:
        proj_query = db.query(Project)
        err_query = db.query(ErrorModel)
        sess_query = db.query(RepairSession)
        test_query = db.query(TestRunModel)
        audit_query = db.query(AuditLogModel)

        if user_id:
            proj_query = proj_query.filter(Project.user_id == user_id)

        total_projects = proj_query.count()
        total_errors = err_query.count()
        repairs_attempted = sess_query.count()
        repairs_successful = sess_query.filter(RepairSession.status == "SUCCESS").count()
        repairs_failed = sess_query.filter(RepairSession.status == "FAILED").count()
        tests_executed = test_query.count()
        tests_passed = test_query.filter(TestRunModel.status == "PASSED").count()
        tests_failed = test_query.filter(TestRunModel.status == "FAILED").count()
        active_repairs = sess_query.filter(RepairSession.status.in_(["ANALYZING", "RECALLING_MEMORY", "INVESTIGATING", "GENERATING_PATCH", "VALIDATING", "RETRYING"])).count()

        recent_logs = audit_query.order_by(AuditLogModel.timestamp.desc()).limit(10).all()
        recent_activities = [
            {
                "id": log.id,
                "action": log.action,
                "details": log.details,
                "time": log.timestamp.strftime("%H:%M:%S") if log.timestamp else ""
            }
            for log in recent_logs
        ]

        repair_success_rate = (repairs_successful / repairs_attempted * 100) if repairs_attempted > 0 else 0.0

        return {
            "projects": total_projects,
            "repositories": total_projects,  # 1-to-1 project repository mapping
            "files_scanned": total_projects * 10,
            "errors_detected": total_errors,
            "errors_fixed": repairs_successful,
            "repairs_attempted": repairs_attempted,
            "repairs_successful": repairs_successful,
            "repairs_failed": repairs_failed,
            "tests_executed": tests_executed,
            "tests_passed": tests_passed,
            "tests_failed": tests_failed,
            "active_repairs": active_repairs,
            "repair_success_rate": round(repair_success_rate, 1),
            "recent_activities": recent_activities
        }

    # ================= REPAIR SESSIONS & HISTORY CRUD =================
    @staticmethod
    def list_repairs(db: Session, project_id: Optional[str] = None) -> List[RepairSession]:
        query = db.query(RepairSession)
        if project_id:
            query = query.filter(RepairSession.project_id == project_id)
        return query.order_by(RepairSession.created_at.desc()).all()

    @staticmethod
    def get_repair(db: Session, session_id: str) -> Optional[RepairSession]:
        return db.query(RepairSession).filter(RepairSession.id == session_id).first()

    @staticmethod
    def delete_project(db: Session, project_id: str) -> bool:
        project = db.query(Project).filter(Project.id == project_id).first()
        if project:
            db.delete(project)
            db.commit()
            return True
        return False

    @staticmethod
    def list_test_runs(db: Session) -> List[TestRunModel]:
        return db.query(TestRunModel).order_by(TestRunModel.created_at.desc()).all()

    @staticmethod
    def list_audit_logs(db: Session) -> List[AuditLogModel]:
        return db.query(AuditLogModel).order_by(AuditLogModel.timestamp.desc()).all()

    @staticmethod
    def create_audit_log(db: Session, action: str, details: Optional[Dict[str, Any]] = None, user_id: Optional[str] = None) -> AuditLogModel:
        log = AuditLogModel(
            id=f"log_{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            action=action,
            details=details or {}
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

db_service = DBService()
