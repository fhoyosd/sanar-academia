from datetime import date
from functools import wraps

from flask import Blueprint, jsonify, session
from models.models import (
    Usuario, Jugador, Categoria, Evento, Partido, Pago,
    Observacion, Asistencia, Aviso
)

acudiente_bp = Blueprint('acudiente', __name__)


def solo_acudiente(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = session.get('user_id')
        rol = session.get('rol')
        if not user_id:
            return jsonify({'error': 'Debes iniciar sesión'}), 401
        if rol != 'acudiente':
            return jsonify({'error': 'No tienes permisos para consultar este recurso'}), 403
        usuario = Usuario.query.get(user_id)
        if not usuario or usuario.rol != 'acudiente':
            session.clear()
            return jsonify({'error': 'Sesión no válida'}), 401
        return fn(usuario, *args, **kwargs)
    return wrapper


def serializar_jugador(jugador):
    hoy = date.today()
    edad = hoy.year - jugador.fecha_nacimiento.year
    if (hoy.month, hoy.day) < (jugador.fecha_nacimiento.month, jugador.fecha_nacimiento.day):
        edad -= 1
    categoria = jugador.categoria_rel.nombre if jugador.categoria_rel else 'Sin categoría'
    return {
        'id': jugador.id,
        'nombre': jugador.nombre,
        'edad': edad,
        'posicion': jugador.posicion or 'No especificada',
        'categoria': categoria
    }


@acudiente_bp.route('/dashboard', methods=['GET'])
@solo_acudiente
def dashboard(usuario):
    hijos = Jugador.query.filter_by(acudiente_id=usuario.id).all()
    hijos_ids = [h.id for h in hijos]
    categorias_ids = list({h.categoria_id for h in hijos if h.categoria_id})

    asistencia_data = []
    observaciones_data = []
    pagos_data = []
    partidos_data = []
    eventos_data = []

    if hijos_ids:
        asistencias = Asistencia.query.filter(
            Asistencia.jugador_id.in_(hijos_ids)
        ).order_by(Asistencia.fecha.desc()).all()
        asistencia_data = [{
            'id': a.id,
            'jugador_id': a.jugador_id,
            'jugador': next((h.nombre for h in hijos if h.id == a.jugador_id), ''),
            'tipo': a.tipo,
            'estado': a.estado,
            'fecha': a.fecha.isoformat() if a.fecha else None
        } for a in asistencias]

        observaciones = Observacion.query.filter(
            Observacion.jugador_id.in_(hijos_ids)
        ).order_by(Observacion.fecha.desc()).all()
        observaciones_data = [{
            'id': o.id,
            'jugador_id': o.jugador_id,
            'jugador': next((h.nombre for h in hijos if h.id == o.jugador_id), ''),
            'comentario': o.comentario,
            'fortalezas': o.fortalezas,
            'aspectos_mejorar': o.aspectos_mejorar,
            'rendimiento': o.rendimiento,
            'fecha': o.fecha.isoformat() if o.fecha else None
        } for o in observaciones]

        pagos = Pago.query.filter(Pago.jugador_id.in_(hijos_ids)).order_by(Pago.fecha_pago.desc()).all()
        pagos_data = [{
            'id': p.id,
            'jugador_id': p.jugador_id,
            'jugador': next((h.nombre for h in hijos if h.id == p.jugador_id), ''),
            'concepto': p.mes or 'Mensualidad',
            'monto': p.monto,
            'estado': p.estado or 'Pendiente',
            'fecha': p.fecha_pago.isoformat() if p.fecha_pago else None
        } for p in pagos]

        partidos = Partido.query.join(Partido.jugadores).filter(
            Jugador.id.in_(hijos_ids)
        ).all()
        partidos_data = [{
            'id': p.id,
            'rival': p.rival or 'Rival por confirmar',
            'resultado': p.resultado or 'Pendiente',
            'fecha': p.evento_rel.fecha_hora.isoformat() if p.evento_rel and p.evento_rel.fecha_hora else None,
            'lugar': p.evento_rel.lugar if p.evento_rel else '',
            'categoria': p.evento_rel.categoria_rel.nombre if p.evento_rel and p.evento_rel.categoria_rel else '',
            'convocados': [j.nombre for j in p.jugadores if j.id in hijos_ids]
        } for p in partidos]

        if categorias_ids:
            eventos = Evento.query.filter(Evento.categoria_id.in_(categorias_ids)).order_by(Evento.fecha_hora.asc()).all()
            eventos_data = [{
                'id': e.id,
                'tipo': e.tipo,
                'fecha': e.fecha_hora.isoformat() if e.fecha_hora else None,
                'lugar': e.lugar,
                'descripcion': e.actividades or '',
                'categoria': e.categoria_rel.nombre if e.categoria_rel else ''
            } for e in eventos]

    avisos_query = Aviso.query.filter(
        (Aviso.categoria_id.is_(None)) |
        (Aviso.categoria_id.in_(categorias_ids) if categorias_ids else Aviso.categoria_id.is_(None))
    ).order_by(Aviso.fecha.desc())
    avisos_data = [{
        'id': a.id,
        'titulo': a.titulo,
        'mensaje': a.mensaje,
        'fecha': a.fecha.isoformat() if a.fecha else None
    } for a in avisos_query.all()]

    total_pendiente = sum(
        float(p['monto'] or 0) for p in pagos_data
        if str(p['estado']).lower() in ('pendiente', 'atrasado', 'vencido')
    )

    return jsonify({
        'acudiente': {
            'id': usuario.id,
            'nombre': usuario.nombre_completo or usuario.nombre_usuario
        },
        'resumen': {
            'estudiantes': len(hijos),
            'asistencias': len(asistencia_data),
            'convocatorias': len(partidos_data),
            'pagos_pendientes': sum(
                1 for p in pagos_data
                if str(p['estado']).lower() in ('pendiente', 'atrasado', 'vencido')
            ),
            'valor_pendiente': total_pendiente
        },
        'hijos': [serializar_jugador(h) for h in hijos],
        'asistencias': asistencia_data,
        'observaciones': observaciones_data,
        'pagos': pagos_data,
        'convocatorias': partidos_data,
        'eventos': eventos_data,
        'avisos': avisos_data
    }), 200


@acudiente_bp.route('/estudiantes/<int:jugador_id>', methods=['GET'])
@solo_acudiente
def detalle_estudiante(usuario, jugador_id):
    jugador = Jugador.query.filter_by(id=jugador_id, acudiente_id=usuario.id).first()
    if not jugador:
        return jsonify({'error': 'Estudiante no encontrado o no asociado a tu cuenta'}), 404
    return jsonify({
        'estudiante': serializar_jugador(jugador),
        'asistencias': [{
            'id': a.id,
            'tipo': a.tipo,
            'estado': a.estado,
            'fecha': a.fecha.isoformat() if a.fecha else None
        } for a in Asistencia.query.filter_by(jugador_id=jugador.id).order_by(Asistencia.fecha.desc()).all()],
        'observaciones': [{
            'id': o.id,
            'comentario': o.comentario,
            'fortalezas': o.fortalezas,
            'aspectos_mejorar': o.aspectos_mejorar,
            'rendimiento': o.rendimiento,
            'fecha': o.fecha.isoformat() if o.fecha else None
        } for o in Observacion.query.filter_by(jugador_id=jugador.id).order_by(Observacion.fecha.desc()).all()],
        'pagos': [{
            'id': p.id,
            'concepto': p.mes or 'Mensualidad',
            'monto': p.monto,
            'estado': p.estado or 'Pendiente',
            'fecha': p.fecha_pago.isoformat() if p.fecha_pago else None
        } for p in Pago.query.filter_by(jugador_id=jugador.id).order_by(Pago.fecha_pago.desc()).all()]
    }), 200
