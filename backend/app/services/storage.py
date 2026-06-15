import uuid
from pathlib import Path

import boto3
from botocore.client import Config

from app.core.config import settings


class StorageService:
    def save_profile_photo(self, *, user_id: str, filename: str, content: bytes) -> str:
        extension = Path(filename).suffix.lower() or ".bin"
        object_name = f"profile_photos/{user_id}/{uuid.uuid4().hex}{extension}"
        if settings.storage_backend == "s3":
            return self._save_to_s3(object_name, content)
        return self._save_locally(object_name, content)

    def _save_locally(self, object_name: str, content: bytes) -> str:
        target = Path("storage") / object_name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
        normalized = object_name.replace("\\", "/")
        return f"/storage/{normalized}"

    def _save_to_s3(self, object_name: str, content: bytes) -> str:
        if not settings.s3_bucket:
            raise ValueError("S3_BUCKET must be configured for s3 storage backend")

        client = boto3.client(
            "s3",
            region_name=settings.s3_region,
            aws_access_key_id=settings.s3_access_key,
            aws_secret_access_key=settings.s3_secret_key,
            endpoint_url=settings.s3_endpoint_url,
            config=Config(signature_version="s3v4"),
        )
        client.put_object(
            Bucket=settings.s3_bucket,
            Key=object_name,
            Body=content,
            ContentType="image/jpeg",
        )
        if settings.s3_endpoint_url:
            base = settings.s3_endpoint_url.rstrip("/")
            return f"{base}/{settings.s3_bucket}/{object_name}"
        return f"https://{settings.s3_bucket}.s3.amazonaws.com/{object_name}"

    def create_profile_photo_presigned_upload(self, *, user_id: str, filename: str, content_type: str) -> dict[str, str]:
        extension = Path(filename).suffix.lower() or ".bin"
        object_name = f"profile_photos/{user_id}/{uuid.uuid4().hex}{extension}"
        if settings.storage_backend != "s3":
            raise ValueError("Presigned upload requires s3 storage backend")
        if not settings.s3_bucket:
            raise ValueError("S3_BUCKET must be configured for s3 storage backend")

        client = boto3.client(
            "s3",
            region_name=settings.s3_region,
            aws_access_key_id=settings.s3_access_key,
            aws_secret_access_key=settings.s3_secret_key,
            endpoint_url=settings.s3_endpoint_url,
            config=Config(signature_version="s3v4"),
        )
        upload_url = client.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": settings.s3_bucket,
                "Key": object_name,
                "ContentType": content_type,
            },
            ExpiresIn=900,
        )
        if settings.s3_endpoint_url:
            base = settings.s3_endpoint_url.rstrip("/")
            file_url = f"{base}/{settings.s3_bucket}/{object_name}"
        else:
            file_url = f"https://{settings.s3_bucket}.s3.amazonaws.com/{object_name}"
        return {"upload_url": upload_url, "file_url": file_url, "object_key": object_name}


storage_service = StorageService()
