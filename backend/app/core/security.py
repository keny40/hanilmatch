import base64
import hashlib
import hmac
import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone

import jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    derived_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return f"{base64.b64encode(salt).decode()}:{base64.b64encode(derived_key).decode()}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        salt_b64, hash_b64 = password_hash.split(":", maxsplit=1)
    except ValueError:
        return False

    salt = base64.b64decode(salt_b64.encode())
    expected = base64.b64decode(hash_b64.encode())
    actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return hmac.compare_digest(actual, expected)


def create_access_token(subject: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    payload = {"sub": subject, "exp": expires_at}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(subject: str) -> str:
    token_jti = uuid.uuid4().hex
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.jwt_refresh_token_expire_days)
    payload = {"sub": subject, "exp": expires_at, "type": "refresh", "jti": token_jti}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_csrf_token() -> str:
    return secrets.token_urlsafe(32)
