from flask import Blueprint, jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash
from models.models import db, Usuario

auth_bp = Blueprint('auth', __name__)


def serializar_usuario(user):
    return {
        "id": user.id,
        "username": user.nombre_usuario,
        "nombre": user.nombre_completo or user.nombre_usuario,
        "rol": user.rol
    }


def password_valida(guardada, ingresada):
    """Acepta contraseñas con hash y, por compatibilidad, las antiguas en texto plano."""
    if not guardada or not ingresada:
        return False
    try:
        if check_password_hash(guardada, ingresada):
            return True
    except ValueError:
        pass
    return guardada == ingresada


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''

    user = Usuario.query.filter_by(nombre_usuario=username).first()

    if user and password_valida(user.password, password):
        session.clear()
        session['user_id'] = user.id
        session['rol'] = user.rol
        return jsonify({"message": "Login exitoso", "user": serializar_usuario(user)}), 200

    return jsonify({"error": "Usuario o contraseña incorrectos"}), 401


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Sesión cerrada"}), 200


@auth_bp.route('/me', methods=['GET'])
def me():
    user_id = session.get('user_id')
    user = Usuario.query.get(user_id) if user_id else None
    if not user:
        return jsonify({"error": "No hay una sesión activa"}), 401
    return jsonify({"user": serializar_usuario(user)}), 200


@auth_bp.route('/registro', methods=['POST'])
def registro():
    """HU001: un usuario no registrado crea su cuenta (queda con rol acudiente)."""
    data = request.get_json() or {}
    nombre = (data.get('nombre') or '').strip()
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''

    if not nombre or not username or not password:
        return jsonify({"error": "Nombre, usuario/correo y contraseña son obligatorios"}), 400
    if len(password) < 6:
        return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400
    if Usuario.query.filter_by(nombre_usuario=username).first():
        return jsonify({"error": "Ese usuario o correo ya está registrado"}), 409

    user = Usuario(
        nombre_usuario=username,
        password=generate_password_hash(password),
        rol='acudiente',
        nombre_completo=nombre
    )
    db.session.add(user)
    db.session.commit()

    session.clear()
    session['user_id'] = user.id
    session['rol'] = user.rol
    return jsonify({"message": "Cuenta creada", "user": serializar_usuario(user)}), 201
