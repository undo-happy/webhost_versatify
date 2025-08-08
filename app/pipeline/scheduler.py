from datetime import datetime
from zoneinfo import ZoneInfo
from typing import Callable, Any
from apscheduler.schedulers.background import BackgroundScheduler
from app.core.config import settings

scheduler = BackgroundScheduler(timezone=ZoneInfo(settings.TIMEZONE))


def start_scheduler() -> None:
    if not scheduler.running:
        scheduler.start()


def schedule_once(job_id: str, run_at_iso: str, func: Callable[..., Any], *args, **kwargs) -> None:
    run_dt = datetime.fromisoformat(run_at_iso)
    scheduler.add_job(func, "date", run_date=run_dt, id=job_id, replace_existing=True, args=args, kwargs=kwargs)