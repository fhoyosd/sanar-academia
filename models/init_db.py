from app import create_app, db
from models.models import Usuario

app = create_app()

with app.app_context():
    # Crear las tablas en SQLite
    db.create_all()

    # Verificar si existen usuarios
    if not Usuario.query.first():
        admin = Usuario(
            nombre_usuario='admin',
            password='123',
            rol='admin',
            nombre_completo='Administrador Principal'
        )
        
        profesor = Usuario(
            nombre_usuario='profe',
            password='123',
            rol='profesor',
            nombre_completo='Profesor Juan'
        )

        db.session.add(admin)
        db.session.add(profesor)
        db.session.commit()
        print("✅ Base de datos inicializada con usuarios de prueba (admin y profe).")
    else:
        print("ℹ️ La base de datos ya contiene registros.")