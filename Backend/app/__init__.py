from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv


def create_app():
    load_dotenv()

    from app.db.firebase import init_firebase
    init_firebase()

    app = Flask(__name__)

    CORS(app, resources={
        r"/*": {
            "origins": [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            ],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    from app.api.auth_routes import auth_bp
    from app.api.profile_routes import profile_bp
    from app.api.appointment_routes import appointment_bp
    from app.api.location_routes import location_bp
    from app.api.search_routes import search_bp
    from app.api.payment_routes import payment_bp
    from app.api.contact_routes import contact_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(appointment_bp)
    app.register_blueprint(location_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(payment_bp)
    app.register_blueprint(contact_bp)

    return app
