"""
Bloc03_Baers - Backend API
"""

import os
import sys
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

# Shell context pour flask shell
@app.shell_context_processor
def make_shell_context():
    """Contexte pour les commandes flask shell"""
    from app.models import User, Vehicle, Application
    return {"db": db, "User": User, "Vehicle": Vehicle, "Application": Application}

if __name__ == "__main__":
    # Lancer le serveur de développement local
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