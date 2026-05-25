import pytest
from app.models import User
from app import db

@pytest.mark.auth
class TestRegister:
    
    def test_register_success(self, client):
        response = client.post("/api/auth/register", json={
            "email": "unique_register_success@example.com",
            "password": "Password123",
            "firstname": "User01",
            "lastname": "Test01",
            "phone": "0612345678"
        })
        assert response.status_code == 201
        assert "access_token" in response.get_json()
    
    def test_register_missing_required_fields(self, client):
        response = client.post("/api/auth/register", json={
            "email": "test@example.com",
            "firstname": "User01",
            "lastname": "Test01"
        })
        assert response.status_code == 400
    
    def test_register_invalid_email(self, client):
        response = client.post("/api/auth/register", json={
            "email": "invalid-email",
            "password": "Password123",
            "firstname": "User01",
            "lastname": "Test01"
        })
        assert response.status_code == 400

    def test_register_duplicate_email(self, client, test_user):
        db.session.add(test_user)
        test_user.email = "test@example.com"
        db.session.commit()
        
        response = client.post("/api/auth/register", json={
            "email": "test@example.com", 
            "password": "Password123",
            "firstname": "User01",
            "lastname": "Test01"
        })
        assert response.status_code in [400, 409]


@pytest.mark.auth
class TestLogin:
    
    def test_login_success(self, client, test_user):
        db.session.add(test_user)
        test_user.email = "test@example.com"
        test_user.set_password("LoginSuccessPassword123")
        db.session.commit()
        
        response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "LoginSuccessPassword123"
        })
        assert response.status_code == 200
        assert "access_token" in response.get_json()
    
    def test_login_wrong_password(self, client, test_user):
        db.session.add(test_user)
        test_user.email = "test@example.com"
        db.session.commit()
        
        response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "ThisIsDefinitelyTheWrongPassword"
        })
        assert response.status_code == 401
    
    def test_login_nonexistent_user(self, client):
        response = client.post("/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "Password123"
        })
        assert response.status_code == 401
    
    def test_login_missing_fields(self, client):
        response = client.post("/api/auth/login", json={
            "email": "test@example.com"
        })
        assert response.status_code == 400


@pytest.mark.auth
class TestProfile:
    
    def test_get_profile(self, client, auth_headers, test_user):
        response = client.get("/api/auth/profile", headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        profile_data = data.get("user", data)
        assert profile_data["email"] in ["test@example.com", "user@example.com"]
    
    def test_update_profile(self, client, auth_headers):
        response = client.put("/api/auth/profile", 
            headers=auth_headers,
            json={
                "firstname": "User01",
                "lastname": "Test01",
                "phone": "0798765432"
            }
        )
        assert response.status_code == 200
    
    def test_profile_no_auth(self, client):
        response = client.get("/api/auth/profile")
        assert response.status_code == 401
    
    def test_update_profile_no_auth(self, client):
        response = client.put("/api/auth/profile", json={
            "firstname": "User01",
            "lastname": "Test01"
        })
        assert response.status_code == 401


@pytest.mark.auth
class TestChangePassword:
    
    def test_change_password_success(self, client, test_user):
        db.session.add(test_user)
        test_user.email = "test@example.com"
        test_user.set_password("CurrentPassword123")
        db.session.commit()
        
        login_response = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "CurrentPassword123"
        })
        
        token = login_response.get_json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        
        response = client.post("/api/auth/change-password",
            headers=headers,
            json={
                "current_password": "CurrentPassword123",
                "new_password": "NewPassword123"
            }
        )
        assert response.status_code == 200
    
    def test_change_password_wrong_current(self, client, auth_headers):
        response = client.post("/api/auth/change-password",
            headers=auth_headers,
            json={
                "current_password": "WrongPassword",
                "new_password": "NewPassword123"
            }
        )
        assert response.status_code in [400, 401]
    
    def test_change_password_missing_fields(self, client, auth_headers):
        response = client.post("/api/auth/change-password",
            headers=auth_headers,
            json={
                "current_password": "Test123456"
            }
        )
        assert response.status_code == 400
    
    def test_change_password_no_auth(self, client):
        response = client.post("/api/auth/change-password", json={
            "current_password": "Test123456",
            "new_password": "NewPassword123"
        })
        assert response.status_code == 401