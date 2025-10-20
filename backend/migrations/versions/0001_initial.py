"""Initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2024-03-26 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    maturite_enum = sa.Enum("awareness", "consideration", "decision", name="maturite_enum")
    maturite_enum.create(op.get_bind(), checkfirst=True)

    scenario_status_enum = sa.Enum("draft", "ready", name="scenario_status_enum")
    scenario_status_enum.create(op.get_bind(), checkfirst=True)

    ressource_type_enum = sa.Enum(
        "article", "video", "webinar", "cas_client", "autre", name="ressource_type_enum"
    )
    ressource_type_enum.create(op.get_bind(), checkfirst=True)

    auteur_type_enum = sa.Enum("user", "assistant", "system", name="auteur_type_enum")
    auteur_type_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "objectifs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("label", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("label"),
    )

    op.create_table(
        "cibles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("label", sa.String(length=120), nullable=False),
        sa.Column("persona", sa.Text(), nullable=True),
        sa.Column("segment", sa.String(length=120), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("label"),
    )

    op.create_table(
        "ressources",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("type", ressource_type_enum, nullable=False),
        sa.Column("titre", sa.String(length=150), nullable=False),
        sa.Column("url", sa.String(length=255), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "scenarios",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nom", sa.String(length=150), nullable=False),
        sa.Column("thematique", sa.String(length=150), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("statut", scenario_status_enum, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "plans",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("scenario_id", sa.Integer(), nullable=False),
        sa.Column("resume", sa.Text(), nullable=True),
        sa.Column("generated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.ForeignKeyConstraint(["scenario_id"], ["scenarios.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("scenario_id", sa.Integer(), nullable=True),
        sa.Column("auteur", auteur_type_enum, nullable=False),
        sa.Column("contenu", sa.Text(), nullable=False),
        sa.Column("role_action", sa.String(length=60), nullable=True),
        sa.Column("ttl", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.ForeignKeyConstraint(["scenario_id"], ["scenarios.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "plan_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("plan_id", sa.Integer(), nullable=False),
        sa.Column("format", sa.String(length=60), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("canal", sa.String(length=60), nullable=False),
        sa.Column("frequence", sa.String(length=60), nullable=True),
        sa.Column("kpi", sa.String(length=80), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.ForeignKeyConstraint(["plan_id"], ["plans.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "recherches",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("scenario_id", sa.Integer(), nullable=False),
        sa.Column("requete", sa.String(length=180), nullable=False),
        sa.Column("resultat", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.ForeignKeyConstraint(["scenario_id"], ["scenarios.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "scenario_cibles",
        sa.Column("scenario_id", sa.Integer(), nullable=False),
        sa.Column("cible_id", sa.Integer(), nullable=False),
        sa.Column("maturite", maturite_enum, nullable=True),
        sa.ForeignKeyConstraint(["cible_id"], ["cibles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["scenario_id"], ["scenarios.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("scenario_id", "cible_id", name="uq_scenario_cible"),
    )

    op.create_table(
        "scenario_objectifs",
        sa.Column("scenario_id", sa.Integer(), nullable=False),
        sa.Column("objectif_id", sa.Integer(), nullable=False),
        sa.Column("priorite", sa.SmallInteger(), nullable=True),
        sa.ForeignKeyConstraint(["objectif_id"], ["objectifs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["scenario_id"], ["scenarios.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("scenario_id", "objectif_id", name="uq_scenario_objectif"),
    )

    op.create_table(
        "scenario_ressources",
        sa.Column("scenario_id", sa.Integer(), nullable=False),
        sa.Column("ressource_id", sa.Integer(), nullable=False),
        sa.Column("usage", sa.String(length=120), nullable=True),
        sa.ForeignKeyConstraint(["ressource_id"], ["ressources.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["scenario_id"], ["scenarios.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("scenario_id", "ressource_id", name="uq_scenario_ressource"),
    )

    op.create_index(
        "ix_messages_scenario_created", "messages", ["scenario_id", "created_at"]
    )
    op.create_index("ix_plans_scenario", "plans", ["scenario_id"])
    op.create_index("ix_plan_items_plan", "plan_items", ["plan_id"])


def downgrade() -> None:
    op.drop_index("ix_plan_items_plan", table_name="plan_items")
    op.drop_index("ix_plans_scenario", table_name="plans")
    op.drop_index("ix_messages_scenario_created", table_name="messages")
    op.drop_table("scenario_ressources")
    op.drop_table("scenario_objectifs")
    op.drop_table("scenario_cibles")
    op.drop_table("recherches")
    op.drop_table("plan_items")
    op.drop_table("messages")
    op.drop_table("plans")
    op.drop_table("scenarios")
    op.drop_table("ressources")
    op.drop_table("cibles")
    op.drop_table("objectifs")

    author_enum = sa.Enum("user", "assistant", "system", name="auteur_type_enum")
    author_enum.drop(op.get_bind(), checkfirst=True)

    ressource_enum = sa.Enum(
        "article", "video", "webinar", "cas_client", "autre", name="ressource_type_enum"
    )
    ressource_enum.drop(op.get_bind(), checkfirst=True)

    scenario_status = sa.Enum("draft", "ready", name="scenario_status_enum")
    scenario_status.drop(op.get_bind(), checkfirst=True)

    maturite_enum = sa.Enum("awareness", "consideration", "decision", name="maturite_enum")
    maturite_enum.drop(op.get_bind(), checkfirst=True)
