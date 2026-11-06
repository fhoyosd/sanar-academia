from flask import Blueprint, jsonify, request, session
from models.models import db, Aviso, Categoria

avisos_bp = Blueprint('avisos', __name__)

@avisos_bp.route('', methods=['POST'])
def publicar_aviso():
    user_id = session.get('user_id')
    rol = session.get('rol')
    if not user_id:
        return jsonify({'error': 'Debes iniciar sesión'}), 401
    if rol not in ('admin', 'profesor'):
        return jsonify({'error': 'No tienes permisos'}), 403
    data = request.get_json() or {}
    titulo = (data.get('titulo') or '').strip()
    mensaje = (data.get('mensaje') or '').strip()
    categoria_id = data.get('categoria_id') or None
    if not titulo or not mensaje:
        return jsonify({'error': 'Título y mensaje son obligatorios'}), 400
    if categoria_id:
        categoria = Categoria.query.get(categoria_id)
        if not categoria:
            return jsonify({'error': 'Categoría no encontrada'}), 404
        if rol == 'profesor' and categoria.profesor_id != user_id:
            return jsonify({'error': 'No puedes publicar para esa categoría'}), 403
    aviso = Aviso(titulo=titulo, mensaje=mensaje, categoria_id=categoria_id, creador_id=user_id)
    db.session.add(aviso)
    db.session.commit()
    return jsonify({'mensaje': 'Aviso publicado', 'id': aviso.id}), 201
