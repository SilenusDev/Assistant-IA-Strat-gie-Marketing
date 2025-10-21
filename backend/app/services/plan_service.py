"""Service de génération de plans marketing."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any

import openai
from flask import current_app

from ..ai import OpenAIClient, PlanGenerationSchema
from ..ai.prompts import PROMPT_GENERATE_PLAN, SYSTEM_PROMPT_BASE, build_context_summary
from ..extensions import db
from ..models import Article, Configuration, Plan, PlanItem, Scenario

logger = logging.getLogger(__name__)


class PlanService:
    """Service de génération et gestion des plans marketing."""

    @staticmethod
    def generate_plan(scenario_id: int) -> dict[str, Any]:
        """
        Génère un plan marketing pour un scénario.

        Args:
            scenario_id: ID du scénario

        Returns:
            Dict avec plan, success, error
        """
        logger.info(
            "[plan_service][start] Génération plan",
            extra={"scenario_id": scenario_id},
        )

        try:
            scenario = Scenario.query.filter_by(id=scenario_id).first()
            if not scenario:
                return {
                    "success": False,
                    "error": "Scénario introuvable",
                }

            # Vérifier les prérequis
            validation = PlanService._validate_prerequisites(scenario)
            if not validation["valid"]:
                return {
                    "success": False,
                    "error": validation["message"],
                    "missing": validation["missing"],
                }

            # Construire le contexte
            context_summary = build_context_summary(
                scenario={
                    "nom": scenario.nom,
                    "thematique": scenario.thematique,
                    "statut": scenario.statut.value,
                },
                objectifs=[{"label": obj.label} for obj in scenario.objectifs],
                cibles=[
                    {"label": c.label, "segment": c.segment} for c in scenario.cibles
                ],
                ressources=[
                    {"titre": r.titre, "type": r.type.value} for r in scenario.ressources
                ],
            )

            # Appeler OpenAI pour générer le plan
            ai_client = OpenAIClient()
            
            user_message = (
                f"Génère un plan de diffusion marketing complet pour ce scénario.\n\n"
                f"{context_summary}\n\n"
                f"Le plan doit contenir entre 5 et 10 actions concrètes adaptées aux objectifs, "
                f"cibles et ressources disponibles."
            )

            response = ai_client.chat_completion(
                system_prompt=SYSTEM_PROMPT_BASE + "\n\n" + PROMPT_GENERATE_PLAN,
                user_message=user_message,
                response_format=PlanGenerationSchema,
            )

            if not response:
                logger.error("[plan_service][error] Échec génération OpenAI")
                return {
                    "success": False,
                    "error": "Impossible de générer le plan. Service IA indisponible.",
                }

            # Créer le plan en base
            plan = PlanService._create_plan_in_db(scenario, response)

            # Mettre à jour le statut du scénario
            scenario.statut = "ready"
            db.session.commit()

            logger.info(
                "[plan_service][success] Plan généré",
                extra={"plan_id": plan.id, "items_count": len(plan.items)},
            )

            return {
                "success": True,
                "plan": PlanService._serialize_plan(plan),
            }

        except Exception as exc:
            logger.exception("[plan_service][error] Erreur génération plan")
            db.session.rollback()
            return {
                "success": False,
                "error": f"Erreur lors de la génération: {str(exc)}",
            }

    @staticmethod
    def get_latest_plan(scenario_id: int) -> Plan | None:
        """
        Récupère le dernier plan généré pour un scénario.

        Args:
            scenario_id: ID du scénario

        Returns:
            Plan ou None
        """
        return (
            Plan.query.filter_by(scenario_id=scenario_id)
            .order_by(Plan.generated_at.desc())
            .first()
        )

    @staticmethod
    def regenerate_plan(scenario_id: int) -> dict[str, Any]:
        """
        Régénère un plan pour un scénario existant.

        Args:
            scenario_id: ID du scénario

        Returns:
            Dict avec plan, success, error
        """
        logger.info(
            "[plan_service][start] Régénération plan",
            extra={"scenario_id": scenario_id},
        )

        # Supprimer l'ancien plan (cascade sur items)
        old_plan = PlanService.get_latest_plan(scenario_id)
        if old_plan:
            db.session.delete(old_plan)
            db.session.commit()

        # Générer un nouveau plan
        return PlanService.generate_plan(scenario_id)

    @staticmethod
    def _validate_prerequisites(scenario: Scenario) -> dict[str, Any]:
        """
        Valide que le scénario a tous les prérequis pour générer un plan.

        Args:
            scenario: Instance du scénario

        Returns:
            Dict avec valid, message, missing
        """
        missing = []

        if not scenario.objectifs:
            missing.append("objectifs")
        
        if not scenario.cibles:
            missing.append("cibles")
        
        if not scenario.ressources:
            missing.append("ressources")

        if missing:
            return {
                "valid": False,
                "message": (
                    f"Le scénario doit avoir au moins un objectif, une cible et une ressource. "
                    f"Manquant: {', '.join(missing)}"
                ),
                "missing": missing,
            }

        return {
            "valid": True,
            "message": "Prérequis validés",
            "missing": [],
        }

    @staticmethod
    def _create_plan_in_db(
        scenario: Scenario,
        plan_data: PlanGenerationSchema,
    ) -> Plan:
        """
        Crée un plan et ses items en base de données.

        Args:
            scenario: Scénario associé
            plan_data: Données du plan validées

        Returns:
            Plan créé
        """
        plan = Plan(
            scenario_id=scenario.id,
            resume=plan_data.resume,
            generated_at=datetime.now(timezone.utc),
        )

        db.session.add(plan)
        db.session.flush()  # Pour obtenir l'ID du plan

        # Créer les items
        for item_data in plan_data.items:
            item = PlanItem(
                plan_id=plan.id,
                format=item_data.format,
                message=item_data.message,
                canal=item_data.canal,
                frequence=item_data.frequence,
                kpi=item_data.kpi,
            )
            db.session.add(item)

        db.session.commit()

        logger.info(
            "[plan_service][success] Plan créé en DB",
            extra={"plan_id": plan.id, "items_count": len(plan_data.items)},
        )

        return plan

    @staticmethod
    def _serialize_plan(plan: Plan) -> dict[str, Any]:
        """Sérialise un plan pour la réponse API."""
        from ..schemas.scenario import PlanSchema

        schema = PlanSchema()
        return schema.dump(plan)

    @staticmethod
    def generate_plan_with_articles(configuration_id: int) -> dict[str, Any]:
        """
        Génère un plan avec 5 articles pour une configuration.
        Utilise OpenAI pour créer des articles pertinents basés sur les objectifs et cibles.

        Args:
            configuration_id: ID de la configuration

        Returns:
            Dict avec le plan créé et ses articles

        Raises:
            LookupError: Si la configuration n'existe pas
            ValueError: Si la configuration n'a pas les prérequis
        """
        configuration = Configuration.query.filter_by(id=configuration_id).first()
        if not configuration:
            raise LookupError(f"Configuration {configuration_id} not found")

        # Vérifier les prérequis
        if not configuration.objectifs or not configuration.cibles:
            raise ValueError(
                "La configuration doit avoir au moins 1 objectif et 1 cible"
            )

        scenario = configuration.scenario

        # Construire le contexte pour l'IA
        objectifs_list = [f"- {obj.label}" for obj in configuration.objectifs]
        cibles_list = [
            f"- {cible.label} ({cible.segment})" for cible in configuration.cibles
        ]

        prompt = f"""Vous êtes un expert en content marketing B2B.

Configuration à développer :
- Scénario : {scenario.nom}
- Thématique : {scenario.thematique}
- Description : {scenario.description or "Non spécifiée"}

Objectifs :
{chr(10).join(objectifs_list)}

Cibles :
{chr(10).join(cibles_list)}

Votre mission :
1. Créez un plan de contenu stratégique
2. Proposez EXACTEMENT 5 articles/contenus pertinents
3. Chaque article doit :
   - Avoir un titre accrocheur et SEO-friendly (max 100 caractères)
   - Un résumé de 2-3 phrases expliquant l'angle et la valeur (max 200 caractères)
   - Être adapté aux objectifs et cibles
   - Couvrir différents aspects du scénario

Répondez UNIQUEMENT au format JSON suivant (sans markdown, juste le JSON) :
{{
  "resume": "Résumé global du plan de contenu en 2-3 phrases",
  "articles": [
    {{
      "nom": "Titre de l'article",
      "resume": "Résumé détaillé de l'article et de son angle"
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
                        "content": "Vous êtes un expert en content marketing B2B. Vous répondez toujours en JSON valide.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.8,
                max_tokens=1500,
            )

            # Extraire la réponse
            content = response.choices[0].message.content.strip()

            # Parser le JSON
            result = json.loads(content)

            # Créer le plan en base
            plan = Plan(
                configuration_id=configuration_id,
                resume=result.get("resume", "Plan de contenu généré"),
                generated_at=datetime.now(timezone.utc),
            )

            db.session.add(plan)
            db.session.flush()  # Pour obtenir l'ID du plan

            # Créer les 5 articles
            articles_data = result.get("articles", [])
            created_articles = []

            for article_data in articles_data[:5]:  # Limiter à 5 articles
                article = Article(
                    plan_id=plan.id,
                    nom=article_data.get("nom", "Article sans titre"),
                    resume=article_data.get("resume"),
                )
                db.session.add(article)
                created_articles.append(article)

            db.session.commit()

            logger.info(
                "[plan_service][success] Plan avec articles généré",
                extra={
                    "configuration_id": configuration_id,
                    "plan_id": plan.id,
                    "articles_count": len(created_articles),
                },
            )

            return {
                "plan_id": plan.id,
                "resume": plan.resume,
                "articles": [
                    {"id": a.id, "nom": a.nom, "resume": a.resume}
                    for a in created_articles
                ],
            }

        except Exception as exc:
            db.session.rollback()
            logger.error(
                "[plan_service][error] Erreur lors de la génération du plan",
                extra={"configuration_id": configuration_id, "error": str(exc)},
            )
            raise
