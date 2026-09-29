import re
from typing import List, Optional
from pydantic import BaseModel, Field

class ExecutionLimits(BaseModel):
    timeout_seconds: int = 60
    max_memory_mb: int = 1024
    max_cpu_percent: int = 80
    max_processes: int = 10
    allow_network: bool = False

class ExecutionPolicyError(PermissionError):
    """Raised when command execution violates security policy."""
    pass

class ExecutionPolicy:
    """Policy engine governing process command execution safety."""

    DENIED_COMMAND_PATTERNS = [
        r'\brm\s+-rf\s+/',
        r'\bformat\b',
        r'\bmkfs\b',
        r'\bdd\b',
        r':\(\)\{\s*:\|:&\s*\};:',  # Fork bomb
        r'\bshutdown\b',
        r'\breboot\b',
        r'\bcurl\s+.*\|\s*sh\b',
        r'\bwget\s+.*\|\s*sh\b',
        r'\bpowershell\s+.*-enc\b',
    ]

    ALLOWED_PREFIXES = [
        "pytest", "python", "py", "npm", "node", "yarn", "pip", "git", "flake8", "ruff", "mypy", "eslint", "tsc", "cargo", "go"
    ]

    def __init__(self, limits: Optional[ExecutionLimits] = None):
        self.limits = limits or ExecutionLimits()
        self.denied_patterns = [re.compile(p, re.IGNORECASE) for p in self.DENIED_COMMAND_PATTERNS]

    def validate_command(self, command: str, working_dir: Optional[str] = None) -> bool:
        """Validates command string against execution policy limits and blocklists."""
        if not command or not command.strip():
            raise ExecutionPolicyError("Empty command string submitted")

        cmd_clean = command.strip()

        # 1. Check explicitly denied malicious patterns
        for pattern in self.denied_patterns:
            if pattern.search(cmd_clean):
                raise ExecutionPolicyError(f"Command execution DENIED: Matches forbidden security pattern '{pattern.pattern}'")

        # 2. Check if command starts with an allowed executable prefix
        executable = cmd_clean.split()[0].lower().replace("./", "").replace(".\\", "")
        if not any(executable.endswith(prefix) or executable == prefix for prefix in self.ALLOWED_PREFIXES):
            raise ExecutionPolicyError(
                f"Command execution DENIED: Executable '{executable}' is not in allowed tool whitelist."
            )

        return True

execution_policy = ExecutionPolicy()
