import os
import json
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Load configuration from config.json if available
    config_data = {}
    config_path = os.path.join(os.path.dirname(__file__), "config.json")
    if os.path.exists(config_path):
        try:
            with open(config_path, "r") as f:
                config_data = json.load(f)
        except Exception as e:
            print(f"Error loading config.json: {e}")

    SECRET_KEY = config_data.get("SECRET_KEY") or os.getenv("SECRET_KEY") or "dev-secret-key-12345"

    SQLALCHEMY_DATABASE_URI = config_data.get("SQLALCHEMY_DATABASE_URI") or os.getenv("DATABASE_URL")

    SQLALCHEMY_TRACK_MODIFICATIONS = config_data.get("SQLALCHEMY_TRACK_MODIFICATIONS", False)

    GMAIL_USER = config_data.get("GMAIL_USER") or os.getenv("GMAIL_USER")
    GMAIL_PASSWORD = config_data.get("GMAIL_PASSWORD") or os.getenv("GMAIL_PASSWORD")
