import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.profile import Profile
from app.models.profile_photo import ProfilePhoto
from app.models.user import User
from app.schemas.profile_photo import ProfilePhotoRead, ProfilePhotoRegister
from app.services.storage import storage_service


router = APIRouter()
MAX_PROFILE_PHOTOS = 3


def ensure_photo_limit(db: Session, user_id: uuid.UUID) -> None:
    count = db.scalar(select(func.count()).select_from(ProfilePhoto).where(ProfilePhoto.user_id == user_id)) or 0
    if count >= MAX_PROFILE_PHOTOS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile photos are limited to 3",
        )


@router.post("/", response_model=ProfilePhotoRead, status_code=201)
async def upload_profile_photo(
    file: UploadFile = File(...),
    display_order: int = Form(0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProfilePhotoRead:
    profile = db.get(Profile, current_user.id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Profile must exist before uploading photos")
    ensure_photo_limit(db, current_user.id)

    content = await file.read()
    file_url = storage_service.save_profile_photo(
        user_id=str(current_user.id),
        filename=file.filename or f"{uuid.uuid4().hex}.bin",
        content=content,
    )

    photo = ProfilePhoto(
        user_id=current_user.id,
        file_url=file_url,
        display_order=display_order,
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return ProfilePhotoRead.model_validate(photo)


@router.post("/register", response_model=ProfilePhotoRead, status_code=201)
def register_profile_photo(
    payload: ProfilePhotoRegister,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProfilePhotoRead:
    profile = db.get(Profile, current_user.id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Profile must exist before registering photos")
    ensure_photo_limit(db, current_user.id)

    photo = ProfilePhoto(
        user_id=current_user.id,
        file_url=payload.file_url,
        display_order=payload.display_order,
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return ProfilePhotoRead.model_validate(photo)


@router.get("/me", response_model=list[ProfilePhotoRead])
def list_my_profile_photos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ProfilePhotoRead]:
    statement = (
        select(ProfilePhoto)
        .where(ProfilePhoto.user_id == current_user.id)
        .order_by(ProfilePhoto.display_order.asc(), ProfilePhoto.created_at.asc())
    )
    return [ProfilePhotoRead.model_validate(photo) for photo in db.scalars(statement)]
