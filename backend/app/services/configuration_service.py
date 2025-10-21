"""Service de gestion des configurations."""

from __future__ import annotations

import logging
from typing import Any

from ..extensions import db
from ..models import Cible, Configuration, Objectif, Scenario

logger = logging.getLogger(__name__)


class ConfigurationService:
    """Service de gestion des configurations de scénarios."""

    @staticmethod
    def list_configurations(scenario_id: int) -> list[Configuration]:
        """
        Liste toutes les configurations d'un scénario.

        Args:
            scenario_id: ID du scénario

        Returns:
            Liste des configurations

        Raises:
            LookupError: Si le scénario n'existe pas
        """
        scenario = Scenario.query.filter_by(id=scenario_id).first()
        if not scenario:
            raise LookupError(f"Scenario {scenario_id} not found")

        return Configuration.query.filter_by(scenario_id=scenario_id).all()

    @staticmethod
    def create_configuration(data: dict[str, Any]) -> Configuration:
        """
        Crée une nouvelle configuration.

        Args:
            data: Données de la configuration (scenario_id, nom)

        Returns:
            Configuration créée

        Raises:
            ValueError: Si les données sont invalides
        """
        scenario_id = data.get("scenario_id")
        nom = data.get("nom")

        if not scenario_id or not nom:
            raise ValueError("scenario_id et nom sont requis")

        scenario = Scenario.query.filter_by(id=scenario_id).first()
        if not scenario:
            raise ValueError(f"Scenario {scenario_id} not found")

        configuration = Configuration(
            scenario_id=scenario_id,
            nom=nom,
        )

        db.session.add(configuration)
        db.session.commit()

        logger.info(
            "[configuration_service][success] Configuration créée",
            extra={"configuration_id": configuration.id, "scenario_id": scenario_id},
        )

        return configuration

    @staticmethod
    def get_configuration_detail(configuration_id: int) -> Configuration:
        """
        Récupère les détails d'une configuration.

        Args:
            configuration_id: ID de la configuration

        Returns:
            Configuration avec relations chargées

        Raises:
            LookupError: Si la configuration n'existe pas
        """
        configuration = Configuration.query.filter_by(id=configuration_id).first()
        if not configuration:
            raise LookupError(f"Configuration {configuration_id} not found")

        return configuration

    @staticmethod
    def delete_configuration(configuration_id: int) -> None:
        """
        Supprime une configuration.

        Args:
            configuration_id: ID de la configuration

        Raises:
            LookupError: Si la configuration n'existe pas
        """
        configuration = Configuration.query.filter_by(id=configuration_id).first()
        if not configuration:
            raise LookupError(f"Configuration {configuration_id} not found")

        db.session.delete(configuration)
        db.session.commit()

        logger.info(
            "[configuration_service][success] Configuration supprimée",
            extra={"configuration_id": configuration_id},
        )

    @staticmethod
    def add_objectif(configuration_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        """
        Ajoute un objectif à une configuration.

        Args:
            configuration_id: ID de la configuration
            payload: Données de l'objectif

        Returns:
            Dict avec configuration mise à jour

        Raises:
            LookupError: Si la configuration n'existe pas
            ValueError: Si les données sont invalides
        """
        configuration = Configuration.query.filter_by(id=configuration_id).first()
        if not configuration:
            raise LookupError(f"Configuration {configuration_id} not found")

        label = payload.get("label")
        description = payload.get("description")

        if not label:
            raise ValueError("label est requis")

        # Chercher ou créer l'objectif
        objectif = Objectif.query.filter_by(label=label).first()
        if not objectif:
            objectif = Objectif(label=label, description=description)
            db.session.add(objectif)

        # Ajouter à la configuration si pas déjà présent
        if objectif not in configuration.objectifs:
            configuration.objectifs.append(objectif)
            db.session.commit()

        logger.info(
            "[configuration_service][success] Objectif ajouté",
            extra={"configuration_id": configuration_id, "objectif_id": objectif.id},
        )

        from ..schemas.scenario import ConfigurationDetailSchema
        schema = ConfigurationDetailSchema()
        return schema.dump(configuration)

    @staticmethod
    def add_cible(configuration_id: int, payload: dict[str, Any]) -> dict[str, Any]:
        """
        Ajoute une cible à une configuration.

        Args:
            configuration_id: ID de la configuration
            payload: Données de la cible

        Returns:
            Dict avec configuration mise à jour

        Raises:
            LookupError: Si la configuration n'existe pas
            ValueError: Si les données sont invalides
        """
        configuration = Configuration.query.filter_by(id=configuration_id).first()
        if not configuration:
            raise LookupError(f"Configuration {configuration_id} not found")

        label = payload.get("label")
        persona = payload.get("persona")
        segment = payload.get("segment")

        if not label:
            raise ValueError("label est requis")

        # Chercher ou créer la cible
        cible = Cible.query.filter_by(label=label).first()
        if not cible:
            cible = Cible(label=label, persona=persona, segment=segment)
            db.session.add(cible)

        # Ajouter à la configuration si pas déjà présent
        if cible not in configuration.cibles:
            configuration.cibles.append(cible)
            db.session.commit()

        logger.info(
            "[configuration_service][success] Cible ajoutée",
            extra={"configuration_id": configuration_id, "cible_id": cible.id},
        )

        from ..schemas.scenario import ConfigurationDetailSchema
        schema = ConfigurationDetailSchema()
        return schema.dump(configuration)

    @staticmethod
    def remove_objectif(configuration_id: int, objectif_id: int) -> dict[str, Any]:
        """
        Retire un objectif d'une configuration.

        Args:
            configuration_id: ID de la configuration
            objectif_id: ID de l'objectif

        Returns:
            Dict avec configuration mise à jour

        Raises:
            LookupError: Si la configuration ou l'objectif n'existe pas
        """
        configuration = Configuration.query.filter_by(id=configuration_id).first()
        if not configuration:
            raise LookupError(f"Configuration {configuration_id} not found")

        objectif = Objectif.query.filter_by(id=objectif_id).first()
        if not objectif:
            raise LookupError(f"Objectif {objectif_id} not found")

        if objectif in configuration.objectifs:
            configuration.objectifs.remove(objectif)
            db.session.commit()

        logger.info(
            "[configuration_service][success] Objectif retiré",
            extra={"configuration_id": configuration_id, "objectif_id": objectif_id},
        )

        from ..schemas.scenario import ConfigurationDetailSchema
        schema = ConfigurationDetailSchema()
        return schema.dump(configuration)

    @staticmethod
    def remove_cible(configuration_id: int, cible_id: int) -> dict[str, Any]:
        """
        Retire une cible d'une configuration.

        Args:
            configuration_id: ID de la configuration
            cible_id: ID de la cible

        Returns:
            Dict avec configuration mise à jour

        Raises:
            LookupError: Si la configuration ou la cible n'existe pas
        """
        configuration = Configuration.query.filter_by(id=configuration_id).first()
        if not configuration:
            raise LookupError(f"Configuration {configuration_id} not found")

        cible = Cible.query.filter_by(id=cible_id).first()
        if not cible:
            raise LookupError(f"Cible {cible_id} not found")

        if cible in configuration.cibles:
            configuration.cibles.remove(cible)
            db.session.commit()

        logger.info(
            "[configuration_service][success] Cible retirée",
            extra={"configuration_id": configuration_id, "cible_id": cible_id},
        )

        from ..schemas.scenario import ConfigurationDetailSchema
        schema = ConfigurationDetailSchema()
        return schema.dump(configuration)

    @staticmethod
    def can_create_plan(configuration_id: int) -> bool:
        """
        Vérifie si une configuration peut générer un plan.
        Nécessite au moins 1 objectif ET 1 cible.

        Args:
            configuration_id: ID de la configuration

        Returns:
            True si la configuration peut générer un plan

        Raises:
            LookupError: Si la configuration n'existe pas
        """
        configuration = Configuration.query.filter_by(id=configuration_id).first()
        if not configuration:
            raise LookupError(f"Configuration {configuration_id} not found")

        return len(configuration.objectifs) >= 1 and len(configuration.cibles) >= 1
