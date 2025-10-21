import csv
import io
import json

from flask import jsonify, request, send_file

from ..schemas.scenario import (
    ScenarioCreateSchema,
    ScenarioDetailSchema,
    ScenarioSchema,
)
from ..services.plan_service import PlanService
from ..services.scenario_service import ScenarioService


def init_scenario_routes(bp):
    scenario_schema = ScenarioSchema()
    scenarios_schema = ScenarioSchema(many=True)
    scenario_detail_schema = ScenarioDetailSchema()
    create_schema = ScenarioCreateSchema()

    @bp.route("/scenarios", methods=["GET"])
    def list_scenarios():
        scenarios = ScenarioService.list_scenarios()
        return jsonify(scenarios_schema.dump(scenarios)), 200

    @bp.route("/scenarios", methods=["POST"])
    def create_scenario():
        payload = request.get_json(silent=True) or {}
        data = create_schema.load(payload)
        try:
            scenario = ScenarioService.create_scenario(data)
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400
        return jsonify(scenario_schema.dump(scenario)), 201

    @bp.route("/scenarios/<int:scenario_id>", methods=["GET"])
    def get_scenario(scenario_id: int):
        try:
            scenario = ScenarioService.get_scenario_detail(scenario_id)
        except LookupError:
            return jsonify({"error": "Scenario not found"}), 404
        return jsonify(scenario_detail_schema.dump(scenario)), 200

    @bp.route("/scenarios/<int:scenario_id>", methods=["DELETE"])
    def delete_scenario(scenario_id: int):
        """Supprime un scénario."""
        try:
            ScenarioService.delete_scenario(scenario_id)
            return jsonify({"message": "Scenario deleted successfully"}), 200
        except LookupError:
            return jsonify({"error": "Scenario not found"}), 404
        except Exception as exc:
            return jsonify({"error": str(exc)}), 500

    @bp.route("/scenarios/<int:scenario_id>/objectifs", methods=["POST"])
    def add_objectif(scenario_id: int):
        """Ajoute un objectif à un scénario."""
        payload = request.get_json(silent=True) or {}
        try:
            result = ScenarioService.add_objectif(scenario_id, payload)
            return jsonify(result), 201
        except LookupError:
            return jsonify({"error": "Scenario not found"}), 404
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400

    @bp.route("/scenarios/<int:scenario_id>/cibles", methods=["POST"])
    def add_cible(scenario_id: int):
        """Ajoute une cible à un scénario."""
        payload = request.get_json(silent=True) or {}
        try:
            result = ScenarioService.add_cible(scenario_id, payload)
            return jsonify(result), 201
        except LookupError:
            return jsonify({"error": "Scenario not found"}), 404
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400

    @bp.route("/scenarios/<int:scenario_id>/ressources", methods=["POST"])
    def add_ressource(scenario_id: int):
        """Ajoute une ressource à un scénario."""
        payload = request.get_json(silent=True) or {}
        try:
            result = ScenarioService.add_ressource(scenario_id, payload)
            return jsonify(result), 201
        except LookupError:
            return jsonify({"error": "Scenario not found"}), 404
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400

    @bp.route("/scenarios/<int:scenario_id>/plan", methods=["POST"])
    def generate_plan(scenario_id: int):
        """Génère ou régénère un plan marketing pour un scénario."""
        regenerate = request.args.get("regenerate", "false").lower() == "true"
        
        if regenerate:
            result = PlanService.regenerate_plan(scenario_id)
        else:
            result = PlanService.generate_plan(scenario_id)
        
        if not result.get("success"):
            status_code = 400 if "missing" in result else 500
            return jsonify(result), status_code
        
        return jsonify(result), 201

    @bp.route("/scenarios/<int:scenario_id>/export/json", methods=["GET"])
    def export_json(scenario_id: int):
        """Exporte un scénario complet en JSON."""
        try:
            scenario = ScenarioService.get_scenario_detail(scenario_id)
            data = scenario_detail_schema.dump(scenario)
            
            # Créer un fichier JSON en mémoire
            json_str = json.dumps(data, ensure_ascii=False, indent=2)
            buffer = io.BytesIO(json_str.encode('utf-8'))
            buffer.seek(0)
            
            filename = f"scenario_{scenario_id}_{scenario.nom.replace(' ', '_')}.json"
            
            return send_file(
                buffer,
                mimetype='application/json',
                as_attachment=True,
                download_name=filename,
            )
        except LookupError:
            return jsonify({"error": "Scenario not found"}), 404

    @bp.route("/scenarios/<int:scenario_id>/export/csv", methods=["GET"])
    def export_csv(scenario_id: int):
        """Exporte le plan marketing d'un scénario en CSV."""
        try:
            scenario = ScenarioService.get_scenario_detail(scenario_id)
            plan = PlanService.get_latest_plan(scenario_id)
            
            if not plan:
                return jsonify({"error": "Aucun plan généré pour ce scénario"}), 404
            
            # Créer le CSV en mémoire
            output = io.StringIO()
            writer = csv.writer(output)
            
            # En-tête
            writer.writerow([f"Plan marketing - {scenario.nom}"])
            writer.writerow([f"Généré le: {plan.generated_at.strftime('%Y-%m-%d %H:%M')}"])
            writer.writerow([])
            writer.writerow(["Format", "Message", "Canal", "Fréquence", "KPI"])
            
            # Items
            for item in plan.items:
                writer.writerow([
                    item.format,
                    item.message,
                    item.canal,
                    item.frequence or "",
                    item.kpi or "",
                ])
            
            # Convertir en bytes
            buffer = io.BytesIO(output.getvalue().encode('utf-8'))
            buffer.seek(0)
            
            filename = f"plan_{scenario_id}_{scenario.nom.replace(' ', '_')}.csv"
            
            return send_file(
                buffer,
                mimetype='text/csv',
                as_attachment=True,
                download_name=filename,
            )
        except LookupError:
            return jsonify({"error": "Scenario not found"}), 404

    @bp.route("/scenarios/suggest-new", methods=["POST"])
    def suggest_new_scenario():
        """Génère plusieurs suggestions de nouveaux scénarios basées sur les scénarios existants."""
        try:
            suggestions = ScenarioService.suggest_new_scenario()
            return jsonify(suggestions), 200
        except Exception as exc:
            return jsonify({"error": str(exc)}), 500

    @bp.route("/scenarios/batch-create", methods=["POST"])
    def batch_create_scenarios():
        """Crée plusieurs scénarios en une seule requête."""
        payload = request.get_json(silent=True) or {}
        scenarios_data = payload.get("scenarios", [])
        
        if not scenarios_data:
            return jsonify({"error": "No scenarios provided"}), 400
        
        try:
            created_scenarios = []
            for scenario_data in scenarios_data:
                data = create_schema.load(scenario_data)
                scenario = ScenarioService.create_scenario(data)
                created_scenarios.append(scenario)
            
            return jsonify({
                "count": len(created_scenarios),
                "scenarios": scenarios_schema.dump(created_scenarios)
            }), 201
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400
        except Exception as exc:
            return jsonify({"error": str(exc)}), 500
