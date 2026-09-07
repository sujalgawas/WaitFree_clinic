import os
from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv


def create_app():
    load_dotenv()

    from app.db.firebase import init_firebase
    init_firebase()

    # Detect built React frontend directory
    candidate_dist_dirs = [
        os.environ.get('FRONTEND_DIST'),
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'frontend_dist'),
        os.path.join(os.getcwd(), 'frontend_dist'),
        os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'Frontend', 'my-react-app', 'dist')),
        os.path.abspath(os.path.join(os.getcwd(), 'Frontend', 'my-react-app', 'dist'))
    ]
    dist_folder = None
    for candidate in candidate_dist_dirs:
        if candidate and os.path.exists(candidate) and os.path.isdir(candidate):
            dist_folder = candidate
            break

    if dist_folder:
        app = Flask(__name__, static_folder=dist_folder, static_url_path='')
    else:
        app = Flask(__name__)

    # Allow all origins for production flexibility & same-origin requests
    CORS(app, resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
    from app.api.scheduler_routes import scheduler_bp
    from app.api.doctor_routes import doctor_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(appointment_bp)
    app.register_blueprint(location_bp)
    app.register_blueprint(search_bp)
    app.register_blueprint(payment_bp)
    app.register_blueprint(contact_bp)
    app.register_blueprint(scheduler_bp)
    app.register_blueprint(doctor_bp)

    # SPA routing for frontend
    if dist_folder:
        @app.route('/', defaults={'path': ''}, methods=['GET'])
        @app.route('/<path:path>', methods=['GET'])
        def serve_frontend(path):
            file_path = os.path.join(dist_folder, path)
            if path != "" and os.path.exists(file_path):
                return send_from_directory(dist_folder, path)
            return send_from_directory(dist_folder, 'index.html')

        @app.errorhandler(404)
        def not_found(e):
            if request.method == 'GET' and not request.path.startswith('/api'):
                return send_from_directory(dist_folder, 'index.html')
            return jsonify({"error": "Not found"}), 404

        @app.errorhandler(405)
        def method_not_allowed(e):
            if request.method == 'GET' and not request.path.startswith('/api'):
                return send_from_directory(dist_folder, 'index.html')
            return jsonify({"error": "Method not allowed"}), 405

    return app
