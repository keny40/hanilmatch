from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.models.match import Match
from app.models.message import Message
from app.models.user import User
from app.schemas.message import MessageCreate, MessageRead, MessageTranslateRequest
from app.services.realtime import connection_manager, conversation_key
from app.services.translation import normalize_translation_language, translate_message_on_demand


router = APIRouter()


@router.post("/", response_model=MessageRead, status_code=201)
async def send_message(
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageRead:
    has_match = db.scalar(
        select(Match).where(
            or_(
                and_(Match.user1_id == current_user.id, Match.user2_id == payload.receiver_id),
                and_(Match.user1_id == payload.receiver_id, Match.user2_id == current_user.id),
            )
        )
    )
    if has_match is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Messaging requires an active match")

    message = Message(
        sender_id=current_user.id,
        receiver_id=payload.receiver_id,
        original_text=payload.original_text,
        translated_text=None,
        translation_status="not_requested",
        language_from=payload.language_from,
        language_to=payload.language_to,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    await connection_manager.broadcast(
        conversation_key(str(current_user.id), str(payload.receiver_id)),
        {
            "type": "message.created",
            "data": MessageRead.model_validate(message).model_dump(mode="json"),
        },
    )
    return MessageRead.model_validate(message)


@router.get("/", response_model=list[MessageRead])
def list_messages(
    match_user_id: UUID,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[MessageRead]:
    statement = (
        select(Message)
        .where(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == match_user_id),
                and_(Message.sender_id == match_user_id, Message.receiver_id == current_user.id),
            )
        )
        .order_by(Message.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    messages = list(db.scalars(statement))
    dirty = False
    for message in messages:
        if message.receiver_id == current_user.id and message.read_at is None:
            message.read_at = datetime.now(timezone.utc)
            dirty = True
    if dirty:
        db.commit()
    return [MessageRead.model_validate(message) for message in messages]


@router.post("/{message_id}/translate", response_model=MessageRead)
def translate_message(
    message_id: UUID,
    payload: MessageTranslateRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageRead:
    message = db.get(Message, message_id)
    if message is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

    if current_user.id not in {message.sender_id, message.receiver_id}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this message")

    requested_target = payload.target_language if payload else None
    target_language = normalize_translation_language(requested_target or current_user.language)
    if message.translated_text and normalize_translation_language(message.language_to) == target_language:
        return MessageRead.model_validate(message)

    try:
        translated = translate_message_on_demand(db, message, target_language=target_language or current_user.language)
    except ValueError as exc:
        detail = str(exc)
        if "too long" in detail.lower():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Message is too long to translate. Limit: {settings.translation_max_chars} characters",
            ) from exc
        if current_user.language and current_user.language.lower().startswith("ja"):
            detail = "翻訳に失敗しました。しばらくしてからもう一度お試しください。"
        else:
            detail = "번역에 실패했습니다. 잠시 후 다시 시도해 주세요."
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail) from exc
    except Exception as exc:
        detail = (
            "翻訳に失敗しました。しばらくしてからもう一度お試しください。"
            if current_user.language and current_user.language.lower().startswith("ja")
            else "번역에 실패했습니다. 잠시 후 다시 시도해 주세요."
        )
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail) from exc

    return MessageRead.model_validate(translated)


@router.get("/conversations")
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict[str, str | None]]:
    matches = list(
        db.scalars(
            select(Match)
            .where(or_(Match.user1_id == current_user.id, Match.user2_id == current_user.id))
            .order_by(Match.created_at.desc())
        )
    )
    conversations: list[dict[str, str | None]] = []
    for match in matches:
        partner_id = match.user2_id if match.user1_id == current_user.id else match.user1_id
        last_message = db.scalar(
            select(Message)
            .where(
                or_(
                    and_(Message.sender_id == current_user.id, Message.receiver_id == partner_id),
                    and_(Message.sender_id == partner_id, Message.receiver_id == current_user.id),
                )
            )
            .order_by(Message.created_at.desc())
            .limit(1)
        )
        conversations.append(
            {
                "partner_id": str(partner_id),
                "match_id": str(match.id),
                "last_message": last_message.original_text if last_message else None,
                "translated_preview": last_message.translated_text if last_message else None,
            }
        )
    return conversations
