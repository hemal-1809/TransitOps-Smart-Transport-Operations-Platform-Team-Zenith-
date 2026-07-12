from extensions import db
from datetime import datetime

class FuelLog(db.Model):
    __tablename__ = "fuel_logs"

    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey("vehicles.id"), nullable=False)
    liters = db.Column(db.Float, nullable=False)
    cost = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(255))
    date = db.Column(db.Date, default=datetime.utcnow)

    # Relationship
    vehicle = db.relationship("Vehicle", backref="fuel_logs")
