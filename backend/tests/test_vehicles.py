import pytest
from app.models import Vehicle
from app import db


@pytest.mark.vehicles
class TestGetVehicles:
    
    def test_get_vehicles_empty(self, client):
        response = client.get("/api/vehicles")
        assert response.status_code == 200
        data = response.get_json()
        vehicles = data.get("vehicles", data)
        assert isinstance(vehicles, list)
        assert len(vehicles) == 0
    
    def test_get_vehicles_with_data(self, client, test_vehicle):
        db.session.add(test_vehicle)
        db.session.commit()
        
        response = client.get("/api/vehicles")
        assert response.status_code == 200
        data = response.get_json()
        vehicles = data.get("vehicles", data)
        assert len(vehicles) == 1
        assert vehicles[0]["brand"] == "Mercedes"
        assert vehicles[0]["model"] == "C-Class"
    
    def test_get_vehicles_filter_by_service_type(self, client, app):
        with app.app_context():
            v1 = Vehicle(brand="Mercedes", model="C-Class", year=2024, 
                         fuel_type="Essence", transmission="Automatique",
                         mileage=500, price=45000, service_type="achat",
                         location="Paris", color="Noir")
            v2 = Vehicle(brand="Audi", model="Q5", year=2023,
                         fuel_type="Diesel", transmission="Automatique",
                         mileage=8000, price=50000, service_type="location_longue_duree",
                         location="Paris", color="Blanc")
            db.session.add_all([v1, v2])
            db.session.commit()
        
        response = client.get("/api/vehicles?service_type=achat")
        assert response.status_code == 200
        data = response.get_json()
        vehicles = data.get("vehicles", data)
        assert len(vehicles) == 1
        assert vehicles[0]["service_type"] == "achat"
    
    def test_get_vehicles_filter_by_brand(self, client, test_vehicle):
        db.session.add(test_vehicle)
        db.session.commit()
        
        response = client.get("/api/vehicles?brand=Mercedes")
        assert response.status_code == 200
        data = response.get_json()
        vehicles = data.get("vehicles", data)
        assert len(vehicles) == 1
        assert vehicles[0]["brand"] == "Mercedes"
    
    def test_get_vehicles_filter_by_location(self, client, test_vehicle):
        db.session.add(test_vehicle)
        db.session.commit()
        
        response = client.get("/api/vehicles?location=Paris")
        assert response.status_code == 200
        data = response.get_json()
        vehicles = data.get("vehicles", data)
        assert len(vehicles) == 1
        assert vehicles[0]["location"] == "Paris"
    
    def test_get_vehicles_filter_by_price_range(self, client, app):
        with app.app_context():
            v1 = Vehicle(brand="Mercedes", model="C-Class", year=2024,
                         fuel_type="Essence", transmission="Automatique",
                         mileage=500, price=45000, service_type="achat",
                         location="Paris", color="Noir")
            v2 = Vehicle(brand="Audi", model="Q5", year=2023,
                         fuel_type="Diesel", transmission="Automatique",
                         mileage=8000, price=60000, service_type="achat",
                         location="Paris", color="Blanc")
            db.session.add_all([v1, v2])
            db.session.commit()
        
        response = client.get("/api/vehicles?min_price=50000&max_price=70000")
        assert response.status_code == 200
        data = response.get_json()
        vehicles = data.get("vehicles", data)
        assert len(vehicles) == 1
        assert vehicles[0]["price"] == 60000


@pytest.mark.vehicles
class TestGetVehicleById:
    
    def test_get_vehicle_by_id(self, client, test_vehicle):
        db.session.add(test_vehicle)
        db.session.commit()
        
        response = client.get(f"/api/vehicles/{test_vehicle.id}")
        assert response.status_code == 200
        data = response.get_json()
        vehicle_data = data.get("vehicle", data.get("data", data))
        assert vehicle_data["id"] == test_vehicle.id
        assert vehicle_data["brand"] == "Mercedes"
    
    def test_get_vehicle_not_found(self, client):
        response = client.get("/api/vehicles/9999")
        assert response.status_code == 404


@pytest.mark.vehicles
class TestCreateVehicle:
    
    def test_create_vehicle_success(self, client, admin_headers):
        response = client.post("/api/vehicles",
            headers=admin_headers,
            json={
                "brand": "BMW",
                "model": "X5",
                "year": 2024,
                "fuel_type": "Essence",
                "transmission": "Automatique",
                "mileage": 100,
                "price": 70000,
                "rental_price_daily": 120,
                "rental_price_monthly": 2400,
                "service_type": "achat",
                "location": "Paris",
                "color": "Bleu"
            }
        )
        assert response.status_code == 201
        data = response.get_json()
        vehicle_data = data.get("vehicle", data.get("data", data))
        assert vehicle_data["brand"] == "BMW"
        assert vehicle_data["model"] == "X5"
    
    def test_create_vehicle_no_auth(self, client):
        response = client.post("/api/vehicles", json={
            "brand": "BMW",
            "model": "X5",
            "year": 2024,
            "fuel_type": "Essence",
            "transmission": "Automatique",
            "mileage": 100,
            "price": 70000,
            "service_type": "achat",
            "location": "Paris",
            "color": "Bleu"
        })
        assert response.status_code == 401
    
    def test_create_vehicle_missing_fields(self, client, admin_headers):
        response = client.post("/api/vehicles",
            headers=admin_headers,
            json={
                "brand": "BMW"
            }
        )
        assert response.status_code == 400


@pytest.mark.vehicles
class TestUpdateVehicle:
    
    def test_update_vehicle_success(self, client, admin_headers, test_vehicle):
        db.session.add(test_vehicle)
        db.session.commit()
        
        response = client.put(f"/api/vehicles/{test_vehicle.id}",
            headers=admin_headers,
            json={
                "brand": "Mercedes",
                "model": "E-Class",
                "year": 2025,
                "price": 50000
            }
        )
        assert response.status_code == 200
        data = response.get_json()
        vehicle_data = data.get("vehicle", data.get("data", data))
        assert vehicle_data["model"] == "E-Class"
        assert vehicle_data["year"] == 2025
    
    def test_update_vehicle_no_auth(self, client, test_vehicle):
        db.session.add(test_vehicle)
        db.session.commit()
        
        response = client.put(f"/api/vehicles/{test_vehicle.id}",
            json={"brand": "BMW"}
        )
        assert response.status_code == 401
    
    def test_update_vehicle_not_found(self, client, admin_headers):
        response = client.put("/api/vehicles/9999",
            headers=admin_headers,
            json={"brand": "BMW"}
        )
        assert response.status_code == 404


@pytest.mark.vehicles
class TestDeleteVehicle:
    
    def test_delete_vehicle_success(self, client, admin_headers, test_vehicle):
        db.session.add(test_vehicle)
        db.session.commit()
        vehicle_id = test_vehicle.id
        
        response = client.delete(f"/api/vehicles/{vehicle_id}",
            headers=admin_headers
        )
        assert response.status_code == 200
        
        get_response = client.get(f"/api/vehicles/{vehicle_id}")
        assert get_response.status_code == 404
    
    def test_delete_vehicle_no_auth(self, client, test_vehicle):
        db.session.add(test_vehicle)
        db.session.commit()
        
        response = client.delete(f"/api/vehicles/{test_vehicle.id}")
        assert response.status_code == 401
    
    def test_delete_vehicle_not_found(self, client, admin_headers):
        response = client.delete("/api/vehicles/9999",
            headers=admin_headers
        )
        assert response.status_code == 404