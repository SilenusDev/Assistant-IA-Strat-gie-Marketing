"""Module d'intégration OpenAI pour l'assistant marketing."""

from .openai_client import OpenAIClient
from .schemas import (
    ActionSchema,
    ChatResponseSchema,
    EntityToCreateSchema,
    PlanGenerationSchema,
    PlanItemGenerationSchema,
)

__all__ = [
    "OpenAIClient",
    "ChatResponseSchema",
    "ActionSchema",
    "EntityToCreateSchema",
    "PlanGenerationSchema",
    "PlanItemGenerationSchema",
]
