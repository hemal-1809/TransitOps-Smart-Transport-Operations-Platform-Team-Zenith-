from flask import Blueprint, request, jsonify
from extensions import db
from models.user import User
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Please provide email and password'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid email or password'}), 401

    return jsonify({
        'email': user.email,
        'role': user.role,
        'name': user.name
    })

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'Fleet Manager')

    if not name or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'User with this email already exists'}), 400

    new_user = User(
        name=name,
        email=email,
        password=generate_password_hash(password),
        role=role
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'email': new_user.email,
        'role': new_user.role,
        'name': new_user.name
    }), 201
