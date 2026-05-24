"""
Bloc03_Baers - Backend API
"""

import os
import sys
import logging
import requests
from flask import jsonify
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()

# AJUSTEMENT SÉCURISÉ DES IMPORTS POUR LA PRODUCTION (Render/Azure)
current_dir = str(Path(__file__).parent)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

parent_dir = str(Path(__file__).parent.parent)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from app import create_app, db

# Application Flask
app = create_app(config_name=os.getenv("FLASK_ENV", "development"))

# CONFIGURATION DE SÉCURITÉ ET ALERTING DISCORD
DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1508110670753824998/_LIH_nqLYTuyh_xQhfgZfmav6-E2bjDgFvesVVAM9_wA_zRcwb4I84414kk7m98dVTkK"

def envoyer_alerte_critique(titre, message):
    """Envoi d'un webhook vers Discord lors d'une levée d'exception globale"""
    if not DISCORD_WEBHOOK_URL:
        return
    payload = {
        "embeds": [{
            "title": f"🚨 {titre}",
            "description": f"**Détails :**\n{message}",
            "color": 15158332  
        }]
    }
    try:
        requests.post(DISCORD_WEBHOOK_URL, json=payload, timeout=5)
    except Exception as e:
        logging.error(f"Impossible d'envoyer l'alerte Discord: {e}")

@app.errorhandler(500)
@app.errorhandler(Exception)
def handle_exception(e):
    """Centralisation de la gestion des erreurs internes (HTTP 500)"""
    error_msg = str(e)
    
    # Persistance du traceback dans les logs applicatifs (Azure/Render)
    logging.critical(f"CRASH APPLICATION: {error_msg}", exc_info=True)
    
    # Notification push via le Webhook
    envoyer_alerte_critique(
        titre="CRASH SERVEUR - Erreur 500",
        message=f"Une erreur critique est survenue sur l'application.\nErreur : `{error_msg}`"
    )
    
    return jsonify({
        "error": "Internal Server Error",
        "message": "Une erreur technique est survenue. L'équipe technique a été alertée."
    }), 500

# Shell context pour flask shell
@app.shell_context_processor
def make_shell_context():
    """Contexte pour les commandes flask shell"""
    from app.models import User, Vehicle, Application
    return {"db": db, "User": User, "Vehicle": Vehicle, "Application": Application}

if __name__ == "__main__":
    # Lancement du serveur Local
    with app.app_context():
        # --- VÉRIFICATION DE LA CONNEXION CLOUD ---
        db_url = os.getenv("DATABASE_URL", "")
        print("\n" + "="*60)
        if "azure.com" in db_url:
            print("🚀  CLOUD EN LIGNE : Connecté à PostgreSQL sur Microsoft Azure !")
            print("📡  Hôte : db-bloc03-python.postgres.database.azure.com")
        else:
            print("🏠  MODE LOCAL : Connecté à la base de données locale (SQLite).")
        print("="*60 + "\n")
        # -------------------------------------------

        app.run(
            host=os.getenv("FLASK_HOST", "0.0.0.0"),
            port=int(os.getenv("FLASK_PORT", 5000)),
            debug=os.getenv("FLASK_ENV") == "development"
        )