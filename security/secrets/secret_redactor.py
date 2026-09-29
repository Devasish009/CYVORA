import re
from typing import List, Dict, Any, Union

class SecretRedactor:
    """Redacts secrets, API keys, credentials, and tokens from strings and data structures."""
    
    SECRET_PATTERNS = [
        # Generic API Keys / Secrets / Tokens / Parameters
        r'(?i)(api[_-]?key|secret|token|password|passwd|auth[_-]?token|access[_-]?token|key)\s*[:=]\s*["\']?([a-zA-Z0-9_\-\.\:\/@]+)["\']?',
        # AWS / Cloud Keys
        r'AKIA[0-9A-Z]{16}',
        # OpenAI / Anthropic / GitHub / Generic API Keys
        r'sk-[a-zA-Z0-9_\-]{10,}',
        r'ghp_[a-zA-Z0-9]{36}',
        r'glpat-[a-zA-Z0-9\-]{20,}',
        # Private Keys
        r'-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----[\s\S]+?-----END\s+(?:RSA\s+)?PRIVATE\s+KEY-----',
        # Database URIs with credentials
        r'postgres(?:ql)?://([^:]+):([^@]+)@',
        r'mysql://([^:]+):([^@]+)@',
        r'mongodb(?:\+srv)?://([^:]+):([^@]+)@',
    ]

    def __init__(self, custom_patterns: List[str] = None):
        self.patterns = [re.compile(p) for p in self.SECRET_PATTERNS]
        if custom_patterns:
            self.patterns.extend([re.compile(p) for p in custom_patterns])

    def has_secrets(self, text: str) -> bool:
        if not text or not isinstance(text, str):
            return False
        for pattern in self.patterns:
            if pattern.search(text):
                return True
        return False

    def redact_text(self, text: str) -> str:
        if not text or not isinstance(text, str):
            return text

        redacted = text
        for pattern in self.patterns:
            def replace_match(match):
                if match.groups():
                    full_str = match.group(0)
                    val = match.group(len(match.groups()))
                    return full_str.replace(val, "[REDACTED]")
                return "[REDACTED]"
            
            try:
                redacted = pattern.sub(replace_match, redacted)
            except Exception:
                pass
        return redacted

    def redact_data(self, data: Union[Dict, List, str, Any]) -> Any:
        if isinstance(data, str):
            return self.redact_text(data)
        elif isinstance(data, dict):
            redacted_dict = {}
            for k, v in data.items():
                if any(sec_term in str(k).lower() for sec_term in ["secret", "password", "token", "key", "auth"]):
                    redacted_dict[k] = "[REDACTED]"
                else:
                    redacted_dict[k] = self.redact_data(v)
            return redacted_dict
        elif isinstance(data, list):
            return [self.redact_data(item) for item in data]
        return data

secret_redactor = SecretRedactor()
