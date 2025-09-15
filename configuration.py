import os

class Config:
    DEBUG = False
    PORT = None
    RELOADER = False
    HOST = "0.0.0.0"
    EUREKA_ENABLED = False
    EUREKA_SERVER = "http://localhost:8761/eureka"
    APP_NAME = "Routine-2-0"

    ARCHIVE_ROOT = os.getenv("ARCHIVE_FOLDER", "/data/archive")
    SERVICE_ROOT = os.getenv("SERVICE_ROOT", "/data/services")

    @property
    def ARCHIVE_FOLDER(self):
        return os.path.join(self.ARCHIVE_ROOT, self.APP_NAME)

    @property
    def SERVICE_FOLDER(self):
        return os.path.join(self.SERVICE_ROOT, self.APP_NAME)


class DevConfig(Config):
    DEBUG = True
    PORT = 5000
    RELOADER = True
    EUREKA_ENABLED = False


class ProdConfig(Config):
    EUREKA_ENABLED = True

APP_PROFILE = os.getenv("APP_PROFILE", "dev").lower()

if APP_PROFILE == "prod":
    config = ProdConfig()
else:
    config = DevConfig()

os.makedirs(config.ARCHIVE_FOLDER, exist_ok=True)
