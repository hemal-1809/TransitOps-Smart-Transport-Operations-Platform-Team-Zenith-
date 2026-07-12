from extensions import db
from datetime import datetime

class Maintenance(db.Model):
    __tablename__ = "maintenances"

    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey("vehicles.id"), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    cost = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default="Open")
    progress = db.Column(db.Integer, default=20)
    date = db.Column(db.Date, default=datetime.utcnow)

    # Relationship
    vehicle = db.relationship("Vehicle", backref="maintenances")
