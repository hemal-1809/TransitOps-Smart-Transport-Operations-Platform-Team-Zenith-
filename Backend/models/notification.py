from extensions import db
from datetime import datetime

class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(500), nullable=False)
    type = db.Column(db.String(20), default="info")
    date = db.Column(db.Date, default=datetime.utcnow)
    read = db.Column(db.Boolean, default=False)
    view = db.Column(db.String(50), default="dashboard")
