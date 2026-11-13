from flask import Blueprint, jsonify, request, session
from models.models import db, Aviso, Categoria, Usuario

avisos_bp = Blueprint('avisos', __name__)


def serializar_aviso(a):
    categoria = Categoria.query.get(a.categoria_id) if a.categoria_id else None
    creador = Usuario.query.get(a.creador_id) if a.creador_id else None
    return {
        'id': a.id,
        'titulo': a.titulo,
        'mensaje': a.mensaje,
        'fecha': a.fecha.isoformat() if a.fecha else None,
        'categoria_id': a.categoria_id,
        'categoria': categoria.nombre if categoria else 'Toda la escuela',
        'creador': (creador.nombre_completo or creador.nombre_usuario) if creador else 'Administración',
        'creador_id': a.creador_id
    }


@avisos_bp.route('', methods=['GET'])
def listar_avisos():
    """Admin ve todos; profesor ve los generales y los de sus categorías."""
    user_id = session.get('user_id')
    rol = session.get('rol')
    if not user_id:
        return jsonify({'error': 'Debes iniciar sesión'}), 401

    query = Aviso.query
    if rol == 'profesor':
        cat_ids = [c.id for c in Categoria.query.filter_by(profesor_id=user_id).all()]
        query = query.filter((Aviso.categoria_id.is_(None)) | (Aviso.categoria_id.in_(cat_ids or [-1])))
    elif rol != 'admin':
        return jsonify({'error': 'No tienes permisos'}), 403

    return jsonify([serializar_aviso(a) for a in query.order_by(Aviso.fecha.desc()).all()]), 200


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
        categoria = Categoria.query.get(int(categoria_id))
        if not categoria:
            return jsonify({'error': 'Categoría no encontrada'}), 404
        if rol == 'profesor' and categoria.profesor_id != user_id:
            return jsonify({'error': 'No puedes publicar para esa categoría'}), 403
        categoria_id = categoria.id
    elif rol == 'profesor':
        return jsonify({'error': 'Como entrenador debes elegir una de tus categorías'}), 400
    aviso = Aviso(titulo=titulo, mensaje=mensaje, categoria_id=categoria_id, creador_id=user_id)
    db.session.add(aviso)
    db.session.commit()
    return jsonify({'mensaje': 'Aviso publicado', 'aviso': serializar_aviso(aviso)}), 201


@avisos_bp.route('/<int:aviso_id>', methods=['DELETE'])
def eliminar_aviso(aviso_id):
    user_id = session.get('user_id')
    rol = session.get('rol')
    if not user_id:
        return jsonify({'error': 'Debes iniciar sesión'}), 401
    aviso = Aviso.query.get_or_404(aviso_id)
    if rol != 'admin' and aviso.creador_id != user_id:
        return jsonify({'error': 'No puedes eliminar este aviso'}), 403
    db.session.delete(aviso)
    db.session.commit()
    return jsonify({'mensaje': 'Aviso eliminado'}), 200
