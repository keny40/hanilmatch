from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router, api_websocket_router
from app.core.config import settings
from app.middleware.csrf import CSRFMiddleware


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    debug=settings.app_debug,
)

allowed_origins = [
    origin.strip()
    for origin in settings.cors_origins.split(",")
    if origin.strip()
]

# 중요:
# Starlette/FastAPI는 나중에 추가한 미들웨어가 바깥쪽에서 먼저 실행됩니다.
# 따라서 CSRF를 먼저 추가하고, CORS를 마지막에 추가해야
# 에러 응답에도 Access-Control-Allow-Origin 헤더가 붙습니다.
app.add_middleware(CSRFMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)
app.include_router(api_websocket_router)

Path("storage/profile_photos").mkdir(parents=True, exist_ok=True)
app.mount("/storage", StaticFiles(directory="storage"), name="storage")


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}