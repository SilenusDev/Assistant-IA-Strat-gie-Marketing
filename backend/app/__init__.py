import logging
import os

from flask import Flask, jsonify
from flask_cors import CORS

from .config import get_config
from .extensions import db, migrate
from .routes import api_bp, health_bp
from .scheduler import init_scheduler


def create_app(test_config: dict | None = None) -> Flask:
    """Application factory."""
    app = Flask(__name__)

    config_class = get_config()
    app.config.from_object(config_class)

    if test_config:
        app.config.update(test_config)

    CORS(
        app,
        resources={r"/*": {"origins": app.config.get("CORS_ALLOW_ORIGINS", "*")}},
    )

    register_extensions(app)
    register_blueprints(app)
    register_error_handlers(app)

    if not app.testing:
        init_scheduler(app)

    return app


def register_extensions(app: Flask) -> None:
    """Attach Flask extensions to the app."""
    db.init_app(app)
    migrate.init_app(app, db)


def register_blueprints(app: Flask) -> None:
    """Register API blueprints."""
    app.register_blueprint(health_bp)
    app.register_blueprint(api_bp, url_prefix="/api")


def register_error_handlers(app: Flask) -> None:
    """Configure JSON error handling."""

    @app.errorhandler(404)
    def handle_404(error):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(400)
    def handle_400(error):
        return jsonify({"error": "Bad request"}), 400

    @app.errorhandler(500)
    def handle_500(error):
        logging.exception("Unhandled server error: %s", error)
        return jsonify({"error": "Internal server error"}), 500
