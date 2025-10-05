from pydantic_settings import BaseSettings
class Settings(BaseSettings):
    DB_USER: str = "root"
    DB_PASS: str = "Peam56201"
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 3306
    DB_NAME: str = "sda_database"
    @property
    def SQLALCHEMY_URL(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
settings = Settings()
