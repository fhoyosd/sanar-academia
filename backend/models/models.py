from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

from datetime import datetime
stats_partido = db.Table('stats_partido',
    db.Column('jugador_id', db.Integer, db.ForeignKey('jugador.id'), primary_key=True),
    db.Column('partido_id', db.Integer, db.ForeignKey('partido.id'), primary_key=True),
    db.Column('goles', db.Integer, default=0),
    db.Column('asistencias', db.Integer, default=0),
    db.Column('amarillas', db.Integer, default=0),
    db.Column('rojas', db.Integer, default=0)
)

jugadores_partido = db.Table(
    'jugadores_partido',

    db.Column(
        'jugador_id',
        db.Integer,
        db.ForeignKey('jugador.id')
    ),

    db.Column(
        'partido_id',
        db.Integer,
        db.ForeignKey('partido.id')
    )
)

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre_usuario = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(20), nullable=False)
    nombre_completo = db.Column(db.String(100))

    hijos = db.relationship('Jugador', backref='acudiente', lazy=True)
    categorias_dirigidas = db.relationship('Categoria', backref='profesor', lazy=True)

class Categoria(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    profesor_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    jugadores = db.relationship('Jugador', backref='categoria_rel', lazy=True)
    eventos = db.relationship('Evento', backref='categoria_rel', lazy=True)

class Jugador(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    fecha_nacimiento = db.Column(db.Date, nullable=False)
    estatura = db.Column(db.Float)
    peso = db.Column(db.Float)
    posicion = db.Column(db.String(50))
    acudiente_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    categoria_id = db.Column(db.Integer, db.ForeignKey('categoria.id'))
    
    pagos = db.relationship('Pago', backref='jugador', lazy=True)

class Evento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(20))
    fecha_hora = db.Column(db.DateTime, nullable=False)
    lugar = db.Column(db.String(100))
    categoria_id = db.Column(db.Integer, db.ForeignKey('categoria.id'))

    actividades = db.Column(db.Text)

    detalles_partido = db.relationship(
        'Partido',
        backref='evento_rel',
        uselist=False
    )

class Partido(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    evento_id = db.Column(db.Integer, db.ForeignKey('evento.id'))
    rival = db.Column(db.String(100))
    resultado = db.Column(db.String(20))

    jugadores = db.relationship(
        'Jugador',
        secondary=jugadores_partido,
        backref='partidos_convocados'
    )

class Pago(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    mes = db.Column(db.String(20)) 
    monto = db.Column(db.Float, nullable=False)
    estado = db.Column(db.String(20), default='Pendiente') 
    comprobante_img = db.Column(db.String(255))
    fecha_pago = db.Column(db.DateTime, default=datetime.utcnow)
    jugador_id = db.Column(db.Integer, db.ForeignKey('jugador.id'))

class Observacion(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    comentario = db.Column(db.Text, nullable=False)
    fortalezas = db.Column(db.Text)
    aspectos_mejorar = db.Column(db.Text)
    rendimiento = db.Column(db.String(50))

    fecha = db.Column(db.DateTime, default=datetime.utcnow)

    jugador_id = db.Column(db.Integer, db.ForeignKey('jugador.id'))
    profesor_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))

class Asistencia(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    tipo = db.Column(db.String(20))  
    # entrenamiento o partido

    estado = db.Column(db.String(20))  
    # asistió / no asistió

    fecha = db.Column(db.DateTime, default=datetime.utcnow)

    jugador_id = db.Column(db.Integer, db.ForeignKey('jugador.id'))
    profesor_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))

class EstadisticaJugador(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    jugador_id = db.Column(
        db.Integer,
        db.ForeignKey('jugador.id')
    )

    partido_id = db.Column(
        db.Integer,
        db.ForeignKey('partido.id')
    )

    goles = db.Column(db.Integer, default=0)
    asistencias = db.Column(db.Integer, default=0)
    amarillas = db.Column(db.Integer, default=0)
    rojas = db.Column(db.Integer, default=0)
    pases = db.Column(db.Integer, default=0)

    asistencia = db.Column(db.Boolean, default=True)

    jugador = db.relationship('Jugador')
    partido = db.relationship('Partido')

