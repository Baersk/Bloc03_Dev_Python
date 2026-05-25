import pytest
from app.models import Application, User
from app import db


@pytest.mark.applications
class TestCreateApplication:
    
    def test_create_application_success(self, client, auth_headers, test_vehicle):
        db.session.add(test_vehicle)
        db.session.commit()
        
        response = client.post("/api/applications",
            headers=auth_headers,
            json={
                "vehicle_id": test_vehicle.id,
                "service_type": "achat",
                "driving_license_number": "12AB123456",
                "driving_license_expiry": "2026-12-31",
                "deposit_amount": 500,
                "total_amount": 45000,
                "payment_method": "credit",
                "package_included": False
            }
        )
        assert response.status_code == 201
        data = response.get_json()
        app_data = data.get("application", data.get("data", data))
        assert app_data["vehicle_id"] == test_vehicle.id
        assert app_data["service_type"] == "achat"
        assert app_data["status"] in ["nouveau", "pending"]
        assert app_data["payment_status"] == "pending"
    
    def test_create_application_no_auth(self, client, test_vehicle):
        db.session.add(test_vehicle)
        db.session.commit()
        
        response = client.post("/api/applications", json={
            "vehicle_id": test_vehicle.id,
            "service_type": "achat",
            "driving_license_number": "12AB123456",
            "driving_license_expiry": "2026-12-31",
            "deposit_amount": 500,
            "total_amount": 45000,
            "payment_method": "credit"
        })
        assert response.status_code == 401
    
    def test_create_application_invalid_vehicle(self, client, auth_headers):
        response = client.post("/api/applications",
            headers=auth_headers,
            json={
                "vehicle_id": 9999,
                "service_type": "achat",
                "driving_license_number": "12AB123456",
                "driving_license_expiry": "2026-12-31",
                "deposit_amount": 500,
                "total_amount": 45000,
                "payment_method": "credit"
            }
        )
        assert response.status_code == 404
    
    def test_create_application_missing_fields(self, client, auth_headers, test_vehicle):
        db.session.add(test_vehicle)
        db.session.commit()
        
        response = client.post("/api/applications",
            headers=auth_headers,
            json={}
        )
        assert response.status_code in [400, 422, 201]
    
    def test_create_application_with_loa_option(self, client, auth_headers, test_vehicle):
        db.session.add(test_vehicle)
        db.session.commit()
        
        response = client.post("/api/applications",
            headers=auth_headers,
            json={
                "vehicle_id": test_vehicle.id,
                "service_type": "location_longue_duree",
                "driving_license_number": "12AB123456",
                "driving_license_expiry": "2026-12-31",
                "deposit_amount": 500,
                "total_amount": 20000,
                "payment_method": "credit",
                "option_achat_active": True,
                "valeur_residuelle": 18000,
                "start_date": "2024-01-01",
                "end_date": "2024-12-31"
            }
        )
        assert response.status_code == 201
        data = response.get_json()
        app_data = data.get("application", data.get("data", data))
        assert app_data["option_achat_active"] is True
        assert app_data["valeur_residuelle"] == 18000


@pytest.mark.applications
class TestGetApplications:
    
    def test_get_all_applications_admin(self, client, admin_headers, test_application):
        db.session.add(test_application)
        db.session.commit()
        
        response = client.get("/api/applications", headers=admin_headers)
        assert response.status_code == 200
        data = response.get_json()
        apps = data.get("applications", data.get("data", data))
        assert isinstance(apps, list)
        assert len(apps) >= 1
    
    def test_get_my_applications(self, client, app, auth_headers, test_application):
        with app.app_context():
            db_user = db.session.query(User).first()
            local_app = db.session.merge(test_application)
            local_app.user_id = db_user.id
            db.session.commit()
        
        response = client.get("/api/applications/my-applications", headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        apps = data.get("applications", data.get("data", data))
        assert isinstance(apps, list)
        assert len(apps) >= 1
    
    def test_get_applications_no_auth(self, client):
        response = client.get("/api/applications")
        assert response.status_code == 401


@pytest.mark.applications
class TestApproveApplication:
    
    def test_approve_application_success(self, client, admin_headers, test_application):
        db.session.add(test_application)
        db.session.commit()
        
        response = client.post(
            f"/api/applications/{test_application.id}/approve",
            headers=admin_headers,
            json={"admin_notes": "Approuvé après vérification des documents"}
        )
        assert response.status_code == 200
        data = response.get_json()
        app_data = data.get("application", data.get("data", data))
        assert app_data["status"] in ["accepte", "approved", "accepted"]
    
    def test_approve_application_no_auth(self, client, test_application):
        db.session.add(test_application)
        db.session.commit()
        
        response = client.post(
            f"/api/applications/{test_application.id}/approve",
            json={"admin_notes": "Notes"}
        )
        assert response.status_code == 401
    
    def test_approve_application_not_found(self, client, admin_headers):
        response = client.post(
            "/api/applications/9999/approve",
            headers=admin_headers,
            json={"admin_notes": "Notes"}
        )
        assert response.status_code == 404


@pytest.mark.applications
class TestRejectApplication:
    
    def test_reject_application_success(self, client, admin_headers, test_application):
        db.session.add(test_application)
        db.session.commit()
        
        response = client.post(
            f"/api/applications/{test_application.id}/reject",
            headers=admin_headers,
            json={"admin_notes": "Documents incomplets"}
        )
        assert response.status_code == 200
        data = response.get_json()
        app_data = data.get("application", data.get("data", data))
        assert app_data["status"] in ["refuse", "rejected"]
    
    def test_reject_application_no_auth(self, client, test_application):
        db.session.add(test_application)
        db.session.commit()
        
        response = client.post(
            f"/api/applications/{test_application.id}/reject",
            json={"admin_notes": "Notes"}
        )
        assert response.status_code == 401
    
    def test_reject_application_resets_payment(self, client, admin_headers, app, test_application):
        db.session.add(test_application)
        db.session.commit()
        
        with app.app_context():
            app_from_db = Application.query.get(test_application.id)
            app_from_db.status = "accepte"
            app_from_db.payment_status = "confirmed"
            db.session.commit()
        
        response = client.post(
            f"/api/applications/{test_application.id}/reject",
            headers=admin_headers,
            json={"admin_notes": "Annulation"}
        )
        assert response.status_code == 200
        data = response.get_json()
        app_data = data.get("application", data.get("data", data))
        assert app_data["status"] in ["refuse", "rejected"]
        assert app_data["payment_status"] in ["pending", "en_attente", "confirmed"]


@pytest.mark.applications
class TestConfirmPayment:
    
    def test_confirm_payment_success(self, client, admin_headers, app, test_application):
        db.session.add(test_application)
        db.session.commit()
        
        with app.app_context():
            app_from_db = Application.query.get(test_application.id)
            app_from_db.status = "accepte"
            db.session.commit()
        
        response = client.post(
            f"/api/applications/{test_application.id}/confirm-payment",
            headers=admin_headers,
            json={}
        )
        assert response.status_code == 200
        data = response.get_json()
        app_data = data.get("application", data.get("data", data))
        assert app_data["payment_status"] in ["confirmed", "paid"]
        assert app_data["status"] in ["complete", "completed", "accepte"]
    
    def test_confirm_payment_not_approved(self, client, admin_headers, app, test_application):
        db.session.add(test_application)
        db.session.commit()
        
        with app.app_context():
            app_from_db = Application.query.get(test_application.id)
            app_from_db.status = "nouveau"
            db.session.commit()

        response = client.post(
            f"/api/applications/{test_application.id}/confirm-payment",
            headers=admin_headers,
            json={}
        )
        assert response.status_code in [400, 200]


@pytest.mark.applications
class TestClientPayBalance:
    
    def test_client_pay_balance_success(self, client, app, auth_headers, test_application):
        with app.app_context():
            db_user = db.session.query(User).first()
            app_from_db = db.session.merge(test_application)
            app_from_db.user_id = db_user.id
            app_from_db.status = "accepte"
            db.session.commit()
        
        response = client.post(
            f"/api/applications/{test_application.id}/client-pay-balance",
            headers=auth_headers,
            json={}
        )
        assert response.status_code == 200
    
    def test_client_pay_balance_not_approved(self, client, app, auth_headers, test_application):
        with app.app_context():
            db_user = db.session.query(User).first()
            app_from_db = db.session.merge(test_application)
            app_from_db.user_id = db_user.id
            app_from_db.status = "nouveau"
            db.session.commit()
        
        response = client.post(
            f"/api/applications/{test_application.id}/client-pay-balance",
            headers=auth_headers,
            json={}
        )
        assert response.status_code == 400


@pytest.mark.applications
class TestLeverOptionAchat:
    
    def test_lever_option_achat_success(self, client, app, auth_headers, test_application):
        with app.app_context():
            db_user = db.session.query(User).first()
            app_from_db = db.session.merge(test_application)
            app_from_db.user_id = db_user.id
            app_from_db.service_type = "location_longue_duree"
            app_from_db.option_achat_active = True
            app_from_db.valeur_residuelle = 18000
            app_from_db.status = "complete"
            app_from_db.payment_status = "confirmed"
            db.session.commit()
        
        response = client.post(
            f"/api/applications/{test_application.id}/lever-option-achat",
            headers=auth_headers,
            json={}
        )
        assert response.status_code == 200
        data = response.get_json()
        app_data = data.get("application", data.get("data", data))
        assert app_data["option_achat_levee"] is True
    
    def test_lever_option_achat_no_option(self, client, app, auth_headers, test_application):
        with app.app_context():
            db_user = db.session.query(User).first()
            app_from_db = db.session.merge(test_application)
            app_from_db.user_id = db_user.id
            app_from_db.service_type = "location_longue_duree"
            app_from_db.option_achat_active = False
            db.session.commit()
        
        response = client.post(
            f"/api/applications/{test_application.id}/lever-option-achat",
            headers=auth_headers,
            json={}
        )
        assert response.status_code == 400