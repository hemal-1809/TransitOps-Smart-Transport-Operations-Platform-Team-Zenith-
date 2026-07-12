from flask import Blueprint, request, jsonify
from extensions import db
from models import Maintenance, Vehicle
from datetime import datetime

maintenance_bp = Blueprint('maintenance', __name__, url_prefix='/api/maintenance')

def maint_to_json(m):
    return {
        'id': f"MAIN-{m.id}",
        'vehicleReg': m.vehicle.registration_number if m.vehicle else '',
        'description': m.description,
        'cost': m.cost,
        'status': m.status,
        'progress': m.progress,
        'date': m.date.strftime('%Y-%m-%d') if m.date else ''
    }

@maintenance_bp.route('/', methods=['GET'])
def get_maintenances():
    maints = Maintenance.query.order_by(Maintenance.id.desc()).all()
    return jsonify([maint_to_json(m) for m in maints])

@maintenance_bp.route('/', methods=['POST'])
def add_maintenance():
    data = request.get_json() or {}
    reg = data.get('vehicleReg')

    vehicle = Vehicle.query.filter_by(registration_number=reg).first()
    if not vehicle:
        return jsonify({'error': 'Selected vehicle does not exist.'}), 400

    new_m = Maintenance(
        vehicle_id=vehicle.id,
        description=data.get('description', 'Maintenance Check'),
        cost=float(data.get('cost', 0)),
        status='Open',
        progress=20,
        date=datetime.utcnow().date()
    )
    db.session.add(new_m)

    # Set vehicle status to In Shop
    vehicle.status = 'In Shop'

    db.session.commit()
    return jsonify(maint_to_json(new_m)), 201

@maintenance_bp.route('/<record_id>/close', methods=['PUT'])
def close_maintenance(record_id):
    try:
        db_id = int(record_id.split('-')[1])
    except Exception:
        return jsonify({'error': 'Invalid maintenance ID format'}), 400

    m = Maintenance.query.get(db_id)
    if not m:
        return jsonify({'error': 'Maintenance record not found'}), 404

    m.status = 'Closed'
    m.progress = 100

    if m.vehicle:
        m.vehicle.status = 'Available' if m.vehicle.status != 'Retired' else 'Retired'

    db.session.commit()
    return jsonify(maint_to_json(m))

@maintenance_bp.route('/<record_id>/progress', methods=['PUT'])
def update_progress(record_id):
    try:
        db_id = int(record_id.split('-')[1])
    except Exception:
        return jsonify({'error': 'Invalid maintenance ID format'}), 400

    m = Maintenance.query.get(db_id)
    if not m:
        return jsonify({'error': 'Maintenance record not found'}), 404

    data = request.get_json() or {}
    progress_val = int(data.get('progress', 0))
    m.progress = min(100, max(0, progress_val))

    db.session.commit()
    return jsonify(maint_to_json(m))
