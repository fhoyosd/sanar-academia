from flask import Blueprint, jsonify, request, session
from werkzeug.security import check_password_hash
from models.models import Usuario

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    user = Usuario.query.filter_by(nombre_usuario=username).first()

    # Valida la clave si es hash O si coincide en texto plano directamente
    if user and (check_password_hash(user.password, password) or user.password == password):
        session['user_id'] = user.id
        session['rol'] = user.rol

        return jsonify({
            "message": "Login exitoso",
            "user": {
                "id": user.id,
                "username": user.nombre_usuario,
                "rol": user.rol
            }
        }), 200

    return jsonify({"error": "Usuario o contraseña incorrectos"}), 401