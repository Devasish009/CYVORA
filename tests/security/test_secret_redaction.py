from security.secrets import secret_redactor

def test_secret_redaction_text():
    sample = "Connecting with API_KEY=abcdef123456789 and secret=super_secret_token_123"
    redacted = secret_redactor.redact_text(sample)
    assert "abcdef123456789" not in redacted
    assert "super_secret_token_123" not in redacted
    assert "[REDACTED]" in redacted

def test_secret_redaction_data_structure():
    data = {
        "user": "admin",
        "api_key": "sk-proj-1234567890abcdef",
        "details": {
            "password": "my_secret_password"
        }
    }
    redacted = secret_redactor.redact_data(data)
    assert redacted["api_key"] == "[REDACTED]"
    assert redacted["details"]["password"] == "[REDACTED]"
    assert redacted["user"] == "admin"
