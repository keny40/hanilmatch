from uuid import UUID

import jwt
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.config import settings
from app.services.realtime import connection_manager, conversation_key


router = APIRouter()


@router.websocket("/chat/{other_user_id}")
async def websocket_chat(websocket: WebSocket, other_user_id: UUID) -> None:
    access_token = websocket.cookies.get(settings.auth_cookie_name)

    if not access_token:
        access_token = websocket.query_params.get("token")

    if not access_token:
        await websocket.close(code=4401)
        return

    try:
        payload = jwt.decode(access_token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        subject = payload.get("sub")
        if subject is None:
            await websocket.close(code=4401)
            return
        current_user_id = str(UUID(subject))
    except (jwt.InvalidTokenError, ValueError):
        await websocket.close(code=4401)
        return

    room_key = conversation_key(current_user_id, str(other_user_id))
    await connection_manager.connect(room_key, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connection_manager.disconnect(room_key, websocket)
