from app import create_app
from models.models import db
from sqlalchemy import inspect, text

app = create_app()


def migrar_columnas():
    """Agrega columnas nuevas a una base SQLite ya existente (create_all no altera tablas)."""
    inspector = inspect(db.engine)
    columnas = [c['name'] for c in inspector.get_columns('asistencia')]
    if 'evento_id' not in columnas:
        with db.engine.begin() as conn:
            conn.execute(text('ALTER TABLE asistencia ADD COLUMN evento_id INTEGER'))


if __name__ == '__main__':
    # Crea las tablas que aún no existan, incluida la tabla de avisos.
    with app.app_context():
        db.create_all()
        migrar_columnas()
    app.run(debug=True, port=5000, host='127.0.0.1')
