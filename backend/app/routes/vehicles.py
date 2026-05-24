from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Vehicle, User, VehicleStatus, ServiceType

vehicles_bp = Blueprint("vehicles", __name__, url_prefix="/api/vehicles")

@vehicles_bp.route("", methods=["GET"])
def get_vehicles():
    """Récupérer véhicules avec filtres"""
    try:
        service_type = request.args.get("service_type")
        brand = request.args.get("brand")
        location = request.args.get("location")
        min_price = request.args.get("min_price", type=float)
        max_price = request.args.get("max_price", type=float)
        status = request.args.get("status")  # Pas de défaut
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 10, type=int)

        query = Vehicle.query

        # Filtrer par statut seulement si spécifié
        if status:
            query = query.filter_by(status=status)
        
        if service_type:
            query = query.filter_by(service_type=service_type)
        
        if brand:
            query = query.filter_by(brand=brand)
        
        if location:
            query = query.filter(Vehicle.location.ilike(f"%{location}%"))
        
        if min_price is not None:
            query = query.filter(Vehicle.price >= min_price)
        
        if max_price is not None:
            query = query.filter(Vehicle.price <= max_price)
        
        paginated = query.paginate(page=page, per_page=per_page)
        
        return jsonify({
            "vehicles": [v.to_dict() for v in paginated.items],
            "total": paginated.total,
            "pages": paginated.pages,
            "current_page": page,
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@vehicles_bp.route("/<int:vehicle_id>", methods=["GET"])
def get_vehicle(vehicle_id):
    """Récupérer un véhicule spécifique"""
    try:
        vehicle = Vehicle.query.get(vehicle_id)
        
        if not vehicle:
            return jsonify({"error": "Véhicule non trouvé"}), 404
        
        return jsonify(vehicle.to_dict()), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@vehicles_bp.route("", methods=["POST"])
@jwt_required()
def create_vehicle():
    """Créer un véhicule (admin seulement)"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({"error": "Accès non autorisé"}), 403
        
        data = request.get_json()
        
        required_fields = [
            "brand", "model", "year", "fuel_type", "transmission",
            "mileage", "price", "service_type", "location"
        ]
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Données manquantes"}), 400

        # Convertir les strings en Enum
        try:
            service_type = ServiceType(data["service_type"])
            status = VehicleStatus(data.get("status", "disponible"))
        except ValueError as e:
            return jsonify({"error": f"Valeur enum invalide: {str(e)}"}), 400

        vehicle = Vehicle(
            brand=data["brand"],
            model=data["model"],
            year=data["year"],
            fuel_type=data["fuel_type"],
            transmission=data["transmission"],
            mileage=data["mileage"],
            price=data["price"],
            rental_price_daily=data.get("rental_price_daily"),
            rental_price_monthly=data.get("rental_price_monthly"),
            description=data.get("description"),
            image_url=data.get("image_url"),
            service_type=service_type,
            location=data["location"],
            color=data.get("color"),
            features=data.get("features"),
            status=status,
        )
        
        db.session.add(vehicle)
        db.session.commit()
        
        return jsonify({
            "message": "Véhicule créé avec succès",
            "vehicle": vehicle.to_dict(),
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@vehicles_bp.route("/<int:vehicle_id>", methods=["PUT"])
@jwt_required()
def update_vehicle(vehicle_id):
    """Mettre à jour un véhicule (admin seulement)"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({"error": "Accès non autorisé"}), 403
        
        vehicle = Vehicle.query.get(vehicle_id)
        
        if not vehicle:
            return jsonify({"error": "Véhicule non trouvé"}), 404
        
        data = request.get_json()
        
        updatable_fields = [
            "brand", "model", "year", "fuel_type", "transmission",
            "mileage", "price", "rental_price_daily", "rental_price_monthly",
            "description", "image_url", "location", "color", "features", "status", "service_type"
        ]

        for field in updatable_fields:
            if field in data:
                value = data[field]
                # Convertir les strings en Enum si nécessaire
                if field == "status" and isinstance(value, str):
                    try:
                        value = VehicleStatus(value)
                    except ValueError:
                        return jsonify({"error": f"Statut invalide: {value}"}), 400
                elif field == "service_type" and isinstance(value, str):
                    try:
                        value = ServiceType(value)
                    except ValueError:
                        return jsonify({"error": f"Type de service invalide: {value}"}), 400

                setattr(vehicle, field, value)
        
        db.session.commit()
        
        return jsonify({
            "message": "Véhicule mis à jour",
            "vehicle": vehicle.to_dict(),
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@vehicles_bp.route("/<int:vehicle_id>", methods=["DELETE"])
@jwt_required()
def delete_vehicle(vehicle_id):
    """Supprimer un véhicule (admin seulement)"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.is_admin:
            return jsonify({"error": "Accès non autorisé"}), 403
        
        vehicle = Vehicle.query.get(vehicle_id)
        
        if not vehicle:
            return jsonify({"error": "Véhicule non trouvé"}), 404
        
        db.session.delete(vehicle)
        db.session.commit()
        
        return jsonify({"message": "Véhicule supprimé"}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@vehicles_bp.route("/brands", methods=["GET"])
def get_brands():
    """Récupérer la liste des marques"""
    try:
        brands = db.session.query(Vehicle.brand).distinct().all()
        brand_list = [b[0] for b in brands if b[0]]
        
        return jsonify({"brands": sorted(brand_list)}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@vehicles_bp.route("/locations", methods=["GET"])
def get_locations():
    """Récupérer la liste des localisations"""
    try:
        locations = db.session.query(Vehicle.location).distinct().all()
        location_list = [l[0] for l in locations if l[0]]
        
        return jsonify({"locations": sorted(location_list)}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500