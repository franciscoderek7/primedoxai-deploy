from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_health_returns_status():
    res = client.get("/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert "uptime" in body
    assert "version" in body


def test_floor_state_unregistered_floor_404s():
    res = client.get("/api/floors/99/state")
    assert res.status_code == 404


def test_floor_state_default_is_deterministic():
    res = client.get("/api/floors/1/state")
    assert res.status_code == 200
    body = res.json()
    assert body["floor_id"] == 1
    assert body["status"] == "offline"
