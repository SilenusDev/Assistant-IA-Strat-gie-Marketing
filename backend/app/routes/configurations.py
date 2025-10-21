"""Routes API pour les configurations."""

from flask import jsonify, request

from ..schemas.scenario import (
    ConfigurationCreateSchema,
    ConfigurationDetailSchema,
    ConfigurationSchema,
    ObjectifSchema,
    CibleSchema,
)
from ..services.configuration_service import ConfigurationService


def init_configuration_routes(bp):
    configuration_schema = ConfigurationSchema()
    configurations_schema = ConfigurationSchema(many=True)
    configuration_detail_schema = ConfigurationDetailSchema()
    create_schema = ConfigurationCreateSchema()

    @bp.route("/scenarios/<int:scenario_id>/configurations", methods=["GET"])
    def list_configurations(scenario_id: int):
        """Liste toutes les configurations d'un scénario."""
        try:
            configurations = ConfigurationService.list_configurations(scenario_id)
            return jsonify(configurations_schema.dump(configurations)), 200
        except LookupError:
            return jsonify({"error": "Scenario not found"}), 404

    @bp.route("/scenarios/<int:scenario_id>/configurations", methods=["POST"])
    def create_configuration(scenario_id: int):
        """Crée une nouvelle configuration pour un scénario."""
        payload = request.get_json(silent=True) or {}
        payload["scenario_id"] = scenario_id
        data = create_schema.load(payload)
        try:
            configuration = ConfigurationService.create_configuration(data)
            return jsonify(configuration_schema.dump(configuration)), 201
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400

    @bp.route("/configurations/<int:configuration_id>", methods=["GET"])
    def get_configuration(configuration_id: int):
        """Récupère les détails d'une configuration."""
        try:
            configuration = ConfigurationService.get_configuration_detail(configuration_id)
            return jsonify(configuration_detail_schema.dump(configuration)), 200
        except LookupError:
            return jsonify({"error": "Configuration not found"}), 404

    @bp.route("/configurations/<int:configuration_id>", methods=["DELETE"])
    def delete_configuration(configuration_id: int):
        """Supprime une configuration."""
        try:
            ConfigurationService.delete_configuration(configuration_id)
            return jsonify({"message": "Configuration deleted"}), 200
        except LookupError:
            return jsonify({"error": "Configuration not found"}), 404

    @bp.route("/configurations/<int:configuration_id>/objectifs", methods=["POST"])
    def add_objectif_to_configuration(configuration_id: int):
        """Ajoute un objectif à une configuration."""
        payload = request.get_json(silent=True) or {}
        try:
            result = ConfigurationService.add_objectif(configuration_id, payload)
            return jsonify(result), 200
        except LookupError:
            return jsonify({"error": "Configuration not found"}), 404
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400

    @bp.route("/configurations/<int:configuration_id>/cibles", methods=["POST"])
    def add_cible_to_configuration(configuration_id: int):
        """Ajoute une cible à une configuration."""
        payload = request.get_json(silent=True) or {}
        try:
            result = ConfigurationService.add_cible(configuration_id, payload)
            return jsonify(result), 200
        except LookupError:
            return jsonify({"error": "Configuration not found"}), 404
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400

    @bp.route("/configurations/<int:configuration_id>/objectifs/<int:objectif_id>", methods=["DELETE"])
    def remove_objectif_from_configuration(configuration_id: int, objectif_id: int):
        """Retire un objectif d'une configuration."""
        try:
            result = ConfigurationService.remove_objectif(configuration_id, objectif_id)
            return jsonify(result), 200
        except LookupError as exc:
            return jsonify({"error": str(exc)}), 404

    @bp.route("/configurations/<int:configuration_id>/cibles/<int:cible_id>", methods=["DELETE"])
    def remove_cible_from_configuration(configuration_id: int, cible_id: int):
        """Retire une cible d'une configuration."""
        try:
            result = ConfigurationService.remove_cible(configuration_id, cible_id)
            return jsonify(result), 200
        except LookupError as exc:
            return jsonify({"error": str(exc)}), 404

    @bp.route("/configurations/<int:configuration_id>/can-create-plan", methods=["GET"])
    def check_can_create_plan(configuration_id: int):
        """Vérifie si une configuration peut générer un plan."""
        try:
            can_create = ConfigurationService.can_create_plan(configuration_id)
            return jsonify({"can_create_plan": can_create}), 200
        except LookupError:
            return jsonify({"error": "Configuration not found"}), 404

    @bp.route("/configurations/<int:configuration_id>/suggest-objectifs", methods=["POST"])
    def suggest_objectifs_for_configuration(configuration_id: int):
        """Suggère des objectifs pertinents pour une configuration."""
        try:
            configuration = ConfigurationService.get_configuration_detail(configuration_id)
            from ..services.objectif_service import ObjectifService
            suggestions = ObjectifService.suggest_objectifs_for_scenario(configuration.scenario_id)
            return jsonify({"objectifs": suggestions}), 200
        except LookupError:
            return jsonify({"error": "Configuration not found"}), 404
        except Exception as exc:
            return jsonify({"error": str(exc)}), 500

    @bp.route("/configurations/<int:configuration_id>/suggest-cibles", methods=["POST"])
    def suggest_cibles_for_configuration(configuration_id: int):
        """Suggère des cibles pertinentes pour une configuration."""
        try:
            configuration = ConfigurationService.get_configuration_detail(configuration_id)
            from ..services.cible_service import CibleService
            suggestions = CibleService.suggest_cibles_for_scenario(
                configuration.scenario_id, configuration_id
            )
            return jsonify({"cibles": suggestions}), 200
        except LookupError:
            return jsonify({"error": "Configuration not found"}), 404
        except Exception as exc:
            return jsonify({"error": str(exc)}), 500

    @bp.route("/configurations/<int:configuration_id>/generate-plan", methods=["POST"])
    def generate_plan_with_articles(configuration_id: int):
        """Génère un plan avec 5 articles pour une configuration."""
        try:
            from ..services.plan_service import PlanService
            result = PlanService.generate_plan_with_articles(configuration_id)
            return jsonify(result), 201
        except LookupError:
            return jsonify({"error": "Configuration not found"}), 404
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400
        except Exception as exc:
            return jsonify({"error": str(exc)}), 500

    @bp.route("/configurations/<int:configuration_id>/plan", methods=["POST"])
    def generate_plan_for_configuration(configuration_id: int):
        """Génère un plan marketing pour une configuration."""
        try:
            from ..services.plan_service import PlanService
            result = PlanService.generate_plan(configuration_id)
            return jsonify(result), 200
        except LookupError:
            return jsonify({"error": "Configuration not found"}), 404
        except Exception as exc:
            return jsonify({"error": str(exc)}), 500
