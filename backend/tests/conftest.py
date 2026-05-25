import pytest
import sys
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent.parent))

from app import create_app, db
from app.models import User, Vehicle, Application

@pytest.fixture(scope="session")
def app():
    app = create_app(config_name="testing")
    assert ":memory:" in app.config["SQLALCHEMY_DATABASE_URI"]
    return app

@pytest.fixture(scope="function")
def client(app):
    return app.test_client()

@pytest.fixture(scope="function")
def runner(app):
    return app.test_cli_runner()

@pytest.fixture(autouse=True)
def init_db(app):
    with app.app_context():
        db.create_all()
        yield db
        db.drop_all()

@pytest.fixture
def auth_headers(client):
    user_data = {
        "email": "test@example.com",
        "password": "Test123456",
        "firstname": "Test",
        "lastname": "User",
        "phone": "0612345678"
    }
    
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 201
    
    login_response = client.post("/api/auth/login", json={
        "email": user_data["email"],
        "password": user_data["password"]
    })
    assert login_response.status_code == 200
    
    token = login_response.get_json()["access_token"]
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

@pytest.fixture
def admin_headers(client, app):
    with app.app_context():
        admin = User(
            email="admin@example.com",
            firstname="Admin",
            lastname="User",
            is_admin=True
        )
        admin.set_password("Admin123456")
        db.session.add(admin)
        db.session.commit()
    
    login_response = client.post("/api/auth/login", json={
        "email": "admin@example.com",
        "password": "Admin123456"
    })
    assert login_response.status_code == 200
    
    token = login_response.get_json()["access_token"]
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

@pytest.fixture
def test_vehicle(app):
    with app.app_context():
        vehicle = Vehicle(
            brand="Mercedes",
            model="C-Class",
            year=2024,
            fuel_type="Essence",
            transmission="Automatique",
            mileage=500,
            price=45000,
            rental_price_daily=85,
            rental_price_monthly=1700,
            service_type="achat",
            location="Paris",
            color="Noir",
            description="Berline élégante"
        )
        db.session.add(vehicle)
        db.session.commit()
        return vehicle

@pytest.fixture
def test_user(app):
    with app.app_context():
        user = User(
            email="user@example.com",
            firstname="Test",
            lastname="User",
            phone="0612345678"
        )
        user.set_password("Test123456")
        db.session.add(user)
        db.session.commit()
        return user

@pytest.fixture
def test_application(app, test_user, test_vehicle):
    with app.app_context():
        local_user = db.session.merge(test_user)
        local_vehicle = db.session.merge(test_vehicle)
        
        application = Application(
            user_id=local_user.id,
            vehicle_id=local_vehicle.id,
            service_type="achat",
            driving_license_number="12AB123456",
            driving_license_expiry=datetime.strptime("2028-12-31", "%Y-%m-%d").date(),
            deposit_amount=500,
            total_amount=45000,
            payment_method="credit",
            status="nouveau",
            payment_status="pending"
        )
        
        db.session.add(application)
        db.session.commit()
        db.session.refresh(application)
        
    return application