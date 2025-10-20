from __future__ import annotations

from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask

from .services.maintenance import purge_expired_messages


def init_scheduler(app: Flask) -> None:
    """Initialize background scheduler for housekeeping tasks."""
    scheduler = BackgroundScheduler(timezone=app.config.get("SCHEDULER_TIMEZONE", "UTC"))

    scheduler.add_job(
        func=lambda: purge_expired_messages(app),
        trigger="cron",
        hour=app.config.get("PURGE_JOB_HOUR", 2),
        id="purge-expired-messages",
        replace_existing=True,
    )

    scheduler.start()

    @app.teardown_appcontext
    def shutdown_session(exception=None):
        if scheduler.state != 0:  # 0 == STATE_STOPPED
            scheduler.shutdown(wait=False)
