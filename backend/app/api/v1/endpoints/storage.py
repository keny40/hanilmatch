from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.core.config import settings
from app.models.user import User
from app.schemas.storage import PresignedUploadRequest, PresignedUploadResponse
from app.services.storage import storage_service


router = APIRouter()


@router.post("/presign/profile-photo", response_model=PresignedUploadResponse)
def create_profile_photo_upload_url(
    payload: PresignedUploadRequest,
    current_user: User = Depends(get_current_user),
) -> PresignedUploadResponse:
    if settings.storage_backend != "s3":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Presigned uploads are available only with s3 storage backend",
        )
    upload = storage_service.create_profile_photo_presigned_upload(
        user_id=str(current_user.id),
        filename=payload.filename,
        content_type=payload.content_type,
    )
    return PresignedUploadResponse(**upload)
