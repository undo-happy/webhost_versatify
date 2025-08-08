from typing import Any, Optional, Dict, List
import requests
from requests.auth import HTTPBasicAuth
from app.core.config import settings


def _auth_headers() -> Dict[str, str]:
    headers: Dict[str, str] = {"Content-Type": "application/json"}
    if settings.WORDPRESS_JWT_TOKEN:
        headers["Authorization"] = f"Bearer {settings.WORDPRESS_JWT_TOKEN}"
    return headers


def _basic_auth() -> Optional[HTTPBasicAuth]:
    if settings.WORDPRESS_USERNAME and settings.WORDPRESS_PASSWORD:
        return HTTPBasicAuth(settings.WORDPRESS_USERNAME, settings.WORDPRESS_PASSWORD)
    return None


def create_post(title: str, content: str, status: str = "draft", categories: Optional[List[int]] = None, tags: Optional[List[int]] = None) -> Dict[str, Any]:
    if not settings.WORDPRESS_BASE_URL:
        raise RuntimeError("WORDPRESS_BASE_URL is not set")

    url = settings.WORDPRESS_BASE_URL.rstrip("/") + "/wp-json/wp/v2/posts"
    payload: Dict[str, Any] = {
        "title": title,
        "content": content,
        "status": status,
    }
    if categories:
        payload["categories"] = categories
    if tags:
        payload["tags"] = tags

    headers = _auth_headers()
    auth = _basic_auth()

    resp = requests.post(url, json=payload, headers=headers, auth=auth, timeout=30)
    if resp.status_code >= 400:
        raise RuntimeError(f"WordPress post failed: {resp.status_code} {resp.text}")
    return resp.json()