from app.services.llm_providers.openai_provider import generate_blog_post
from app.pipeline.seo import extract_summary_and_keywords, add_basic_meta
from app.models.schemas import DraftResponse


def generate_draft(topic: str, style: str, outline: list[str] | None, target_length: int, language: str) -> DraftResponse:
    result = generate_blog_post(topic=topic, style=style, outline=outline, target_length=target_length, language=language)
    title = result["title"]
    content_html = result["content_html"]
    summary, keywords = extract_summary_and_keywords(content_html)
    meta_title, meta_description = add_basic_meta(title, summary)
    return DraftResponse(
        title=title,
        content_html=content_html,
        summary=summary,
        keywords=keywords,
        meta_title=meta_title,
        meta_description=meta_description,
    )