from functools import wraps

from flask import jsonify, request, g

from models import User


def extract_bearer_token():
    auth_header = request.headers.get('Authorization', '')
    if auth_header.lower().startswith('bearer '):
        return auth_header[7:].strip()
    return None


def get_user_from_request():
    token = extract_bearer_token()
    if not token:
        return None
    return User.query.filter_by(auth_token=token, is_active=True).first()


def require_auth(view_func):
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        user = get_user_from_request()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401
        g.current_user = user
        return view_func(*args, **kwargs)

    return wrapper


def require_admin(view_func):
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        user = getattr(g, 'current_user', None) or get_user_from_request()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401
        if user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        g.current_user = user
        return view_func(*args, **kwargs)

    return wrapper
