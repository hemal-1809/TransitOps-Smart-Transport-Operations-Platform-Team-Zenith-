from extensions import db

class Vehicle(db.Model):
    __tablename__="vehicles"

    id=db.Column(
        db.Integer,primary_key=True
    )

    registration_number=db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )

    model=db.Column(
        db.String(100),
        nullable=False
    )

    vehicle_type=db.Column(
        db.String(100),
        nullable=False
    )

    max_capacity=db.Column(
        db.Float,
        nullable=False
    )

    odometer=db.Column(
        db.Float,
        default=0
    )

    acquisition_cost=db.Column(
        db.Float,
        nullable=False
    )

    status=db.Column(
        db.String(20),
        default="Available"
    )

    trips=db.relationship(
        "Trip",
        backref="vehicle",
        lazy=True
    )