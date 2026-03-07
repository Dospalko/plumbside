from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Service Dispatch SaaS"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/saas_db"
    REDIS_URL: str = "redis://localhost:6379"
    SECRET_KEY: str = "super-secret-key-change-in-production"
    
    # OpenAI config for Phase 5
    OPENAI_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
