"""Client OpenAI avec gestion d'erreurs et retry."""

from __future__ import annotations

import json
import logging
from typing import Any

import openai
from flask import current_app
from openai import OpenAI, OpenAIError, RateLimitError
from pydantic import ValidationError

from .schemas import ChatResponseSchema, PlanGenerationSchema

logger = logging.getLogger(__name__)


class OpenAIClient:
    """Wrapper pour les appels à l'API OpenAI."""

    def __init__(self):
        """Initialise le client OpenAI."""
        api_key = current_app.config.get("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY non configurée")
        
        self.client = OpenAI(api_key=api_key)
        self.model = current_app.config.get("OPENAI_MODEL", "gpt-4o-mini")
        self.timeout = current_app.config.get("OPENAI_TIMEOUT", 30)

    def chat_completion(
        self,
        system_prompt: str,
        user_message: str,
        context: dict[str, Any] | None = None,
        response_format: type[ChatResponseSchema] | type[PlanGenerationSchema] = ChatResponseSchema,
        max_retries: int = 2,
    ) -> ChatResponseSchema | PlanGenerationSchema | None:
        """
        Appelle l'API OpenAI pour obtenir une réponse structurée.

        Args:
            system_prompt: Prompt système définissant le comportement
            user_message: Message utilisateur
            context: Contexte additionnel (scénario, historique, etc.)
            response_format: Schéma Pydantic attendu en réponse
            max_retries: Nombre de tentatives en cas d'échec

        Returns:
            Instance du schéma validé ou None en cas d'échec
        """
        messages = [{"role": "system", "content": system_prompt}]

        if context:
            context_str = self._format_context(context)
            messages.append({"role": "system", "content": f"Contexte:\n{context_str}"})

        messages.append({"role": "user", "content": user_message})

        for attempt in range(max_retries):
            try:
                logger.info(
                    "[openai_client][start] Appel OpenAI",
                    extra={
                        "model": self.model,
                        "attempt": attempt + 1,
                        "user_message_length": len(user_message),
                    },
                )

                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    response_format={"type": "json_object"},
                    timeout=self.timeout,
                )

                content = response.choices[0].message.content
                if not content:
                    logger.warning("[openai_client][warning] Réponse vide de OpenAI")
                    continue

                # Parser et valider avec Pydantic
                data = json.loads(content)
                validated = response_format.model_validate(data)

                logger.info(
                    "[openai_client][success] Réponse OpenAI validée",
                    extra={
                        "tokens_used": response.usage.total_tokens if response.usage else 0,
                        "response_type": response_format.__name__,
                    },
                )

                return validated

            except RateLimitError as exc:
                logger.error(
                    "[openai_client][error] Rate limit atteint",
                    extra={"attempt": attempt + 1, "error": str(exc)},
                )
                if attempt == max_retries - 1:
                    return None

            except ValidationError as exc:
                logger.error(
                    "[openai_client][error] Validation Pydantic échouée",
                    extra={"attempt": attempt + 1, "errors": exc.errors()},
                )
                if attempt == max_retries - 1:
                    return None

            except OpenAIError as exc:
                logger.error(
                    "[openai_client][error] Erreur OpenAI",
                    extra={"attempt": attempt + 1, "error": str(exc)},
                )
                if attempt == max_retries - 1:
                    return None

            except json.JSONDecodeError as exc:
                logger.error(
                    "[openai_client][error] JSON invalide",
                    extra={"attempt": attempt + 1, "error": str(exc)},
                )
                if attempt == max_retries - 1:
                    return None

            except Exception as exc:
                logger.exception(
                    "[openai_client][error] Erreur inattendue",
                    extra={"attempt": attempt + 1, "error": str(exc)},
                )
                return None

        return None

    def _format_context(self, context: dict[str, Any]) -> str:
        """Formate le contexte en texte lisible pour le prompt."""
        lines = []
        
        if "scenario" in context:
            scenario = context["scenario"]
            lines.append(f"Scénario actuel: {scenario.get('nom', 'N/A')}")
            lines.append(f"Thématique: {scenario.get('thematique', 'N/A')}")
            lines.append(f"Statut: {scenario.get('statut', 'draft')}")

        if "objectifs" in context and context["objectifs"]:
            lines.append(f"\nObjectifs ({len(context['objectifs'])}):")
            for obj in context["objectifs"]:
                lines.append(f"  - {obj.get('label', 'N/A')}")

        if "cibles" in context and context["cibles"]:
            lines.append(f"\nCibles ({len(context['cibles'])}):")
            for cible in context["cibles"]:
                lines.append(f"  - {cible.get('label', 'N/A')}")

        if "ressources" in context and context["ressources"]:
            lines.append(f"\nRessources ({len(context['ressources'])}):")
            for res in context["ressources"]:
                lines.append(f"  - {res.get('titre', 'N/A')} ({res.get('type', 'N/A')})")

        if "historique" in context and context["historique"]:
            lines.append(f"\nHistorique récent ({len(context['historique'])} messages):")
            for msg in context["historique"][-5:]:  # Derniers 5 messages
                auteur = msg.get("auteur", "unknown")
                contenu = msg.get("contenu", "")[:100]  # Tronquer si trop long
                lines.append(f"  [{auteur}] {contenu}")

        return "\n".join(lines) if lines else "Aucun contexte disponible"

    def get_fallback_response(self, error_message: str | None = None) -> ChatResponseSchema:
        """Retourne une réponse de secours en cas d'échec OpenAI."""
        return ChatResponseSchema(
            message_markdown=(
                "Désolé, je rencontre des difficultés techniques pour traiter votre demande. "
                "Veuillez réessayer dans quelques instants."
            ),
            actions=[],
            entities_to_create=[],
            errors=[error_message] if error_message else ["Service IA temporairement indisponible"],
        )
