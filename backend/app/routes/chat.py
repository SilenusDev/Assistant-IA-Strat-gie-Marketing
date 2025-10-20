"""Routes API pour le chat conversationnel."""

from flask import Blueprint, jsonify, request

from ..services.chat_service import ChatService

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/chat", methods=["POST"])
def chat():
    """
    Endpoint principal de conversation.
    
    Payload:
        {
            "scenario_id": int (optionnel),
            "message": str (optionnel si action fournie),
            "action": {
                "type": str,
                "payload": dict
            } (optionnel si message fourni)
        }
    
    Returns:
        {
            "message": str,
            "actions": list,
            "scenario_state": dict (optionnel),
            "entities_to_create": list (optionnel),
            "errors": list (optionnel)
        }
    """
    payload = request.get_json(silent=True) or {}
    
    scenario_id = payload.get("scenario_id")
    user_message = payload.get("message")
    action = payload.get("action")
    
    # Validation
    if not user_message and not action:
        return jsonify({"error": "Message ou action requis"}), 400
    
    try:
        # Traiter une action
        if action:
            action_type = action.get("type")
            action_payload = action.get("payload")
            
            if not action_type:
                return jsonify({"error": "Type d'action requis"}), 400
            
            if not scenario_id:
                return jsonify({"error": "scenario_id requis pour les actions"}), 400
            
            result = ChatService.process_action(
                scenario_id=scenario_id,
                action_type=action_type,
                payload=action_payload,
            )
        
        # Traiter un message
        else:
            intent = payload.get("intent")  # Intention optionnelle
            
            result = ChatService.process_message(
                scenario_id=scenario_id,
                user_message=user_message,
                intent=intent,
            )
        
        # Gérer les erreurs métier
        if "error" in result and not result.get("message"):
            return jsonify(result), 400
        
        return jsonify(result), 200
    
    except Exception as exc:
        return jsonify({
            "error": "Erreur serveur lors du traitement",
            "details": str(exc),
        }), 500


@chat_bp.route("/chat/history/<int:scenario_id>", methods=["GET"])
def get_history(scenario_id: int):
    """
    Récupère l'historique de conversation d'un scénario.
    
    Query params:
        limit: int (défaut 10)
    
    Returns:
        {
            "messages": list,
            "count": int
        }
    """
    try:
        limit = request.args.get("limit", default=10, type=int)
        
        messages = ChatService.get_conversation_history(
            scenario_id=scenario_id,
            limit=limit,
        )
        
        return jsonify({
            "messages": messages,
            "count": len(messages),
        }), 200
    
    except Exception as exc:
        return jsonify({
            "error": "Erreur lors de la récupération de l'historique",
            "details": str(exc),
        }), 500
