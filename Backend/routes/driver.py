from flask import Blueprint, request, jsonify
from extensions import db
from models.driver import Driver
from datetime import datetime

driver_bp = Blueprint('driver', __name__, url_prefix='/api/drivers')

def driver_to_json(d):
    return {
        'name': d.name,
        'licenseNumber': d.license_number,
        'licenseCategory': d.license_category,
        'licenseExpiry': d.license_expiry.strftime('%Y-%m-%d') if d.license_expiry else '',
        'contactNumber': d.contact_number,
        'safetyScore': d.safety_score,
        'status': d.status
    }

@driver_bp.route('/', methods=['GET'])
def get_drivers():
    drivers = Driver.query.all()
    return jsonify([driver_to_json(d) for d in drivers])

@driver_bp.route('/', methods=['POST'])
def add_driver():
    data = request.get_json() or {}
    lic = data.get('licenseNumber')
    if not lic:
        return jsonify({'error': 'License number is required'}), 400

    existing = Driver.query.filter_by(license_number=lic).first()
    if existing:
        return jsonify({'error': f'Driver with License Number "{lic}" already exists.'}), 400

    expiry_str = data.get('licenseExpiry')
    expiry_date = datetime.strptime(expiry_str, '%Y-%m-%d').date() if expiry_str else datetime.utcnow().date()

    new_d = Driver(
        name=data.get('name', 'Unknown Driver'),
        license_number=lic,
        license_category=data.get('licenseCategory', 'HMV'),
        license_expiry=expiry_date,
        contact_number=data.get('contactNumber', ''),
        safety_score=float(data.get('safetyScore', 100)),
        status=data.get('status', 'Available')
    )
    db.session.add(new_d)
    db.session.commit()
    return jsonify(driver_to_json(new_d)), 201

@driver_bp.route('/<license_number>', methods=['PUT'])
def update_driver(license_number):
    data = request.get_json() or {}
    d = Driver.query.filter_by(license_number=license_number).first()
    if not d:
        return jsonify({'error': 'Driver not found'}), 404

    if 'name' in data:
        d.name = data['name']
    if 'licenseCategory' in data:
        d.license_category = data['licenseCategory']
    if 'licenseExpiry' in data:
        d.license_expiry = datetime.strptime(data['licenseExpiry'], '%Y-%m-%d').date()
    if 'contactNumber' in data:
        d.contact_number = data['contactNumber']
    if 'safetyScore' in data:
        d.safety_score = float(data['safetyScore'])
    if 'status' in data:
        d.status = data['status']

    db.session.commit()
    return jsonify(driver_to_json(d))

@driver_bp.route('/<license_number>', methods=['DELETE'])
def delete_driver(license_number):
    d = Driver.query.filter_by(license_number=license_number).first()
    if not d:
        return jsonify({'error': 'Driver not found'}), 404

    db.session.delete(d)
    db.session.commit()
    return jsonify({'message': 'Driver deleted successfully'})
