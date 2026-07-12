import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { Truck, Search, Plus, X, ShieldAlert, Edit2, Trash2, ShieldX, Check, ChevronDown } from 'lucide-react';

export default function VehicleRegistry({ searchQuery }) {
  const { 
    vehicles, 
    addVehicle, 
    updateVehicle, 
    deleteVehicle, 
    expenses, 
    maintenance,
    vehicleStatusFilter,
    setVehicleStatusFilter
  } = useTransit();
  
  // Local UI and Filter states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState('All');
  
  // Alias global filter states to local names for seamless backward-compatibility
  const statusFilter = vehicleStatusFilter;
  const setStatusFilter = setVehicleStatusFilter;

  // Add Form states
  const [regInput, setRegInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [typeInput, setTypeInput] = useState('Heavy Truck');
  const [loadInput, setLoadInput] = useState('');
  const [odometerInput, setOdometerInput] = useState('');
  const [costInput, setCostInput] = useState('');
  const [formError, setFormError] = useState('');

  // Edit Form states
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('Heavy Truck');
  const [editLoad, setEditLoad] = useState('');
  const [editOdometer, setEditOdometer] = useState('');
  const [editCost, setEditCost] = useState('');
  const [editStatus, setEditStatus] = useState('Available');
  const [editError, setEditError] = useState('');

  // Handle Form Submission: Create
  const handleCreateVehicle = (e) => {
    e.preventDefault();
    setFormError('');

    if (!regInput || !nameInput || !loadInput || !odometerInput || !costInput) {
      setFormError('All fields are strictly required.');
      return;
    }

    const loadValue = parseInt(loadInput);
    const odometerValue = parseInt(odometerInput);
    const costValue = parseInt(costInput);

    if (isNaN(loadValue) || loadValue <= 0) {
      setFormError('Max load capacity must be a positive integer.');
      return;
    }

    if (isNaN(odometerValue) || odometerValue < 0) {
      setFormError('Initial odometer reading must be a positive number.');
      return;
    }

    if (isNaN(costValue) || costValue < 0) {
      setFormError('Acquisition cost must be a positive number.');
      return;
    }

    try {
      addVehicle({
        registration: regInput.toUpperCase().trim(),
        name: nameInput.trim(),
        type: typeInput,
        maxLoad: loadValue,
        odometer: odometerValue,
        acquisitionCost: costValue
      });

      // Clear form & close modal on success
      setRegInput('');
      setNameInput('');
      setLoadInput('');
      setOdometerInput('');
      setCostInput('');
      setShowAddModal(false);
    } catch (err) {
      setFormError(err.message);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setEditName(vehicle.name);
    setEditType(vehicle.type);
    setEditLoad(vehicle.maxLoad.toString());
    setEditOdometer(vehicle.odometer.toString());
    setEditCost((vehicle.acquisitionCost || 85000).toString());
    setEditStatus(vehicle.status);
    setEditError('');
    setShowEditModal(true);
  };

  // Handle Form Submission: Edit
  const handleEditVehicleSubmit = (e) => {
    e.preventDefault();
    setEditError('');

    if (!editName || !editLoad || !editOdometer || !editCost) {
      setEditError('All fields except registration are required.');
      return;
    }

    const loadValue = parseInt(editLoad);
    const odometerValue = parseInt(editOdometer);
    const costValue = parseInt(editCost);

    if (isNaN(loadValue) || loadValue <= 0) {
      setEditError('Max load capacity must be a positive integer.');
      return;
    }

    if (isNaN(odometerValue) || odometerValue < 0) {
      setEditError('Odometer reading must be a positive number.');
      return;
    }

    if (isNaN(costValue) || costValue < 0) {
      setEditError('Acquisition cost must be a positive number.');
      return;
    }

    try {
      updateVehicle(editingVehicle.registration, {
        name: editName.trim(),
        type: editType,
        maxLoad: loadValue,
        odometer: odometerValue,
        acquisitionCost: costValue,
        status: editStatus
      });

      setShowEditModal(false);
      setEditingVehicle(null);
    } catch (err) {
      setEditError(err.message);
    }
  };

  // Handle Delete Vehicle
  const handleDeleteVehicle = (registration, status) => {
    if (status === 'On Trip') {
      alert('Cannot delete a vehicle that is currently on an active trip. Please complete or cancel the trip first.');
      return;
    }
    if (confirm(`Are you sure you want to delete vehicle ${registration} from the fleet registry?`)) {
      deleteVehicle(registration);
    }
  };

  // Handle Quick Retire
  const handleQuickRetire = (registration) => {
    if (confirm(`Mark vehicle ${registration} as retired? It will be removed from dispatch selectors.`)) {
      updateVehicle(registration, { status: 'Retired' });
    }
  };

  // --- DYNAMIC CALCULATIONS PER VEHICLE ---
  const getVehicleOperationalCost = (reg) => {
    const fuelCost = expenses
      .filter((e) => e.vehicleReg === reg && e.type === 'Fuel')
      .reduce((sum, e) => sum + e.cost, 0);
    const miscCost = expenses
      .filter((e) => e.vehicleReg === reg && e.type === 'Expense')
      .reduce((sum, e) => sum + e.cost, 0);
    const maintCost = maintenance
      .filter((m) => m.vehicleReg === reg)
      .reduce((sum, m) => sum + m.cost, 0);
    return fuelCost + miscCost + maintCost;
  };

  // Render colored status pills
  const renderVehicleStatusPill = (status) => {
    switch (status) {
      case 'Available':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#edf7ec] text-[#3d7a3a] border border-[#d2edd0] uppercase tracking-wider">Available</span>;
      case 'On Trip':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#eef4fe] text-[#2c5282] border border-[#d3e4fd] uppercase tracking-wider">On Trip</span>;
      case 'In Shop':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#fff5f5] text-[#c53030] border border-[#fed7d7] uppercase tracking-wider">In Shop</span>;
      case 'Retired':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-200 uppercase tracking-wider">Retired</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-100 uppercase tracking-wider">{status}</span>;
    }
  };

  // --- FILTER VEHICLES LOGIC ---
  const filteredVehicles = vehicles.filter(v => {
    const matchSearch = searchQuery 
      ? (v.registration.toLowerCase().includes(searchQuery.toLowerCase()) || 
         v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         v.type.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    const matchType = typeFilter === 'All' ? true : v.type === typeFilter;
    const matchStatus = statusFilter === 'All' ? true : v.status === statusFilter;

    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#1c221e] tracking-tight">Active Vehicle Registry</h2>
          <p className="text-xs text-[#526357] font-medium">Add, track, and filter operational transport machinery classes inside this platform.</p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1c221e] hover:bg-[#2b352e] text-white font-bold text-xs rounded-full transition-all cursor-pointer shadow-sm shadow-[#1c221e]/10 active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#a7e274] stroke-[3]" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="p-5 bg-white border border-[#e2ede4] rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Filter 1 */}
          <div>
            <label className="block text-[8px] font-mono font-bold text-[#627267] tracking-wider uppercase mb-1.5">Filter Class Type</label>
            <div className="relative min-w-[160px]">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-[#f3f7f2] border border-[#e2ede4]/40 text-xs font-bold text-[#1c221e] pl-4 pr-10 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8ac959] appearance-none cursor-pointer"
              >
                <option value="All">All Vehicle Classes</option>
                <option value="Heavy Truck">Heavy Truck</option>
                <option value="Semi-Trailer">Semi-Trailer</option>
                <option value="Box Truck">Box Truck</option>
                <option value="Cargo Van">Cargo Van</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#627267] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Filter 2 */}
          <div>
            <label className="block text-[8px] font-mono font-bold text-[#627267] tracking-wider uppercase mb-1.5">Filter Fleet Status</label>
            <div className="relative min-w-[140px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#f3f7f2] border border-[#e2ede4]/40 text-xs font-bold text-[#1c221e] pl-4 pr-10 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#8ac959] appearance-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="In Shop">In Shop</option>
                <option value="Retired">Retired</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#627267] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-between md:justify-end">
          {(typeFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setTypeFilter('All');
                setStatusFilter('All');
              }}
              className="text-[10px] font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 px-3.5 py-2 rounded-full transition-all cursor-pointer active:scale-95"
            >
              Clear Filters
            </button>
          )}
          <div className="text-[11px] font-bold text-[#627267] bg-[#f3f7f2] px-4 py-2 rounded-full border border-[#e2ede4]/40">
            Filtered: <span className="text-[#1c221e] font-extrabold">{filteredVehicles.length}</span> of {vehicles.length} vehicles
          </div>
        </div>
      </div>

      {/* REGISTRY TABLE (BENTO RECTANGLE) */}
      <div className="bg-white border border-[#e2ede4] rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fcfdfe] text-[10px] font-bold uppercase text-[#627267] border-b border-[#f0f6f1]">
              <tr>
                <th className="p-4 pl-6">Registration No</th>
                <th className="p-4">Name/Model</th>
                <th className="p-4">Vehicle Category</th>
                <th className="p-4">Max Capacity</th>
                <th className="p-4">Odometer Reading</th>
                <th className="p-4">Acquisition Cost</th>
                <th className="p-4 text-rose-600">Total Op Cost</th>
                <th className="p-4">Operational Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f7f2]">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-12 text-center text-[#627267] font-semibold">
                    No registered vehicles found matching the active filter parameters.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => {
                  const opCost = getVehicleOperationalCost(vehicle.registration);
                  return (
                    <tr key={vehicle.registration} className="hover:bg-[#f3f7f2]/40 transition-colors">
                      <td className="p-4 pl-6 font-mono font-extrabold text-[#8ac959] text-sm select-all">{vehicle.registration}</td>
                      <td className="p-4">
                        <div className="font-bold text-[#1c221e]">{vehicle.name}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full bg-[#f3f7f2] text-[#436e22] text-[11px] font-bold">
                          {vehicle.type}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-[#1c221e]">{vehicle.maxLoad.toLocaleString()} kg</td>
                      <td className="p-4 font-mono font-bold text-[#627267]">{vehicle.odometer.toLocaleString()} km</td>
                      <td className="p-4 font-mono font-bold text-[#1c221e]">₹{(vehicle.acquisitionCost || 1500000).toLocaleString()}</td>
                      <td className="p-4 font-mono font-bold text-rose-600">₹{opCost.toLocaleString()}</td>
                      <td className="p-4">{renderVehicleStatusPill(vehicle.status)}</td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="Edit Vehicle Specs"
                            onClick={() => handleOpenEdit(vehicle)}
                            className="p-1.5 rounded-lg text-[#526357] hover:text-[#1c221e] hover:bg-[#f3f7f2] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {vehicle.status !== 'Retired' && (
                            <button
                              title="Retire Asset"
                              onClick={() => handleQuickRetire(vehicle.registration)}
                              className="p-1.5 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-colors cursor-pointer"
                            >
                              <ShieldX className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            title="De-register Asset"
                            onClick={() => handleDeleteVehicle(vehicle.registration, vehicle.status)}
                            className="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD VEHICLE MODAL OVERLAY */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#e2ede4] w-full max-w-md rounded-[28px] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 bg-[#f3f7f2] border-b border-[#e2ede4] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1c221e] flex items-center justify-center">
                  <Truck className="w-4.5 h-4.5 text-[#a7e274]" />
                </div>
                <h3 className="font-sans font-extrabold text-sm text-[#1c221e]">Add Fleet Vehicle</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-[#627267] hover:text-[#1c221e] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateVehicle} className="p-6 space-y-4">
              {formError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-800 text-xs rounded-xl flex items-center gap-2.5">
                  <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-red-600" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                  REGISTRATION NUMBER (MUST BE UNIQUE)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. REG-1234"
                  value={regInput}
                  onChange={(e) => setRegInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                  VEHICLE MODEL NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Volvo FH16 Heavy Cargo"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    VEHICLE CLASS
                  </label>
                  <select
                    value={typeInput}
                    onChange={(e) => setTypeInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  >
                    <option value="Heavy Truck">Heavy Truck</option>
                    <option value="Semi-Trailer">Semi-Trailer</option>
                    <option value="Box Truck">Box Truck</option>
                    <option value="Cargo Van">Cargo Van</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    MAX CAPACITY (KG)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15000"
                    value={loadInput}
                    onChange={(e) => setLoadInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    ODOMETER READING (KM)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50000"
                    value={odometerInput}
                    onChange={(e) => setOdometerInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    ACQUISITION COST (INR)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 4500000"
                    value={costInput}
                    onChange={(e) => setFormError('') || setCostInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  />
                </div>
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
                  className="px-5 py-2.5 bg-[#1c221e] hover:bg-[#2b352e] text-white text-xs font-bold rounded-full transition-all cursor-pointer"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT VEHICLE MODAL OVERLAY */}
      {showEditModal && editingVehicle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#e2ede4] w-full max-w-md rounded-[28px] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 bg-[#f3f7f2] border-b border-[#e2ede4] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1c221e] flex items-center justify-center">
                  <Truck className="w-4.5 h-4.5 text-[#a7e274]" />
                </div>
                <h3 className="font-sans font-extrabold text-sm text-[#1c221e]">Edit specs: {editingVehicle.registration}</h3>
              </div>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingVehicle(null);
                }}
                className="text-[#627267] hover:text-[#1c221e] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditVehicleSubmit} className="p-6 space-y-4">
              {editError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-800 text-xs rounded-xl flex items-center gap-2.5">
                  <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-red-600" />
                  <span className="font-semibold">{editError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                  REGISTRATION NUMBER (READ-ONLY)
                </label>
                <input
                  type="text"
                  disabled
                  value={editingVehicle.registration}
                  className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#526357] font-mono font-bold outline-none cursor-not-allowed opacity-75"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                  VEHICLE MODEL NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Volvo FH16"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    VEHICLE CLASS
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  >
                    <option value="Heavy Truck">Heavy Truck</option>
                    <option value="Semi-Trailer">Semi-Trailer</option>
                    <option value="Box Truck">Box Truck</option>
                    <option value="Cargo Van">Cargo Van</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    MAX CAPACITY (KG)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15000"
                    value={editLoad}
                    onChange={(e) => setEditLoad(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    ODOMETER READING (KM)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50000"
                    value={editOdometer}
                    onChange={(e) => setEditOdometer(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    ACQUISITION COST (INR)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 4500000"
                    value={editCost}
                    onChange={(e) => setEditCost(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                  OPERATIONAL STATUS
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                >
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="In Shop">In Shop</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f3f7f2]">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingVehicle(null);
                  }}
                  className="px-5 py-2.5 bg-[#f3f7f2] hover:bg-[#e2ede4] text-[#1c221e] text-xs font-bold rounded-full transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1c221e] hover:bg-[#2b352e] text-white text-xs font-bold rounded-full transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
