from app import create_app
from models.models import db

app = create_app()

if __name__ == '__main__':
    # Crea las tablas que aún no existan, incluida la tabla de avisos.
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000, host='127.0.0.1')
