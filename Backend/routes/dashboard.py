from flask import Blueprint, request, jsonify
from extensions import db
from models import FuelLog, Expense, Notification, Vehicle
from datetime import datetime

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api')

@dashboard_bp.route('/expenses', methods=['GET'])
def get_expenses():
    fuel_logs = FuelLog.query.order_by(FuelLog.id.desc()).all()
    expenses = Expense.query.order_by(Expense.id.desc()).all()

    combined = []
    
    for fl in fuel_logs:
        combined.append({
            'id': f"EXP-{fl.id}",
            'vehicleReg': fl.vehicle.registration_number if fl.vehicle else '',
            'date': fl.date.strftime('%Y-%m-%d') if fl.date else '',
            'type': 'Fuel',
            'liters': fl.liters,
            'cost': fl.cost,
            'description': fl.description or 'HP Fuel Station'
        })
        
    for e in expenses:
        combined.append({
            'id': f"EXP-{1000 + e.id}", # Offset other expenses to prevent ID clashes in state
            'vehicleReg': e.vehicle.registration_number if e.vehicle else '',
            'date': e.date.strftime('%Y-%m-%d') if e.date else '',
            'type': 'Expense',
            'liters': 0,
            'cost': e.cost,
            'description': e.description
        })

    # Sort combined by date descending or id descending
    combined.sort(key=lambda x: x['date'], reverse=True)
    return jsonify(combined)

@dashboard_bp.route('/expenses/fuel', methods=['POST'])
def add_fuel_log():
    data = request.get_json() or {}
    reg = data.get('vehicleReg')

    vehicle = Vehicle.query.filter_by(registration_number=reg).first()
    if not vehicle:
        return jsonify({'error': 'Selected vehicle does not exist.'}), 400

    fl = FuelLog(
        vehicle_id=vehicle.id,
        liters=float(data.get('liters', 0)),
        cost=float(data.get('cost', 0)),
        description=data.get('description', 'Fuel station log'),
        date=datetime.utcnow().date()
    )
    db.session.add(fl)
    db.session.commit()

    return jsonify({
        'id': f"EXP-{fl.id}",
        'vehicleReg': vehicle.registration_number,
        'date': fl.date.strftime('%Y-%m-%d'),
        'type': 'Fuel',
        'liters': fl.liters,
        'cost': fl.cost,
        'description': fl.description
    }), 201

@dashboard_bp.route('/expenses/other', methods=['POST'])
def add_misc_expense():
    data = request.get_json() or {}
    reg = data.get('vehicleReg')

    vehicle = Vehicle.query.filter_by(registration_number=reg).first()
    if not vehicle:
        return jsonify({'error': 'Selected vehicle does not exist.'}), 400

    e = Expense(
        vehicle_id=vehicle.id,
        cost=float(data.get('cost', 0)),
        description=data.get('description', 'Miscellaneous charges'),
        date=datetime.utcnow().date()
    )
    db.session.add(e)
    db.session.commit()

    return jsonify({
        'id': f"EXP-{1000 + e.id}",
        'vehicleReg': vehicle.registration_number,
        'date': e.date.strftime('%Y-%m-%d'),
        'type': 'Expense',
        'liters': 0,
        'cost': e.cost,
        'description': e.description
    }), 201

@dashboard_bp.route('/notifications', methods=['GET'])
def get_notifications():
    notifs = Notification.query.order_by(Notification.id.desc()).all()
    return jsonify([{
        'id': f"notif-{n.id}",
        'text': n.text,
        'type': n.type,
        'date': n.date.strftime('%Y-%m-%d') if n.date else '',
        'read': n.read,
        'view': n.view
    } for n in notifs])

@dashboard_bp.route('/notifications', methods=['POST'])
def add_notification():
    data = request.get_json() or {}
    n = Notification(
        text=data.get('text', ''),
        type=data.get('type', 'info'),
        view=data.get('view', 'dashboard'),
        date=datetime.utcnow().date()
    )
    db.session.add(n)
    db.session.commit()
    return jsonify({
        'id': f"notif-{n.id}",
        'text': n.text,
        'type': n.type,
        'date': n.date.strftime('%Y-%m-%d'),
        'read': n.read,
        'view': n.view
    }), 201

@dashboard_bp.route('/notifications/<notif_id>/read', methods=['PUT'])
def mark_notification_read(notif_id):
    try:
        db_id = int(notif_id.split('-')[1])
    except Exception:
        return jsonify({'error': 'Invalid notification ID format'}), 400

    n = Notification.query.get(db_id)
    if not n:
        return jsonify({'error': 'Notification not found'}), 404

    n.read = True
    db.session.commit()
    return jsonify({'message': 'Notification marked as read'})

@dashboard_bp.route('/notifications/<notif_id>', methods=['DELETE'])
def delete_notification(notif_id):
    try:
        db_id = int(notif_id.split('-')[1])
    except Exception:
        return jsonify({'error': 'Invalid notification ID format'}), 400

    n = Notification.query.get(db_id)
    if not n:
        return jsonify({'error': 'Notification not found'}), 404

    db.session.delete(n)
    db.session.commit()
    return jsonify({'message': 'Notification deleted successfully'})

@dashboard_bp.route('/notifications/clear', methods=['DELETE'])
def clear_all_notifications():
    Notification.query.delete()
    db.session.commit()
    return jsonify({'message': 'All notifications cleared'})
