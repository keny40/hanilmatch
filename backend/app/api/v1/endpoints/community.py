from uuid import UUID
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.community_post import CommunityPost
from app.models.user import User
from app.schemas.community import COMMUNITY_CATEGORIES, CommunityPostCreate, CommunityPostRead


router = APIRouter()


def ensure_community_posts_table(db: Session) -> None:
    CommunityPost.__table__.create(bind=db.get_bind(), checkfirst=True)


def community_post_to_read(db: Session, post: CommunityPost) -> CommunityPostRead:
    author = db.get(User, post.author_id)
    return CommunityPostRead(
        id=post.id,
        author_id=post.author_id,
        author_email=author.email if author else None,
        category=post.category,
        title=post.title,
        content=post.content,
        status=post.status,
        is_public=post.is_public,
        admin_note=post.admin_note,
        created_at=post.created_at,
        updated_at=post.updated_at,
        published_at=post.published_at,
    )


@router.get("/posts", response_model=list[CommunityPostRead])
def list_public_community_posts(
    category: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[CommunityPostRead]:
    ensure_community_posts_table(db)
    if category and category not in COMMUNITY_CATEGORIES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category")

    stmt = (
        select(CommunityPost)
        .where(CommunityPost.status == "approved", CommunityPost.is_public.is_(True))
        .order_by(CommunityPost.published_at.desc().nullslast(), CommunityPost.created_at.desc())
    )
    if category:
        stmt = stmt.where(CommunityPost.category == category)

    posts = db.scalars(stmt).all()
    return [community_post_to_read(db, post) for post in posts]


@router.post("/posts", response_model=CommunityPostRead, status_code=201)
def create_community_post(
    payload: CommunityPostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommunityPostRead:
    ensure_community_posts_table(db)
    post = CommunityPost(
        author_id=current_user.id,
        category=payload.category,
        title=payload.title,
        content=payload.content,
        status="approved",
        is_public=True,
        published_at=datetime.now(timezone.utc),
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return community_post_to_read(db, post)


@router.get("/posts/{post_id}", response_model=CommunityPostRead)
def read_public_community_post(
    post_id: UUID,
    db: Session = Depends(get_db),
) -> CommunityPostRead:
    ensure_community_posts_table(db)
    post = db.get(CommunityPost, post_id)
    if post is None or post.status != "approved" or not post.is_public:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Community post not found")
    return community_post_to_read(db, post)
