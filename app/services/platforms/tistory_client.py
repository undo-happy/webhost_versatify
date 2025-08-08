from typing import Any, Dict, Optional
import requests
from app.core.config import settings


BASE_URL = "https://www.tistory.com/apis"


def write_post(title: str, content: str, visibility: int = 3, category: Optional[int] = None, tag: Optional[str] = None) -> Dict[str, Any]:
    if not settings.TISTORY_ACCESS_TOKEN or not settings.TISTORY_BLOG_NAME:
        raise RuntimeError("TISTORY_ACCESS_TOKEN or TISTORY_BLOG_NAME not set")

    url = f"{BASE_URL}/post/write"
    params: Dict[str, Any] = {
        "access_token": settings.TISTORY_ACCESS_TOKEN,
        "output": "json",
        "blogName": settings.TISTORY_BLOG_NAME,
        "title": title,
        "content": content,
        "visibility": visibility,
    }
    if category is not None:
        params["category"] = category
    if tag:
        params["tag"] = tag

    resp = requests.post(url, params=params, timeout=30)
    if resp.status_code >= 400:
        raise RuntimeError(f"Tistory post failed: {resp.status_code} {resp.text}")
    data = resp.json()
    if data.get("tistory", {}).get("status") != "200":
        raise RuntimeError(f"Tistory API error: {data}")
    return data