from extensions import db
from datetime import datetime

class Driver(db.Model):
    __tablename__="drivers"

    id=db.Column(db.Integer,primary_key=True)

    name=db.Column(
        db.String(100),
        nullable=False
    )

    license_number=db.Column(
        db.String(100),
        unique=True,
        nullable=False
    )

    license_category=db.Column(
        db.String(50),
        nullable=False
    )

    license_expiry=db.Column(
        db.Date,
        nullable=False
    )

    contact_number=db.Column(
        db.String(30)
    )

    safety_score=db.Column(
        db.Float,
        default=100
    )

    status=db.Column(
        db.String(20),
        default="Available"
    )

    trips=db.relationship(
        "Trip",
        backref="driver",
        lazy=True
    )