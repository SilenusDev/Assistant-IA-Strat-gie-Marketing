from __future__ import annotations

from datetime import datetime, timezone, timedelta
from enum import Enum

from sqlalchemy import Enum as SAEnum, UniqueConstraint
from sqlalchemy.orm import mapped_column, relationship

from ..extensions import db


class TimestampMixin:
    created_at = mapped_column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at = mapped_column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


configuration_objectifs = db.Table(
    "configuration_objectifs",
    db.Column("configuration_id", db.Integer, db.ForeignKey("configurations.id"), primary_key=True),
    db.Column("objectif_id", db.Integer, db.ForeignKey("objectifs.id"), primary_key=True),
    db.Column("priorite", db.SmallInteger, nullable=True),
    UniqueConstraint("configuration_id", "objectif_id", name="uq_configuration_objectif"),
)

configuration_cibles = db.Table(
    "configuration_cibles",
    db.Column("configuration_id", db.Integer, db.ForeignKey("configurations.id"), primary_key=True),
    db.Column("cible_id", db.Integer, db.ForeignKey("cibles.id"), primary_key=True),
    db.Column(
        "maturite",
        db.String(20),
        nullable=True,
    ),
    UniqueConstraint("configuration_id", "cible_id", name="uq_configuration_cible"),
)


class Scenario(db.Model, TimestampMixin):
    __tablename__ = "scenarios"

    id = mapped_column(db.Integer, primary_key=True)
    nom = mapped_column(db.String(150), nullable=False)
    thematique = mapped_column(db.String(150), nullable=False)
    description = mapped_column(db.Text, nullable=True)
    statut = mapped_column(
        db.String(20),
        default="draft",
        nullable=False,
    )

    configurations = relationship("Configuration", back_populates="scenario", lazy="selectin")
    messages = relationship("Message", back_populates="scenario", lazy="dynamic")
    recherches = relationship("Recherche", back_populates="scenario", lazy="selectin")

    def compute_ttl(self, ttl_days: int) -> datetime:
        return datetime.now(timezone.utc) + timedelta(days=ttl_days)


class Objectif(db.Model, TimestampMixin):
    __tablename__ = "objectifs"

    id = mapped_column(db.Integer, primary_key=True)
    label = mapped_column(db.String(120), nullable=False, unique=True)
    description = mapped_column(db.Text, nullable=True)

    configurations = relationship(
        "Configuration", secondary=configuration_objectifs, back_populates="objectifs"
    )


class Cible(db.Model, TimestampMixin):
    __tablename__ = "cibles"

    id = mapped_column(db.Integer, primary_key=True)
    label = mapped_column(db.String(120), nullable=False, unique=True)
    persona = mapped_column(db.Text, nullable=True)
    segment = mapped_column(db.String(120), nullable=True)

    configurations = relationship(
        "Configuration", secondary=configuration_cibles, back_populates="cibles"
    )


class Configuration(db.Model, TimestampMixin):
    __tablename__ = "configurations"

    id = mapped_column(db.Integer, primary_key=True)
    scenario_id = mapped_column(db.Integer, db.ForeignKey("scenarios.id"), nullable=False)
    nom = mapped_column(db.String(150), nullable=False)

    scenario = relationship("Scenario", back_populates="configurations")
    objectifs = relationship(
        "Objectif",
        secondary=configuration_objectifs,
        back_populates="configurations",
        lazy="selectin",
    )
    cibles = relationship(
        "Cible",
        secondary=configuration_cibles,
        back_populates="configurations",
        lazy="selectin",
    )
    plans = relationship("Plan", back_populates="configuration", lazy="selectin")
    messages = relationship("Message", back_populates="configuration", lazy="dynamic")


class Plan(db.Model, TimestampMixin):
    __tablename__ = "plans"

    id = mapped_column(db.Integer, primary_key=True)
    configuration_id = mapped_column(db.Integer, db.ForeignKey("configurations.id"), nullable=False)
    resume = mapped_column(db.Text, nullable=True)
    generated_at = mapped_column(
        db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    configuration = relationship("Configuration", back_populates="plans")
    items = relationship("PlanItem", back_populates="plan", cascade="all, delete-orphan")
    articles = relationship("Article", back_populates="plan", cascade="all, delete-orphan")


class PlanItem(db.Model, TimestampMixin):
    __tablename__ = "plan_items"

    id = mapped_column(db.Integer, primary_key=True)
    plan_id = mapped_column(db.Integer, db.ForeignKey("plans.id"), nullable=False)
    format = mapped_column(db.String(60), nullable=False)
    message = mapped_column(db.Text, nullable=False)
    canal = mapped_column(db.String(60), nullable=False)
    frequence = mapped_column(db.String(60), nullable=True)
    kpi = mapped_column(db.String(80), nullable=True)

    plan = relationship("Plan", back_populates="items")


class AuteurType(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class Article(db.Model, TimestampMixin):
    __tablename__ = "articles"

    id = mapped_column(db.Integer, primary_key=True)
    plan_id = mapped_column(db.Integer, db.ForeignKey("plans.id"), nullable=False)
    nom = mapped_column(db.String(150), nullable=False)
    resume = mapped_column(db.String(255), nullable=True)

    plan = relationship("Plan", back_populates="articles")


class Message(db.Model, TimestampMixin):
    __tablename__ = "messages"

    id = mapped_column(db.Integer, primary_key=True)
    scenario_id = mapped_column(db.Integer, db.ForeignKey("scenarios.id"), nullable=True)
    configuration_id = mapped_column(db.Integer, db.ForeignKey("configurations.id"), nullable=True)
    auteur = mapped_column(db.String(20), nullable=False)
    contenu = mapped_column(db.Text, nullable=False)
    role_action = mapped_column(db.String(60), nullable=True)
    ttl = mapped_column(db.DateTime(timezone=True), nullable=True)

    scenario = relationship("Scenario", back_populates="messages")
    configuration = relationship("Configuration", back_populates="messages")


class Recherche(db.Model, TimestampMixin):
    __tablename__ = "recherches"

    id = mapped_column(db.Integer, primary_key=True)
    scenario_id = mapped_column(db.Integer, db.ForeignKey("scenarios.id"), nullable=False)
    requete = mapped_column(db.String(180), nullable=False)
    resultat = mapped_column(db.Text, nullable=False)

    scenario = relationship("Scenario", back_populates="recherches")
