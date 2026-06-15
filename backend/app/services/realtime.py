from collections import defaultdict

from fastapi import WebSocket


def conversation_key(user_a: str, user_b: str) -> str:
    return ":".join(sorted([user_a, user_b]))


class ConnectionManager:
    def __init__(self) -> None:
        self.connections: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, room_key: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.connections[room_key].append(websocket)

    def disconnect(self, room_key: str, websocket: WebSocket) -> None:
        if room_key in self.connections and websocket in self.connections[room_key]:
            self.connections[room_key].remove(websocket)
            if not self.connections[room_key]:
                del self.connections[room_key]

    async def broadcast(self, room_key: str, payload: dict) -> None:
        for websocket in list(self.connections.get(room_key, [])):
            await websocket.send_json(payload)


connection_manager = ConnectionManager()
