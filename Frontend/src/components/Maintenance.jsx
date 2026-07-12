import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { Wrench, Plus, X, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Maintenance({ searchQuery }) {
  const { 
    maintenance, 
    vehicles, 
    addMaintenance, 
    closeMaintenance, 
    updateMaintenanceProgress 
  } = useTransit();

  // Local states
  const [showAddModal, setShowAddModal] = useState(false);
  const [vehicleReg, setVehicleReg] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [formError, setFormError] = useState('');

  // Choose vehicles eligible for maintenance (not already retired)
  const eligibleVehicles = vehicles.filter(v => v.status !== 'Retired');

  // Set default selected vehicle on load
  React.useEffect(() => {
    if (eligibleVehicles.length > 0 && !vehicleReg) {
      setVehicleReg(eligibleVehicles[0].registration);
    }
  }, [eligibleVehicles, vehicleReg]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!vehicleReg || !description || !cost) {
      setFormError('All fields are required.');
      return;
    }

    const costNum = parseFloat(cost);
    if (isNaN(costNum) || costNum <= 0) {
      setFormError('Maintenance cost must be a positive number.');
      return;
    }

    try {
      addMaintenance({
        vehicleReg,
        description: description.trim(),
        cost: costNum
      });

      // Clear fields
      setDescription('');
      setCost('');
      setShowAddModal(false);
    } catch (err) {
      setFormError(err.message);
    }
  };

  // Status mapping
  const renderStatusPill = (status) => {
    if (status === 'Open') {
      return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#fff7e6] text-[#b36b00] border border-[#ffe9cc] uppercase tracking-wider">In Shop</span>;
    }
    return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#edf7ec] text-[#3d7a3a] border border-[#d2edd0] uppercase tracking-wider">Resolved</span>;
  };

  // Filter records based on search query
  const filteredRecords = maintenance.filter(m => {
    const v = vehicles.find(veh => veh.registration === m.vehicleReg);
    const vName = v ? v.name : '';
    const matchSearch = searchQuery
      ? (m.vehicleReg.toLowerCase().includes(searchQuery.toLowerCase()) ||
         vName.toLowerCase().includes(searchQuery.toLowerCase()) ||
         m.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#1c221e] tracking-tight">Active Maintenance Workshops</h2>
          <p className="text-xs text-[#526357] font-medium">Log repair tickets, drag work order progress levels, and clear vehicles back to dispatch.</p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1c221e] hover:bg-[#2b352e] text-white font-bold text-xs rounded-full transition-all cursor-pointer shadow-sm shadow-[#1c221e]/10 active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#a7e274] stroke-[3]" />
          <span>New Repair Ticket</span>
        </button>
      </div>

      {/* CARDS LIST SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRecords.length === 0 ? (
          <div className="col-span-full bg-white border border-[#e2ede4] p-12 text-center rounded-[28px] space-y-3.5 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#f3f7f2] flex items-center justify-center mx-auto">
              <Wrench className="w-6 h-6 text-[#627267]" />
            </div>
            <p className="text-xs text-[#627267] font-semibold leading-relaxed">No active repair logs currently registered inside the database.</p>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const vehicle = vehicles.find((v) => v.registration === record.vehicleReg);
            const isOpen = record.status === 'Open';

            return (
              <div 
                key={record.id} 
                className={`bg-white border rounded-[24px] p-5 flex flex-col justify-between space-y-4 transition-all duration-200 shadow-sm ${
                  isOpen ? 'border-[#8ac959]/55 ring-1 ring-[#8ac959]/10' : 'border-[#e2ede4]'
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-extrabold text-[#1c221e] text-sm tracking-tight leading-tight">
                      {vehicle ? vehicle.name : 'Unknown Vehicle'}
                    </h3>
                    <span className="text-[10px] font-mono font-extrabold text-[#8ac959] mt-1 block select-all">
                      {record.vehicleReg}
                    </span>
                  </div>
                  {renderStatusPill(record.status)}
                </div>

                {/* Description and Cost info */}
                <div className="text-xs space-y-3.5">
                  <p className="text-[#526357] font-medium leading-relaxed bg-[#f3f7f2]/40 p-3.5 rounded-2xl italic border border-[#e2ede4]/50">
                    "{record.description}"
                  </p>
                  <div className="flex justify-between font-mono bg-[#f3f7f2] px-3.5 py-2 rounded-full border border-[#e2ede4]">
                    <span className="text-[#627267] uppercase text-[9px] font-bold tracking-wider self-center">Est. Cost</span>
                    <span className="text-[#1c221e] font-extrabold">₹{record.cost.toLocaleString()}</span>
                  </div>
                </div>

                {/* Progress Control Range Slider */}
                <div className="space-y-2 bg-[#f3f7f2] p-4 rounded-2xl border border-[#e2ede4]">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#627267]">
                    <span className="uppercase tracking-wider">Progress Gauge</span>
                    <span className="font-mono text-[#1c221e] font-extrabold">{record.progress}%</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      disabled={!isOpen}
                      value={record.progress}
                      onChange={(e) => updateMaintenanceProgress(record.id, parseInt(e.target.value))}
                      className={`w-full h-1.5 rounded-full bg-[#e2ede4] accent-[#8ac959] cursor-pointer ${
                        !isOpen ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                  {isOpen && (
                    <p className="text-[9px] font-bold text-[#627267] text-center mt-1">
                      Drag slider handle to record progress increments
                    </p>
                  )}
                </div>

                {/* Action button */}
                <div className="pt-2">
                  {isOpen ? (
                    <button
                      onClick={() => closeMaintenance(record.id)}
                      className="w-full py-2.5 bg-[#1c221e] hover:bg-[#2b352e] text-white font-bold text-xs rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-[#a7e274]" />
                      <span>Close Repair Session</span>
                    </button>
                  ) : (
                    <div className="w-full py-2.5 bg-[#edf7ec] text-[#3d7a3a] border border-[#d2edd0] font-bold text-center text-xs rounded-full select-none">
                      ✅ Job Resolved
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* NEW MAINTENANCE TICKET MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#e2ede4] w-full max-w-md rounded-[28px] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 bg-[#f3f7f2] border-b border-[#e2ede4] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1c221e] flex items-center justify-center">
                  <Wrench className="w-4.5 h-4.5 text-[#a7e274]" />
                </div>
                <h3 className="font-sans font-extrabold text-sm text-[#1c221e]">Create Repair Workshop Ticket</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-[#627267] hover:text-[#1c221e] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-800 text-xs rounded-xl flex items-center gap-2.5">
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-red-600 animate-pulse" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                  SELECT FLEET TARGET (WILL BE FLAGGED "IN SHOP")
                </label>
                <select
                  value={vehicleReg}
                  onChange={(e) => setVehicleReg(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                >
                  {eligibleVehicles.length === 0 ? (
                    <option value="">⚠️ NO REGULAR MACHINE RECORD LOADED</option>
                  ) : (
                    eligibleVehicles.map((v) => (
                      <option key={v.registration} value={v.registration}>
                        {v.name} ({v.registration}) — Status: {v.status}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                  REPAIR OR FAULT DESCRIPTION
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. 50,000 km standard transmission fluid flushing and replacement..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f3f7f2] border-0 rounded-2xl text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959] resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                  PROJECTED SERVICE COST (INR)
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 25000"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f3f7f2]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-[#f3f7f2] hover:bg-[#e2ede4] text-[#1c221e] text-xs font-bold rounded-full transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={eligibleVehicles.length === 0}
                  className="px-5 py-2.5 bg-[#1c221e] hover:bg-[#2b352e] text-white text-xs font-bold rounded-full transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  File Workshop Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
