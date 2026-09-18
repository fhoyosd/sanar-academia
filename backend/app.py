from flask import Flask, request, jsonify
from flask_cors import CORS
from models.models import db, Usuario
from routes.auth import auth_bp
from routes.main import main_bp
from routes.admin import admin_bp
from routes.profesores import profesor_bp

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///futbol_app.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'mi_secreto_super_seguro'

    # Configuración de CORS corregida para permitir credenciales/sesiones
    CORS(
        app,
        resources={r"/*": {"origins": ["http://localhost:4200", "http://127.0.0.1:4200"]}},
        supports_credentials=True
    )

    db.init_app(app)

    # Registramos los blueprints
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(profesor_bp, url_prefix='/api/profesor')

    @app.route('/api/ping', methods=['GET'])
    def ping():
        return jsonify({"mensaje": "API de Flask funcionando correctamente"}), 200

    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)