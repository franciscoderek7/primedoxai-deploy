"""backend/api/deps.py — shared auth dependencies for protected routes."""

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from ..core.db import get_db
from ..core.security import decode_token
from ..db_models.user import ApiKey, User


def get_current_user(
    authorization: str = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")

    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_token(token)
    except ValueError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(exc)) from exc

    if payload.get("type") != "access":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not an access token")

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found or inactive")
    return user


def get_api_key_user(
    x_api_key: str = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not x_api_key:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing X-API-Key")

    api_key = db.query(ApiKey).filter(ApiKey.key == x_api_key).first()
    if not api_key:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid API key")
    if api_key.expires_at and api_key.expires_at.tzinfo and api_key.expires_at < api_key.expires_at.now():
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "API key expired")
    if api_key.usage_count >= api_key.rate_limit:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Rate limit exceeded")

    api_key.usage_count += 1
    db.commit()

    user = db.query(User).filter(User.id == api_key.user_id).first()
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "API key has no owning user")
    return user
