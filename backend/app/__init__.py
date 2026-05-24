from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
import os
from datetime import timedelta

# Initialiser les extensions sans app
db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

# Variables globales initialisées dans create_app
_app = None

def create_app(config_name: str = None) -> Flask:
    """Application Factory Pattern"""
    global _app

    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    # Créer l'app Flask
    app = Flask(__name__)
    _app = app

    # Charger la configuration
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from config import config
    app.config.from_object(config.get(config_name, config["development"]))

    # Initialiser les extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Configuration CORS (Local + Render Azure)
    raw_origins = os.getenv("ALLOWED_ORIGINS") or app.config.get("CORS_ORIGINS", "http://localhost:5173,http://localhost:8080")
    
    if isinstance(raw_origins, str):
        cors_origins = [o.strip() for o in raw_origins.split(",")]
    else:
        cors_origins = raw_origins

    CORS(app, origins=cors_origins, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])

    # Importer les modèles AVANT de créer les tables
    from app.models import User, Vehicle, Application

    # Créer les tables dans le contexte de l'app
    with app.app_context():
        db.create_all()

    # Enregistrer les blueprints
    from app.routes import auth_bp, vehicles_bp, applications_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(vehicles_bp)
    app.register_blueprint(applications_bp)
    
    # Routes de santé
    @app.route("/api/health", methods=["GET"])
    def health():
        return {"status": "ok", "message": "API running"}, 200

    # Route de debug - Initialiser les données de test (DEV ONLY)
    @app.route("/api/debug/seed-vehicles", methods=["POST"])
    def debug_seed_vehicles():
        """Endpoint de debug pour seeder les véhicules (développement uniquement)"""
        from app.models import Vehicle

        if app.config.get("ENV") == "production":
            return {"error": "Not available in production"}, 403

        try:
            # Supprimer les véhicules existants
            Vehicle.query.delete()

            vehicles_data = [
                # Mercedes (5 modèles)
                {'brand': 'Mercedes', 'model': 'C-Class Berline', 'year': 2024, 'fuel_type': 'Essence', 'transmission': 'Automatique', 'mileage': 500, 'price': 45000, 'rental_price_daily': 85, 'rental_price_monthly': 1700, 'service_type': 'achat', 'location': 'Paris', 'color': 'Noir', 'description': 'Berline élégante et performante'},
                {'brand': 'Mercedes', 'model': 'GLC SUV', 'year': 2023, 'fuel_type': 'Hybride', 'transmission': 'Automatique', 'mileage': 8000, 'price': 58000, 'rental_price_daily': 110, 'rental_price_monthly': 2200, 'service_type': 'location_longue_duree', 'location': 'Paris', 'color': 'Blanc', 'description': 'SUV hybride de prestige avec 4-Matic'},
                {'brand': 'Mercedes', 'model': 'A-Class', 'year': 2024, 'fuel_type': 'Essence', 'transmission': 'Automatique', 'mileage': 300, 'price': 32000, 'rental_price_daily': 55, 'rental_price_monthly': 1100, 'service_type': 'achat', 'location': 'Lyon', 'color': 'Gris', 'description': 'Citadine compacte et luxueuse'},
                {'brand': 'Mercedes', 'model': 'E-Class Berline', 'year': 2023, 'fuel_type': 'Diesel', 'transmission': 'Automatique', 'mileage': 12000, 'price': 52000, 'rental_price_daily': 95, 'rental_price_monthly': 1900, 'service_type': 'location_court_terme', 'location': 'Paris', 'color': 'Bleu', 'description': 'Berline de luxe avec équipements premium'},
                {'brand': 'Mercedes', 'model': 'GLA SUV Compact', 'year': 2024, 'fuel_type': 'Essence', 'transmission': 'Automatique', 'mileage': 600, 'price': 38000, 'rental_price_daily': 70, 'rental_price_monthly': 1400, 'service_type': 'achat', 'location': 'Marseille', 'color': 'Rouge', 'description': 'SUV compact sportif et confortable'},

                # Audi (4)
                {'brand': 'Audi', 'model': 'A4 Berline', 'year': 2024, 'fuel_type': 'Essence', 'transmission': 'Automatique', 'mileage': 400, 'price': 42000, 'rental_price_daily': 80, 'rental_price_monthly': 1600, 'service_type': 'achat', 'location': 'Toulouse', 'color': 'Noir', 'description': 'Berline sportive avec Quattro'},
                {'brand': 'Audi', 'model': 'Q5 SUV', 'year': 2023, 'fuel_type': 'Diesel', 'transmission': 'Automatique', 'mileage': 15000, 'price': 50000, 'rental_price_daily': 100, 'rental_price_monthly': 2000, 'service_type': 'location_longue_duree', 'location': 'Paris', 'color': 'Blanc', 'description': 'SUV spacieux avec technologie MMI'},
                {'brand': 'Audi', 'model': 'A6 Berline', 'year': 2023, 'fuel_type': 'Hybride', 'transmission': 'Automatique', 'mileage': 10000, 'price': 55000, 'rental_price_daily': 105, 'rental_price_monthly': 2100, 'service_type': 'location_court_terme', 'location': 'Lyon', 'color': 'Gris', 'description': 'Berline premium hybride'},
                {'brand': 'Audi', 'model': 'Q3 SUV Compact', 'year': 2024, 'fuel_type': 'Essence', 'transmission': 'Automatique', 'mileage': 500, 'price': 36000, 'rental_price_daily': 65, 'rental_price_monthly': 1300, 'service_type': 'achat', 'location': 'Bordeaux', 'color': 'Bleu', 'description': 'SUV compact dynamique'},
            ]

            for v in vehicles_data:
                vehicle = Vehicle(**v)
                db.session.add(vehicle)

            db.session.commit()
            return {
                "status": "success",
                "message": f"{len(vehicles_data)} véhicules ajoutés",
                "vehicles_added": len(vehicles_data)
            }, 201

        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

    # Gestion des erreurs
    @app.errorhandler(404)
    def not_found(error):
        return {"error": "Route non trouvée"}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return {"error": "Erreur serveur interne"}, 500
    
    # CLI Commands
    register_cli_commands(app)
    
    return app

def register_cli_commands(app: Flask):
    """Enregistrer les commandes CLI"""
    
    @app.cli.command()
    def create_admin():
        """Créer un utilisateur admin"""
        from app.models import User
        
        email = input("Email admin: ")
        firstname = input("Prénom: ")
        lastname = input("Nom: ")
        password = input("Mot de passe (min 6 caractères): ")
        
        if len(password) < 6:
            print("❌ Le mot de passe doit contenir au minimum 6 caractères")
            return
        
        if User.query.filter_by(email=email).first():
            print("❌ Cet email existe déjà")
            return
        
        admin = User(
            email=email,
            firstname=firstname,
            lastname=lastname,
            is_admin=True
        )
        admin.set_password(password)
        
        db.session.add(admin)
        db.session.commit()
        
        print(f"✅ Admin {email} créé avec succès!")
    
    @app.cli.command()
    def reset_admin():
        """Réinitialiser la base de données et créer un nouvel admin"""
        from app.models import User
        
        confirm = input("⚠️  Êtes-vous sûr de vouloir supprimer TOUS les utilisateurs? (oui/non): ")
        
        if confirm.lower() not in ['oui', 'yes', 'y']:
            print("Annulé")
            return
        
        User.query.delete()
        db.session.commit()
        print("✅ Tous les utilisateurs supprimés")
        
        email = input("Nouvel email admin: ")
        firstname = input("Prénom: ")
        lastname = input("Nom: ")
        password = input("Mot de passe (min 6 caractères): ")
        
        if len(password) < 6:
            print("❌ Le mot de passe doit contenir au minimum 6 caractères")
            return
        
        admin = User(
            email=email,
            firstname=firstname,
            lastname=lastname,
            is_admin=True
        )
        admin.set_password(password)
        
        db.session.add(admin)
        db.session.commit()
        
        print(f"✅ Nouvel admin {email} créé avec succès!")
    
    @app.cli.command()
    def seed_vehicles():
        """Ajouter des véhicules de test réalistes"""
        from app.models import Vehicle
        
        vehicles_data = [
            # Mercedes (5 modèles)
            {'brand': 'Mercedes', 'model': 'C-Class Berline', 'year': 2024, 'fuel_type': 'Essence', 'transmission': 'Automatique', 'mileage': 500, 'price': 45000, 'rental_price_daily': 85, 'rental_price_monthly': 1700, 'service_type': 'achat', 'location': 'Paris', 'color': 'Noir', 'description': 'Berline élégante et performante'},
            {'brand': 'Mercedes', 'model': 'GLC SUV', 'year': 2023, 'fuel_type': 'Hybride', 'transmission': 'Automatique', 'mileage': 8000, 'price': 58000, 'rental_price_daily': 110, 'rental_price_monthly': 2200, 'service_type': 'location_longue_duree', 'location': 'Paris', 'color': 'Blanc', 'description': 'SUV hybride de prestige avec 4-Matic'},
            {'brand': 'Mercedes', 'model': 'A-Class', 'year': 2024, 'fuel_type': 'Essence', 'transmission': 'Automatique', 'mileage': 300, 'price': 32000, 'rental_price_daily': 55, 'rental_price_monthly': 1100, 'service_type': 'achat', 'location': 'Lyon', 'color': 'Gris', 'description': 'Citadine compacte et luxueuse'},
            {'brand': 'Mercedes', 'model': 'E-Class Berline', 'year': 2023, 'fuel_type': 'Diesel', 'transmission': 'Automatique', 'mileage': 12000, 'price': 52000, 'rental_price_daily': 95, 'rental_price_monthly': 1900, 'service_type': 'location_court_terme', 'location': 'Paris', 'color': 'Bleu', 'description': 'Berline de luxe avec équipements premium'},
            {'brand': 'Mercedes', 'model': 'GLA SUV Compact', 'year': 2024, 'fuel_type': 'Essence', 'transmission': 'Automatique', 'mileage': 600, 'price': 38000, 'rental_price_daily': 70, 'rental_price_monthly': 1400, 'service_type': 'achat', 'location': 'Marseille', 'color': 'Rouge', 'description': 'SUV compact sportif et confortable'},
            
            # Audi (4)
            {'brand': 'Audi', 'model': 'A4 Berline', 'year': 2024, 'fuel_type': 'Essence', 'transmission': 'Automatique', 'mileage': 400, 'price': 42000, 'rental_price_daily': 80, 'rental_price_monthly': 1600, 'service_type': 'achat', 'location': 'Toulouse', 'color': 'Noir', 'description': 'Berline sportive avec Quattro'},
            {'brand': 'Audi', 'model': 'Q5 SUV', 'year': 2023, 'fuel_type': 'Diesel', 'transmission': 'Automatique', 'mileage': 15000, 'price': 50000, 'rental_price_daily': 100, 'rental_price_monthly': 2000, 'service_type': 'location_longue_duree', 'location': 'Paris', 'color': 'Blanc', 'description': 'SUV spacieux avec technologie MMI'},
            {'brand': 'Audi', 'model': 'A6 Berline', 'year': 2023, 'fuel_type': 'Hybride', 'transmission': 'Automatique', 'mileage': 10000, 'price': 55000, 'rental_price_daily': 105, 'rental_price_monthly': 2100, 'service_type': 'location_court_terme', 'location': 'Lyon', 'color': 'Gris', 'description': 'Berline premium hybride'},
            {'brand': 'Audi', 'model': 'Q3 SUV Compact', 'year': 2024, 'fuel_type': 'Essence', 'transmission': 'Automatique', 'mileage': 500, 'price': 36000, 'rental_price_daily': 65, 'rental_price_monthly': 1300, 'service_type': 'achat', 'location': 'Bordeaux', 'color': 'Bleu', 'description': 'SUV compact dynamique'},
        ]
        
        for v in vehicles_data:
            if not Vehicle.query.filter_by(brand=v['brand'], model=v['model']).first():
                vehicle = Vehicle(**v)
                db.session.add(vehicle)
        
        db.session.commit()
        print(f"✅ {len(vehicles_data)} véhicules ajoutés avec succès!")
