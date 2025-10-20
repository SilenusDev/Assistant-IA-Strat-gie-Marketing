"""Service de génération de plans marketing."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from ..ai import OpenAIClient, PlanGenerationSchema
from ..ai.prompts import PROMPT_GENERATE_PLAN, SYSTEM_PROMPT_BASE, build_context_summary
from ..extensions import db
from ..models import Plan, PlanItem, Scenario

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
