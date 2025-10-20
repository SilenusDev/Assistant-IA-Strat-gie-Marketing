from __future__ import annotations

import json
from pathlib import Path

from flask import current_app

from app import create_app
from app.extensions import db
from app.models import (
    Cible,
    Objectif,
    Ressource,
    RessourceType,
    Scenario,
    scenario_cibles,
)

DATASET_FILE = Path(__file__).resolve().parents[2] / "dataset.json"


matricule_map = {
    "débutant": "awareness",
    "intermédiaire": "consideration",
    "avancé": "decision",
}


def load_json():
    with DATASET_FILE.open(encoding="utf-8") as fp:
        return json.load(fp)


def get_or_create_objectif(label: str, description: str | None = None) -> Objectif:
    objectif = Objectif.query.filter_by(label=label).first()
    if objectif:
        return objectif
    objectif = Objectif(label=label, description=description)
    db.session.add(objectif)
    db.session.flush()
    return objectif


def build_cible(cible_data: dict) -> Cible:
    label = cible_data.get("persona") or cible_data.get("segment") or "Cible"
    existing = Cible.query.filter_by(label=label).first()
    if existing:
        return existing
    cible = Cible(
        label=label,
        persona=cible_data.get("persona"),
        segment=cible_data.get("segment"),
    )
    db.session.add(cible)
    db.session.flush()
    return cible


def create_ressources(scenario: Scenario, ressources_existantes: dict) -> list[Ressource]:
    ressources: list[Ressource] = []

    mapping = {
        "blog_posts": RessourceType.ARTICLE,
        "infographies": RessourceType.AUTRE,
        "videos": RessourceType.VIDEO,
        "lead_magnets": RessourceType.AUTRE,
    }

    for key, res_type in mapping.items():
        items = ressources_existantes.get(key) or []
        for item in items:
            res = Ressource(type=res_type, titre=str(item))
            ressources.append(res)

    for flag in ("newsletter", "base_contacts", "site_web"):
        if ressources_existantes.get(flag):
            titre = flag.replace("_", " ").title()
            ressources.append(Ressource(type=RessourceType.AUTRE, titre=titre))

    db.session.add_all(ressources)
    db.session.flush()
    return ressources


def populate_scenario(data: dict) -> Scenario:
    nom = data.get("nom")
    thematique = data.get("thématique") or data.get("thematique") or ""

    scenario = Scenario.query.filter_by(nom=nom).first()
    if scenario:
        return scenario

    scenario = Scenario(
        nom=nom,
        thematique=thematique,
        description=json.dumps(data.get("contraintes", {}), ensure_ascii=False),
    )

    objectif_label = (
        data.get("objectif")
        or data.get("objective")
        or f"Objectif {thematique}".title()
    )
    objectif = get_or_create_objectif(objectif_label)
    cible = build_cible(data.get("cible", {}))
    ressources = create_ressources(scenario, data.get("ressources_existantes", {}))

    db.session.add(scenario)
    db.session.flush()

    objectif.scenarios.append(scenario)
    cible.scenarios.append(scenario)
    scenario.ressources.extend(ressources)
    db.session.flush()

    niveau = data.get("cible", {}).get("niveau_maturité")
    maturite = matricule_map.get(niveau.lower()) if isinstance(niveau, str) else None
    if maturite:
        db.session.execute(
            scenario_cibles.update()
            .where(
                (scenario_cibles.c.scenario_id == scenario.id)
                & (scenario_cibles.c.cible_id == cible.id)
            )
            .values(maturite=maturite)
        )

    return scenario


def main():
    app = create_app()

    with app.app_context():
        if not DATASET_FILE.exists():
            raise FileNotFoundError(f"Dataset file not found: {DATASET_FILE}")

        payload = load_json()
        for entry in payload:
            populate_scenario(entry)

        db.session.commit()
        print("Database seeded successfully.")


if __name__ == "__main__":
    main()
