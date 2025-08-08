from typing import List, Tuple
from bs4 import BeautifulSoup


def extract_summary_and_keywords(html: str, max_keywords: int = 8) -> Tuple[str, List[str]]:
    soup = BeautifulSoup(html, "html.parser")
    text = " ".join([p.get_text(" ").strip() for p in soup.find_all(["p", "li"])])
    summary = (text[:180] + "...") if len(text) > 183 else text
    words = [w.lower() for w in text.split() if len(w) > 3]
    freq: dict[str, int] = {}
    for w in words:
        freq[w] = freq.get(w, 0) + 1
    keywords = sorted(freq, key=freq.get, reverse=True)[:max_keywords]
    return summary, keywords


def add_basic_meta(title: str, summary: str) -> tuple[str, str]:
    meta_title = title[:60]
    meta_description = summary[:155]
    return meta_title, meta_description