from flask import Blueprint, request, jsonify
from extensions import db
from models.vehicle import Vehicle

vehicle_bp = Blueprint('vehicle', __name__, url_prefix='/api/vehicles')

def vehicle_to_json(v):
    return {
        'registration': v.registration_number,
        'name': v.model,
        'type': v.vehicle_type,
        'maxLoad': v.max_capacity,
        'odometer': v.odometer,
        'acquisitionCost': v.acquisition_cost,
        'status': v.status
    }

@vehicle_bp.route('/', methods=['GET'])
def get_vehicles():
    vehicles = Vehicle.query.all()
    return jsonify([vehicle_to_json(v) for v in vehicles])

@vehicle_bp.route('/', methods=['POST'])
def add_vehicle():
    data = request.get_json() or {}
    reg = data.get('registration')
    
    if not reg:
        return jsonify({'error': 'Registration number is required'}), 400

    existing = Vehicle.query.filter_by(registration_number=reg).first()
    if existing:
        return jsonify({'error': f'Vehicle with registration "{reg}" already exists.'}), 400

    new_v = Vehicle(
        registration_number=reg,
        model=data.get('name', 'Unknown Model'),
        vehicle_type=data.get('type', 'Truck'),
        max_capacity=float(data.get('maxLoad', 0)),
        odometer=float(data.get('odometer', 0)),
        acquisition_cost=float(data.get('acquisitionCost', 0)),
        status=data.get('status', 'Available')
    )
    db.session.add(new_v)
    db.session.commit()
    return jsonify(vehicle_to_json(new_v)), 201

@vehicle_bp.route('/<registration>', methods=['PUT'])
def update_vehicle(registration):
    data = request.get_json() or {}
    v = Vehicle.query.filter_by(registration_number=registration).first()
    if not v:
        return jsonify({'error': 'Vehicle not found'}), 404

    if 'name' in data:
        v.model = data['name']
    if 'type' in data:
        v.vehicle_type = data['type']
    if 'maxLoad' in data:
        v.max_capacity = float(data['maxLoad'])
    if 'odometer' in data:
        v.odometer = float(data['odometer'])
    if 'acquisitionCost' in data:
        v.acquisition_cost = float(data['acquisitionCost'])
    if 'status' in data:
        v.status = data['status']

    db.session.commit()
    return jsonify(vehicle_to_json(v))

@vehicle_bp.route('/<registration>', methods=['DELETE'])
def delete_vehicle(registration):
    v = Vehicle.query.filter_by(registration_number=registration).first()
    if not v:
        return jsonify({'error': 'Vehicle not found'}), 404

    db.session.delete(v)
    db.session.commit()
    return jsonify({'message': 'Vehicle deleted successfully'})
