from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings


class CSRFMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
            if request.url.path.startswith(settings.api_v1_prefix):
                csrf_cookie = request.cookies.get(settings.csrf_cookie_name)
                csrf_header = request.headers.get("X-CSRF-Token")
                access_cookie = request.cookies.get(settings.auth_cookie_name)
                refresh_cookie = request.cookies.get(settings.refresh_cookie_name)

                # Require CSRF when cookie-based auth is in play.
                if access_cookie or refresh_cookie:
                    if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
                        return JSONResponse(
                            status_code=status.HTTP_403_FORBIDDEN,
                            content={"detail": "CSRF validation failed"},
                        )

        return await call_next(request)
