import base64
import hashlib
import hmac
import json
import secrets
import time
from typing import Any, Dict

from .....infra.settings import settings

PBKDF2_ITERATIONS = 210_000
SALT_BYTES = 16


def _b64encode(data: bytes) -> str:
    """URL-safe base64 without padding."""
    encoded = base64.urlsafe_b64encode(data).decode("utf-8")
    return encoded.rstrip("=")


def _b64decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def hash_password(password: str) -> str:
    if not password:
        raise ValueError("Password must not be empty.")
    salt = secrets.token_bytes(SALT_BYTES)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return f"{_b64encode(salt)}:{_b64encode(dk)}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt_b64, hash_b64 = stored_hash.split(":", 1)
    except ValueError:
        return False
    salt = _b64decode(salt_b64)
    expected = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return hmac.compare_digest(_b64encode(expected), hash_b64)


def create_access_token(data: Dict[str, Any], expires_in_seconds: int = 3600) -> str:
    payload = data.copy()
    payload["exp"] = int(time.time()) + int(expires_in_seconds)
    payload_bytes = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    signature = hmac.new(settings.SECRET_KEY.encode("utf-8"), payload_bytes, hashlib.sha256).digest()
    return f"{_b64encode(payload_bytes)}.{_b64encode(signature)}"


def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        payload_part, signature_part = token.split(".", 1)
        payload_bytes = _b64decode(payload_part)
        expected_signature = hmac.new(
            settings.SECRET_KEY.encode("utf-8"),
            payload_bytes,
            hashlib.sha256,
        ).digest()
        if not hmac.compare_digest(_b64decode(signature_part), expected_signature):
            raise ValueError("Invalid token signature")
        payload = json.loads(payload_bytes.decode("utf-8"))
        if int(payload.get("exp", 0)) < int(time.time()):
            raise ValueError("Token expired")
        return payload
    except Exception as exc:
        raise ValueError("Invalid token") from exc
