def test_list_scenarios(client, scenario):
    response = client.get("/api/scenarios")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert data[0]["nom"] == "Test"


def test_create_scenario(client):
    payload = {"nom": "Nouveau scénario", "thematique": "Brand awareness"}
    response = client.post("/api/scenarios", json=payload)
    assert response.status_code == 201
    data = response.get_json()
    assert data["nom"] == payload["nom"]
    assert data["thematique"] == payload["thematique"]


def test_get_scenario_detail(client, scenario):
    response = client.get(f"/api/scenarios/{scenario.id}")
    assert response.status_code == 200
    data = response.get_json()
    assert data["id"] == scenario.id
    assert data["nom"] == scenario.nom
