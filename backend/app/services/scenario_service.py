from __future__ import annotations

import logging
from typing import Any

from flask import current_app
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models import Cible, Objectif, Ressource, RessourceType, Scenario

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
    def add_ressource(scenario_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        """
        Ajoute une ressource à un scénario.

        Args:
            scenario_id: ID du scénario
            payload: Données de la ressource (type, titre, url, note)

        Returns:
            Dict avec ressource créée et scénario mis à jour
        """
        scenario = Scenario.query.filter_by(id=scenario_id).first()
        if not scenario:
            raise LookupError("Scenario not found")

        titre = payload.get("titre")
        type_str = payload.get("type")

        if not titre or not type_str:
            raise ValueError("Titre et type requis")

        # Valider le type
        try:
            ressource_type = RessourceType(type_str)
        except ValueError:
            raise ValueError(f"Type invalide: {type_str}")

        # Créer la ressource
        ressource = Ressource(
            type=ressource_type,
            titre=titre,
            url=payload.get("url"),
            note=payload.get("note"),
        )
        db.session.add(ressource)
        db.session.flush()

        # Ajouter au scénario
        scenario.ressources.append(ressource)
        db.session.commit()

        logger.info(
            "[scenario_service][success] Ressource ajoutée",
            extra={"scenario_id": scenario_id, "ressource_id": ressource.id},
        )

        from ..schemas.scenario import RessourceSchema, ScenarioDetailSchema

        return {
            "ressource": RessourceSchema().dump(ressource),
            "scenario": ScenarioDetailSchema().dump(scenario),
        }
