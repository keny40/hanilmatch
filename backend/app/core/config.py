from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "kr-jp-match-api"
    app_debug: bool = True
    api_v1_prefix: str = "/api/v1"
    database_url: str = "postgresql+psycopg://postgres:change_me@localhost:5432/kr_jp_match"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    auth_cookie_name: str = "krjp_access_token"
    refresh_cookie_name: str = "krjp_refresh_token"
    csrf_cookie_name: str = "krjp_csrf_token"
    auth_cookie_secure: bool = False
    jwt_secret_key: str = "change_this_secret"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    jwt_refresh_token_expire_days: int = 14
    translation_provider: str = "mock"
    deepl_api_key: str | None = None
    google_translate_api_key: str | None = None
    storage_backend: str = "local"
    storage_public_base_url: str = "http://localhost:8000"
    s3_bucket: str | None = None
    s3_region: str | None = None
    s3_access_key: str | None = None
    s3_secret_key: str | None = None
    s3_endpoint_url: str | None = None
    matching_ai_provider: str = "mock"
    openai_api_key: str | None = None
    openai_translation_model: str = "gpt-4o-mini"
    openai_base_url: str = "https://api.openai.com/v1"
    openai_embedding_model: str = "text-embedding-3-small"
    openai_chat_model: str = "gpt-4.1-mini"
    recommendation_scheduler_poll_seconds: int = 300
    recommendation_scheduler_batch_size: int = 100
    recommendation_generation_limit: int = 20
    admin_emails: str = "keny4000@gmail.com"
    frontend_base_url: str = "http://localhost:3000"
    frontend_url: str = "http://localhost:3000"
    google_client_id: str | None = None
    google_client_secret: str | None = None
    google_redirect_uri: str | None = None
    payment_provider: str | None = None
    payment_sandbox: bool = True
    payment_client_key: str | None = None
    payment_secret_key: str | None = None
    payment_webhook_secret: str | None = None
    translation_max_chars: int = 200

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()
