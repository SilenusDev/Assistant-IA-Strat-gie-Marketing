from __future__ import annotations

from datetime import datetime, timezone

from flask import Flask

from ..extensions import db
from ..models import Message


def purge_expired_messages(app: Flask) -> int:
    """Delete messages whose TTL has expired."""
    with app.app_context():
        now = datetime.now(timezone.utc)
        deleted = (
            db.session.query(Message)
            .filter(Message.ttl.isnot(None))
            .filter(Message.ttl < now)
            .delete(synchronize_session=False)
        )
        db.session.commit()
        return deleted or 0
