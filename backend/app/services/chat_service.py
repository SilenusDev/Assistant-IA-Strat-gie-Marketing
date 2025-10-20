"""Service d'orchestration conversationnelle."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from flask import current_app

from ..ai import ChatResponseSchema, OpenAIClient
from ..ai.prompts import (
    SYSTEM_PROMPT_BASE,
    build_context_summary,
    get_prompt_for_intent,
)
from ..extensions import db
from ..models import AuteurType, Message, Scenario

logger = logging.getLogger(__name__)


class ChatService:
    """Service de gestion du chat et orchestration IA."""

    @staticmethod
    def process_message(
        scenario_id: int | None,
        user_message: str,
        intent: str | None = None,
    ) -> dict[str, Any]:
        """
        Traite un message utilisateur et retourne une réponse IA.

        Args:
            scenario_id: ID du scénario actif (None si création)
            user_message: Message de l'utilisateur
            intent: Intention détectée (optionnel)

        Returns:
            Dict avec message, actions, scenario_state, error
        """
        logger.info(
            "[chat_service][start] Traitement message",
            extra={"scenario_id": scenario_id, "intent": intent},
        )

        try:
            # Charger le scénario si fourni
            scenario = None
            context = {}
            
            if scenario_id:
                scenario = Scenario.query.filter_by(id=scenario_id).first()
                if not scenario:
                    return {
                        "message": "Scénario introuvable.",
                        "actions": [],
                        "error": "Scenario not found",
                    }
                
                # Construire le contexte
                context = ChatService._build_context(scenario)

            # Sauvegarder le message utilisateur
            if scenario_id:
                ChatService.save_message(
                    scenario_id=scenario_id,
                    auteur=AuteurType.USER,
                    contenu=user_message,
                )

            # Appeler OpenAI
            ai_client = OpenAIClient()
            
            # Construire le prompt selon l'intention
            system_prompt = SYSTEM_PROMPT_BASE
            if intent:
                intent_prompt = get_prompt_for_intent(intent)
                if intent_prompt:
                    system_prompt += f"\n\n{intent_prompt}"

            response = ai_client.chat_completion(
                system_prompt=system_prompt,
                user_message=user_message,
                context=context,
                response_format=ChatResponseSchema,
            )

            if not response:
                logger.error("[chat_service][error] Échec appel OpenAI")
                response = ai_client.get_fallback_response()

            # Sauvegarder la réponse assistant
            if scenario_id:
                ChatService.save_message(
                    scenario_id=scenario_id,
                    auteur=AuteurType.ASSISTANT,
                    contenu=response.message_markdown,
                    role_action=intent,
                )

            # Construire la réponse
            result = {
                "message": response.message_markdown,
                "actions": [action.model_dump() for action in response.actions],
                "entities_to_create": [
                    entity.model_dump() for entity in response.entities_to_create
                ],
            }

            if scenario:
                result["scenario_state"] = ChatService._serialize_scenario(scenario)

            if response.errors:
                result["errors"] = response.errors

            logger.info(
                "[chat_service][success] Message traité",
                extra={"actions_count": len(response.actions)},
            )

            return result

        except Exception as exc:
            logger.exception("[chat_service][error] Erreur traitement message")
            return {
                "message": "Une erreur est survenue lors du traitement de votre message.",
                "actions": [],
                "error": str(exc),
            }

    @staticmethod
    def process_action(
        scenario_id: int,
        action_type: str,
        payload: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Traite une action déclenchée par un bouton.

        Args:
            scenario_id: ID du scénario
            action_type: Type d'action (add_objective, add_target, etc.)
            payload: Données de l'action

        Returns:
            Dict avec message, actions, scenario_state, error
        """
        logger.info(
            "[chat_service][start] Traitement action",
            extra={"scenario_id": scenario_id, "action_type": action_type},
        )

        try:
            scenario = Scenario.query.filter_by(id=scenario_id).first()
            if not scenario:
                return {
                    "message": "Scénario introuvable.",
                    "actions": [],
                    "error": "Scenario not found",
                }

            # Sauvegarder l'action comme message système
            action_label = payload.get("label", action_type) if payload else action_type
            ChatService.save_message(
                scenario_id=scenario_id,
                auteur=AuteurType.SYSTEM,
                contenu=f"Action déclenchée: {action_label}",
                role_action=action_type,
            )

            # Construire un message utilisateur simulé pour l'action
            user_message = ChatService._action_to_message(action_type, payload)

            # Traiter comme un message normal avec intention
            return ChatService.process_message(
                scenario_id=scenario_id,
                user_message=user_message,
                intent=action_type,
            )

        except Exception as exc:
            logger.exception("[chat_service][error] Erreur traitement action")
            return {
                "message": "Une erreur est survenue lors du traitement de l'action.",
                "actions": [],
                "error": str(exc),
            }

    @staticmethod
    def get_conversation_history(
        scenario_id: int,
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        """
        Récupère l'historique récent de conversation.

        Args:
            scenario_id: ID du scénario
            limit: Nombre maximum de messages

        Returns:
            Liste de messages sérialisés
        """
        messages = (
            Message.query.filter_by(scenario_id=scenario_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
            .all()
        )

        return [
            {
                "id": msg.id,
                "auteur": msg.auteur.value,
                "contenu": msg.contenu,
                "role_action": msg.role_action,
                "created_at": msg.created_at.isoformat() if msg.created_at else None,
            }
            for msg in reversed(messages)  # Ordre chronologique
        ]

    @staticmethod
    def save_message(
        scenario_id: int | None,
        auteur: AuteurType,
        contenu: str,
        role_action: str | None = None,
    ) -> Message:
        """
        Sauvegarde un message dans l'historique.

        Args:
            scenario_id: ID du scénario (None pour messages globaux)
            auteur: Auteur du message (user, assistant, system)
            contenu: Contenu du message
            role_action: Action/rôle associé (optionnel)

        Returns:
            Message créé
        """
        ttl_days = current_app.config.get("PURGE_TTL_DAYS", 7)
        ttl = datetime.now(timezone.utc) + timedelta(days=ttl_days)

        message = Message(
            scenario_id=scenario_id,
            auteur=auteur,
            contenu=contenu,
            role_action=role_action,
            ttl=ttl,
        )

        db.session.add(message)
        db.session.commit()

        logger.info(
            "[chat_service][success] Message sauvegardé",
            extra={"message_id": message.id, "auteur": auteur.value},
        )

        return message

    @staticmethod
    def compute_available_actions(scenario: Scenario) -> list[dict[str, Any]]:
        """
        Calcule les actions disponibles selon l'état du scénario.

        Args:
            scenario: Instance du scénario

        Returns:
            Liste d'actions disponibles
        """
        actions = []

        # Actions toujours disponibles
        actions.append({
            "id": "add_objective",
            "label": "Ajouter un objectif",
            "type": "add_objective",
        })

        actions.append({
            "id": "suggest_targets",
            "label": "Proposer des cibles",
            "type": "suggest_targets",
        })

        actions.append({
            "id": "add_resource",
            "label": "Ajouter une ressource",
            "type": "add_resource",
        })

        # Action génération plan si prérequis OK
        has_objectives = len(scenario.objectifs) > 0
        has_targets = len(scenario.cibles) > 0
        has_resources = len(scenario.ressources) > 0

        if has_objectives and has_targets and has_resources:
            actions.append({
                "id": "generate_plan",
                "label": "Générer le plan marketing",
                "type": "generate_plan",
            })
        
        # Action recherche
        actions.append({
            "id": "search_inspiration",
            "label": "Rechercher des inspirations",
            "type": "search_inspiration",
        })

        return actions

    @staticmethod
    def _build_context(scenario: Scenario) -> dict[str, Any]:
        """Construit le contexte pour OpenAI."""
        from ..schemas.scenario import (
            CibleSchema,
            ObjectifSchema,
            RessourceSchema,
            ScenarioSchema,
        )

        scenario_schema = ScenarioSchema()
        objectif_schema = ObjectifSchema(many=True)
        cible_schema = CibleSchema(many=True)
        ressource_schema = RessourceSchema(many=True)

        return {
            "scenario": scenario_schema.dump(scenario),
            "objectifs": objectif_schema.dump(scenario.objectifs),
            "cibles": cible_schema.dump(scenario.cibles),
            "ressources": ressource_schema.dump(scenario.ressources),
            "historique": ChatService.get_conversation_history(scenario.id, limit=5),
        }

    @staticmethod
    def _serialize_scenario(scenario: Scenario) -> dict[str, Any]:
        """Sérialise un scénario pour la réponse."""
        from ..schemas.scenario import ScenarioDetailSchema

        schema = ScenarioDetailSchema()
        return schema.dump(scenario)

    @staticmethod
    def _action_to_message(action_type: str, payload: dict[str, Any] | None) -> str:
        """Convertit une action en message utilisateur simulé."""
        messages = {
            "add_objective": "Je veux ajouter un objectif à mon scénario.",
            "suggest_targets": "Propose-moi des cibles pertinentes pour mon scénario.",
            "add_target": "Je veux ajouter une cible à mon scénario.",
            "add_resource": "Je veux ajouter une ressource existante.",
            "generate_plan": "Génère-moi un plan de diffusion marketing complet.",
            "search_inspiration": "Recherche des inspirations pour mon scénario.",
        }

        base_message = messages.get(action_type, f"Action: {action_type}")

        # Ajouter le payload si présent
        if payload and "label" in payload:
            base_message += f" ({payload['label']})"

        return base_message
