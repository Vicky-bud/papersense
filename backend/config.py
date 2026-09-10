from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "PaperSense"
    

    # ChromaDB Configuration
    CHROMA_PERSIST_DIRECTORY: str = "./.chroma"
    
    # LLM Configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.6-flash"
    GEMINI_EMBEDDING_MODEL: str = "gemini-embedding-001"
    
    @property
    def sync_database_url(self) -> str:
        return "sqlite:///./papersense.db"
    
    @property
    def async_database_url(self) -> str:
        return "sqlite+aiosqlite:///./papersense.db"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()
