from flask import Blueprint, request, jsonify, session
from app import db
from datetime import datetime
from models.models import (
    Usuario,
    Categoria,
    Jugador,
    Evento,
    Partido,
    Observacion,
    EstadisticaJugador,
    Asistencia 
)

profesor_bp = Blueprint(
    'profesor',
    __name__,
    url_prefix='/api/profesor'
)

# =========================
# DASHBOARD
# =========================
@profesor_bp.route('/dashboard/<int:profesor_id>', methods=['GET', 'OPTIONS'])
def dashboard(profesor_id):
    if request.method == 'OPTIONS':
        return '', 200

    try:
        categorias = Categoria.query.filter_by(profesor_id=profesor_id).all()
        categorias_data = [{'id': c.id, 'nombre': c.nombre} for c in categorias]
        
        jugadores = []
        for c in categorias:
            for j in c.jugadores:
                jugadores.append({
                    'id': j.id,
                    'nombre': j.nombre,
                    'posicion': j.posicion,
                    'categoria': c.nombre
                })

        return jsonify({
            'categorias': categorias_data,
            'jugadores': jugadores
        }), 200
    except Exception as e:
        print(f"Error en dashboard profesor: {e}")
        return jsonify({'error': str(e)}), 500


# =========================
# JUGADORES
# =========================
@profesor_bp.route('/jugadores/<int:profesor_id>', methods=['GET', 'OPTIONS'])
def listar_jugadores(profesor_id):
    if request.method == 'OPTIONS':
        return '', 200

    try:
        categorias = Categoria.query.filter_by(profesor_id=profesor_id).all()
        jugadores = []

        for c in categorias:
            for j in c.jugadores:
                jugadores.append({
                    'id': j.id,
                    'nombre': j.nombre,
                    'posicion': j.posicion,
                    'categoria': c.nombre,
                    'estatura': getattr(j, 'estatura', 0),
                    'peso': getattr(j, 'peso', 0)
                })

        return jsonify(jugadores), 200
    except Exception as e:
        print(f"Error al listar jugadores del profesor: {e}")
        return jsonify({'error': str(e)}), 500


@profesor_bp.route('/jugador/<int:id>', methods=['GET', 'OPTIONS'])
def detalle_jugador(id):
    if request.method == 'OPTIONS':
        return '', 200

    try:
        jugador = Jugador.query.get_or_404(id)
        
        observaciones = Observacion.query.filter_by(jugador_id=id).order_by(Observacion.id.desc()).all()
        obs_data = [{
            'id': o.id,
            'comentario': o.comentario,
            'fortalezas': o.fortalezas,
            'aspectos_mejorar': o.aspectos_mejorar,
            'rendimiento': o.rendimiento
        } for o in observaciones]

        historial = EstadisticaJugador.query.filter_by(jugador_id=id).all()
        hist_data = [{
            'id': h.id,
            'partido_id': h.partido_id,
            'goles': h.goles,
            'asistencias': h.asistencias,
            'amarillas': h.amarillas,
            'rojas': h.rojas
        } for h in historial]

        return jsonify({
            'jugador': {
                'id': jugador.id,
                'nombre': jugador.nombre,
                'posicion': jugador.posicion,
                'estatura': getattr(jugador, 'estatura', 0), 
                'peso': getattr(jugador, 'peso', 0),          
                'categoria': jugador.categoria_rel.nombre if jugador.categoria_rel else 'Sin Categoría'
            },
            'observaciones': obs_data,
            'historial': hist_data
        }), 200
    except Exception as e:
        print(f"Error al obtener detalle del jugador: {e}")
        return jsonify({'error': str(e)}), 500


@profesor_bp.route('/jugador/<int:id>/observacion', methods=['POST', 'OPTIONS'])
def agregar_observacion(id):
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    try:
        nueva_obs = Observacion(
            comentario=data.get('comentario'),
            fortalezas=data.get('fortalezas'),
            aspectos_mejorar=data.get('aspectos_mejorar'),
            rendimiento=data.get('rendimiento'),
            jugador_id=id,
            profesor_id=data.get('profesor_id')
        )
        db.session.add(nueva_obs)
        db.session.commit()
        return jsonify({'mensaje': 'Observación guardada exitosamente'}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error al guardar observación: {e}")
        return jsonify({'error': str(e)}), 400


# =========================
# PARTIDOS
# =========================
@profesor_bp.route('/partidos', methods=['GET', 'OPTIONS'])
@profesor_bp.route('/partidos/<int:profesor_id>', methods=['GET', 'OPTIONS'])
def listar_partidos(profesor_id=None):
    if request.method == 'OPTIONS':
        return '', 200

    try:
        if profesor_id:
            categorias = Categoria.query.filter_by(profesor_id=profesor_id).all()
            cat_ids = [c.id for c in categorias]
            if cat_ids:
                eventos = Evento.query.filter(Evento.tipo == 'partido', Evento.categoria_id.in_(cat_ids)).all()
                evento_ids = [e.id for e in eventos]
                partidos = Partido.query.filter(Partido.evento_id.in_(evento_ids)).all()
            else:
                partidos = []
        else:
            partidos = Partido.query.all()

        resultado = []
        for p in partidos:
            evento = p.evento_rel if hasattr(p, 'evento_rel') else None
            resultado.append({
                'id': p.id,
                'rival': p.rival,
                'resultado': p.resultado,
                'lugar': evento.lugar if evento else 'N/A',
                'fecha': evento.fecha_hora.strftime('%Y-%m-%d %H:%M') if evento and evento.fecha_hora else 'N/A',
                'categoria': evento.categoria_rel.nombre if evento and evento.categoria_rel else 'Sin Categoría'
            })
        return jsonify(resultado), 200
    except Exception as e:
        print(f"Error al listar partidos: {e}")
        return jsonify({'error': str(e)}), 500


@profesor_bp.route('/crear_partido', methods=['POST', 'OPTIONS'])
@profesor_bp.route('/partidos/nuevo', methods=['POST', 'OPTIONS'])
def crear_partido():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    try:
        fecha_str = data.get('fecha')
        fecha_dt = datetime.now()
        if fecha_str:
            try:
                fecha_dt = datetime.strptime(fecha_str, '%Y-%m-%dT%H:%M')
            except ValueError:
                fecha_dt = datetime.strptime(fecha_str, '%Y-%m-%dT%H:%M:%S')

        evento = Evento(
            tipo='partido',
            fecha_hora=fecha_dt,
            lugar=data.get('lugar'),
            categoria_id=data.get('categoria_id')
        )
        db.session.add(evento)
        db.session.commit()

        nuevo_partido = Partido(
            evento_id=evento.id,
            rival=data.get('rival'),
            resultado=data.get('resultado') if data.get('resultado') else 'Pendiente'
        )
        db.session.add(nuevo_partido)
        db.session.commit()

        jugadores_ids = data.get('convocados') or data.get('jugadores') or []
        for j_id in jugadores_ids:
            jugador = Jugador.query.get(j_id)
            if jugador:
                nuevo_partido.jugadores.append(jugador)

        db.session.commit()
        return jsonify({'mensaje': 'Partido creado exitosamente', 'id': nuevo_partido.id}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error al crear partido: {e}")
        return jsonify({'error': str(e)}), 400


@profesor_bp.route('/partido/<int:id>', methods=['GET', 'OPTIONS'])
def detalle_partido(id):
    if request.method == 'OPTIONS':
        return '', 200

    try:
        partido = Partido.query.get_or_404(id)
        evento = getattr(partido, 'evento_rel', None)

        fecha_str = 'N/A'
        if evento and getattr(evento, 'fecha_hora', None):
            fecha_str = evento.fecha_hora.strftime('%Y-%m-%d %H:%M')

        jugadores = []
        if hasattr(partido, 'jugadores') and partido.jugadores:
            jugadores = [{
                'id': j.id,
                'nombre': j.nombre,
                'posicion': getattr(j, 'posicion', 'Sin posición')
            } for j in partido.jugadores]

        estadisticas = EstadisticaJugador.query.filter_by(partido_id=id).all()
        stats_data = [{
            'jugador_id': s.jugador_id,
            'goles': s.goles or 0,
            'asistencias': s.asistencias or 0,
            'amarillas': s.amarillas or 0,
            'rojas': s.rojas or 0,
            'pases': getattr(s, 'pases', 0),
            'asistencia': getattr(s, 'asistencia', True)
        } for s in estadisticas]

        return jsonify({
            'partido': {
                'id': partido.id,
                'rival': partido.rival,
                'resultado': partido.resultado or 'Pendiente',
                'lugar': evento.lugar if evento else 'N/A',
                'fecha': fecha_str
            },
            'jugadores': jugadores,
            'estadisticas': stats_data
        }), 200

    except Exception as e:
        print(f"Error crítico en detalle_partido: {e}")
        return jsonify({'error': str(e)}), 500


@profesor_bp.route('/partido/<int:id>/estadisticas', methods=['POST', 'OPTIONS'])
def guardar_estadisticas_partido(id):
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    jugador_id = data.get('jugador_id')

    try:
        stat = EstadisticaJugador.query.filter_by(
            jugador_id=jugador_id,
            partido_id=id
        ).first()

        if not stat:
            stat = EstadisticaJugador(jugador_id=jugador_id, partido_id=id)
            db.session.add(stat)

        stat.goles = int(data.get('goles', 0))
        stat.asistencias = int(data.get('asistencias', 0))
        stat.amarillas = int(data.get('amarillas', 0))
        stat.rojas = int(data.get('rojas', 0))
        stat.pases = int(data.get('pases', 0))
        stat.asistencia = bool(data.get('asistencia', False))

        db.session.commit()
        return jsonify({'mensaje': 'Estadísticas actualizadas'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error al guardar estadísticas: {e}")
        return jsonify({'error': str(e)}), 400


# =========================
# ENTRENAMIENTOS
# =========================
@profesor_bp.route('/entrenamientos', methods=['GET', 'OPTIONS'])
def listar_entrenamientos():
    if request.method == 'OPTIONS':
        return '', 200

    try:
        entrenamientos = Evento.query.filter_by(tipo='entrenamiento').all()
        resultado = [{
            'id': e.id,
            'lugar': e.lugar,
            'fecha_hora': e.fecha_hora.strftime('%Y-%m-%d %H:%M') if e.fecha_hora else 'N/A',
            'categoria': e.categoria_rel.nombre if e.categoria_rel else 'Sin Categoría',
            'actividades': getattr(e, 'actividades', '')
        } for e in entrenamientos]

        return jsonify(resultado), 200
    except Exception as e:
        print(f"Error al obtener entrenamientos: {e}")
        return jsonify({'error': str(e)}), 500


@profesor_bp.route('/crear_entrenamiento', methods=['POST', 'OPTIONS'])
def crear_entrenamiento():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    try:
        fecha_str = data.get('fecha')
        fecha_dt = datetime.now()
        if fecha_str:
            try:
                fecha_dt = datetime.strptime(fecha_str, '%Y-%m-%dT%H:%M')
            except ValueError:
                fecha_dt = datetime.strptime(fecha_str, '%Y-%m-%dT%H:%M:%S')

        entrenamiento = Evento(
            tipo='entrenamiento',
            fecha_hora=fecha_dt,
            lugar=data.get('lugar'),
            actividades=data.get('actividades'),
            categoria_id=data.get('categoria_id')
        )

        db.session.add(entrenamiento)
        db.session.commit()
        return jsonify({'mensaje': 'Entrenamiento creado exitosamente'}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error al crear entrenamiento: {e}")
        return jsonify({'error': str(e)}), 400


@profesor_bp.route('/entrenamiento-detalle/<int:id>', methods=['GET', 'OPTIONS'])
def detalle_entrenamiento(id):
    if request.method == 'OPTIONS':
        return '', 200

    try:
        entrenamiento = Evento.query.get(id)
        if not entrenamiento:
            return jsonify({'error': 'Entrenamiento no encontrado'}), 404

        jugadores = []
        if hasattr(entrenamiento, 'categoria_rel') and entrenamiento.categoria_rel:
            jugadores_query = getattr(entrenamiento.categoria_rel, 'jugadores', [])
            for j in jugadores_query:
                jugadores.append({
                    'id': j.id,
                    'nombre': getattr(j, 'nombre', ''),
                    'posicion': getattr(j, 'posicion', ''),
                    'estatura': getattr(j, 'estatura', 0),
                    'peso': getattr(j, 'peso', 0)
                })

        asistencias_data = []
        try:
            ids_jugadores = [j['id'] for j in jugadores]
            asistencias = Asistencia.query.filter(
                Asistencia.jugador_id.in_(ids_jugadores),
                Asistencia.tipo == 'entrenamiento'
            ).all()
            
            for a in asistencias:
                jugador_obj = Jugador.query.get(a.jugador_id)
                asistencias_data.append({
                    'jugador_id': a.jugador_id,
                    'estado': getattr(a, 'estado', 'no_asistio'),
                    'jugador': {
                        'nombre': getattr(jugador_obj, 'nombre', 'Sin nombre') if jugador_obj else 'Sin nombre',
                        'posicion': getattr(jugador_obj, 'posicion', 'N/A') if jugador_obj else 'N/A'
                    }
                })
        except Exception as e_asist:
            print(f"Error en asistencias: {e_asist}")

        fecha_str = ''
        if hasattr(entrenamiento, 'fecha_hora') and entrenamiento.fecha_hora:
            fecha_str = entrenamiento.fecha_hora.strftime('%Y-%m-%d %H:%M')

        return jsonify({
            'entrenamiento': {
                'id': entrenamiento.id,
                'lugar': getattr(entrenamiento, 'lugar', 'No especificado'),
                'fecha_hora': fecha_str,
                'actividades': getattr(entrenamiento, 'actividades', '')
            },
            'jugadores': jugadores,
            'asistencias': asistencias_data
        }), 200

    except Exception as e:
        print(f"Error en endpoint entrenamiento: {e}")
        return jsonify({'error': str(e)}), 500

@profesor_bp.route('/asistencias', methods=['POST', 'OPTIONS'])
def guardar_asistencia():
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.get_json() or {}
        
        entrenamiento_id = data.get('entrenamiento_id')
        jugador_id = data.get('jugador_id')
        estado = data.get('estado', 'asistio')
        profesor_id = session.get('user_id')

        if not jugador_id:
            return jsonify({'error': 'Falta jugador_id'}), 400

        asistencia = Asistencia.query.filter_by(
            jugador_id=jugador_id,
            tipo='entrenamiento'
        ).first()

        if asistencia:
            asistencia.estado = estado
            asistencia.fecha = datetime.utcnow()
            if profesor_id:
                asistencia.profesor_id = profesor_id
        else:
            asistencia = Asistencia(
                jugador_id=jugador_id,
                profesor_id=profesor_id,
                tipo='entrenamiento',
                estado=estado,
                fecha=datetime.utcnow()
            )
            db.session.add(asistencia)

        db.session.commit()
        return jsonify({'mensaje': 'Asistencia guardada correctamente'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error al guardar asistencia: {e}")
        return jsonify({'error': str(e)}), 500

@profesor_bp.route('/categorias', methods=['GET', 'OPTIONS'])
def obtener_categorias_profesor():
    if request.method == 'OPTIONS':
        return '', 200

    try:
        profesor_id = session.get('user_id')
        if profesor_id:
            categorias = Categoria.query.filter_by(profesor_id=profesor_id).all()
        else:
            categorias = Categoria.query.filter(Categoria.profesor_id.isnot(None)).all()

        resultado = []
        for c in categorias:
            resultado.append({
                'id': c.id,
                'nombre': c.nombre 
            })

        return jsonify(resultado), 200

    except Exception as e:
        print(f"Error al obtener categorías: {e}")
        return jsonify({'error': str(e)}), 500