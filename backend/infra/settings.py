from pydantic_settings import BaseSettings
class Settings(BaseSettings):
    DB_USER: str = "app"
    DB_PASS: str = "apppwd"
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 3306
    DB_NAME: str = "petfinder"
    @property
    def SQLALCHEMY_URL(self) -> str:
        return f"mariadb+mariadbconnector://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
settings = Settings()
