from __future__ import annotations

import logging
from typing import Any

from flask import current_app
from sqlalchemy.exc import IntegrityError
import openai

from ..extensions import db
from ..models import Cible, Configuration, Objectif, Scenario

logger = logging.getLogger(__name__)


class ScenarioService:
    """Business logic for scenarios."""

    @staticmethod
    def list_scenarios() -> list[Scenario]:
        return (
            Scenario.query.order_by(Scenario.updated_at.desc())
            .limit(50)
            .all()
        )

    @staticmethod
    def create_scenario(payload: dict[str, Any]) -> Scenario:
        scenario = Scenario(**payload)
        db.session.add(scenario)
        try:
            db.session.commit()
        except IntegrityError as exc:
            db.session.rollback()
            raise ValueError("Unable to create scenario") from exc
        return scenario

    @staticmethod
    def get_scenario_detail(scenario_id: int) -> Scenario:
        scenario = Scenario.query.filter_by(id=scenario_id).first()
        if not scenario:
            raise LookupError("Scenario not found")
        return scenario

    @staticmethod
    def delete_scenario(scenario_id: int) -> None:
        """
        Supprime un scénario et toutes ses relations.
        
        Args:
            scenario_id: ID du scénario à supprimer
            
        Raises:
            LookupError: Si le scénario n'existe pas
        """
        scenario = Scenario.query.filter_by(id=scenario_id).first()
        if not scenario:
            raise LookupError("Scenario not found")
        
        try:
            db.session.delete(scenario)
            db.session.commit()
            logger.info(
                "[scenario_service][success] Scénario supprimé",
                extra={"scenario_id": scenario_id}
            )
        except Exception as exc:
            db.session.rollback()
            logger.error(
                "[scenario_service][error] Erreur lors de la suppression",
                extra={"scenario_id": scenario_id, "error": str(exc)}
            )
            raise

    @staticmethod
    def add_objectif(scenario_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        """
        Ajoute un objectif à un scénario.

        Args:
            scenario_id: ID du scénario
            payload: Données de l'objectif (label, description)

        Returns:
            Dict avec objectif créé et scénario mis à jour
        """
        scenario = Scenario.query.filter_by(id=scenario_id).first()
        if not scenario:
            raise LookupError("Scenario not found")

        label = payload.get("label")
        if not label:
            raise ValueError("Label requis")

        # Vérifier si l'objectif existe déjà
        objectif = Objectif.query.filter_by(label=label).first()
        if not objectif:
            objectif = Objectif(
                label=label,
                description=payload.get("description"),
            )
            db.session.add(objectif)
            db.session.flush()

        # Ajouter au scénario si pas déjà présent
        if objectif not in scenario.objectifs:
            scenario.objectifs.append(objectif)
            db.session.commit()
            logger.info(
                "[scenario_service][success] Objectif ajouté",
                extra={"scenario_id": scenario_id, "objectif_id": objectif.id},
            )
        else:
            logger.info(
                "[scenario_service][info] Objectif déjà présent",
                extra={"scenario_id": scenario_id, "objectif_id": objectif.id},
            )

        from ..schemas.scenario import ObjectifSchema, ScenarioDetailSchema

        return {
            "objectif": ObjectifSchema().dump(objectif),
            "scenario": ScenarioDetailSchema().dump(scenario),
        }

    @staticmethod
    def add_cible(scenario_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        """
        Ajoute une cible à un scénario.

        Args:
            scenario_id: ID du scénario
            payload: Données de la cible (label, persona, segment)

        Returns:
            Dict avec cible créée et scénario mis à jour
        """
        scenario = Scenario.query.filter_by(id=scenario_id).first()
        if not scenario:
            raise LookupError("Scenario not found")

        label = payload.get("label")
        if not label:
            raise ValueError("Label requis")

        # Vérifier si la cible existe déjà
        cible = Cible.query.filter_by(label=label).first()
        if not cible:
            cible = Cible(
                label=label,
                persona=payload.get("persona"),
                segment=payload.get("segment"),
            )
            db.session.add(cible)
            db.session.flush()

        # Ajouter au scénario si pas déjà présent
        if cible not in scenario.cibles:
            scenario.cibles.append(cible)
            db.session.commit()
            logger.info(
                "[scenario_service][success] Cible ajoutée",
                extra={"scenario_id": scenario_id, "cible_id": cible.id},
            )
        else:
            logger.info(
                "[scenario_service][info] Cible déjà présente",
                extra={"scenario_id": scenario_id, "cible_id": cible.id},
            )

        from ..schemas.scenario import CibleSchema, ScenarioDetailSchema

        return {
            "cible": CibleSchema().dump(cible),
            "scenario": ScenarioDetailSchema().dump(scenario),
        }

    @staticmethod
    def suggest_new_scenario() -> dict[str, Any]:
        """
        Génère plusieurs suggestions de nouveaux scénarios basées sur les scénarios existants.
        Utilise OpenAI pour analyser les scénarios et proposer des idées innovantes.
        
        Returns:
            dict: Liste de suggestions avec nom, thématique et description
        """
        # Récupérer tous les scénarios existants
        scenarios = Scenario.query.all()
        
        # Construire le contexte pour l'IA
        scenarios_context = []
        for scenario in scenarios:
            scenarios_context.append({
                "nom": scenario.nom,
                "thematique": scenario.thematique,
                "description": scenario.description
            })
        
        # Construire le prompt pour OpenAI
        prompt = f"""Vous êtes un expert en stratégie marketing innovante.

Voici les scénarios marketing existants :
{scenarios_context}

Votre mission :
1. Analysez les thématiques déjà couvertes
2. Identifiez les tendances marketing actuelles non exploitées
3. Proposez 3 à 5 nouveaux scénarios marketing innovants et différents

Chaque nouveau scénario doit :
- Être original et ne pas dupliquer les existants
- Explorer une thématique marketing actuelle et pertinente
- Être actionnable et concret
- Avoir un potentiel d'impact business

Répondez UNIQUEMENT au format JSON suivant (sans markdown, juste le JSON) :
{{
  "suggestions": [
    {{
      "nom": "Nom court et accrocheur du scénario",
      "thematique": "Thématique marketing principale",
      "description": "Description détaillée en 2-3 phrases expliquant l'objectif et l'approche"
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
                        "content": "Vous êtes un expert en stratégie marketing. Vous répondez toujours en JSON valide."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.8,  # Plus créatif
                max_tokens=1500  # Plus de tokens pour plusieurs suggestions
            )
            
            # Extraire la réponse
            content = response.choices[0].message.content.strip()
            
            # Parser le JSON
            import json
            suggestion = json.loads(content)
            
            logger.info(
                "[scenario_service][success] Suggestion générée",
                extra={"suggestion": suggestion}
            )
            
            return suggestion
            
        except Exception as exc:
            logger.error(
                "[scenario_service][error] Erreur lors de la génération de suggestion",
                extra={"error": str(exc)}
            )
            raise

