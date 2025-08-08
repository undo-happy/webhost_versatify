def is_probably_duplicate(new_text: str, recent_texts: list[str], threshold: float = 0.9) -> bool:
    normalized = new_text.lower().strip()
    for t in recent_texts:
        if normalized == t.lower().strip():
            return True
    return False