import os


class BaseConfig:
    PROJECT_NAME = os.getenv("PROJECT_NAME", "ai-marketing-assistant")
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{os.getenv('DB_USER','assistant')}:"
        f"{os.getenv('DB_PASS','assistant_pass')}@"
        f"{os.getenv('DB_HOST','db')}:{os.getenv('DB_PORT','3306')}/"
        f"{os.getenv('DB_NAME','assistantdb')}?charset=utf8mb4"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    PURGE_TTL_DAYS = int(os.getenv("PURGE_TTL_DAYS", "7"))
    PURGE_JOB_HOUR = int(os.getenv("PURGE_JOB_HOUR", "2"))
    SCHEDULER_TIMEZONE = os.getenv("SCHEDULER_TIMEZONE", "UTC")
    CORS_ALLOW_ORIGINS = os.getenv("CORS_ALLOW_ORIGINS", "*")


class DevelopmentConfig(BaseConfig):
    DEBUG = True


class ProductionConfig(BaseConfig):
    DEBUG = False


class TestingConfig(BaseConfig):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    CORS_ALLOW_ORIGINS = "*"


def get_config():
    config_name = os.getenv("FLASK_ENV", "development").lower()
    return {
        "development": DevelopmentConfig,
        "production": ProductionConfig,
        "testing": TestingConfig,
    }.get(config_name, DevelopmentConfig)
