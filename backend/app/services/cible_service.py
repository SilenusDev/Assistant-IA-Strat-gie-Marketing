"""Service de gestion des cibles."""

from __future__ import annotations

import json
import logging
from typing import Any

import openai
from flask import current_app

from ..extensions import db
from ..models import Cible, Configuration, Scenario

logger = logging.getLogger(__name__)


class CibleService:
    """Service de gestion des cibles."""

    @staticmethod
    def get_all_cibles() -> list[Cible]:
        """
        Récupère toutes les cibles existantes.

        Returns:
            Liste de toutes les cibles
        """
        return Cible.query.all()

    @staticmethod
    def create_cible(data: dict[str, Any]) -> Cible:
        """
        Crée une nouvelle cible.

        Args:
            data: Données de la cible (label, persona, segment)

        Returns:
            Cible créée

        Raises:
            ValueError: Si les données sont invalides
        """
        label = data.get("label")
        persona = data.get("persona")
        segment = data.get("segment")

        if not label:
            raise ValueError("label est requis")

        # Vérifier si la cible existe déjà
        existing = Cible.query.filter_by(label=label).first()
        if existing:
            return existing

        cible = Cible(label=label, persona=persona, segment=segment)
        db.session.add(cible)
        db.session.commit()

        logger.info(
            "[cible_service][success] Cible créée",
            extra={"cible_id": cible.id, "label": label},
        )

        return cible

    @staticmethod
    def suggest_cibles_for_scenario(
        scenario_id: int, configuration_id: int | None = None
    ) -> list[dict[str, str]]:
        """
        Génère des suggestions de cibles pertinentes pour un scénario via IA.
        Prend en compte les objectifs déjà sélectionnés si une configuration est fournie.
        Évite les doublons en excluant les cibles existantes.

        Args:
            scenario_id: ID du scénario
            configuration_id: ID de la configuration (optionnel)

        Returns:
            Liste de 5-7 cibles suggérées avec label, persona et segment

        Raises:
            LookupError: Si le scénario n'existe pas
        """
        scenario = Scenario.query.filter_by(id=scenario_id).first()
        if not scenario:
            raise LookupError(f"Scenario {scenario_id} not found")

        # Récupérer les cibles existantes pour éviter les doublons
        existing_cibles = CibleService.get_all_cibles()
        existing_labels = [cible.label for cible in existing_cibles]
        
        existing_context = ""
        if existing_labels:
            existing_context = f"\n\nCibles DÉJÀ EXISTANTES à NE PAS proposer :\n" + "\n".join([f"- {label}" for label in existing_labels])

        # Récupérer les objectifs si une configuration est fournie
        objectifs_context = ""
        if configuration_id:
            configuration = Configuration.query.filter_by(id=configuration_id).first()
            if configuration and configuration.objectifs:
                objectifs_list = [
                    f"- {obj.label}" for obj in configuration.objectifs
                ]
                objectifs_context = f"\n\nObjectifs sélectionnés :\n" + "\n".join(
                    objectifs_list
                )

        # Construire le prompt pour OpenAI
        prompt = f"""Vous êtes un expert en ciblage marketing B2B.

Scénario :
- Nom : {scenario.nom}
- Thématique : {scenario.thematique}
- Description : {scenario.description or "Non spécifiée"}{objectifs_context}{existing_context}

Votre mission :
1. Analysez le scénario{" et les objectifs" if objectifs_context else ""}
2. Proposez 5 à 7 cibles (personas) B2B pertinentes
3. Chaque cible doit avoir :
   - Un label clair (fonction/rôle) - max 60 caractères
   - Une description persona détaillée (responsabilités, défis, motivations)
   - Un segment de marché précis
   - Être DIFFÉRENTE des cibles déjà existantes listées ci-dessus
   - Être INÉDITE et innovante

Répondez UNIQUEMENT au format JSON suivant (sans markdown, juste le JSON) :
{{
  "cibles": [
    {{
      "label": "Titre du poste / Fonction",
      "persona": "Description détaillée du persona : responsabilités, défis, motivations",
      "segment": "Segment de marché ciblé"
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
                        "content": "Vous êtes un expert en ciblage marketing B2B. Vous répondez toujours en JSON valide.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=1500,
            )

            # Extraire la réponse
            content = response.choices[0].message.content.strip()

            # Parser le JSON
            result = json.loads(content)

            logger.info(
                "[cible_service][success] Cibles suggérées",
                extra={
                    "scenario_id": scenario_id,
                    "count": len(result.get("cibles", [])),
                },
            )

            return result.get("cibles", [])

        except Exception as exc:
            logger.error(
                "[cible_service][error] Erreur lors de la suggestion de cibles",
                extra={"scenario_id": scenario_id, "error": str(exc)},
            )
            raise
