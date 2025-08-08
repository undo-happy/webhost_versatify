# Blog Generation Tool (MVP)

A minimal, extensible FastAPI service to generate and publish blog posts to platforms (WordPress, Tistory; Naver via Selenium stub). Includes OpenAI integration, simple SEO helpers, and job scheduling via APScheduler.

## Quickstart

1) Python 3.10+

2) Install dependencies
```
pip install -r requirements.txt
```

3) Configure environment
- Copy `.env.example` to `.env`
- Fill in `OPENAI_API_KEY`. Optional: platform credentials.

4) Run API
```
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

5) Try endpoints
- Swagger UI: http://localhost:8000/docs
- Generate draft:
```
curl -X POST http://localhost:8000/generate \
  -H 'Content-Type: application/json' \
  -d '{"topic": "AI 블로그 자동화", "style": "informative"}'
```
- Publish to WordPress (requires creds):
```
curl -X POST http://localhost:8000/publish/wordpress \
  -H 'Content-Type: application/json' \
  -d '{"title": "Test Title", "content": "<p>Hello</p>", "status": "draft"}'
```

## Structure
```
app/
  core/config.py
  main.py
  models/schemas.py
  pipeline/
    generator.py
    seo.py
    plagiarism.py
    scheduler.py
  services/
    llm_providers/openai_provider.py
    platforms/
      wordpress_client.py
      tistory_client.py
      naver_publisher.py (stub)
```

## Notes
- WordPress: supports Basic Auth (Application Passwords) or JWT token.
- Tistory: uses official Open API.
- Naver: no official API; Selenium automation is stubbed (bring your own driver).
- This is an MVP scaffold; extend modules per your needs.
