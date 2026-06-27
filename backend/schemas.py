"""backend/schemas.py — request/response contracts shared by the auth/generate/payment routes."""

from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    user_id: UUID
    email: EmailStr
    access_token: str
    refresh_token: str


class RefreshResponse(BaseModel):
    access_token: str
    refresh_token: str


class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    name: Optional[str] = None
    access_level: str

    class Config:
        from_attributes = True


class GenerateRequest(BaseModel):
    type: str
    prompt: str
    variables: Dict[str, Any] = {}


class GenerateResponse(BaseModel):
    document_id: UUID
    status: str
    estimated_time: int = 30


class CheckoutRequest(BaseModel):
    plan_id: str
    success_url: str
    cancel_url: str


class FloorApplyRequest(BaseModel):
    company_name: str
    contact_email: EmailStr
    website_url: Optional[str] = None
    tier_requested: Optional[str] = None
    success_url: str
    cancel_url: str
