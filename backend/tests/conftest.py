import pytest

from app import create_app
from app.extensions import db
from app.models import Scenario


@pytest.fixture()
def app():
    app = create_app(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "SCHEDULER_TIMEZONE": "UTC",
        }
    )

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def scenario(app):
    item = Scenario(nom="Test", thematique="Marketing Automation")
    db.session.add(item)
    db.session.commit()
    return item
