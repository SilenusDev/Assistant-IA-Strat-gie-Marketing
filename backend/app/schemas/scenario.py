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


class ArticleSchema(Schema):
    id = fields.Int(dump_only=True)
    nom = fields.Str(required=True)
    resume = fields.Str(allow_none=True, validate=validate.Length(max=255))


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
    articles = fields.List(fields.Nested(ArticleSchema))


class ScenarioSchema(Schema):
    id = fields.Int(dump_only=True)
    nom = fields.Str(required=True)
    thematique = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    statut = fields.Str()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()


class ConfigurationSchema(Schema):
    id = fields.Int(dump_only=True)
    scenario_id = fields.Int(required=True)
    nom = fields.Str(required=True, validate=validate.Length(min=1, max=150))
    created_at = fields.DateTime()
    updated_at = fields.DateTime()


class ConfigurationDetailSchema(ConfigurationSchema):
    objectifs = fields.List(fields.Nested(ObjectifSchema))
    cibles = fields.List(fields.Nested(CibleSchema))
    plans = fields.List(fields.Nested(PlanSchema))


class ScenarioDetailSchema(ScenarioSchema):
    configurations = fields.List(fields.Nested(ConfigurationSchema))


class ScenarioCreateSchema(Schema):
    nom = fields.Str(required=True, validate=validate.Length(min=1, max=150))
    thematique = fields.Str(required=True, validate=validate.Length(min=1, max=150))
    description = fields.Str(load_default=None, allow_none=True)


class ConfigurationCreateSchema(Schema):
    scenario_id = fields.Int(required=True)
    nom = fields.Str(required=True, validate=validate.Length(min=1, max=150))


class ArticleCreateSchema(Schema):
    plan_id = fields.Int(required=True)
    nom = fields.Str(required=True, validate=validate.Length(min=1, max=150))
    resume = fields.Str(allow_none=True, validate=validate.Length(max=255))
