import os
import json
import pymysql
from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, login_manager, migrate

# Create the database schema if it does not exist in MySQL
def create_database_if_not_exists():
    config_path = os.path.join(os.path.dirname(__file__), "config.json")
    db_user = "root"
    db_password = "Hetm189"
    db_host = "localhost"
    db_port = 3306
    db_name = "Transitops"  # Default name

    if os.path.exists(config_path):
        try:
            with open(config_path, "r") as f:
                data = json.load(f)
                uri = data.get("SQLALCHEMY_DATABASE_URI", "")
                if uri.startswith("mysql+pymysql://"):
                    
                    rest = uri[len("mysql+pymysql://"):]
                    user_pass, host_port_db = rest.split("@")
                    db_user, db_password = user_pass.split(":")
                    if "/" in host_port_db:
                        host_port, db_name = host_port_db.split("/")
                    else:
                        host_port = host_port_db
                    if ":" in host_port:
                        db_host, db_port = host_port.split(":")
                        db_port = int(db_port)
                    else:
                        db_host = host_port
        except Exception as e:
            print(f"Error parsing config.json for database auto-creation: {e}")

    try:
        conn = pymysql.connect(
            host=db_host,
            user=db_user,
            password=db_password,
            port=db_port
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        cursor.close()
        conn.close()
        print(f"Database {db_name} verified/created successfully.")
    except Exception as e:
        print(f"Could not check/create database {db_name}: {e}")

# Call creation before app boot
create_database_if_not_exists()

# Initialize app
app = Flask(__name__)
CORS(app) # Enable CORS for frontend connection

app.config.from_object(Config)

db.init_app(app)
login_manager.init_app(app)
migrate.init_app(app, db)

# Register Blueprints
from routes.auth import auth_bp
from routes.vehicle import vehicle_bp
from routes.driver import driver_bp
from routes.trip import trip_bp
from routes.maintenance import maintenance_bp
from routes.dashboard import dashboard_bp

app.register_blueprint(auth_bp)
app.register_blueprint(vehicle_bp)
app.register_blueprint(driver_bp)
app.register_blueprint(trip_bp)
app.register_blueprint(maintenance_bp)
app.register_blueprint(dashboard_bp)

from flask import jsonify

@app.route('/')
def home():
    return jsonify({
        "status": "online",
        "message": "TransitOps API Gateway",
        "endpoints": {
            "auth": "/api/auth/login",
            "vehicles": "/api/vehicles/",
            "drivers": "/api/drivers/",
            "trips": "/api/trips/",
            "maintenance": "/api/maintenance/",
            "expenses": "/api/expenses",
            "notifications": "/api/notifications"
        }
    })

# Auto-seed default records
def seed_database():
    from models import Vehicle, Driver, Trip, Maintenance, FuelLog, Expense, User, Notification
    from datetime import datetime, date
    from werkzeug.security import generate_password_hash

    # 1. Seed Vehicles
    if Vehicle.query.first() is None:
        v1 = Vehicle(registration_number='MH-12-QA-9012', model='Tata Signa 5530.S Heavy Duty', vehicle_type='Heavy Truck', max_capacity=15000.0, odometer=124500.0, acquisition_cost=4500000.0, status='Available')
        v2 = Vehicle(registration_number='DL-03-EB-4567', model='Ashok Leyland 5525 Semi-trailer', vehicle_type='Semi-Trailer', max_capacity=24000.0, odometer=89200.0, acquisition_cost=5200000.0, status='On Trip')
        v3 = Vehicle(registration_number='KA-51-MB-1122', model='Mahindra Blazo X 35 Box Truck', vehicle_type='Box Truck', max_capacity=5000.0, odometer=45600.0, acquisition_cost=3200000.0, status='Available')
        v4 = Vehicle(registration_number='HR-38-XY-8899', model='Tata Winger Cargo Van', vehicle_type='Cargo Van', max_capacity=1500.0, odometer=62100.0, acquisition_cost=1400000.0, status='In Shop')
        db.session.add_all([v1, v2, v3, v4])
        db.session.commit()
        print("Vehicles seeded.")

    # 2. Seed Drivers
    if Driver.query.first() is None:
        d1 = Driver(name='Rajesh Kumar', license_number='IND-DL03-2026-A', license_category='HMV (Heavy Motor)', license_expiry=date(2027, 9, 15), contact_number='+91 98765 43210', safety_score=94.0, status='Available')
        d2 = Driver(name='Sunita Sharma', license_number='IND-MH12-2026-B', license_category='HMV (Heavy Motor)', license_expiry=date(2026, 11, 10), contact_number='+91 87654 32109', safety_score=98.0, status='On Trip')
        d3 = Driver(name='Gurpreet Singh', license_number='IND-PB02-2026-C', license_category='LMV (Light Transport)', license_expiry=date(2025, 11, 20), contact_number='+91 76543 21098', safety_score=82.0, status='Off Duty')
        d4 = Driver(name='Amit Patel', license_number='IND-GJ01-2026-D', license_category='HMV (Heavy Motor)', license_expiry=date(2028, 3, 30), contact_number='+91 95432 10987', safety_score=68.0, status='Suspended')
        db.session.add_all([d1, d2, d3, d4])
        db.session.commit()
        print("Drivers seeded.")

    # 3. Seed Trips
    if Trip.query.first() is None:
        v_dl = Vehicle.query.filter_by(registration_number='DL-03-EB-4567').first()
        v_mh = Vehicle.query.filter_by(registration_number='MH-12-QA-9012').first()
        d_sharma = Driver.query.filter_by(license_number='IND-MH12-2026-B').first()
        d_kumar = Driver.query.filter_by(license_number='IND-DL03-2026-A').first()

        if v_dl and v_mh and d_sharma and d_kumar:
            t1 = Trip(source='Mumbai NH-4 Hub', destination='Pune Industrial Depot', vehicle_id=v_dl.id, driver_id=d_sharma.id, cargo_weight=18000.0, planned_distance=450.0, status='Dispatched')
            t2 = Trip(source='JNPT Port Navi Mumbai', destination='Delhi NCR Terminal', vehicle_id=v_mh.id, driver_id=d_kumar.id, cargo_weight=12000.0, planned_distance=350.0, status='Completed')
            db.session.add_all([t1, t2])
            db.session.commit()
            print("Trips seeded.")

    # 4. Seed Maintenance
    if Maintenance.query.first() is None:
        v_hr = Vehicle.query.filter_by(registration_number='HR-38-XY-8899').first()
        v_mh = Vehicle.query.filter_by(registration_number='MH-12-QA-9012').first()
        if v_hr and v_mh:
            m1 = Maintenance(vehicle_id=v_hr.id, description='Transmission Fluid Leak & Clutch replacement', cost=45000.0, status='Open', progress=40, date=date(2026, 7, 10))
            m2 = Maintenance(vehicle_id=v_mh.id, description='Brake Pad Service & Tyre Rotation', cost=25000.0, status='Closed', progress=100, date=date(2026, 7, 5))
            db.session.add_all([m1, m2])
            db.session.commit()
            print("Maintenance seeded.")

    # 5. Seed Fuel & Expenses
    if FuelLog.query.first() is None and Expense.query.first() is None:
        v_mh = Vehicle.query.filter_by(registration_number='MH-12-QA-9012').first()
        v_dl = Vehicle.query.filter_by(registration_number='DL-03-EB-4567').first()
        v_ka = Vehicle.query.filter_by(registration_number='KA-51-MB-1122').first()
        v_hr = Vehicle.query.filter_by(registration_number='HR-38-XY-8899').first()

        if v_mh and v_dl and v_ka and v_hr:
            fl1 = FuelLog(vehicle_id=v_mh.id, date=date(2026, 7, 8), liters=120.0, cost=11400.0, description='HP Fuel Station #14')
            fl2 = FuelLog(vehicle_id=v_dl.id, date=date(2026, 7, 10), liters=210.0, cost=19950.0, description='IndianOil Regional Depot')
            e1 = Expense(vehicle_id=v_ka.id, date=date(2026, 7, 5), cost=1200.0, description='NHAI Fastag Toll Plaza Charge')
            e2 = Expense(vehicle_id=v_hr.id, date=date(2026, 7, 9), cost=1500.0, description='Heavy Truck Wiper Replacements')
            db.session.add_all([fl1, fl2, e1, e2])
            db.session.commit()
            print("Expenses/Fuel seeded.")

    # 6. Seed Users
    if User.query.first() is None:
        u1 = User(name='Fleet Manager', email='manager@transitops.com', password=generate_password_hash('secret_token_123'), role='Fleet Manager')
        u2 = User(name='Dispatcher', email='dispatcher@transitops.com', password=generate_password_hash('secret_token_123'), role='Dispatcher')
        u3 = User(name='Safety Officer', email='safety@transitops.com', password=generate_password_hash('secret_token_123'), role='Safety Officer')
        u4 = User(name='Financial Analyst', email='finance@transitops.com', password=generate_password_hash('secret_token_123'), role='Financial Analyst')
        db.session.add_all([u1, u2, u3, u4])
        db.session.commit()
        print("Users seeded.")

    # 7. Seed Notifications
    if Notification.query.first() is None:
        n1 = Notification(text="HMV License Expiry Warning: Gurpreet Singh's transport permit (IND-PB02-2026-C) expired on 2025-11-20.", type="danger", date=date(2026, 7, 11), read=False, view="drivers")
        n2 = Notification(text="Fleet Workshop alert: HR-38-XY-8899 (Tata Winger Cargo Van) has entered Shop for clutch leak repairs.", type="warning", date=date(2026, 7, 11), read=False, view="maintenance")
        n3 = Notification(text="Route Dispatched: TRIP-1001 safely deployed from Mumbai NH-4 Hub to Pune Industrial Depot.", type="success", date=date(2026, 7, 11), read=True, view="trips")
        n4 = Notification(text="Preventative Maintenance: MH-12-QA-9012 odometer exceeds 124K, scheduler recommends tyre check and brake inspections.", type="info", date=date(2026, 7, 10), read=False, view="vehicles")
        db.session.add_all([n1, n2, n3, n4])
        db.session.commit()
        print("Notifications seeded.")

with app.app_context():
    # Import all models to ensure they are registered on the metadata before calling create_all
    import models
    db.create_all()
    seed_database()

if __name__ == "__main__":
    app.run(debug=True, port=5000)