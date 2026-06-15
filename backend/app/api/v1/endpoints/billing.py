from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, is_admin_user
from app.api.v1.endpoints.admin import get_or_create_admin_settings
from app.models.user import User
from app.schemas.billing import BillingStatusRead, CheckoutSessionCreateResponse
from app.services.matching import get_daily_match_status


router = APIRouter()


def premium_enabled_for(user: User) -> bool:
    return user.membership_tier == "paid" or is_admin_user(user)


@router.get("/me", response_model=BillingStatusRead)
def get_billing_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BillingStatusRead:
    admin_settings = get_or_create_admin_settings(db)
    return BillingStatusRead(
        membership_tier=current_user.membership_tier,
        is_premium=premium_enabled_for(current_user),
        paid_membership_price_usd=float(admin_settings.paid_membership_price_usd),
        plan="premium" if premium_enabled_for(current_user) else "free",
        token_balance=0,
        translation_used_count=0,
        translation_monthly_limit_count=300,
        daily_match_status=get_daily_match_status(db, current_user),
    )


@router.post("/checkout-session", response_model=CheckoutSessionCreateResponse)
def create_checkout_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CheckoutSessionCreateResponse:
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Payment checkout is not available during MVP testing.",
    )


@router.post("/webhook")
async def payment_webhook() -> dict[str, bool]:
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Payment webhook is reserved for future sandbox testing and is not active during MVP testing.",
    )
