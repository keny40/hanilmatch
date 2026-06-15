from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


class UserBase(BaseModel):
    email: EmailStr
    gender: str
    nationality: str
    language: str

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in {"male", "female"}:
            raise ValueError("gender must be 'male' or 'female'")
        return normalized

    @field_validator("nationality")
    @classmethod
    def validate_nationality(cls, value: str) -> str:
        normalized = value.strip().upper()
        if normalized not in {"KR", "JP"}:
            raise ValueError("nationality must be 'KR' or 'JP'")
        return normalized

    @field_validator("language")
    @classmethod
    def validate_language(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("language is required")
        return normalized

    @model_validator(mode="after")
    def validate_platform_pair(self) -> "UserBase":
        supported_pair = (
            self.nationality == "KR" and self.gender == "male"
        ) or (
            self.nationality == "JP" and self.gender == "female"
        )
        if not supported_pair:
            raise ValueError("Only Korean male and Japanese female users are supported")
        return self


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserRead(UserBase):
    id: UUID
    is_verified: bool
    is_admin: bool
    membership_tier: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
