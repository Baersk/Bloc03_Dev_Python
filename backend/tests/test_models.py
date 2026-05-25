import pytest
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.application import Application
from app import db

@pytest.mark.models
class TestUserModel:
    def test_create_user(self, app):
        with app.app_context():
            user = User(email="test@example.com", firstname="User01", lastname="Test01", phone="0798765432")
            user.set_password("SecurePassword123")
            db.session.add(user)
            db.session.commit()
            assert user.id is not None

    def test_user_to_dict(self, app, test_user):
        with app.app_context():
            user = db.session.merge(test_user)
            assert user.to_dict()["email"] == user.email

@pytest.mark.models
class TestVehicleModel:
    def test_create_vehicle(self, app):
        with app.app_context():
            vehicle = Vehicle(
                brand="Mercedes", model="C-Class", year=2024, 
                fuel_type="Essence", transmission="Automatique", 
                mileage=0, price=45000, service_type="ACHAT",
                location="PARIS"
            )
            db.session.add(vehicle)
            db.session.commit()
            assert vehicle.id is not None

    def test_vehicle_to_dict(self, app, test_vehicle):
        with app.app_context():
            vehicle = db.session.merge(test_vehicle)
            assert vehicle.to_dict()["brand"] == vehicle.brand

@pytest.mark.models
class TestApplicationModel:
    def test_application_with_loa(self, app, test_user, test_vehicle):
        with app.app_context():
            u = db.session.merge(test_user)
            v = db.session.merge(test_vehicle)
            
            app_record = Application(
                user_id=u.id, 
                vehicle_id=v.id, 
                service_type="location_longue_duree",
                option_achat_active=True
            )
            db.session.add(app_record)
            db.session.commit()
            assert app_record.id is not None