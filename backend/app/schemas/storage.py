from pydantic import BaseModel


class PresignedUploadRequest(BaseModel):
    filename: str
    content_type: str


class PresignedUploadResponse(BaseModel):
    upload_url: str
    file_url: str
    object_key: str
    method: str = "PUT"
