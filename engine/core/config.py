import os
from pydantic import BaseModel, Field

class EngineConfig(BaseModel):
    environment: str = Field(default_factory=lambda: os.getenv("ENVIRONMENT", "development"))
    log_level: str = Field(default_factory=lambda: os.getenv("LOG_LEVEL", "INFO"))
    sandbox_mode: str = Field(default_factory=lambda: os.getenv("SANDBOX_MODE", "subprocess"))
    sandbox_timeout_seconds: int = Field(default_factory=lambda: int(os.getenv("SANDBOX_TIMEOUT_SECONDS", "60")))
    sandbox_max_memory_mb: int = Field(default_factory=lambda: int(os.getenv("SANDBOX_MAX_MEMORY_MB", "1024")))
    secret_key: str = Field(default_factory=lambda: os.getenv("SECRET_KEY", "cyvora-default-secret-key-change-me"))

config = EngineConfig()
