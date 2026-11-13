from flask import Blueprint, jsonify

main_bp = Blueprint('main', __name__)

@main_bp.route('/', methods=['GET'])
def index():
    return jsonify({
        "mensaje": "Bienvenido al Backend de Sanar FC",
        "estado": "Online",
        "version": "1.0"
    }), 200