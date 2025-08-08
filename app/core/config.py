import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    WORDPRESS_BASE_URL: str | None = os.getenv("WORDPRESS_BASE_URL")
    WORDPRESS_USERNAME: str | None = os.getenv("WORDPRESS_USERNAME")
    WORDPRESS_PASSWORD: str | None = os.getenv("WORDPRESS_PASSWORD")
    WORDPRESS_JWT_TOKEN: str | None = os.getenv("WORDPRESS_JWT_TOKEN")

    TISTORY_ACCESS_TOKEN: str | None = os.getenv("TISTORY_ACCESS_TOKEN")
    TISTORY_BLOG_NAME: str | None = os.getenv("TISTORY_BLOG_NAME")

    TIMEZONE: str = os.getenv("TIMEZONE", "Asia/Seoul")

settings = Settings()