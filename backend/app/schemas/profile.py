from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.schemas.profile_photo import ProfilePhotoRead


class ProfileBase(BaseModel):
    age: int
    age_group: str | None = None
    nationality: str | None = None
    gender: str | None = None
    occupation: str | None = None
    location: str | None = None
    native_language: str | None = None
    learning_language: str | None = None
    language_level: str | None = None
    match_purpose: str | None = None
    bio: str | None = None
    interests: list[str] = Field(default_factory=list)

    @field_validator("age")
    @classmethod
    def validate_age(cls, value: int) -> int:
        if value < 18 or value > 120:
            raise ValueError("age must be between 18 and 120")
        return value

    @field_validator("bio")
    @classmethod
    def normalize_bio(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None

    @field_validator(
        "occupation",
        "location",
        "native_language",
        "learning_language",
        "language_level",
        "match_purpose",
        mode="before",
    )
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = str(value).strip()
        return normalized or None

    @field_validator("nationality", mode="before")
    @classmethod
    def normalize_nationality(cls, value: str | None) -> str | None:
        normalized = str(value or "").strip().lower()
        if normalized in {"kr", "korea", "korean", "south korea", "한국", "대한민국"}:
            return "KR"
        if normalized in {"jp", "japan", "japanese", "일본"}:
            return "JP"
        return None

    @field_validator("gender", mode="before")
    @classmethod
    def normalize_gender(cls, value: str | None) -> str | None:
        normalized = str(value or "").strip().lower()
        if normalized in {"male", "man", "m", "남성", "남자"}:
            return "male"
        if normalized in {"female", "woman", "f", "여성", "여자"}:
            return "female"
        return None

    @field_validator("interests")
    @classmethod
    def normalize_interests(cls, value: list[str]) -> list[str]:
        normalized = []
        for item in value:
            interest = item.strip()
            if interest:
                normalized.append(interest)
        return normalized


class ProfileCreate(ProfileBase):
    phone_number: str | None = None

    @model_validator(mode="after")
    def validate_required_profile_fields(self) -> "ProfileCreate":
        if not (
            self.nationality
            and self.gender
            and self.native_language
            and self.learning_language
            and (self.match_purpose or self.bio)
        ):
            raise ValueError("Required profile information is missing")
        if not (
            (self.nationality == "KR" and self.gender == "male")
            or (self.nationality == "JP" and self.gender == "female")
        ):
            raise ValueError("HanilMatch MVP supports Korean male and Japanese female recommendations")
        return self

    @field_validator("phone_number", mode="before")
    @classmethod
    def normalize_phone_number(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = str(value).strip()
        return normalized or None


class PublicProfileRead(ProfileBase):
    user_id: UUID
    photos: list[ProfilePhotoRead] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class ProfileRead(PublicProfileRead):
    phone_number: str | None = None
