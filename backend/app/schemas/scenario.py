from marshmallow import Schema, fields, validate


class ObjectifSchema(Schema):
    id = fields.Int(dump_only=True)
    label = fields.Str(required=True)
    description = fields.Str(allow_none=True)


class CibleSchema(Schema):
    id = fields.Int(dump_only=True)
    label = fields.Str(required=True)
    persona = fields.Str(allow_none=True)
    segment = fields.Str(allow_none=True)


class RessourceSchema(Schema):
    id = fields.Int(dump_only=True)
    type = fields.Str(required=True)
    titre = fields.Str(required=True)
    url = fields.Str(allow_none=True)
    note = fields.Str(allow_none=True)


class PlanItemSchema(Schema):
    id = fields.Int(dump_only=True)
    format = fields.Str(required=True)
    message = fields.Str(required=True)
    canal = fields.Str(required=True)
    frequence = fields.Str(allow_none=True)
    kpi = fields.Str(allow_none=True)


class PlanSchema(Schema):
    id = fields.Int(dump_only=True)
    resume = fields.Str(allow_none=True)
    generated_at = fields.DateTime()
    items = fields.List(fields.Nested(PlanItemSchema))


class ScenarioSchema(Schema):
    id = fields.Int(dump_only=True)
    nom = fields.Str(required=True)
    thematique = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    statut = fields.Str()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()


class ScenarioDetailSchema(ScenarioSchema):
    objectifs = fields.List(fields.Nested(ObjectifSchema))
    cibles = fields.List(fields.Nested(CibleSchema))
    ressources = fields.List(fields.Nested(RessourceSchema))
    plans = fields.List(fields.Nested(PlanSchema))


class ScenarioCreateSchema(Schema):
    nom = fields.Str(required=True, validate=validate.Length(min=1, max=150))
    thematique = fields.Str(required=True, validate=validate.Length(min=1, max=150))
    description = fields.Str(load_default=None, allow_none=True)
