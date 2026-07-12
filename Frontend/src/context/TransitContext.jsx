import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the Context for the Transit Platform state
const TransitContext = createContext();

const API_BASE = 'http://localhost:5000/api';

export function TransitProvider({ children }) {
  // --- AUTHENTICATION & ROLE-BASED ACCESS CONTROL STATE ---
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('transitops_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('transitops_username') || 'Alex Mercer';
  });

  const [userAvatar, setUserAvatar] = useState(() => {
    return localStorage.getItem('transitops_user_avatar') || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80';
  });

  useEffect(() => {
    localStorage.setItem('transitops_user_avatar', userAvatar);
  }, [userAvatar]);

  // --- SEED DATA DEFINITIONS (USED AS FALLBACKS) ---
  const initialVehicles = [
    { registration: 'MH-12-QA-9012', name: 'Tata Signa 5530.S Heavy Duty', type: 'Heavy Truck', maxLoad: 15000, odometer: 124500, acquisitionCost: 4500000, status: 'Available' },
    { registration: 'DL-03-EB-4567', name: 'Ashok Leyland 5525 Semi-trailer', type: 'Semi-Trailer', maxLoad: 24000, odometer: 89200, acquisitionCost: 5200000, status: 'On Trip' },
    { registration: 'KA-51-MB-1122', name: 'Mahindra Blazo X 35 Box Truck', type: 'Box Truck', maxLoad: 5000, odometer: 45600, acquisitionCost: 3200000, status: 'Available' },
    { registration: 'HR-38-XY-8899', name: 'Tata Winger Cargo Van', type: 'Cargo Van', maxLoad: 1500, odometer: 62100, acquisitionCost: 1400000, status: 'In Shop' }
  ];

  const initialDrivers = [
    { name: 'Rajesh Kumar', licenseNumber: 'IND-DL03-2026-A', licenseCategory: 'HMV (Heavy Motor)', licenseExpiry: '2027-09-15', contactNumber: '+91 98765 43210', safetyScore: 94, status: 'Available' },
    { name: 'Sunita Sharma', licenseNumber: 'IND-MH12-2026-B', licenseCategory: 'HMV (Heavy Motor)', licenseExpiry: '2026-11-10', contactNumber: '+91 87654 32109', safetyScore: 98, status: 'On Trip' },
    { name: 'Gurpreet Singh', licenseNumber: 'IND-PB02-2026-C', licenseCategory: 'LMV (Light Transport)', licenseExpiry: '2025-11-20', contactNumber: '+91 76543 21098', safetyScore: 82, status: 'Off Duty' },
    { name: 'Amit Patel', licenseNumber: 'IND-GJ01-2026-D', licenseCategory: 'HMV (Heavy Motor)', licenseExpiry: '2028-03-30', contactNumber: '+91 95432 10987', safetyScore: 68, status: 'Suspended' }
  ];

  const initialTrips = [
    { id: 'TRIP-1001', vehicleReg: 'DL-03-EB-4567', driverLic: 'IND-MH12-2026-B', source: 'Mumbai NH-4 Hub', destination: 'Pune Industrial Depot', cargoWeight: 18000, plannedDistance: 450, status: 'Dispatched', date: '2026-07-11' },
    { id: 'TRIP-1002', vehicleReg: 'MH-12-QA-9012', driverLic: 'IND-DL03-2026-A', source: 'JNPT Port Navi Mumbai', destination: 'Delhi NCR Terminal', cargoWeight: 12000, plannedDistance: 350, status: 'Completed', date: '2026-07-09' }
  ];

  const initialMaintenance = [
    { id: 'MAIN-3001', vehicleReg: 'HR-38-XY-8899', description: 'Transmission Fluid Leak & Clutch replacement', cost: 45000, status: 'Open', date: '2026-07-10', progress: 40 },
    { id: 'MAIN-3002', vehicleReg: 'MH-12-QA-9012', description: 'Brake Pad Service & Tyre Rotation', cost: 25000, status: 'Closed', date: '2026-07-05', progress: 100 }
  ];

  const initialExpenses = [
    { id: 'EXP-5001', vehicleReg: 'MH-12-QA-9012', date: '2026-07-08', type: 'Fuel', liters: 120, cost: 11400, description: 'HP Fuel Station #14' },
    { id: 'EXP-5002', vehicleReg: 'DL-03-EB-4567', date: '2026-07-10', type: 'Fuel', liters: 210, cost: 19950, description: 'IndianOil Regional Depot' },
    { id: 'EXP-5003', vehicleReg: 'KA-51-MB-1122', date: '2026-07-05', type: 'Expense', liters: 0, cost: 1200, description: 'NHAI Fastag Toll Plaza Charge' },
    { id: 'EXP-5004', vehicleReg: 'HR-38-XY-8899', date: '2026-07-09', type: 'Expense', liters: 0, cost: 1500, description: 'Heavy Truck Wiper Replacements' }
  ];

  const initialNotifications = [
    { id: 'notif-1', text: "HMV License Expiry Warning: Gurpreet Singh's transport permit (IND-PB02-2026-C) expired on 2025-11-20.", type: "danger", date: "2026-07-11", read: false, view: "drivers" },
    { id: 'notif-2', text: "Fleet Workshop alert: HR-38-XY-8899 (Tata Winger Cargo Van) has entered Shop for clutch leak repairs.", type: "warning", date: "2026-07-11", read: false, view: "maintenance" },
    { id: 'notif-3', text: "Route Dispatched: TRIP-1001 safely deployed from Mumbai NH-4 Hub to Pune Industrial Depot.", type: "success", date: "2026-07-11", read: true, view: "trips" },
    { id: 'notif-4', text: "Preventative Maintenance: MH-12-QA-9012 odometer exceeds 124K, scheduler recommends tyre check and brake inspections.", type: "info", date: "2026-07-10", read: false, view: "vehicles" }
  ];

  // --- STATE WITH API BACKED VALUES & LOCALSTORAGE FALLBACKS ---
  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem('transitops_vehicles_inr');
    return saved ? JSON.parse(saved) : initialVehicles;
  });

  const [drivers, setDrivers] = useState(() => {
    const saved = localStorage.getItem('transitops_drivers_inr');
    return saved ? JSON.parse(saved) : initialDrivers;
  });

  const [trips, setTrips] = useState(() => {
    const saved = localStorage.getItem('transitops_trips_inr');
    return saved ? JSON.parse(saved) : initialTrips;
  });

  const [maintenance, setMaintenance] = useState(() => {
    const saved = localStorage.getItem('transitops_maintenance_inr');
    return saved ? JSON.parse(saved) : initialMaintenance;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('transitops_expenses_inr');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('transitops_notifications_inr');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [selectedDate, setSelectedDate] = useState('2026-07-11');
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState('All');
  const [tripDispatcherStep, setTripDispatcherStep] = useState('Draft');

  // --- LOAD DATA FROM FLASK BACKEND ON LOGIN/BOOT ---
  const syncWithBackend = async () => {
    try {
      const [vehiclesRes, driversRes, tripsRes, maintenanceRes, expensesRes, notificationsRes] = await Promise.all([
        fetch(`${API_BASE}/vehicles/`).then(r => r.json()),
        fetch(`${API_BASE}/drivers/`).then(r => r.json()),
        fetch(`${API_BASE}/trips/`).then(r => r.json()),
        fetch(`${API_BASE}/maintenance/`).then(r => r.json()),
        fetch(`${API_BASE}/expenses/`).then(r => r.json()),
        fetch(`${API_BASE}/notifications/`).then(r => r.json())
      ]);

      setVehicles(vehiclesRes);
      setDrivers(driversRes);
      setTrips(tripsRes);
      setMaintenance(maintenanceRes);
      setExpenses(expensesRes);
      setNotifications(notificationsRes);

      // Save to localStorage as a cache layer
      localStorage.setItem('transitops_vehicles_inr', JSON.stringify(vehiclesRes));
      localStorage.setItem('transitops_drivers_inr', JSON.stringify(driversRes));
      localStorage.setItem('transitops_trips_inr', JSON.stringify(tripsRes));
      localStorage.setItem('transitops_maintenance_inr', JSON.stringify(maintenanceRes));
      localStorage.setItem('transitops_expenses_inr', JSON.stringify(expensesRes));
      localStorage.setItem('transitops_notifications_inr', JSON.stringify(notificationsRes));
    } catch (err) {
      console.warn("Failed to synchronize with MySQL Backend API, using cached data.", err);
    }
  };

  useEffect(() => {
    if (user) {
      syncWithBackend();
    }
  }, [user]);

  // --- BUSINESS RULES & MUTATIONS SYNCED TO DATABASE ---

  const loginUser = async (email, role) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'secret_token_123' })
      });
      
      if (res.ok) {
        const data = await res.json();
        const session = { email: data.email, role: data.role };
        setUser(session);
        localStorage.setItem('transitops_user', JSON.stringify(session));
        setUserName(data.name);
        localStorage.setItem('transitops_username', data.name);
        return;
      }
    } catch (err) {
      console.warn("Auth connection failed. Using demo credential fallback.");
    }
    
    // Fallback/Local login
    const session = { email, role };
    setUser(session);
    localStorage.setItem('transitops_user', JSON.stringify(session));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('transitops_user');
  };

  const addVehicle = async (newVehicle) => {
    // Check local duplicate first
    const exists = vehicles.some(
      (v) => v.registration.toLowerCase().trim() === newVehicle.registration.toLowerCase().trim()
    );
    if (exists) {
      throw new Error(`Vehicle with registration "${newVehicle.registration}" already exists.`);
    }

    try {
      const res = await fetch(`${API_BASE}/vehicles/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehicle)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add vehicle to DB.');
      }
      const saved = await res.json();
      setVehicles((prev) => [...prev, saved]);
    } catch (err) {
      console.error(err);
      // Local fallback
      setVehicles((prev) => [...prev, { ...newVehicle, status: 'Available' }]);
    }
  };

  const updateVehicle = async (registration, updatedData) => {
    try {
      const res = await fetch(`${API_BASE}/vehicles/${registration}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        const saved = await res.json();
        setVehicles((prev) =>
          prev.map((v) => v.registration === registration ? saved : v)
        );
        return;
      }
    } catch (err) {
      console.error(err);
    }
    // Local fallback
    setVehicles((prev) =>
      prev.map((v) =>
        v.registration.toLowerCase().trim() === registration.toLowerCase().trim()
          ? { ...v, ...updatedData }
          : v
      )
    );
  };

  const deleteVehicle = async (registration) => {
    try {
      const res = await fetch(`${API_BASE}/vehicles/${registration}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setVehicles((prev) => prev.filter((v) => v.registration !== registration));
        return;
      }
    } catch (err) {
      console.error(err);
    }
    // Local fallback
    setVehicles((prev) =>
      prev.filter((v) => v.registration.toLowerCase().trim() !== registration.toLowerCase().trim())
    );
  };

  const addDriver = async (newDriver) => {
    const exists = drivers.some(
      (d) => d.licenseNumber.toLowerCase().trim() === newDriver.licenseNumber.toLowerCase().trim()
    );
    if (exists) {
      throw new Error(`Driver with License Number "${newDriver.licenseNumber}" already exists.`);
    }

    try {
      const res = await fetch(`${API_BASE}/drivers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDriver)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add driver to DB.');
      }
      const saved = await res.json();
      setDrivers((prev) => [...prev, saved]);
    } catch (err) {
      console.error(err);
      setDrivers((prev) => [...prev, { ...newDriver, status: 'Available' }]);
    }
  };

  const updateDriver = async (licenseNumber, updatedData) => {
    try {
      const res = await fetch(`${API_BASE}/drivers/${licenseNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        const saved = await res.json();
        setDrivers((prev) =>
          prev.map((d) => d.licenseNumber === licenseNumber ? saved : d)
        );
        return;
      }
    } catch (err) {
      console.error(err);
    }
    // Local fallback
    setDrivers((prev) =>
      prev.map((d) =>
        d.licenseNumber.toLowerCase().trim() === licenseNumber.toLowerCase().trim()
          ? { ...d, ...updatedData }
          : d
      )
    );
  };

  const deleteDriver = async (licenseNumber) => {
    try {
      const res = await fetch(`${API_BASE}/drivers/${licenseNumber}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDrivers((prev) => prev.filter((d) => d.licenseNumber !== licenseNumber));
        return;
      }
    } catch (err) {
      console.error(err);
    }
    // Local fallback
    setDrivers((prev) =>
      prev.filter((d) => d.licenseNumber.toLowerCase().trim() !== licenseNumber.toLowerCase().trim())
    );
  };

  const isLicenseExpired = (expiryDateString) => {
    const expiry = new Date(expiryDateString);
    const today = new Date('2026-07-11');
    return expiry < today;
  };

  const dispatchTrip = async (tripData) => {
    const vehicle = vehicles.find((v) => v.registration === tripData.vehicleReg);
    const driver = drivers.find((d) => d.licenseNumber === tripData.driverLic);

    if (!vehicle) throw new Error('Selected vehicle does not exist.');
    if (!driver) throw new Error('Selected driver does not exist.');

    if (vehicle.status === 'In Shop' || vehicle.status === 'Retired') {
      throw new Error(`Vehicle is currently ${vehicle.status} and cannot be dispatched.`);
    }
    if (driver.status === 'Suspended') {
      throw new Error('Driver is suspended and cannot be assigned to any trip.');
    }
    if (isLicenseExpired(driver.licenseExpiry)) {
      throw new Error('Driver license is expired and cannot operate vehicles.');
    }
    if (tripData.cargoWeight > vehicle.maxLoad) {
      throw new Error(`Cargo weight (${tripData.cargoWeight} kg) exceeds capacity (${vehicle.maxLoad} kg).`);
    }

    try {
      const res = await fetch(`${API_BASE}/trips/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to dispatch trip.');
      }
      const saved = await res.json();
      setTrips((prev) => [saved, ...prev]);

      // Re-sync vehicle/driver status from DB
      const [vRes, dRes] = await Promise.all([
        fetch(`${API_BASE}/vehicles/`).then(r => r.json()),
        fetch(`${API_BASE}/drivers/`).then(r => r.json())
      ]);
      setVehicles(vRes);
      setDrivers(dRes);

      addNotification(`Route ${saved.id} successfully dispatched: ${saved.source} → ${saved.destination} (${saved.cargoWeight.toLocaleString()} kg).`, 'success', 'trips');
    } catch (err) {
      console.error(err);
      // Local fallback
      const newTrip = {
        id: `TRIP-${Math.floor(1000 + Math.random() * 9000)}`,
        ...tripData,
        status: 'Dispatched',
        date: selectedDate
      };
      setTrips((prev) => [newTrip, ...prev]);
      setVehicles((prev) =>
        prev.map((v) => (v.registration === vehicle.registration ? { ...v, status: 'On Trip' } : v))
      );
      setDrivers((prev) =>
        prev.map((d) => (d.licenseNumber === driver.licenseNumber ? { ...d, status: 'On Trip' } : d))
      );
      addNotification(`Route ${newTrip.id} successfully dispatched: ${newTrip.source} → ${newTrip.destination} (${newTrip.cargoWeight.toLocaleString()} kg).`, 'success', 'trips');
    }
  };

  const completeTrip = async (tripId, finalOdometer, fuelLiters, fuelCost) => {
    try {
      const res = await fetch(`${API_BASE}/trips/${tripId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalOdometer, fuelLiters, fuelCost })
      });
      if (res.ok) {
        const saved = await res.json();
        setTrips((prev) => prev.map((t) => (t.id === tripId ? saved : t)));

        // Re-sync components
        const [vRes, dRes, eRes] = await Promise.all([
          fetch(`${API_BASE}/vehicles/`).then(r => r.json()),
          fetch(`${API_BASE}/drivers/`).then(r => r.json()),
          fetch(`${API_BASE}/expenses/`).then(r => r.json())
        ]);
        setVehicles(vRes);
        setDrivers(dRes);
        setExpenses(eRes);

        addNotification(`Trip ${tripId} resolved. Vehicle odometer updated.`, 'success', 'trips');
        return;
      }
    } catch (err) {
      console.error(err);
    }

    // Local Fallback
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: 'Completed' } : t))
    );

    const odometerValue = parseInt(finalOdometer);
    setVehicles((prev) =>
      prev.map((v) =>
        v.registration === trip.vehicleReg
          ? { 
              ...v, 
              status: v.status === 'Retired' ? 'Retired' : 'Available', 
              odometer: !isNaN(odometerValue) && odometerValue >= v.odometer ? odometerValue : (v.odometer + parseInt(trip.plannedDistance || 0)) 
            }
          : v
      )
    );

    setDrivers((prev) =>
      prev.map((d) => (d.licenseNumber === trip.driverLic ? { ...d, status: 'Available' } : d))
    );

    const litersVal = parseFloat(fuelLiters || 0);
    const costVal = parseFloat(fuelCost || 0);
    if (litersVal > 0) {
      addFuelLog({
        vehicleReg: trip.vehicleReg,
        liters: litersVal,
        cost: costVal,
        description: `Refuel automatic log from completed Trip ${tripId}`
      });
    }

    addNotification(`Trip ${tripId} resolved. Vehicle ${trip.vehicleReg} odometer updated to ${odometerValue.toLocaleString()} km.`, 'success', 'trips');
  };

  const cancelTrip = async (tripId) => {
    try {
      const res = await fetch(`${API_BASE}/trips/${tripId}/cancel`, {
        method: 'PUT'
      });
      if (res.ok) {
        const saved = await res.json();
        setTrips((prev) => prev.map((t) => (t.id === tripId ? saved : t)));

        const [vRes, dRes] = await Promise.all([
          fetch(`${API_BASE}/vehicles/`).then(r => r.json()),
          fetch(`${API_BASE}/drivers/`).then(r => r.json())
        ]);
        setVehicles(vRes);
        setDrivers(dRes);

        addNotification(`Route ${tripId} aborted by operator. Vehicle and driver released back to available pool.`, 'danger', 'trips');
        return;
      }
    } catch (err) {
      console.error(err);
    }

    // Local Fallback
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: 'Cancelled' } : t))
    );
    setVehicles((prev) =>
      prev.map((v) => (v.registration === trip.vehicleReg ? { ...v, status: 'Available' } : v))
    );
    setDrivers((prev) =>
      prev.map((d) => (d.licenseNumber === trip.driverLic ? { ...d, status: 'Available' } : d))
    );
    addNotification(`Route ${tripId} aborted by operator. Vehicle and driver released back to available pool.`, 'danger', 'trips');
  };

  const addMaintenance = async (maintenanceData) => {
    try {
      const res = await fetch(`${API_BASE}/maintenance/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenanceData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to register maintenance.');
      }
      const saved = await res.json();
      setMaintenance((prev) => [saved, ...prev]);

      const vRes = await fetch(`${API_BASE}/vehicles/`).then(r => r.json());
      setVehicles(vRes);

      addNotification(`Vehicle ${maintenanceData.vehicleReg} placed in workshop: ${maintenanceData.description}.`, 'warning', 'maintenance');
    } catch (err) {
      console.error(err);
      // Local Fallback
      const newRecord = {
        id: `MAIN-${Math.floor(3000 + Math.random() * 9000)}`,
        ...maintenanceData,
        status: 'Open',
        progress: 20,
        date: selectedDate
      };
      setMaintenance((prev) => [newRecord, ...prev]);
      setVehicles((prev) =>
        prev.map((v) => (v.registration === maintenanceData.vehicleReg ? { ...v, status: 'In Shop' } : v))
      );
      addNotification(`Vehicle ${maintenanceData.vehicleReg} placed in workshop: ${maintenanceData.description}.`, 'warning', 'maintenance');
    }
  };

  const closeMaintenance = async (recordId) => {
    try {
      const res = await fetch(`${API_BASE}/maintenance/${recordId}/close`, {
        method: 'PUT'
      });
      if (res.ok) {
        const saved = await res.json();
        setMaintenance((prev) =>
          prev.map((m) => (m.id === recordId ? saved : m))
        );

        const vRes = await fetch(`${API_BASE}/vehicles/`).then(r => r.json());
        setVehicles(vRes);

        addNotification(`Maintenance record ${recordId} closed. Vehicle is cleared for operations.`, 'success', 'maintenance');
        return;
      }
    } catch (err) {
      console.error(err);
    }

    // Local Fallback
    const record = maintenance.find((m) => m.id === recordId);
    if (!record) return;

    setMaintenance((prev) =>
      prev.map((m) => (m.id === recordId ? { ...m, status: 'Closed', progress: 100 } : m))
    );
    setVehicles((prev) =>
      prev.map((v) =>
        v.registration === record.vehicleReg
          ? { ...v, status: v.status === 'Retired' ? 'Retired' : 'Available' }
          : v
      )
    );
    addNotification(`Maintenance record ${recordId} closed. Vehicle ${record.vehicleReg} is cleared for operations.`, 'success', 'maintenance');
  };

  const updateMaintenanceProgress = async (recordId, progress) => {
    try {
      const res = await fetch(`${API_BASE}/maintenance/${recordId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress })
      });
      if (res.ok) {
        const saved = await res.json();
        setMaintenance((prev) =>
          prev.map((m) => (m.id === recordId ? saved : m))
        );
        return;
      }
    } catch (err) {
      console.error(err);
    }
    // Local Fallback
    setMaintenance((prev) =>
      prev.map((m) => (m.id === recordId ? { ...m, progress: Math.min(100, Math.max(0, progress)) } : m))
    );
  };

  const addFuelLog = async (fuelData) => {
    try {
      const res = await fetch(`${API_BASE}/expenses/fuel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fuelData)
      });
      if (res.ok) {
        const saved = await res.json();
        setExpenses((prev) => [saved, ...prev]);
        return;
      }
    } catch (err) {
      console.error(err);
    }
    // Local Fallback
    const newLog = {
      id: `EXP-${Math.floor(5000 + Math.random() * 9000)}`,
      ...fuelData,
      type: 'Fuel',
      date: '2026-07-11'
    };
    setExpenses((prev) => [newLog, ...prev]);
  };

  const addExpense = async (expenseData) => {
    try {
      const res = await fetch(`${API_BASE}/expenses/other`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });
      if (res.ok) {
        const saved = await res.json();
        setExpenses((prev) => [saved, ...prev]);
        return;
      }
    } catch (err) {
      console.error(err);
    }
    // Local Fallback
    const newLog = {
      id: `EXP-${Math.floor(5000 + Math.random() * 9000)}`,
      ...expenseData,
      type: 'Expense',
      liters: 0,
      date: '2026-07-11'
    };
    setExpenses((prev) => [newLog, ...prev]);
  };

  const addNotification = async (text, type = 'info', view = 'dashboard') => {
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type, view })
      });
      if (res.ok) {
        const saved = await res.json();
        setNotifications((prev) => [saved, ...prev]);
        return;
      }
    } catch (err) {
      console.error(err);
    }
    // Local Fallback
    const newNotif = {
      id: `notif-${Date.now()}`,
      text,
      type,
      date: selectedDate,
      read: false,
      view
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PUT'
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        return;
      }
    } catch (err) {
      console.error(err);
    }
    // Local Fallback
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const deleteNotification = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        return;
      }
    } catch (err) {
      console.error(err);
    }
    // Local Fallback
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/clear`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setNotifications([]);
        return;
      }
    } catch (err) {
      console.error(err);
    }
    // Local Fallback
    setNotifications([]);
  };

  // --- ROLE-BASED VISIBILITY ACCESS LOOKUP ---
  const permissionsByRole = {
    'Fleet Manager': {
      dashboard: true,
      vehicles: true,
      drivers: true,
      trips: true,
      maintenance: true,
      expenses: true,
      reports: true,
      settings: true,
    },
    'Dispatcher': {
      dashboard: true,
      vehicles: true,
      drivers: true,
      trips: true,
      maintenance: false,
      expenses: false,
      reports: false,
      settings: false,
    },
    'Safety Officer': {
      dashboard: true,
      vehicles: false,
      drivers: true,
      trips: false,
      maintenance: true,
      expenses: false,
      reports: false,
      settings: false,
    },
    'Financial Analyst': {
      dashboard: true,
      vehicles: false,
      drivers: false,
      trips: false,
      maintenance: false,
      expenses: true,
      reports: true,
      settings: false,
    }
  };

  const isTabVisible = (tabId) => {
    if (!user) return false;
    const rolePermissions = permissionsByRole[user.role];
    if (!rolePermissions) return false;
    return !!rolePermissions[tabId];
  };

  return (
    <TransitContext.Provider
      value={{
        user,
        userName,
        setUserName,
        userAvatar,
        setUserAvatar,
        loginUser,
        logoutUser,
        vehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        drivers,
        addDriver,
        updateDriver,
        deleteDriver,
        trips,
        dispatchTrip,
        completeTrip,
        cancelTrip,
        maintenance,
        addMaintenance,
        closeMaintenance,
        updateMaintenanceProgress,
        expenses,
        addFuelLog,
        addExpense,
        isLicenseExpired,
        isTabVisible,
        permissionsByRole,
        selectedDate,
        setSelectedDate,
        notifications,
        addNotification,
        markNotificationRead,
        deleteNotification,
        clearAllNotifications,
        vehicleStatusFilter,
        setVehicleStatusFilter,
        tripDispatcherStep,
        setTripDispatcherStep,
      }}
    >
      {children}
    </TransitContext.Provider>
  );
}

// Hook for accessing the context
export function useTransit() {
  const context = useContext(TransitContext);
  if (!context) {
    throw new Error('useTransit must be used within a TransitProvider');
  }
  return context;
}
