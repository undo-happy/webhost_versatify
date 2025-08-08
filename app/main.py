from fastapi import FastAPI, HTTPException
from app.models.schemas import GenerateRequest, DraftResponse, WordPressPublishRequest, TistoryPublishRequest, ScheduleRequest
from app.pipeline.generator import generate_draft
from app.services.platforms.wordpress_client import create_post as wp_create_post
from app.services.platforms.tistory_client import write_post as tistory_write_post
from app.services.platforms.naver_publisher import publish_with_selenium
from app.pipeline.scheduler import start_scheduler, schedule_once

app = FastAPI(title="Blog Generation Tool", version="0.1.0")


@app.on_event("startup")
async def on_startup():
    start_scheduler()


@app.post("/generate", response_model=DraftResponse)
def generate(req: GenerateRequest):
    try:
        draft = generate_draft(
            topic=req.topic,
            style=req.style or "informative",
            outline=req.outline or None,
            target_length=req.target_length or 1200,
            language=req.language or "ko",
        )
        return draft
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/publish/wordpress")
def publish_wordpress(req: WordPressPublishRequest):
    try:
        result = wp_create_post(
            title=req.title,
            content=req.content,
            status=req.status or "draft",
            categories=req.categories,
            tags=req.tags,
        )
        return {"ok": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/publish/tistory")
def publish_tistory(req: TistoryPublishRequest):
    try:
        result = tistory_write_post(
            title=req.title,
            content=req.content,
            visibility=req.visibility or 3,
            category=req.category,
            tag=req.tag,
        )
        return {"ok": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/schedule")
def schedule_publication(req: ScheduleRequest):
    try:
        job_id = f"publish-{req.platform}-{hash(str(req.payload))}"
        if req.platform == "wordpress":
            schedule_once(job_id, req.run_at_iso, _publish_wordpress_job, req.payload)
        elif req.platform == "tistory":
            schedule_once(job_id, req.run_at_iso, _publish_tistory_job, req.payload)
        else:
            schedule_once(job_id, req.run_at_iso, _publish_naver_job, req.payload)
        return {"ok": True, "job_id": job_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _publish_wordpress_job(payload: dict):
    wp_create_post(
        title=payload.get("title", "Untitled"),
        content=payload.get("content", ""),
        status=payload.get("status", "draft"),
        categories=payload.get("categories"),
        tags=payload.get("tags"),
    )


def _publish_tistory_job(payload: dict):
    tistory_write_post(
        title=payload.get("title", "Untitled"),
        content=payload.get("content", ""),
        visibility=payload.get("visibility", 3),
        category=payload.get("category"),
        tag=payload.get("tag"),
    )


def _publish_naver_job(payload: dict):
    publish_with_selenium(payload)