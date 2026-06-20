from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parent.parent
_PROJECT_ROOT = _BACKEND_DIR.parent
_ENV_FILES = [p for p in (_BACKEND_DIR / ".env", _PROJECT_ROOT / ".env") if p.exists()]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_ENV_FILES or ".env",
        extra="ignore",
    )

    database_url: str = "postgresql://inventory:inventory@localhost:5432/inventory"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    low_stock_threshold: int = 10

    @property
    def cors_origin_list(self) -> list[str]:
        origins: list[str] = []
        for origin in self.cors_origins.split(","):
            cleaned = origin.strip().strip('"').strip("'").rstrip("/")
            if cleaned:
                origins.append(cleaned)
        return origins


settings = Settings()
