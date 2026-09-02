from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "PaperSense"
    
    # PostgreSQL Configuration
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "papersense"
    
    # ChromaDB Configuration
    CHROMA_PERSIST_DIRECTORY: str = "./.chroma"
    
    # LLM Configuration
    GEMINI_API_KEY: str = ""
    
    @property
    def sync_database_url(self) -> str:
        return "sqlite:///./papersense.db"
    
    @property
    def async_database_url(self) -> str:
        return "sqlite+aiosqlite:///./papersense.db"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()
