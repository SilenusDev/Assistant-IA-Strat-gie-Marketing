"""Routes API pour les objectifs."""

from flask import jsonify, request

from ..services.objectif_service import ObjectifService


def init_objectif_routes(bp):
    @bp.route("/objectifs", methods=["GET"])
    def list_objectifs():
        """Liste tous les objectifs existants."""
        objectifs = ObjectifService.get_all_objectifs()
        return jsonify({
            "objectifs": [
                {
                    "id": obj.id,
                    "label": obj.label,
                    "description": obj.description
                }
                for obj in objectifs
            ]
        }), 200

    @bp.route("/objectifs", methods=["POST"])
    def create_objectif():
        """Crée un nouvel objectif."""
        payload = request.get_json(silent=True) or {}
        try:
            objectif = ObjectifService.create_objectif(payload)
            return jsonify({
                "id": objectif.id,
                "label": objectif.label,
                "description": objectif.description
            }), 201
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400
    
    @bp.route("/objectifs/suggest-ai/<int:scenario_id>", methods=["POST"])
    def suggest_objectifs_ai(scenario_id: int):
        """Génère des suggestions d'objectifs via IA en évitant les doublons."""
        try:
            suggestions = ObjectifService.suggest_objectifs_for_scenario(scenario_id)
            return jsonify({"objectifs": suggestions}), 200
        except LookupError as exc:
            return jsonify({"error": str(exc)}), 404
        except Exception as exc:
            return jsonify({"error": f"Erreur lors de la génération: {str(exc)}"}), 500
