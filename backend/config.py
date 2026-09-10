from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "PaperSense"
    

    # ChromaDB Configuration
    CHROMA_PERSIST_DIRECTORY: str = "./.chroma"
    
    # LLM Configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.6-flash"
    GEMINI_EMBEDDING_MODEL: str = "gemini-embedding-001"
    
    # Database Configuration
    DATABASE_URL: str = "sqlite:///./papersense.db"
    
    # CORS Configuration
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    
    @property
    def sync_database_url(self) -> str:
        if self.DATABASE_URL.startswith("postgres://"):
            return self.DATABASE_URL.replace("postgres://", "postgresql://", 1)
        return self.DATABASE_URL
    
    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("sqlite"):
            return "sqlite+aiosqlite" + url[6:]
        if url.startswith("postgresql://") or url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url
        
    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()
