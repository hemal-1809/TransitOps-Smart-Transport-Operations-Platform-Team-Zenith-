from extensions import db
from datetime import datetime

class Trip(db.Model):

    __tablename__="trips"

    id=db.Column(db.Integer,primary_key=True)
     
    source=db.Column(
        db.String(100),
        nullable=False
    )

    destination=db.Column(
        db.String(100),
        nullable=False
    )

    vehicle_id=db.Column(
        db.Integer,
        db.ForeignKey("vehicles.id"),
        nullable=False
    )

    driver_id=db.Column(
        db.Integer,
        db.ForeignKey("drivers.id"),
        nullable=False
    )

    cargo_weight=db.Column(
        db.Float,
        nullable=False
    )

    planned_distance=db.Column(
        db.Float
        )
    
    status=db.Column(
        db.String(20),
        default="Draft"
    )

    customer_email=db.Column(
        db.String(120),
        nullable=True
    )

    created_at=db.Column(
        db.DateTime,
        default=datetime.utcnow
    )