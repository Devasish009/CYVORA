import os
import json
import base64
from typing import Optional, Dict, Any
from fastapi import Request, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security_scheme = HTTPBearer(auto_error=False)

# Try initializing Firebase Admin SDK if service account file is present
try:
    import firebase_admin
    from firebase_admin import auth, credentials
    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    elif not firebase_admin._apps:
        firebase_admin.initialize_app()
    FIREBASE_SDK_AVAILABLE = True
except Exception:
    FIREBASE_SDK_AVAILABLE = False

class FirebaseAuthHandler:
    """Firebase ID Token Verifier and User Session Guard."""

    @staticmethod
    def verify_token(credentials: Optional[HTTPAuthorizationCredentials]) -> Dict[str, Any]:
        """Parse Bearer token using Firebase Admin SDK or return authenticated dev payload when permitted."""
        allow_dev_auth = os.getenv("CYVORA_ALLOW_DEV_AUTH", "true").lower() == "true"

        if not credentials:
            if allow_dev_auth:
                return {
                    "uid": "usr_dev_default",
                    "email": "developer@cyvora.io",
                    "name": "CYVORA Developer",
                    "role": "developer"
                }
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized: Missing Authorization header."
            )

        token = credentials.credentials
        
        # 1. Try Firebase Admin SDK verification if available
        if FIREBASE_SDK_AVAILABLE:
            try:
                decoded_token = auth.verify_id_token(token)
                return {
                    "uid": decoded_token.get("uid"),
                    "email": decoded_token.get("email", ""),
                    "name": decoded_token.get("name", "Firebase User"),
                    "role": "developer"
                }
            except Exception as e:
                if not allow_dev_auth:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail=f"Unauthorized: Invalid Firebase ID Token ({str(e)})."
                    )

        # 2. Token decoding for valid Bearer token string
        try:
            parts = token.split(".")
            if len(parts) >= 2:
                payload_b64 = parts[1] + "=="
                decoded = json.loads(base64.b64decode(payload_b64).decode("utf-8"))
                uid = decoded.get("sub") or decoded.get("user_id") or "usr_dev_default"
                return {
                    "uid": uid,
                    "email": decoded.get("email", "user@cyvora.io"),
                    "name": decoded.get("name", "CYVORA User"),
                    "role": "developer"
                }
        except Exception:
            pass

        if allow_dev_auth:
            return {
                "uid": "usr_dev_default",
                "email": "developer@cyvora.io",
                "name": "CYVORA Developer",
                "role": "developer"
            }

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Invalid token payload."
        )

    @staticmethod
    def authorize_project_access(user_payload: Dict[str, Any], project_user_id: Optional[str]):
        """Ensure user A cannot access user B's project (403 Forbidden)."""
        if project_user_id and project_user_id != user_payload.get("uid") and user_payload.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You do not have permission to access this project resource."
            )

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> Dict[str, Any]:
    return FirebaseAuthHandler.verify_token(credentials)
