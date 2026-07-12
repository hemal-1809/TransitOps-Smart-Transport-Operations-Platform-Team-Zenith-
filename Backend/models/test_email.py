import sys
import os

# Include Backend folder in Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'Backend'))

from app import app
from extensions import db
from models import Trip
from routes.trip import send_status_email

print("--- TRANSITOPS SMTP EMAIL GATEWAY TEST ---")

with app.app_context():
    # Get the first seeded trip from the database
    trip = Trip.query.first()
    if not trip:
        print("Error: No trips found in MySQL database. Please make sure Backend/app.py is running and database is seeded.")
        sys.exit(1)

    print(f"Using Seeded Trip: TRIP-{trip.id}")
    print(f"Source: {trip.source} | Destination: {trip.destination}")
    print(f"Driver ID: {trip.driver_id} | Vehicle ID: {trip.vehicle_id}")

    # Set customer email to testing mailbox
    test_email = "tracknfix7@gmail.com"
    trip.customer_email = test_email

    print(f"\n1. Dispatched Alert: Sending HTML status email to {test_email}...")
    try:
        send_status_email(trip, 'Dispatched')
    except Exception as e:
        print(f"Dispatch test failed: {e}")

    print(f"\n2. Completed Alert: Sending HTML status email to {test_email}...")
    try:
        send_status_email(trip, 'Completed', final_odo=125400, fuel_liters=120, fuel_cost=11400)
    except Exception as e:
        print(f"Completion test failed: {e}")

    print("\n--- TEST RUN COMPLETED ---")
