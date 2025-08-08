from pydantic import BaseModel, Field
from typing import List, Optional, Literal


class GenerateRequest(BaseModel):
    topic: str = Field(..., description="Topic or keyword for the blog post")
    style: Optional[Literal["informative", "conversational", "technical", "marketing"]] = "informative"
    outline: Optional[List[str]] = None
    target_length: Optional[int] = Field(1200, description="Target word count")
    language: Optional[str] = Field("ko", description="ISO language code, e.g., 'ko' or 'en'")


class DraftResponse(BaseModel):
    title: str
    content_html: str
    summary: Optional[str] = None
    keywords: Optional[List[str]] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None


class WordPressPublishRequest(BaseModel):
    title: str
    content: str
    status: Optional[Literal["draft", "publish", "future"]] = "draft"
    categories: Optional[List[int]] = None
    tags: Optional[List[int]] = None


class TistoryPublishRequest(BaseModel):
    title: str
    content: str
    visibility: Optional[int] = Field(3, description="0 private, 1 protected, 2 neighbor, 3 public")
    category: Optional[int] = None
    tag: Optional[str] = None


class ScheduleRequest(BaseModel):
    platform: Literal["wordpress", "tistory", "naver"]
    payload: dict
    run_at_iso: str