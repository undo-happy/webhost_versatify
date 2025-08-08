from typing import List, Optional
from openai import OpenAI
from app.core.config import settings

_client: Optional[OpenAI] = None

def _get_client() -> OpenAI:
    global _client
    if _client is None:
        if not settings.OPENAI_API_KEY:
            raise RuntimeError("OPENAI_API_KEY is not set")
        _client = OpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


def generate_blog_post(topic: str, style: str = "informative", outline: Optional[List[str]] = None, target_length: int = 1200, language: str = "ko") -> dict:
    client = _get_client()
    system = (
        "You are a senior SEO content writer. Produce well-structured, factual, non-plagiarized blog posts with headings, lists, code blocks if relevant, and internal logical flow."
    )
    outline_prompt = "" if not outline else f"\nUse this outline (can refine):\n- " + "\n- ".join(outline)
    user = (
        f"Topic: {topic}\nStyle: {style}\nTarget length: ~{target_length} words\nLanguage: {language}{outline_prompt}\n"
        "Return HTML content only with semantic tags (h1/h2/h3, p, ul/ol, img placeholders)."
    )
    resp = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.7,
    )
    content = resp.choices[0].message.content or ""
    title = topic if len(topic) < 80 else topic[:77] + "..."
    return {"title": title, "content_html": content}