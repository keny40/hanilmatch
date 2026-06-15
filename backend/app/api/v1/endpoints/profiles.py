from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.profile import Profile
from app.models.user import User
from app.schemas.profile import ProfileCreate, ProfileRead, PublicProfileRead
from app.services.profile_utils import calculate_age_group


router = APIRouter()


def _profile_response(profile: Profile, user: User, include_private: bool = False) -> ProfileRead | PublicProfileRead:
    data = PublicProfileRead.model_validate(profile).model_dump()
    data["nationality"] = user.nationality
    data["gender"] = user.gender
    if include_private:
        data["phone_number"] = profile.phone_number
        return ProfileRead(**data)
    return PublicProfileRead(**data)


def _apply_profile_identity(current_user: User, payload: ProfileCreate) -> None:
    if payload.nationality:
        current_user.nationality = payload.nationality
    if payload.gender:
        current_user.gender = payload.gender


@router.post("/", response_model=ProfileRead, status_code=201)
def create_profile(
    payload: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProfileRead:
    profile = db.get(Profile, current_user.id)
    if profile is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Profile already exists")

    _apply_profile_identity(current_user, payload)
    payload_data = payload.model_dump(exclude={"nationality", "gender"})
    payload_data["age_group"] = calculate_age_group(payload.age)
    profile = Profile(user_id=current_user.id, **payload_data)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    db.refresh(current_user)
    return _profile_response(profile, current_user, include_private=True)


@router.get("/me", response_model=ProfileRead)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProfileRead:
    profile = db.get(Profile, current_user.id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return _profile_response(profile, current_user, include_private=True)


@router.patch("/me", response_model=ProfileRead)
def update_my_profile(
    payload: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProfileRead:
    profile = db.get(Profile, current_user.id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    _apply_profile_identity(current_user, payload)
    payload_data = payload.model_dump(exclude={"nationality", "gender"})
    payload_data["age_group"] = calculate_age_group(payload.age)
    for field, value in payload_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    db.refresh(current_user)
    return _profile_response(profile, current_user, include_private=True)


@router.get("/{user_id}", response_model=PublicProfileRead)
def get_profile_by_user_id(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PublicProfileRead:
    profile = db.get(Profile, user_id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return _profile_response(profile, user)
