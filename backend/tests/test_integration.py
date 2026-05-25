import pytest

@pytest.mark.integration
class TestCompleteApplicationFlow:
    
    def test_full_achat_workflow(self, client, auth_headers):
        admin_headers = self._create_admin(client)
        v_res = client.post("/api/vehicles", headers=admin_headers, json={
            "brand": "Mercedes", "model": "C-Class", "year": 2024, "fuel_type": "Essence",
            "transmission": "Automatique", "mileage": 500, "price": 45000, 
            "service_type": "achat", "location": "Paris", "color": "Noir"
        })
        v_data = v_res.get_json()
        vehicle_id = v_data.get("id") or v_data.get("vehicle", {}).get("id")
        
        a_res = client.post("/api/applications", headers=auth_headers, json={
            "vehicle_id": vehicle_id, "service_type": "achat",
            "driving_license_number": "12AB123456", "driving_license_expiry": "2026-12-31",
            "deposit_amount": 500, "total_amount": 45000, "payment_method": "credit"
        })
        app_id = a_res.get_json().get("id") or a_res.get_json().get("application", {}).get("id")
        
        client.post(f"/api/applications/{app_id}/approve", headers=admin_headers, json={"admin_notes": "Ok"})
        res = client.post(f"/api/applications/{app_id}/confirm-payment", headers=admin_headers, json={})
        assert res.status_code == 200

    def test_full_lld_with_loa_workflow(self, client, auth_headers):
        admin_headers = self._create_admin(client)
        v_res = client.post("/api/vehicles", headers=admin_headers, json={
            "brand": "Audi", "model": "Q5", "year": 2023, "fuel_type": "Diesel",
            "transmission": "Automatique", "mileage": 8000, "price": 50000, 
            "rental_price_monthly": 2000, "service_type": "location_longue_duree", "location": "Paris"
        })
        v_data = v_res.get_json()
        vehicle_id = v_data.get("id") or v_data.get("vehicle", {}).get("id")
        
        a_res = client.post("/api/applications", headers=auth_headers, json={
            "vehicle_id": vehicle_id, "service_type": "location_longue_duree",
            "driving_license_number": "12AB123456", "driving_license_expiry": "2026-12-31",
            "option_achat_active": True, "valeur_residuelle": 20000
        })
        app_id = a_res.get_json().get("id") or a_res.get_json().get("application", {}).get("id")
        
        client.post(f"/api/applications/{app_id}/approve", headers=admin_headers, json={})
        client.post(f"/api/applications/{app_id}/confirm-payment", headers=admin_headers, json={})
        res = client.post(f"/api/applications/{app_id}/lever-option-achat", headers=auth_headers, json={})
        assert res.status_code == 200

    def test_rejection_workflow(self, client, auth_headers):
        admin_headers = self._create_admin(client)
        pass

    @staticmethod
    def _create_admin(client):
        from app import db
        from app.models.user import User
        email = f"admin_{id(client)}@example.com"
        client.post("/api/auth/register", json={"email": email, "password": "AdminPassword123", "firstname": "A", "lastname": "T"})
        user = User.query.filter_by(email=email).first()
        user.is_admin = True
        db.session.commit()
        token = client.post("/api/auth/login", json={"email": email, "password": "AdminPassword123"}).get_json()["access_token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

@pytest.mark.integration
class TestAuthenticationFlow:
    def test_signup_and_login_flow(self, client):
        res = client.post("/api/auth/register", json={"email": "new@example.com", "password": "Password123", "firstname": "N", "lastname": "U"})
        assert res.status_code == 201
        assert "access_token" in client.post("/api/auth/login", json={"email": "new@example.com", "password": "Password123"}).get_json()

    def test_profile_update_flow(self, client, auth_headers):
        assert client.put("/api/auth/profile", headers=auth_headers, json={"firstname": "Updated"}).status_code == 200

    def test_change_password_flow(self, client, auth_headers):
        client.post("/api/auth/change-password", headers=auth_headers, json={"current_password": "Test123456", "new_password": "NewPassword123"})
        assert client.post("/api/auth/login", json={"email": "user@example.com", "password": "Test123456"}).status_code == 401

@pytest.mark.integration
class TestErrorHandling:
    def test_database_constraints(self, client):
        client.post("/api/auth/register", json={"email": "u@e.com", "password": "P", "firstname": "A", "lastname": "B"})
        assert client.post("/api/auth/register", json={"email": "u@e.com", "password": "P", "firstname": "A", "lastname": "B"}).status_code == 409

    def test_invalid_json(self, client):
        assert client.post("/api/auth/login", data="bad", content_type="application/json").status_code in [400, 500]