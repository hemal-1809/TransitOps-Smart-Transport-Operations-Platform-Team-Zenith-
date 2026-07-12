import React, { useState, useEffect } from 'react';
import { useTransit } from '../context/TransitContext';
import { Navigation, AlertCircle, CheckCircle2, Check, ArrowRight, Play, X, ChevronRight } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function TripDispatcher() {
  const { 
    vehicles, 
    drivers, 
    trips, 
    dispatchTrip, 
    completeTrip, 
    cancelTrip, 
    isLicenseExpired,
    tripDispatcherStep,
    setTripDispatcherStep
  } = useTransit();

  // Map stepper state to global context for external navigation & control
  const currentStep = tripDispatcherStep;
  const setCurrentStep = setTripDispatcherStep;

  // Form states
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedVehicleReg, setSelectedVehicleReg] = useState('');
  const [selectedDriverLic, setSelectedDriverLic] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDistance, setPlannedDistance] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  
  // Validation and Feedback states
  const [inlineError, setInlineError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Trip completion modal states
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completingTrip, setCompletingTrip] = useState(null);
  const [finalOdoInput, setFinalOdoInput] = useState('');
  const [fuelLitersInput, setFuelLitersInput] = useState('');
  const [fuelCostInput, setFuelCostInput] = useState('');
  const [completeError, setCompleteError] = useState('');

  const handleOpenCompleteModal = (trip) => {
    const vehicle = vehicles.find(v => v.registration === trip.vehicleReg);
    setCompletingTrip(trip);
    if (vehicle) {
      setFinalOdoInput((vehicle.odometer + parseInt(trip.plannedDistance || 0)).toString());
    } else {
      setFinalOdoInput('');
    }
    setFuelLitersInput('');
    setFuelCostInput('');
    setCompleteError('');
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = (e) => {
    e.preventDefault();
    setCompleteError('');

    if (!completingTrip) return;

    const odoVal = parseInt(finalOdoInput);
    const vehicle = vehicles.find(v => v.registration === completingTrip.vehicleReg);

    if (isNaN(odoVal)) {
      setCompleteError('Please enter a valid final odometer reading.');
      return;
    }

    if (vehicle && odoVal < vehicle.odometer) {
      setCompleteError(`Final odometer cannot be less than current odometer (${vehicle.odometer.toLocaleString()} km).`);
      return;
    }

    const litersVal = fuelLitersInput ? parseFloat(fuelLitersInput) : 0;
    const costVal = fuelCostInput ? parseFloat(fuelCostInput) : 0;

    if (isNaN(litersVal) || litersVal < 0) {
      setCompleteError('Fuel consumed must be a non-negative number.');
      return;
    }

    if (isNaN(costVal) || costVal < 0) {
      setCompleteError('Fuel cost must be a non-negative number.');
      return;
    }

    try {
      completeTrip(completingTrip.id, odoVal, litersVal, costVal);
      setCurrentStep('Completed');
      setSuccessMsg(`Trip ${completingTrip.id} successfully completed. Vehicle odometer updated to ${odoVal.toLocaleString()} km, and fuel log registered!`);
      setShowCompleteModal(false);
      setCompletingTrip(null);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setCompleteError(err.message);
    }
  };

  // --- BUSINESS RULES FOR DROPDOWNS ---
  // Rule: Retired, On Trip, or In Shop vehicles NEVER appear in dispatch vehicle dropdown
  const availableVehicles = vehicles.filter(v => v.status === 'Available');

  // Rule: Drivers with expired license, Suspended, or On Trip status NEVER appear in driver dropdown
  const availableDrivers = drivers.filter(d => 
    d.status === 'Available' && 
    !isLicenseExpired(d.licenseExpiry)
  );

  // Auto-fill first available values when dropdown lists load
  useEffect(() => {
    if (availableVehicles.length > 0 && !selectedVehicleReg) {
      setSelectedVehicleReg(availableVehicles[0].registration);
    }
  }, [availableVehicles, selectedVehicleReg]);

  useEffect(() => {
    if (availableDrivers.length > 0 && !selectedDriverLic) {
      setSelectedDriverLic(availableDrivers[0].licenseNumber);
    }
  }, [availableDrivers, selectedDriverLic]);

  // Dynamic inline weight capacity validation as user types
  const activeVehicle = vehicles.find(v => v.registration === selectedVehicleReg);
  const currentCargoWeightNum = parseInt(cargoWeight || '0');

  useEffect(() => {
    if (activeVehicle && currentCargoWeightNum > activeVehicle.maxLoad) {
      setInlineError(`Cargo weight (${currentCargoWeightNum.toLocaleString()} kg) exceeds vehicle max load capacity (${activeVehicle.maxLoad.toLocaleString()} kg) for ${activeVehicle.name}.`);
      setCurrentStep('Draft');
    } else {
      setInlineError('');
    }
  }, [cargoWeight, selectedVehicleReg, activeVehicle, currentCargoWeightNum]);

  // Form submission handler
  const handleDispatch = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setInlineError('');

    if (!source || !destination || !selectedVehicleReg || !selectedDriverLic || !cargoWeight || !plannedDistance || !customerEmail) {
      setInlineError('Please complete all dispatch parameter fields.');
      return;
    }

    const weight = parseInt(cargoWeight);
    const distance = parseInt(plannedDistance);

    if (isNaN(weight) || weight <= 0) {
      setInlineError('Cargo weight must be a positive integer.');
      return;
    }

    if (isNaN(distance) || distance <= 0) {
      setInlineError('Planned distance must be a positive integer.');
      return;
    }

    // Re-verify weight rule
    if (activeVehicle && weight > activeVehicle.maxLoad) {
      setInlineError(`Cargo weight exceeds vehicle capacity of ${activeVehicle.maxLoad} kg.`);
      return;
    }

    try {
      // Execute middleware dispatch logic
      dispatchTrip({
        vehicleReg: selectedVehicleReg,
        driverLic: selectedDriverLic,
        source: source.trim(),
        destination: destination.trim(),
        cargoWeight: weight,
        plannedDistance: distance,
        customerEmail: customerEmail.trim()
      });

      // Update stepper indicator to visual stage "Dispatched"
      setCurrentStep('Dispatched');
      setSuccessMsg(`Trip successfully dispatched! Vehicle and Driver are now flagged as "On Trip".`);
      
      // Reset inputs
      setSource('');
      setDestination('');
      setCargoWeight('');
      setPlannedDistance('');
      setSelectedVehicleReg('');
      setSelectedDriverLic('');
      setCustomerEmail('');

      // Auto-clear success message
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setInlineError(err.message);
    }
  };

  const handleCancelForm = () => {
    setSource('');
    setDestination('');
    setCargoWeight('');
    setPlannedDistance('');
    setCustomerEmail('');
    setInlineError('');
    setSuccessMsg('');
    setCurrentStep('Draft');
  };

  // Get active dispatched trips
  const activeTripsList = trips.filter(t => t.status === 'Dispatched');

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-[#1c221e] tracking-tight">Active Trip Dispatcher Deck</h2>
        <p className="text-xs text-[#526357] font-medium">Validate vehicle weight capacities, crosscheck driver certifications, and dispatch live transits.</p>
      </div>

      {/* STEPPER STEP INDICATOR (FULLY CLICKABLE & ACCESSIBLE) */}
      <div className="bg-white border border-[#e2ede4] p-5 rounded-[24px] shadow-sm">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          
          {/* Step 1: Draft */}
          <button 
            type="button"
            onClick={() => setCurrentStep('Draft')}
            className="flex flex-col items-center cursor-pointer group transition-all hover:scale-105 focus:outline-none"
            title="Switch panel to Draft Parameters setup view"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs border transition-all ${
              currentStep === 'Draft' 
                ? 'bg-[#1c221e] text-[#a7e274] border-[#1c221e] shadow-[0_4px_12px_rgba(28,34,30,0.15)] scale-110' 
                : 'bg-white text-[#627267] border-[#e2ede4] group-hover:border-[#627267]'
            }`}>
              1
            </div>
            <span className="text-[10px] font-bold uppercase mt-2 text-[#1c221e] group-hover:underline">Draft Setup</span>
          </button>

          {/* Arrow indicating next step */}
          <div className="flex items-center justify-center self-start mt-2 text-[#b0c4b4]">
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </div>

          {/* Step 2: Dispatched */}
          <button 
            type="button"
            onClick={() => setCurrentStep('Dispatched')}
            className="flex flex-col items-center cursor-pointer group transition-all hover:scale-105 focus:outline-none"
            title="Switch panel to Active Dispatched transits tracker"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs border transition-all ${
              currentStep === 'Dispatched' 
                ? 'bg-[#1c221e] text-[#a7e274] border-[#1c221e] shadow-[0_4px_12px_rgba(28,34,30,0.15)] scale-110' 
                : 'bg-white text-[#627267] border-[#e2ede4] group-hover:border-[#627267]'
            }`}>
              2
            </div>
            <span className="text-[10px] font-bold uppercase mt-2 text-[#1c221e] group-hover:underline">Dispatched</span>
          </button>

          {/* Arrow indicating next step */}
          <div className="flex items-center justify-center self-start mt-2 text-[#b0c4b4]">
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </div>

          {/* Step 3: Completed */}
          <button 
            type="button"
            onClick={() => setCurrentStep('Completed')}
            className="flex flex-col items-center cursor-pointer group transition-all hover:scale-105 focus:outline-none"
            title="Switch panel to Resolved and Completed runs roster"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs border transition-all ${
              currentStep === 'Completed' 
                ? 'bg-[#8ac959] text-white border-[#8ac959] shadow-[0_4px_12px_rgba(138,201,89,0.25)] scale-110' 
                : 'bg-white text-[#627267] border-[#e2ede4] group-hover:border-[#627267]'
            }`}>
              3
            </div>
            <span className="text-[10px] font-bold uppercase mt-2 text-[#1c221e] group-hover:underline">Completed</span>
          </button>

          {/* Arrow indicating next step */}
          <div className="flex items-center justify-center self-start mt-2 text-[#b0c4b4]">
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </div>

          {/* Step 4: Cancelled */}
          <button 
            type="button"
            onClick={() => setCurrentStep('Cancelled')}
            className="flex flex-col items-center cursor-pointer group transition-all hover:scale-105 focus:outline-none"
            title="Switch panel to Aborted and Cancelled route logs"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs border transition-all ${
              currentStep === 'Cancelled' 
                ? 'bg-red-500 text-white border-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.25)] scale-110' 
                : 'bg-white text-[#627267] border-[#e2ede4] group-hover:border-red-500'
            }`}>
              X
            </div>
            <span className="text-[10px] font-bold uppercase mt-2 text-[#1c221e] group-hover:underline">Cancelled</span>
          </button>
        </div>
      </div>

      {/* DUAL WORK PANEL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: DISPATCH FORM */}
        <div className="lg:col-span-7 bg-white border border-[#e2ede4] rounded-[28px] overflow-hidden shadow-sm">
          <div className="p-5 bg-[#fcfdfe] border-b border-[#f0f6f1] flex items-center justify-between">
            <span className="text-sm font-extrabold text-[#1c221e] tracking-tight">Submit Route Parameters</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#436e22] bg-[#edf7ec] px-2.5 py-1 rounded-full">
              System Cleared
            </span>
          </div>

          <form onSubmit={handleDispatch} className="p-6 space-y-4">
            {inlineError && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-800 text-xs rounded-xl flex items-center gap-2.5">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-600 animate-pulse" />
                <span className="font-semibold">{inlineError}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 bg-[#edf7ec] border border-[#d2edd0] text-[#3d7a3a] text-xs rounded-xl flex items-center gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-[#3d7a3a]" />
                <span className="font-semibold">{successMsg}</span>
              </div>
            )}

            {/* Source & Destination */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                  SOURCE HUB / PORT
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai NH-4 Hub"
                  value={source}
                  onChange={(e) => {
                    setSource(e.target.value);
                    setCurrentStep('Draft');
                  }}
                  className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                  DESTINATION TERM / DEPOT
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune Industrial Depot"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setCurrentStep('Draft');
                  }}
                  className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                />
              </div>
            </div>

            {/* Customer Email */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                CUSTOMER EMAIL (FOR REAL-TIME TELEMETRY ALERTS)
              </label>
              <input
                type="email"
                required
                placeholder="e.g. client@example.com"
                value={customerEmail}
                onChange={(e) => {
                  setCustomerEmail(e.target.value);
                  setCurrentStep('Draft');
                }}
                className="w-full px-5 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
              />
            </div>

            {/* Vehicle Dropdown */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                  ASSIGN FLEET VEHICLE (AVAILABLE ONLY)
                </label>
                {activeVehicle && (
                  <span className="text-[10px] text-[#436e22] font-bold bg-[#edf7ec] px-2 py-0.5 rounded-full font-mono">
                    Limit: {activeVehicle.maxLoad.toLocaleString()} kg
                  </span>
                )}
              </div>
              <CustomSelect
                value={selectedVehicleReg}
                onChange={(e) => {
                  setSelectedVehicleReg(e.target.value);
                  setCurrentStep('Draft');
                }}
                options={availableVehicles.length === 0 ? [
                  { value: '', label: '⚠️ NO VEHICLES IN STANDBY POOL (ALL BUSY/IN SHOP)' }
                ] : availableVehicles.map((v) => ({
                  value: v.registration,
                  label: `${v.name} (${v.registration}) — Max load: ${v.maxLoad.toLocaleString()} kg`
                }))}
                placeholder="Select Fleet Vehicle"
                minWidth="100%"
                className="!py-2 bg-[#f3f7f2] border-0"
              />
            </div>

            {/* Driver Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                ASSIGN OPERATOR (AVAILABLE & CERTIFIED ONLY)
              </label>
              <CustomSelect
                value={selectedDriverLic}
                onChange={(e) => {
                  setSelectedDriverLic(e.target.value);
                  setCurrentStep('Draft');
                }}
                options={availableDrivers.length === 0 ? [
                  { value: '', label: '⚠️ NO ELIGIBLE OPERATORS STANDBY (CHECK EXPIRATIONS)' }
                ] : availableDrivers.map((d) => ({
                  value: d.licenseNumber,
                  label: `${d.name} (License: ${d.licenseNumber}) — Safety score: ${d.safetyScore}/100`
                }))}
                placeholder="Select Operator"
                minWidth="100%"
                className="!py-2 bg-[#f3f7f2] border-0"
              />
            </div>

            {/* Cargo weight & planned distance */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                  CARGO PAYLOAD WEIGHT (KG)
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 10000"
                  value={cargoWeight}
                  onChange={(e) => setCargoWeight(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                  PLANNED DISTANCE (KM)
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 450"
                  value={plannedDistance}
                  onChange={(e) => {
                    setPlannedDistance(e.target.value);
                    setCurrentStep('Draft');
                  }}
                  className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                />
              </div>
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f3f7f2]">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-5 py-2.5 bg-[#f3f7f2] hover:bg-[#e2ede4] text-[#1c221e] text-xs font-bold rounded-full transition-all cursor-pointer"
              >
                Cancel / Reset
              </button>
              <button
                type="submit"
                disabled={!!inlineError || availableVehicles.length === 0 || availableDrivers.length === 0}
                className={`px-5 py-2.5 text-white text-xs font-bold rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
                  !!inlineError || availableVehicles.length === 0 || availableDrivers.length === 0
                    ? 'bg-gray-300 cursor-not-allowed opacity-55'
                    : 'bg-[#1c221e] hover:bg-[#2b352e]'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current stroke-none" />
                <span>Dispatch Route</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT PANEL: DYNAMIC INTERACTIVE CONTEXT TERMINAL */}
        <div className="lg:col-span-5 flex flex-col gap-4 animate-fade-in">
          {currentStep === 'Draft' && (
            <div className="bg-white border border-[#e2ede4] rounded-[28px] overflow-hidden shadow-sm flex-1 flex flex-col">
              <div className="p-5 bg-[#fcfdfe] border-b border-[#f0f6f1] flex items-center justify-between">
                <span className="text-sm font-extrabold text-[#1c221e] tracking-tight">Standby Assets Pool</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#436e22] bg-[#edf7ec] px-2.5 py-1 rounded-full font-mono">
                  Ready to Dispatch
                </span>
              </div>

              <div className="p-5 space-y-4 flex-1 overflow-y-auto max-h-[420px]">
                {/* Available vehicles */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono font-bold text-[#627267] uppercase tracking-wider">
                    Available Vehicles ({availableVehicles.length})
                  </h4>
                  {availableVehicles.length === 0 ? (
                    <p className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-100">
                      ⚠️ Standby pool exhausted. Add new vehicles or resolve open workshops.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {availableVehicles.slice(0, 3).map(v => (
                        <div key={v.registration} className="flex justify-between items-center p-2.5 rounded-xl bg-[#fcfdfe] border border-[#e2ede4] text-xs">
                          <div>
                            <span className="font-extrabold text-[#1c221e]">{v.name}</span>
                            <span className="block font-mono text-[9px] text-[#627267] mt-0.5">{v.registration}</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-[#627267] bg-[#f3f7f2] px-2 py-0.5 rounded-full">
                            {v.maxLoad.toLocaleString()} kg max
                          </span>
                        </div>
                      ))}
                      {availableVehicles.length > 3 && (
                        <p className="text-[10px] text-center text-[#627267] font-semibold">
                          + {availableVehicles.length - 3} more standby vehicles available
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Available drivers */}
                <div className="space-y-2 pt-2 border-t border-[#f3f7f2]">
                  <h4 className="text-[10px] font-mono font-bold text-[#627267] uppercase tracking-wider">
                    Certified Operators ({availableDrivers.length})
                  </h4>
                  {availableDrivers.length === 0 ? (
                    <p className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-100">
                      ⚠️ No standby operators available. Check license expiry warnings.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {availableDrivers.slice(0, 3).map(d => (
                        <div key={d.licenseNumber} className="flex justify-between items-center p-2.5 rounded-xl bg-[#fcfdfe] border border-[#e2ede4] text-xs">
                          <div>
                            <span className="font-extrabold text-[#1c221e]">{d.name}</span>
                            <span className="block font-mono text-[9px] text-[#627267] mt-0.5">Score: {d.safetyScore}/100</span>
                          </div>
                          <span className="text-[10px] font-bold text-[#436e22] bg-[#edf7ec] px-2 py-0.5 rounded-full">
                            CDL Verified
                          </span>
                        </div>
                      ))}
                      {availableDrivers.length > 3 && (
                        <p className="text-[10px] text-center text-[#627267] font-semibold">
                          + {availableDrivers.length - 3} more standby operators ready
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'Dispatched' && (
            <div className="bg-white border border-[#e2ede4] rounded-[28px] overflow-hidden shadow-sm flex-1 flex flex-col">
              <div className="p-5 bg-[#fcfdfe] border-b border-[#f0f6f1] flex items-center justify-between">
                <span className="text-sm font-extrabold text-[#1c221e] tracking-tight">Active Transits ({activeTripsList.length})</span>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8ac959] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#8ac959]"></span>
                </span>
              </div>

              <div className="p-5 space-y-4 flex-1 overflow-y-auto max-h-[420px]">
                {activeTripsList.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#f3f7f2] flex items-center justify-center mx-auto">
                      <Navigation className="w-6 h-6 text-[#627267]" />
                    </div>
                    <p className="text-xs text-[#627267] font-semibold leading-relaxed px-4">
                      No active transits currently on trip. Shift to "Draft Setup" to launch a standby vehicle.
                    </p>
                  </div>
                ) : (
                  activeTripsList.map((trip) => {
                    const vehicle = vehicles.find(v => v.registration === trip.vehicleReg);
                    const driver = drivers.find(d => d.licenseNumber === trip.driverLic);

                    return (
                      <div key={trip.id} className="p-4 rounded-2xl bg-[#fcfdfe] border border-[#e2ede4] space-y-3.5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-extrabold text-[#8ac959]">{trip.id}</span>
                          <span className="text-[10px] font-bold text-[#627267] bg-[#f3f7f2] px-2 py-0.5 rounded-full">{trip.date}</span>
                        </div>

                        <div className="text-xs">
                          <div className="flex items-center gap-1.5 text-[#1c221e] font-extrabold">
                            <span>{trip.source}</span>
                            <span className="text-[#8ac959]">→</span>
                            <span>{trip.destination}</span>
                          </div>
                          <p className="text-[10px] font-bold text-[#627267] mt-1">
                            {trip.plannedDistance} km | Payload: {trip.cargoWeight.toLocaleString()} kg
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-[11px] border-t border-b border-[#f3f7f2] py-2.5">
                          <div>
                            <span className="block text-[8px] font-mono font-bold text-[#627267] uppercase">Vehicle</span>
                            <span className="text-[#1c221e] truncate block font-bold mt-0.5">{vehicle ? vehicle.name : 'Unknown'}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] font-mono font-bold text-[#627267] uppercase">Operator</span>
                            <span className="text-[#1c221e] truncate block font-bold mt-0.5">{driver ? driver.name : 'Unknown'}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              cancelTrip(trip.id);
                              setCurrentStep('Cancelled');
                            }}
                            className="px-3.5 py-1.5 text-[10px] bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-full cursor-pointer transition-colors"
                          >
                            Abort Route
                          </button>
                          <button
                            onClick={() => handleOpenCompleteModal(trip)}
                            className="px-3.5 py-1.5 text-[10px] bg-[#1c221e] hover:bg-[#2b352e] text-[#a7e274] font-bold rounded-full flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Complete Trip</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {currentStep === 'Completed' && (
            <div className="bg-white border border-[#e2ede4] rounded-[28px] overflow-hidden shadow-sm flex-1 flex flex-col">
              <div className="p-5 bg-[#fcfdfe] border-b border-[#f0f6f1] flex items-center justify-between">
                <span className="text-sm font-extrabold text-[#1c221e] tracking-tight">Resolved Run Logs ({trips.filter(t => t.status === 'Completed').length})</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#436e22] bg-[#edf7ec] px-2.5 py-1 rounded-full font-mono">
                  Ledger Synced
                </span>
              </div>

              <div className="p-5 space-y-4 flex-1 overflow-y-auto max-h-[420px]">
                {trips.filter(t => t.status === 'Completed').length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#f3f7f2] flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6 text-[#627267]" />
                    </div>
                    <p className="text-xs text-[#627267] font-semibold leading-relaxed px-4">
                      No resolved routes recorded in the active session database. Complete an active transit to populate this ledger.
                    </p>
                  </div>
                ) : (
                  trips.filter(t => t.status === 'Completed').map((trip) => {
                    const vehicle = vehicles.find(v => v.registration === trip.vehicleReg);
                    const driver = drivers.find(d => d.licenseNumber === trip.driverLic);

                    return (
                      <div key={trip.id} className="p-3.5 rounded-2xl bg-[#edf7ec]/45 border border-[#d2edd0] space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-extrabold text-[#3d7a3a]">{trip.id}</span>
                          <span className="text-[9px] font-bold text-[#3d7a3a] bg-[#edf7ec] px-2 py-0.5 rounded-full uppercase">
                            RESOLVED OK
                          </span>
                        </div>

                        <div className="text-xs text-[#1c221e] font-extrabold">
                          <span>{trip.source}</span>
                          <span className="text-[#8ac959] mx-1.5">→</span>
                          <span>{trip.destination}</span>
                          <span className="block text-[10px] font-bold text-[#526357] mt-0.5 font-sans">
                            Distance: {trip.plannedDistance} km | Date: {trip.date}
                          </span>
                        </div>

                        <div className="text-[10px] text-[#526357] font-medium pt-2 border-t border-[#d2edd0]/40 flex justify-between">
                          <span>Operator: <strong className="text-[#1c221e]">{driver ? driver.name : trip.driverLic}</strong></span>
                          <span>Vehicle: <strong className="text-[#1c221e] font-mono">{trip.vehicleReg}</strong></span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {currentStep === 'Cancelled' && (
            <div className="bg-white border border-[#e2ede4] rounded-[28px] overflow-hidden shadow-sm flex-1 flex flex-col">
              <div className="p-5 bg-[#fcfdfe] border-b border-[#f0f6f1] flex items-center justify-between">
                <span className="text-sm font-extrabold text-red-800 tracking-tight">Aborted Route Logs ({trips.filter(t => t.status === 'Cancelled').length})</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 bg-red-50 px-2.5 py-1 rounded-full font-mono">
                  Aborted Records
                </span>
              </div>

              <div className="p-5 space-y-4 flex-1 overflow-y-auto max-h-[420px]">
                {trips.filter(t => t.status === 'Cancelled').length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <p className="text-xs text-[#627267] font-semibold leading-relaxed px-4">
                      No aborted or cancelled routes recorded in this session.
                    </p>
                  </div>
                ) : (
                  trips.filter(t => t.status === 'Cancelled').map((trip) => {
                    const vehicle = vehicles.find(v => v.registration === trip.vehicleReg);
                    const driver = drivers.find(d => d.licenseNumber === trip.driverLic);

                    return (
                      <div key={trip.id} className="p-3.5 rounded-2xl bg-red-50/50 border border-red-100 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-extrabold text-red-800">{trip.id}</span>
                          <span className="text-[9px] font-bold text-red-800 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full uppercase">
                            ABORTED
                          </span>
                        </div>

                        <div className="text-xs text-[#1c221e] font-extrabold">
                          <span>{trip.source}</span>
                          <span className="text-red-500 mx-1.5">⇁</span>
                          <span>{trip.destination}</span>
                          <span className="block text-[10px] font-bold text-[#526357] mt-0.5 font-sans">
                            Assigned payload: {trip.cargoWeight} kg | Date: {trip.date}
                          </span>
                        </div>

                        <div className="text-[10px] text-[#526357] font-medium pt-2 border-t border-red-100/40 flex justify-between">
                          <span>Operator: <strong className="text-[#1c221e]">{driver ? driver.name : trip.driverLic}</strong></span>
                          <span>Vehicle: <strong className="text-[#1c221e] font-mono">{trip.vehicleReg}</strong></span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TRIP COMPLETION DETAILS MODAL */}
      {showCompleteModal && completingTrip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#e2ede4] w-full max-w-md rounded-[28px] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 bg-[#f3f7f2] border-b border-[#e2ede4] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1c221e] flex items-center justify-center">
                  <Check className="w-4.5 h-4.5 text-[#a7e274] stroke-[3]" />
                </div>
                <h3 className="font-sans font-extrabold text-sm text-[#1c221e]">Complete Route {completingTrip.id}</h3>
              </div>
              <button 
                onClick={() => setShowCompleteModal(false)}
                className="text-[#627267] hover:text-[#1c221e] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCompleteSubmit} className="p-6 space-y-4">
              {completeError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-800 text-xs rounded-xl flex items-center gap-2.5">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-600 animate-pulse" />
                  <span className="font-semibold">{completeError}</span>
                </div>
              )}

              <div className="bg-[#f3f7f2] p-4 rounded-2xl border border-[#e2ede4] text-xs space-y-1">
                <p className="font-extrabold text-[#1c221e]">Route Information</p>
                <p className="text-[#526357] font-medium">
                  Source: <span className="text-[#1c221e] font-bold">{completingTrip.source}</span>
                </p>
                <p className="text-[#526357] font-medium">
                  Destination: <span className="text-[#1c221e] font-bold">{completingTrip.destination}</span>
                </p>
                <p className="text-[#526357] font-medium">
                  Planned Distance: <span className="text-[#1c221e] font-bold">{completingTrip.plannedDistance} km</span>
                </p>
                <p className="text-[#526357] font-medium">
                  Assigned Vehicle: <span className="text-[#1c221e] font-bold font-mono">{completingTrip.vehicleReg}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                  FINAL ODOMETER READING (KM)
                </label>
                <input
                  type="number"
                  required
                  value={finalOdoInput}
                  onChange={(e) => setFinalOdoInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                />
                <span className="block text-[9px] text-[#627267] font-bold">
                  Pre-filled with estimated odometer reading. Final reading must be greater than current.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    FUEL CONSUMED (LITERS)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 120"
                    value={fuelLitersInput}
                    onChange={(e) => setFuelLitersInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    FUEL COST (INR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 11400"
                    value={fuelCostInput}
                    onChange={(e) => setFuelCostInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f3f7f2]">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-5 py-2.5 bg-[#f3f7f2] hover:bg-[#e2ede4] text-[#1c221e] text-xs font-bold rounded-full transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1c221e] hover:bg-[#2b352e] text-white text-xs font-bold rounded-full transition-all cursor-pointer"
                >
                  Resolve Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
