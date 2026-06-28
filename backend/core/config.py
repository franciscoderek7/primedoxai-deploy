"""
backend/core/config.py

All secrets and live-vs-test toggles come from environment variables only.
Nothing here is hardcoded — whoever sets STRIPE_SECRET_KEY to a live `sk_live_...`
key in the deploy environment is the one who actually flips Stripe to live mode.
This file never decides that.
"""

import os


class Settings:
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql://primedox:primedox@localhost:5432/primedox"
    )
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret-change-me")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    STRIPE_PRICE_STARTER: str = os.getenv("STRIPE_PRICE_STARTER", "")
    STRIPE_PRICE_PRO: str = os.getenv("STRIPE_PRICE_PRO", "")
    STRIPE_PRICE_ENTERPRISE: str = os.getenv("STRIPE_PRICE_ENTERPRISE", "")

    SENDGRID_API_KEY: str = os.getenv("SENDGRID_API_KEY", "")
    EMAIL_LEGAL: str = os.getenv("EMAIL_LEGAL", "docweedla@gmail.com")
    EMAIL_OMNIGUARD: str = os.getenv("EMAIL_OMNIGUARD", "omniaguard1@gmail.com")
    EMAIL_GENERAL: str = os.getenv("EMAIL_GENERAL", "franciscoderek7@gmail.com")

    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

    @property
    def stripe_live(self) -> bool:
        return self.STRIPE_SECRET_KEY.startswith("sk_live_")


settings = Settings()
