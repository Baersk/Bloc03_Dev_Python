from app import db
from enum import Enum
from datetime import datetime

class ApplicationStatus(str, Enum):
    """Statut de la demande"""
    NOUVEAU = "nouveau"
    EN_ATTENTE = "en_attente"
    ACCEPTE = "accepte"
    REFUSE = "refuse"
    COMPLETE = "complete"

class ServiceType(str, Enum):
    """Type de service"""
    ACHAT = "achat"
    LOCATION_COURT = "location_court_terme"
    LOCATION_LONG = "location_longue_duree"

class PaymentStatus(str, Enum):
    """Statut du paiement"""
    PENDING = "pending"
    PAID = "paid"
    CONFIRMED = "confirmed"

class Application(db.Model):
    """Modèle Application - Dossiers de location/achat"""
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey("vehicles.id"), nullable=False, index=True)
    service_type = db.Column(db.Enum(ServiceType), nullable=False)
    status = db.Column(db.Enum(ApplicationStatus), default=ApplicationStatus.NOUVEAU)

    # Documents
    identity_document = db.Column(db.String(500))
    license_document = db.Column(db.String(500))
    insurance_document = db.Column(db.String(500))
    proof_of_residence = db.Column(db.String(500))

    # Informations conducteur
    driving_license_number = db.Column(db.String(50))
    driving_license_expiry = db.Column(db.Date)

    # Notes
    notes = db.Column(db.Text)
    admin_notes = db.Column(db.Text)

    # Package options pour location
    package_included = db.Column(db.Boolean, default=False)
    package_price_monthly = db.Column(db.Float, default=0)

    # Leasing & Option d'achat (LOA)
    option_achat_active = db.Column(db.Boolean, default=False)
    valeur_residuelle = db.Column(db.Float, default=0)
    option_achat_levee = db.Column(db.Boolean, default=False)
    date_levee_option = db.Column(db.DateTime)

    # Dates
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Paiements
    payment_status = db.Column(db.Enum(PaymentStatus), default=PaymentStatus.PENDING)
    deposit_amount = db.Column(db.Float, default=500)
    total_amount = db.Column(db.Float, default=0)
    payment_method = db.Column(db.String(50))  # 'credit' ou 'transfer'
    invoice_number = db.Column(db.String(100), unique=True)
    paid_at = db.Column(db.DateTime)
    confirmed_at = db.Column(db.DateTime)
    
    # Relations
    user = db.relationship("User", back_populates="applications")
    vehicle = db.relationship("Vehicle", back_populates="applications")
    
    def approve(self):
        """Approuver la demande et mettre à jour le véhicule"""
        self.status = ApplicationStatus.ACCEPTE

        # Mettre à jour le statut du véhicule
        if self.service_type == ServiceType.ACHAT:
            self.vehicle.mark_as_sold()
        else:
            self.vehicle.mark_as_rented()

        db.session.commit()
    
    def reject(self):
        """Rejeter la demande et annuler le paiement"""
        self.status = ApplicationStatus.REFUSE
        # Réinitialiser le paiement à l'état pending/annulé
        self.payment_status = PaymentStatus.PENDING
        self.paid_at = None
        self.confirmed_at = None
        db.session.commit()
    
    def to_dict(self):
        """Convertir en dictionnaire"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "vehicle_id": self.vehicle_id,
            "vehicle": self.vehicle.to_dict() if self.vehicle else None,
            "user": self.user.to_dict() if self.user else None,
            "service_type": self.service_type.value,
            "status": self.status.value,
            "driving_license_number": self.driving_license_number,
            "driving_license_expiry": self.driving_license_expiry.isoformat() if self.driving_license_expiry else None,
            "notes": self.notes,
            "admin_notes": self.admin_notes,
            "package_included": self.package_included,
            "package_price_monthly": self.package_price_monthly,
            # Leasing & Option d'achat
            "option_achat_active": self.option_achat_active,
            "valeur_residuelle": self.valeur_residuelle,
            "option_achat_levee": self.option_achat_levee,
            "date_levee_option": self.date_levee_option.isoformat() if self.date_levee_option else None,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "documents": {
                "identity_document": self.identity_document,
                "license_document": self.license_document,
                "insurance_document": self.insurance_document,
                "proof_of_residence": self.proof_of_residence,
            },
            # Paiements
            "payment_status": self.payment_status.value if self.payment_status else "pending",
            "deposit_amount": self.deposit_amount,
            "total_amount": self.total_amount,
            "payment_method": self.payment_method,
            "invoice_number": self.invoice_number,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
            "confirmed_at": self.confirmed_at.isoformat() if self.confirmed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }