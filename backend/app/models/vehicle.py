from app import db
from enum import Enum
from datetime import datetime

class VehicleStatus(str, Enum):
    """Statut de disponibilité du véhicule"""
    DISPONIBLE = "disponible"
    LOUE = "loue"
    VENDU = "vendu"
    MAINTENANCE = "maintenance"

class ServiceType(str, Enum):
    """Type de service proposé"""
    ACHAT = "achat"
    LOCATION_COURT = "location_court_terme"
    LOCATION_LONG = "location_longue_duree"

class Vehicle(db.Model):
    """Modèle Vehicle - Gestion des véhicules"""
    __tablename__ = "vehicles"
    
    id = db.Column(db.Integer, primary_key=True)
    brand = db.Column(db.String(50), nullable=False, index=True)
    model = db.Column(db.String(100), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    fuel_type = db.Column(db.String(20), nullable=False)
    transmission = db.Column(db.String(20), nullable=False)
    mileage = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    rental_price_daily = db.Column(db.Float)
    rental_price_monthly = db.Column(db.Float)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    status = db.Column(db.Enum(VehicleStatus), default=VehicleStatus.DISPONIBLE)
    service_type = db.Column(db.Enum(ServiceType), nullable=False)
    location = db.Column(db.String(100), nullable=False, index=True)
    color = db.Column(db.String(30))
    features = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    applications = db.relationship("Application", back_populates="vehicle")
    
    def mark_as_sold(self):
        """Marquer le véhicule comme vendu"""
        self.status = VehicleStatus.VENDU
        db.session.commit()
    
    def mark_as_rented(self):
        """Marquer le véhicule comme loué"""
        self.status = VehicleStatus.LOUE
        db.session.commit()
    
    def mark_as_available(self):
        """Marquer le véhicule comme disponible"""
        self.status = VehicleStatus.DISPONIBLE
        db.session.commit()
    
    def is_available_for_search(self) -> bool:
        """Vérifier si le véhicule doit apparaître dans les recherches"""
        return self.status == VehicleStatus.DISPONIBLE
    
    def to_dict(self):
        """Convertir en dictionnaire"""
        return {
            "id": self.id,
            "brand": self.brand,
            "model": self.model,
            "year": self.year,
            "fuel_type": self.fuel_type,
            "transmission": self.transmission,
            "mileage": self.mileage,
            "price": self.price,
            "rental_price_daily": self.rental_price_daily,
            "rental_price_monthly": self.rental_price_monthly,
            "description": self.description,
            "image_url": self.image_url,
            "status": self.status.value,
            "service_type": self.service_type.value,
            "location": self.location,
            "color": self.color,
            "features": self.features,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
