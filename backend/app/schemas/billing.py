from pydantic import BaseModel, ConfigDict


class BillingStatusRead(BaseModel):
    membership_tier: str
    is_premium: bool
    paid_membership_price_usd: float
    billing_currency: str = "USD"
    plan: str = "free"
    token_balance: int = 0
    translation_used_count: int = 0
    translation_monthly_limit_count: int = 300
    daily_match_status: str = "waiting"


class CheckoutSessionCreateResponse(BaseModel):
    checkout_url: str


class CheckoutSessionRead(BaseModel):
    id: str
    url: str | None = None

    model_config = ConfigDict(extra="allow")
