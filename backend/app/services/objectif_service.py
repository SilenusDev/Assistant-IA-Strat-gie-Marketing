"""Service de gestion des objectifs."""

from __future__ import annotations

import json
import logging
from typing import Any

import openai
from flask import current_app

from ..extensions import db
from ..models import Objectif, Scenario

logger = logging.getLogger(__name__)


class ObjectifService:
    """Service de gestion des objectifs."""

    @staticmethod
    def get_all_objectifs() -> list[Objectif]:
        """
        Récupère tous les objectifs existants.

        Returns:
            Liste de tous les objectifs
        """
        return Objectif.query.all()

    @staticmethod
    def create_objectif(data: dict[str, Any]) -> Objectif:
        """
        Crée un nouvel objectif.

        Args:
            data: Données de l'objectif (label, description)

        Returns:
            Objectif créé

        Raises:
            ValueError: Si les données sont invalides
        """
        label = data.get("label")
        description = data.get("description")

        if not label:
            raise ValueError("label est requis")

        # Vérifier si l'objectif existe déjà
        existing = Objectif.query.filter_by(label=label).first()
        if existing:
            return existing

        objectif = Objectif(label=label, description=description)
        db.session.add(objectif)
        db.session.commit()

        logger.info(
            "[objectif_service][success] Objectif créé",
            extra={"objectif_id": objectif.id, "label": label},
        )

        return objectif

    @staticmethod
    def suggest_objectifs_for_scenario(scenario_id: int) -> list[dict[str, str]]:
        """
        Génère des suggestions d'objectifs pertinents pour un scénario via IA.
        Évite les doublons en excluant les objectifs existants.

        Args:
            scenario_id: ID du scénario

        Returns:
            Liste de 4-6 objectifs suggérés avec label et description

        Raises:
            LookupError: Si le scénario n'existe pas
        """
        scenario = Scenario.query.filter_by(id=scenario_id).first()
        if not scenario:
            raise LookupError(f"Scenario {scenario_id} not found")

        # Récupérer les objectifs existants pour éviter les doublons
        existing_objectifs = ObjectifService.get_all_objectifs()
        existing_labels = [obj.label for obj in existing_objectifs]
        
        existing_context = ""
        if existing_labels:
            existing_context = f"\n\nObjectifs DÉJÀ EXISTANTS à NE PAS proposer :\n" + "\n".join([f"- {label}" for label in existing_labels])

        # Construire le prompt pour OpenAI
        prompt = f"""Vous êtes un expert en stratégie marketing B2B.

Scénario à analyser :
- Nom : {scenario.nom}
- Thématique : {scenario.thematique}
- Description : {scenario.description or "Non spécifiée"}{existing_context}

Votre mission :
1. Analysez ce scénario marketing
2. Proposez 4 à 6 objectifs marketing SMART et pertinents
3. Chaque objectif doit être :
   - Spécifique au contexte du scénario
   - Mesurable et actionnable
   - DIFFÉRENT des objectifs déjà existants listés ci-dessus
   - INÉDIT et innovant
   - Formulé de manière concise (max 80 caractères)

Répondez UNIQUEMENT au format JSON suivant (sans markdown, juste le JSON) :
{{
  "objectifs": [
    {{
      "label": "Objectif court et percutant",
      "description": "Description détaillée de l'objectif et de son impact"
    }}
  ]
}}"""

        try:
            # Appeler OpenAI
            client = openai.OpenAI(api_key=current_app.config["OPENAI_API_KEY"])
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "Vous êtes un expert en stratégie marketing B2B. Vous répondez toujours en JSON valide.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=1000,
            )

            # Extraire la réponse
            content = response.choices[0].message.content.strip()

            # Parser le JSON
            result = json.loads(content)

            logger.info(
                "[objectif_service][success] Objectifs suggérés",
                extra={"scenario_id": scenario_id, "count": len(result.get("objectifs", []))},
            )

            return result.get("objectifs", [])

        except Exception as exc:
            logger.error(
                "[objectif_service][error] Erreur lors de la suggestion d'objectifs",
                extra={"scenario_id": scenario_id, "error": str(exc)},
            )
            raise
