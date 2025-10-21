"""Routes API pour les cibles."""

from flask import jsonify, request

from ..services.cible_service import CibleService


def init_cible_routes(bp):
    @bp.route("/cibles", methods=["GET"])
    def list_cibles():
        """Liste toutes les cibles existantes."""
        cibles = CibleService.get_all_cibles()
        return jsonify({
            "cibles": [
                {
                    "id": cible.id,
                    "label": cible.label,
                    "persona": cible.persona,
                    "segment": cible.segment
                }
                for cible in cibles
            ]
        }), 200

    @bp.route("/cibles", methods=["POST"])
    def create_cible():
        """Crée une nouvelle cible."""
        payload = request.get_json(silent=True) or {}
        try:
            cible = CibleService.create_cible(payload)
            return jsonify({
                "id": cible.id,
                "label": cible.label,
                "persona": cible.persona,
                "segment": cible.segment
            }), 201
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400
    
    @bp.route("/cibles/suggest-ai/<int:scenario_id>", methods=["POST"])
    def suggest_cibles_ai(scenario_id: int):
        """Génère des suggestions de cibles via IA en évitant les doublons."""
        payload = request.get_json(silent=True) or {}
        configuration_id = payload.get("configuration_id")
        
        try:
            suggestions = CibleService.suggest_cibles_for_scenario(
                scenario_id, 
                configuration_id
            )
            return jsonify({"cibles": suggestions}), 200
        except LookupError as exc:
            return jsonify({"error": str(exc)}), 404
        except Exception as exc:
            return jsonify({"error": f"Erreur lors de la génération: {str(exc)}"}), 500
