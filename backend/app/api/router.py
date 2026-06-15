from fastapi import APIRouter

from app.api.v1.endpoints import (
    admin,
    auth,
    billing,
    community,
    inquiries,
    matches,
    messages,
    notifications,
    profile_photos,
    profiles,
    realtime,
    reports,
    sessions,
    storage,
    users,
)


api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(billing.router, prefix="/billing", tags=["billing"])
api_router.include_router(community.router, prefix="/community", tags=["community"])
api_router.include_router(inquiries.router, prefix="/inquiries", tags=["inquiries"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(profiles.router, prefix="/profiles", tags=["profiles"])
api_router.include_router(profile_photos.router, prefix="/profile-photos", tags=["profile-photos"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
api_router.include_router(storage.router, prefix="/storage", tags=["storage"])
api_router.include_router(matches.router, prefix="/matches", tags=["matches"])
api_router.include_router(messages.router, prefix="/messages", tags=["messages"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])

api_websocket_router = APIRouter()
api_websocket_router.include_router(realtime.router, prefix="/ws")
