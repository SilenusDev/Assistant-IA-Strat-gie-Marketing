"""Schémas Pydantic pour validation des réponses OpenAI."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ActionSchema(BaseModel):
    """Action contextuelle proposée à l'utilisateur."""

    id: str = Field(..., description="Identifiant unique de l'action")
    label: str = Field(..., description="Libellé affiché sur le bouton")
    type: str = Field(..., description="Type d'action (add_objective, add_target, etc.)")
    payload: dict[str, Any] | None = Field(default=None, description="Données associées à l'action")


class EntityToCreateSchema(BaseModel):
    """Entité à créer suite à la conversation."""

    entity_type: str = Field(..., description="Type d'entité (objectif, cible, ressource)")
    data: dict[str, Any] = Field(..., description="Données de l'entité à créer")


class ChatResponseSchema(BaseModel):
    """Réponse structurée du chatbot."""

    message_markdown: str = Field(..., description="Message formaté en Markdown")
    actions: list[ActionSchema] = Field(default_factory=list, description="Actions disponibles")
    entities_to_create: list[EntityToCreateSchema] = Field(
        default_factory=list,
        description="Entités à créer automatiquement",
    )
    errors: list[str] = Field(default_factory=list, description="Erreurs rencontrées")


class PlanItemGenerationSchema(BaseModel):
    """Item d'un plan marketing généré."""

    format: str = Field(..., description="Format du contenu (article, video, etc.)")
    message: str = Field(..., description="Message ou description du contenu")
    canal: str = Field(..., description="Canal de diffusion (LinkedIn, email, etc.)")
    frequence: str | None = Field(default=None, description="Fréquence de publication")
    kpi: str | None = Field(default=None, description="KPI à suivre")


class PlanGenerationSchema(BaseModel):
    """Plan marketing complet généré par l'IA."""

    resume: str = Field(..., description="Résumé du plan marketing")
    items: list[PlanItemGenerationSchema] = Field(
        ...,
        min_length=3,
        description="Liste des actions du plan (minimum 3)",
    )
