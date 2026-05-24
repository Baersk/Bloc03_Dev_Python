from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User
from email_validator import validate_email, EmailNotValidError

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    """Inscription d'un nouvel utilisateur"""
    try:
        data = request.get_json()
        
        if not all(k in data for k in ["email", "firstname", "lastname", "password"]):
            return jsonify({"error": "Données manquantes"}), 400
        
        try:
            validate_email(data["email"], check_deliverability=False)
        except EmailNotValidError:
            return jsonify({"error": "Email invalide"}), 400
        
        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"error": "Cet email est déjà utilisé"}), 409
        
        user = User(
            email=data["email"],
            firstname=data["firstname"],
            lastname=data["lastname"],
            phone=data.get("phone"),
        )
        user.set_password(data["password"])
        
        db.session.add(user)
        db.session.commit()

        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            "message": "Utilisateur créé avec succès",
            "user": user.to_dict(),
            "access_token": access_token,
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    """Connexion utilisateur"""
    try:
        data = request.get_json()
        
        if not data.get("email") or not data.get("password"):
            return jsonify({"error": "Email et mot de passe requis"}), 400
        
        user = User.query.filter_by(email=data["email"]).first()
        
        if not user or not user.check_password(data["password"]):
            return jsonify({"error": "Email ou mot de passe incorrect"}), 401
        
        if not user.is_active:
            return jsonify({"error": "Compte désactivé"}), 403

        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            "message": "Connexion réussie",
            "user": user.to_dict(),
            "access_token": access_token,
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """Récupérer le profil utilisateur"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "Utilisateur non trouvé"}), 404
        
        return jsonify(user.to_dict()), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    """Mettre à jour le profil utilisateur"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "Utilisateur non trouvé"}), 404
        
        data = request.get_json()
        
        if "firstname" in data:
            user.firstname = data["firstname"]
        if "lastname" in data:
            user.lastname = data["lastname"]
        if "phone" in data:
            user.phone = data["phone"]
        
        db.session.commit()
        
        return jsonify({
            "message": "Profil mis à jour",
            "user": user.to_dict(),
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    """Changer le mot de passe"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "Utilisateur non trouvé"}), 404
        
        data = request.get_json()
        
        if not data.get("current_password") or not data.get("new_password"):
            return jsonify({"error": "Mots de passe requis"}), 400
        
        if not user.check_password(data["current_password"]):
            return jsonify({"error": "Mot de passe actuel incorrect"}), 401
        
        user.set_password(data["new_password"])
        db.session.commit()
        
        return jsonify({"message": "Mot de passe changé avec succès"}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
