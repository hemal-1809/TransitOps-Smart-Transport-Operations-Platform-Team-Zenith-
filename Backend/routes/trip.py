import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Blueprint, request, jsonify
from extensions import db
from models import Trip, Vehicle, Driver, FuelLog
from datetime import datetime
from config import Config

trip_bp = Blueprint('trip', __name__, url_prefix='/api/trips')

def send_status_email(trip_obj, status_type, final_odo=None, fuel_liters=None, fuel_cost=None):
    if not trip_obj.customer_email:
        print("No customer email registered for this trip.")
        return

    sender = Config.GMAIL_USER
    password = Config.GMAIL_PASSWORD

    if not sender or not password:
        print("SMTP credentials not configured in config.json")
        return

    recipient = trip_obj.customer_email
    subject = f"TransitOps Real-Time Update: Trip TRIP-{trip_obj.id} - {status_type.upper()}"

    # Visual HSL/Tailored HTML style matching premium TransitOps dashboard design aesthetics
    html_body = f"""
    <html>
      <body style="font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f7f2; color: #1c221e; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 30px; border-radius: 24px; border: 1px solid #e2ede4; box-shadow: 0 12px 40px rgba(28,34,30,0.04);">
          
          <div style="border-bottom: 2px solid #8ac959; padding-bottom: 20px; margin-bottom: 25px;">
            <h1 style="color: #1c221e; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
              Transit<span style="color: #8ac959;">Ops</span> Fleet Portal
            </h1>
            <p style="font-size: 10px; font-weight: 700; color: #627267; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1.5px; font-family: monospace;">
              Automated Dispatch Systems // Live Telemetry Update
            </p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <p style="font-size: 15px; font-weight: bold; margin: 0 0 12px 0;">Hello Customer,</p>
            <p style="font-size: 13.5px; color: #526357; line-height: 1.6; margin: 0;">
              Your shipment transit registry has been modified by the fleet dispatcher operations desk. Live tracking metadata is detailed below:
            </p>
          </div>

          <div style="background-color: #f9fbf9; border: 1px solid #e2ede4; border-radius: 18px; padding: 20px 25px; margin-bottom: 25px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #627267; width: 45%; text-transform: uppercase; font-size: 10px; font-family: monospace;">TRIP ID</td>
                <td style="padding: 8px 0; font-weight: 800; color: #3d7a3a; font-family: monospace; font-size: 14px;">TRIP-{trip_obj.id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #627267; text-transform: uppercase; font-size: 10px; font-family: monospace;">LIVE STATUS</td>
                <td style="padding: 8px 0; font-weight: bold;">
                  <span style="background-color: {'#edf7ec' if status_type == 'Dispatched' else '#fff0f0' if status_type == 'Cancelled' else '#e5f3f0'}; color: {'#3d7a3a' if status_type == 'Dispatched' else '#cc2929' if status_type == 'Cancelled' else '#112d26'}; padding: 4px 12px; border-radius: 12px; text-transform: uppercase; font-size: 9px; font-weight: 800; letter-spacing: 0.5px; border: 1px solid {'#d2edd0' if status_type == 'Dispatched' else '#fcd2d2' if status_type == 'Cancelled' else '#c0dfd7'};">
                    {status_type}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #627267; text-transform: uppercase; font-size: 10px; font-family: monospace;">SOURCE PORT</td>
                <td style="padding: 8px 0; color: #1c221e; font-weight: 800;">{trip_obj.source}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #627267; text-transform: uppercase; font-size: 10px; font-family: monospace;">DESTINATION DEPOT</td>
                <td style="padding: 8px 0; color: #1c221e; font-weight: 800;">{trip_obj.destination}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #627267; text-transform: uppercase; font-size: 10px; font-family: monospace;">CARGO PAYLOAD</td>
                <td style="padding: 8px 0; color: #1c221e; font-weight: bold;">{trip_obj.cargo_weight:,.0f} kg</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #627267; text-transform: uppercase; font-size: 10px; font-family: monospace;">PLANNED ROUTE DISTANCE</td>
                <td style="padding: 8px 0; color: #1c221e; font-weight: bold;">{trip_obj.planned_distance} km</td>
              </tr>
    """

    if status_type == "Completed":
        html_body += f"""
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #627267; text-transform: uppercase; font-size: 10px; font-family: monospace;">FINAL VEHICLE ODOMETER</td>
                <td style="padding: 8px 0; color: #1c221e; font-weight: 800; font-family: monospace;">{final_odo:,.0f} km</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #627267; text-transform: uppercase; font-size: 10px; font-family: monospace;">REFUEL CONSUMED</td>
                <td style="padding: 8px 0; color: #1c221e; font-weight: bold;">{fuel_liters} Liters (Total Cost: ₹{fuel_cost:,.2f})</td>
              </tr>
        """

    html_body += f"""
            </table>
          </div>

          <div style="font-size: 11px; color: #7d93a6; border-top: 1px solid #f3f7f2; padding-top: 20px; line-height: 1.5; text-align: center;">
            <p style="margin: 0 0 5px 0; font-weight: bold; color: #627267;">TransitOps Secure Alert Gate</p>
            <p style="margin: 0;">This is an automated TLS 1.3 encrypted alert regarding fleet operations. Please do not reply directly to this mail.</p>
          </div>
        </div>
      </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = recipient
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender, password)
            server.sendmail(sender, [recipient], msg.as_string())
        print(f"Operational status email successfully dispatched to {recipient}")
    except Exception as e:
        print(f"SMTP notification dispatch failure to {recipient}: {e}")


def trip_to_json(t):
    return {
        'id': f"TRIP-{t.id}",
        'vehicleReg': t.vehicle.registration_number if t.vehicle else '',
        'driverLic': t.driver.license_number if t.driver else '',
        'source': t.source,
        'destination': t.destination,
        'cargoWeight': t.cargo_weight,
        'plannedDistance': t.planned_distance,
        'status': t.status,
        'customerEmail': t.customer_email or '',
        'date': t.created_at.strftime('%Y-%m-%d') if t.created_at else ''
    }

@trip_bp.route('/', methods=['GET'])
def get_trips():
    trips = Trip.query.order_by(Trip.id.desc()).all()
    return jsonify([trip_to_json(t) for t in trips])

@trip_bp.route('/', methods=['POST'])
def dispatch_trip():
    data = request.get_json() or {}
    vehicle_reg = data.get('vehicleReg')
    driver_lic = data.get('driverLic')

    vehicle = Vehicle.query.filter_by(registration_number=vehicle_reg).first()
    driver = Driver.query.filter_by(license_number=driver_lic).first()

    if not vehicle:
        return jsonify({'error': 'Selected vehicle does not exist.'}), 400
    if not driver:
        return jsonify({'error': 'Selected driver does not exist.'}), 400

    if vehicle.status in ['In Shop', 'Retired']:
        return jsonify({'error': f'Vehicle is currently {vehicle.status} and cannot be dispatched.'}), 400
    if driver.status == 'Suspended':
        return jsonify({'error': 'Driver is suspended and cannot be assigned to any trip.'}), 400

    # Cargo weight capacity check
    cargo_weight = float(data.get('cargoWeight', 0))
    if cargo_weight > vehicle.max_capacity:
        return jsonify({'error': f'Cargo weight ({cargo_weight} kg) exceeds capacity ({vehicle.max_capacity} kg).'}), 400

    # Dispatch
    new_t = Trip(
        source=data.get('source'),
        destination=data.get('destination'),
        vehicle_id=vehicle.id,
        driver_id=driver.id,
        cargo_weight=cargo_weight,
        planned_distance=float(data.get('plannedDistance', 0)),
        customer_email=data.get('customerEmail'),
        status='Dispatched'
    )
    db.session.add(new_t)

    # Set statuses to On Trip
    vehicle.status = 'On Trip'
    driver.status = 'On Trip'

    db.session.commit()
    
    # Send dispatch email in background/safely
    send_status_email(new_t, 'Dispatched')
    
    return jsonify(trip_to_json(new_t)), 201

@trip_bp.route('/<trip_id>/complete', methods=['PUT'])
def complete_trip(trip_id):
    try:
        # Extract numeric ID from TRIP-XXXX
        db_id = int(trip_id.split('-')[1])
    except Exception:
        return jsonify({'error': 'Invalid trip ID format'}), 400

    t = Trip.query.get(db_id)
    if not t:
        return jsonify({'error': 'Trip not found'}), 404

    data = request.get_json() or {}
    final_odometer = float(data.get('finalOdometer', 0))
    fuel_liters = float(data.get('fuelLiters', 0))
    fuel_cost = float(data.get('fuelCost', 0))

    t.status = 'Completed'

    # Release vehicle and driver
    if t.vehicle:
        t.vehicle.status = 'Available' if t.vehicle.status != 'Retired' else 'Retired'
        if final_odometer > t.vehicle.odometer:
            t.vehicle.odometer = final_odometer
        else:
            t.vehicle.odometer += (t.planned_distance or 0)

        # Log fuel if liters provided
        if fuel_liters > 0:
            fl = FuelLog(
                vehicle_id=t.vehicle.id,
                liters=fuel_liters,
                cost=fuel_cost,
                description=f"Refuel automatic log from completed Trip {trip_id}"
            )
            db.session.add(fl)

    if t.driver:
        t.driver.status = 'Available'

    db.session.commit()
    
    # Send completion email safely
    send_status_email(t, 'Completed', final_odometer, fuel_liters, fuel_cost)
    
    return jsonify(trip_to_json(t))

@trip_bp.route('/<trip_id>/cancel', methods=['PUT'])
def cancel_trip(trip_id):
    try:
        db_id = int(trip_id.split('-')[1])
    except Exception:
        return jsonify({'error': 'Invalid trip ID format'}), 400

    t = Trip.query.get(db_id)
    if not t:
        return jsonify({'error': 'Trip not found'}), 404

    t.status = 'Cancelled'

    if t.vehicle:
        t.vehicle.status = 'Available'
    if t.driver:
        t.driver.status = 'Available'

    db.session.commit()
    
    # Send cancellation email safely
    send_status_email(t, 'Cancelled')
    
    return jsonify(trip_to_json(t))
