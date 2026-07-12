from extensions import db
from datetime import datetime

class Expense(db.Model):
    __tablename__ = "expenses"

    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey("vehicles.id"), nullable=False)
    cost = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(255), nullable=False)
    date = db.Column(db.Date, default=datetime.utcnow)

    # Relationship
    vehicle = db.relationship("Vehicle", backref="expenses")
