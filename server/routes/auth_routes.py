"""Authentication and user management routes."""

from datetime import datetime
import os

from flask import Blueprint, jsonify, request, g
from sqlalchemy.exc import IntegrityError

from auth_utils import require_admin, require_auth
from models import db, User

auth_bp = Blueprint('auth', __name__)


def _normalize_role(role):
    role_value = (role or 'teacher').strip().lower()
    if role_value not in {'admin', 'teacher'}:
        return None
    return role_value


def ensure_default_admin():
    if User.query.filter_by(role='admin').first():
        return None

    base_username = os.environ.get('DEFAULT_ADMIN_USERNAME', 'admin')
    password = os.environ.get('DEFAULT_ADMIN_PASSWORD', 'admin123')
    full_name = os.environ.get('DEFAULT_ADMIN_FULL_NAME', 'System Administrator')

    username = base_username
    suffix = 1
    while User.query.filter_by(username=username).first():
        username = f'{base_username}{suffix}'
        suffix += 1

    admin_user = User(
        username=username,
        full_name=full_name,
        role='admin',
        is_active=True,
    )
    admin_user.set_password(password)
    db.session.add(admin_user)
    db.session.commit()
    return {'username': username, 'password': password}


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''

    if not username or not password:
        return jsonify({'success': False, 'error': 'Username and password are required'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.is_active or not user.check_password(password):
        return jsonify({'success': False, 'error': 'Invalid username or password'}), 401

    token = user.issue_token()
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict(),
    })


@auth_bp.route('/logout', methods=['POST'])
@require_auth
def logout():
    user = g.current_user
    user.revoke_token()
    db.session.commit()
    return jsonify({'success': True, 'message': 'Logged out successfully'})


@auth_bp.route('/me', methods=['GET'])
@require_auth
def me():
    return jsonify({'success': True, 'user': g.current_user.to_dict()})


@auth_bp.route('/profile', methods=['PUT'])
@require_auth
def update_profile():
    user = g.current_user
    data = request.get_json(silent=True) or {}

    full_name = data.get('full_name')
    password = data.get('password')

    if full_name is not None:
        if not str(full_name).strip():
            return jsonify({'success': False, 'error': 'Full name cannot be empty'}), 400
        user.full_name = str(full_name).strip()

    if password:
        if len(password) < 8:
            return jsonify({'success': False, 'error': 'Password must be at least 8 characters long'}), 400
        user.set_password(password)

    user.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({'success': True, 'message': 'Profile updated successfully', 'user': user.to_dict()})


@auth_bp.route('/users', methods=['GET'])
@require_admin
def list_users():
    users = User.query.order_by(User.role, User.full_name, User.username).all()
    return jsonify({'success': True, 'users': [user.to_dict() for user in users]})


@auth_bp.route('/users', methods=['POST'])
@require_admin
def create_user():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    full_name = (data.get('full_name') or '').strip()
    password = data.get('password') or ''
    role = _normalize_role(data.get('role'))

    if not username or not full_name or not password:
        return jsonify({'success': False, 'error': 'Username, full name, and password are required'}), 400
    if len(password) < 8:
        return jsonify({'success': False, 'error': 'Password must be at least 8 characters long'}), 400
    if role is None:
        return jsonify({'success': False, 'error': 'Invalid role'}), 400

    user = User(username=username, full_name=full_name, role=role, is_active=bool(data.get('is_active', True)))
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Username already exists'}), 400

    return jsonify({'success': True, 'message': 'User created successfully', 'user': user.to_dict()}), 201


@auth_bp.route('/users/<int:user_id>', methods=['PUT'])
@require_admin
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json(silent=True) or {}

    if 'username' in data:
        new_username = (data.get('username') or '').strip()
        if not new_username:
            return jsonify({'success': False, 'error': 'Username cannot be empty'}), 400
        user.username = new_username

    if 'full_name' in data:
        new_full_name = (data.get('full_name') or '').strip()
        if not new_full_name:
            return jsonify({'success': False, 'error': 'Full name cannot be empty'}), 400
        user.full_name = new_full_name

    if 'role' in data:
        role = _normalize_role(data.get('role'))
        if role is None:
            return jsonify({'success': False, 'error': 'Invalid role'}), 400
        user.role = role

    if 'is_active' in data:
        user.is_active = bool(data.get('is_active'))

    if data.get('password'):
        password = data.get('password') or ''
        if len(password) < 8:
            return jsonify({'success': False, 'error': 'Password must be at least 8 characters long'}), 400
        user.set_password(password)

    user.updated_at = datetime.utcnow()

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Username already exists'}), 400

    return jsonify({'success': True, 'message': 'User updated successfully', 'user': user.to_dict()})


@auth_bp.route('/users/<int:user_id>', methods=['DELETE'])
@require_admin
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    if g.current_user.id == user.id:
        return jsonify({'success': False, 'error': 'You cannot delete your own account'}), 400

    db.session.delete(user)
    db.session.commit()
    return jsonify({'success': True, 'message': 'User deleted successfully'})
