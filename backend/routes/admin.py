from flask import Blueprint, jsonify, request
from models.models import db, Usuario, Categoria, Jugador, Pago
from datetime import datetime

admin_bp = Blueprint('admin', __name__)

# ==========================================
# DASHBOARD
# ==========================================
@admin_bp.route('/dashboard', methods=['GET'])
def dashboard():
    conteo = {
        'usuarios': Usuario.query.count(),
        'jugadores': Jugador.query.count(),
        'categorias': Categoria.query.count()
    }
    return jsonify(conteo), 200


# ==========================================
# GESTIÓN DE USUARIOS
# ==========================================
@admin_bp.route('/usuarios', methods=['GET'])
def listar_usuarios():
    usuarios = Usuario.query.all()
    resultado = [{
        'id': u.id,
        'nombre_usuario': u.nombre_usuario,
        'nombre_completo': u.nombre_completo,
        'rol': u.rol
    } for u in usuarios]
    return jsonify(resultado), 200

@admin_bp.route('/usuarios/nuevo', methods=['POST'])
def crear_usuario():
    data = request.get_json() or {}
    
    nuevo_user = Usuario(
        nombre_usuario=data.get('username'),
        password=data.get('password'),
        rol=data.get('rol'),
        nombre_completo=data.get('nombre')
    )
    db.session.add(nuevo_user)
    db.session.commit()
    return jsonify({'mensaje': 'Usuario creado exitosamente'}), 201

@admin_bp.route('/usuarios/editar/<int:id>', methods=['PUT'])
def editar_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    data = request.get_json() or {}

    usuario.nombre_completo = data.get('nombre', usuario.nombre_completo)
    usuario.nombre_usuario = data.get('username', usuario.nombre_usuario)
    usuario.rol = data.get('rol', usuario.rol)
    
    if data.get('password'):  # Solo cambia si se envía un valor
        usuario.password = data.get('password')

    db.session.commit()
    return jsonify({'mensaje': 'Usuario actualizado correctamente'}), 200

@admin_bp.route('/usuarios/eliminar/<int:id>', methods=['DELETE'])
def eliminar_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    if usuario.nombre_usuario == 'admin':
        return jsonify({'error': 'No puedes eliminar al administrador principal'}), 400

    db.session.delete(usuario)
    db.session.commit()
    return jsonify({'mensaje': 'Usuario eliminado correctamente'}), 200

# ==========================================
# GESTIÓN DE JUGADORES
# ==========================================
@admin_bp.route('/jugadores', methods=['GET'])
def listar_jugadores():
    try:
        jugadores = Jugador.query.all()
        resultado = []
        for j in jugadores:
            acudiente_nom = j.acudiente.nombre_completo if hasattr(j, 'acudiente') and j.acudiente else 'Sin Acudiente'
            categoria_nom = j.categoria_rel.nombre if hasattr(j, 'categoria_rel') and j.categoria_rel else 'Sin Categoría'

            resultado.append({
                'id': j.id,
                'nombre': j.nombre,
                'fecha_nacimiento': j.fecha_nacimiento.strftime('%Y-%m-%d') if j.fecha_nacimiento else None,
                'estatura': j.estatura,
                'peso': j.peso,
                'posicion': j.posicion,
                'acudiente_id': j.acudiente_id,
                'acudiente': acudiente_nom,
                'categoria_id': j.categoria_id,
                'categoria': categoria_nom
            })
        return jsonify(resultado), 200
    except Exception as e:
        print(f"Error al listar jugadores: {e}")
        return jsonify({'error': str(e)}), 500


# OBTENER JUGADOR POR ID (Necesario para cargar el formulario de edición)
@admin_bp.route('/jugadores/<int:id>', methods=['GET'])
def obtener_jugador(id):
    try:
        jugador = Jugador.query.get_or_404(id)
        return jsonify({
            'id': jugador.id,
            'nombre': jugador.nombre,
            'fecha_nacimiento': jugador.fecha_nacimiento.strftime('%Y-%m-%d') if jugador.fecha_nacimiento else '',
            'estatura': jugador.estatura,
            'peso': jugador.peso,
            'posicion': jugador.posicion or '',
            'acudiente_id': jugador.acudiente_id,
            'categoria_id': jugador.categoria_id
        }), 200
    except Exception as e:
        print(f"Error al obtener jugador: {e}")
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/jugadores/nuevo', methods=['POST'])
def crear_jugador():
    data = request.get_json() or {}
    
    try:
        fecha_str = data.get('fecha_nacimiento')
        fecha_dt = None
        if fecha_str and fecha_str.strip():
            fecha_dt = datetime.strptime(fecha_str, '%Y-%m-%d').date()

        acudiente_id = int(data.get('acudiente_id')) if data.get('acudiente_id') else None
        categoria_id = int(data.get('categoria_id')) if data.get('categoria_id') else None

        nuevo_jugador = Jugador(
            nombre=data.get('nombre'),
            fecha_nacimiento=fecha_dt,
            estatura=float(data.get('estatura')) if data.get('estatura') else None,
            peso=float(data.get('peso')) if data.get('peso') else None,
            posicion=data.get('posicion'),
            acudiente_id=acudiente_id,
            categoria_id=categoria_id
        )

        db.session.add(nuevo_jugador)
        db.session.commit()
        return jsonify({'mensaje': 'Jugador inscrito correctamente'}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error al crear jugador: {e}")
        return jsonify({'error': f'Error al guardar en base de datos: {str(e)}'}), 400


@admin_bp.route('/jugadores/editar/<int:id>', methods=['PUT'])
def editar_jugador(id):
    data = request.get_json() or {}

    try:
        jugador = Jugador.query.get_or_404(id)

        fecha_str = data.get('fecha_nacimiento')
        if fecha_str and str(fecha_str).strip():
            jugador.fecha_nacimiento = datetime.strptime(fecha_str, '%Y-%m-%d').date()

        jugador.nombre = data.get('nombre', jugador.nombre)
        jugador.estatura = float(data.get('estatura')) if data.get('estatura') else None
        jugador.peso = float(data.get('peso')) if data.get('peso') else None
        jugador.posicion = data.get('posicion', jugador.posicion)

        if data.get('acudiente_id'):
            jugador.acudiente_id = int(data.get('acudiente_id'))
        if data.get('categoria_id'):
            jugador.categoria_id = int(data.get('categoria_id'))

        db.session.commit()
        return jsonify({'mensaje': 'Jugador actualizado correctamente'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error al editar jugador: {e}")
        return jsonify({'error': str(e)}), 400


@admin_bp.route('/jugadores/eliminar/<int:id>', methods=['DELETE'])
def eliminar_jugador(id):
    try:
        jugador = Jugador.query.get_or_404(id)
        
        # 1. Eliminamos los pagos asociados si existen
        Pago.query.filter_by(jugador_id=id).delete()

        # 2. Eliminamos el jugador
        db.session.delete(jugador)
        db.session.commit()
        return jsonify({'mensaje': 'Jugador eliminado correctamente'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error al eliminar jugador: {e}")
        return jsonify({'error': f'No se pudo eliminar: {str(e)}'}), 500

# ==========================================
# GESTIÓN DE PAGOS
# ==========================================
@admin_bp.route('/pagos', methods=['GET'])
def listar_pagos():
    try:
        pagos = Pago.query.all()
        resultado = []
        for p in pagos:
            resultado.append({
                'id': p.id,
                'monto': p.monto,
                'fecha_pago': p.fecha_pago.strftime('%Y-%m-%d') if p.fecha_pago else None,
                'concepto': getattr(p, 'concepto', 'Cuota / Mensualidad'),
                'estado': getattr(p, 'estado', 'Completado'),
                'jugador_id': p.jugador_id,
                'jugador_nombre': p.jugador.nombre if p.jugador else 'Desconocido'
            })
        return jsonify(resultado), 200
    except Exception as e:
        print(f"Error al listar pagos: {e}")
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/pagos/nuevo', methods=['POST'])
def registrar_pago():
    data = request.get_json() or {}
    try:
        fecha_str = data.get('fecha_pago')
        fecha_dt = datetime.strptime(fecha_str, '%Y-%m-%d').date() if fecha_str else datetime.now().date()

        nuevo_pago = Pago(
            monto=float(data.get('monto')),
            fecha_pago=fecha_dt,
            jugador_id=int(data.get('jugador_id'))
        )

        db.session.add(nuevo_pago)
        db.session.commit()
        return jsonify({'mensaje': 'Pago registrado con éxito'}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error al registrar pago: {e}")
        return jsonify({'error': f'No se pudo registrar el pago: {str(e)}'}), 400

# ==========================================
# DETALLE Y REGISTRO DE PAGOS POR JUGADOR
# ==========================================
@admin_bp.route('/jugadores/<int:id>/pagos', methods=['GET'])
def obtener_pagos_jugador(id):
    try:
        jugador = Jugador.query.get_or_404(id)
        pagos = Pago.query.filter_by(jugador_id=id).order_by(Pago.id.desc()).all()
        
        historial = []
        for p in pagos:
            historial.append({
                'id': p.id,
                'monto': p.monto,
                'fecha_pago': p.fecha_pago.strftime('%Y-%m-%d') if p.fecha_pago else None,
                'concepto': getattr(p, 'concepto', 'Mensualidad'),
                'estado': 'Completado'
            })
            
        return jsonify({
            'jugador': {'id': jugador.id, 'nombre': jugador.nombre},
            'historial': historial
        }), 200
    except Exception as e:
        print(f"Error al obtener pagos: {e}")
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/jugadores/<int:id>/pagos/nuevo', methods=['POST'])
def registrar_pago_jugador(id):
    data = request.get_json() or {}
    try:
        fecha_str = data.get('fecha_pago') or datetime.now().strftime('%Y-%m-%d')
        fecha_dt = datetime.strptime(fecha_str, '%Y-%m-%d').date()

        nuevo_pago = Pago(
            monto=float(data.get('monto', 0)),
            fecha_pago=fecha_dt,
            concepto=data.get('mes', 'Mensualidad'),  # Guarda el mes seleccionado si tu modelo tiene concepto
            jugador_id=id
        )

        db.session.add(nuevo_pago)
        db.session.commit()
        return jsonify({'mensaje': 'Pago registrado con éxito'}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error al registrar pago: {e}")
        return jsonify({'error': f'No se pudo registrar el pago: {str(e)}'}), 400

# ==========================================
# AUXILIARES PARA FORMULARIOS
# ==========================================
@admin_bp.route('/acudientes', methods=['GET'])
def listar_acudientes():
    # Obtiene solo usuarios con rol 'acudiente'
    acudientes = Usuario.query.filter_by(rol='acudiente').all()
    resultado = [{'id': a.id, 'nombre_completo': a.nombre_completo} for a in acudientes]
    return jsonify(resultado), 200

# =========================
# CATEGORÍAS
# =========================

@admin_bp.route('/categorias', methods=['GET'])
def listar_categorias():
    try:
        categorias = Categoria.query.all()
        resultado = [{
            'id': c.id, 
            'nombre': c.nombre,
            'profesor_id': c.profesor_id
        } for c in categorias]
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/categorias/nueva', methods=['POST', 'OPTIONS'])
def crear_categoria():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    nombre = data.get('nombre')
    profesor_id = data.get('profesor_id')

    if not nombre:
        return jsonify({'error': 'El nombre de la categoría es obligatorio'}), 400

    try:
        nueva_cat = Categoria(
            nombre=nombre,
            profesor_id=profesor_id if profesor_id else None
        )
        db.session.add(nueva_cat)
        db.session.commit()
        return jsonify({'mensaje': 'Categoría creada con éxito', 'id': nueva_cat.id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error al crear categoría: {e}")
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/categorias/<int:id>', methods=['GET', 'PUT', 'DELETE', 'OPTIONS'])
def gestionar_categoria(id):
    if request.method == 'OPTIONS':
        return '', 200

    categoria = Categoria.query.get_or_404(id)

    if request.method == 'GET':
        return jsonify({
            'id': categoria.id,
            'nombre': categoria.nombre,
            'profesor_id': categoria.profesor_id
        }), 200

    elif request.method == 'PUT':
        data = request.get_json() or {}
        categoria.nombre = data.get('nombre', categoria.nombre)
        categoria.profesor_id = data.get('profesor_id', categoria.profesor_id)

        try:
            db.session.commit()
            return jsonify({'mensaje': 'Categoría actualizada con éxito'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    elif request.method == 'DELETE':
        try:
            db.session.delete(categoria)
            db.session.commit()
            return jsonify({'mensaje': 'Categoría eliminada con éxito'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

# ==========================================
# AUXILIAR PARA SELECCIÓN DE PROFESORES
# ==========================================
@admin_bp.route('/profesores', methods=['GET'])
def listar_profesores():
    # Consulta a los usuarios cuya función/rol sea 'profesor'
    profesores = Usuario.query.filter_by(rol='profesor').all()
    resultado = [{'id': p.id, 'nombre_completo': p.nombre_completo} for p in profesores]
    return jsonify(resultado), 200