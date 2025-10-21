from flask import Blueprint

from .chat import chat_bp
from .cibles import init_cible_routes
from .configurations import init_configuration_routes
from .health import init_health_routes
from .objectifs import init_objectif_routes
from .scenarios import init_scenario_routes

api_bp = Blueprint("api", __name__)
health_bp = Blueprint("health", __name__)


def _register_routes():
    init_health_routes(health_bp)
    init_scenario_routes(api_bp)
    init_configuration_routes(api_bp)
    init_objectif_routes(api_bp)
    init_cible_routes(api_bp)
    # Enregistrer les routes chat dans l'API blueprint
    api_bp.register_blueprint(chat_bp)


_register_routes()
