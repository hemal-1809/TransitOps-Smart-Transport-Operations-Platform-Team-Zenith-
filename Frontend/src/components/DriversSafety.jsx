import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { Users, Plus, X, AlertTriangle, Edit2, Trash2, ShieldX } from 'lucide-react';

export default function DriversSafety({ searchQuery }) {
  const { drivers, addDriver, updateDriver, deleteDriver, isLicenseExpired } = useTransit();
  
  // UI states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [editError, setEditError] = useState('');

  // Add Form states
  const [nameInput, setNameInput] = useState('');
  const [licenseInput, setLicenseInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('Class A CDL');
  const [expiryInput, setExpiryInput] = useState('');
  const [scoreInput, setScoreInput] = useState('95');
  const [contactInput, setContactInput] = useState('');

  // Edit Form states
  const [editingDriver, setEditingDriver] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Class A CDL');
  const [editExpiry, setEditExpiry] = useState('');
  const [editScore, setEditScore] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editStatus, setEditStatus] = useState('Available');

  // Handle Create Driver
  const handleCreateDriver = (e) => {
    e.preventDefault();
    setFormError('');

    if (!nameInput || !licenseInput || !expiryInput || !scoreInput || !contactInput) {
      setFormError('All fields are required.');
      return;
    }

    const scoreValue = parseInt(scoreInput);
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
      setFormError('Safety score must be an integer between 0 and 100.');
      return;
    }

    try {
      addDriver({
        name: nameInput.trim(),
        licenseNumber: licenseInput.toUpperCase().trim(),
        licenseCategory: categoryInput,
        licenseExpiry: expiryInput,
        safetyScore: scoreValue,
        contactNumber: contactInput.trim(),
        status: 'Available'
      });

      // Reset form states
      setNameInput('');
      setLicenseInput('');
      setCategoryInput('Class A CDL');
      setExpiryInput('');
      setScoreInput('95');
      setContactInput('');
      setShowAddModal(false);
    } catch (err) {
      setFormError(err.message);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (driver) => {
    setEditingDriver(driver);
    setEditName(driver.name);
    setEditCategory(driver.licenseCategory);
    setEditExpiry(driver.licenseExpiry);
    setEditScore(driver.safetyScore.toString());
    setEditContact(driver.contactNumber || '');
    setEditStatus(driver.status);
    setEditError('');
    setShowEditModal(true);
  };

  // Handle Edit Submit
  const handleEditDriverSubmit = (e) => {
    e.preventDefault();
    setEditError('');

    if (!editName || !editExpiry || !editScore || !editContact) {
      setEditError('All fields are required.');
      return;
    }

    const scoreValue = parseInt(editScore);
    if (isNaN(scoreValue) || scoreValue < 0 || scoreValue > 100) {
      setEditError('Safety score must be an integer between 0 and 100.');
      return;
    }

    try {
      updateDriver(editingDriver.licenseNumber, {
        name: editName.trim(),
        licenseCategory: editCategory,
        licenseExpiry: editExpiry,
        safetyScore: scoreValue,
        contactNumber: editContact.trim(),
        status: editStatus
      });

      setShowEditModal(false);
      setEditingDriver(null);
    } catch (err) {
      setEditError(err.message);
    }
  };

  // Handle Delete Driver
  const handleDeleteDriver = (licenseNumber, status) => {
    if (status === 'On Trip') {
      alert('Cannot delete a driver currently assigned to an active trip. Complete or cancel the trip first.');
      return;
    }
    if (confirm(`Are you sure you want to remove driver ${licenseNumber} from the platform roster?`)) {
      deleteDriver(licenseNumber);
    }
  };

  // Handle Quick Suspend
  const handleQuickSuspend = (licenseNumber) => {
    if (confirm(`Mark driver ${licenseNumber} as Suspended? They will be blocked from active trips.`)) {
      updateDriver(licenseNumber, { status: 'Suspended' });
    }
  };

  // Render status pills strictly mapped to requested colors:
  // green=Available, blue=On Trip, orange=Off Duty, red=Suspended
  const renderDriverStatusPill = (status) => {
    switch (status) {
      case 'Available':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#edf7ec] text-[#3d7a3a] border border-[#d2edd0] uppercase tracking-wider">Available</span>;
      case 'On Trip':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#eef4fe] text-[#2c5282] border border-[#d3e4fd] uppercase tracking-wider">On Trip</span>;
      case 'Off Duty':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#fff7e6] text-[#b36b00] border border-[#ffe9cc] uppercase tracking-wider">Off Duty</span>;
      case 'Suspended':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#fff5f5] text-[#c53030] border border-[#fed7d7] uppercase tracking-wider">Suspended</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-100 uppercase tracking-wider">{status}</span>;
    }
  };

  // Filter drivers list based on search bar
  const filteredDrivers = drivers.filter(d => {
    if (!searchQuery) return true;
    return (
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.licenseCategory.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Collect expiring or already expired drivers
  const expiringDrivers = drivers.filter(d => isLicenseExpired(d.licenseExpiry));

  // Helper for safety score indicator
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-[#3d7a3a]';
    if (score >= 80) return 'text-[#b36b00]';
    return 'text-red-600';
  };

  const getScoreProgressColor = (score) => {
    if (score >= 90) return 'bg-[#8ac959]';
    if (score >= 80) return 'bg-[#e8940c]';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#1c221e] tracking-tight">Driver Profiles & Safety Logs</h2>
          <p className="text-xs text-[#526357] font-medium">Manage CDL permits, track operator safety performance scores, and inspect active duty rosters.</p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1c221e] hover:bg-[#2b352e] text-white font-bold text-xs rounded-full transition-all cursor-pointer shadow-sm shadow-[#1c221e]/10 active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#a7e274] stroke-[3]" />
          <span>Add Driver</span>
        </button>
      </div>

      {/* WARNING/ALERT ROW FOR EXPIRING LICENSES */}
      {expiringDrivers.length > 0 && (
        <div className="p-5 bg-red-50 border border-red-100 rounded-2xl space-y-2.5 shadow-sm">
          <div className="flex items-center gap-2 text-red-800 font-sans font-extrabold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4.5 h-4.5 text-red-600 animate-pulse shrink-0" />
            <span>CRITICAL LICENSE COMPLIANCE BLOCKS ({expiringDrivers.length})</span>
          </div>
          <ul className="space-y-1.5 pl-1">
            {expiringDrivers.map((driver) => (
              <li key={driver.licenseNumber} className="text-xs text-[#521b1b] font-medium list-disc ml-4">
                <span className="font-extrabold text-red-800">{driver.name}</span> (Permit: {driver.licenseNumber}) expired on <span className="text-red-700 font-bold">{driver.licenseExpiry}</span>. Automatically gated from active dispatcher selection.
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* REGISTRY TABLE (BENTO RECTANGLE) */}
      <div className="bg-white border border-[#e2ede4] rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
        <div className="p-6 bg-[#fcfdfe] border-b border-[#f0f6f1] flex items-center justify-between">
          <span className="text-sm font-extrabold text-[#1c221e] tracking-tight">Active Operator Roster</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#627267] bg-[#f3f7f2] px-3 py-1 rounded-full">
            Registry count: {filteredDrivers.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fcfdfe] text-[10px] font-bold uppercase text-[#627267] border-b border-[#f0f6f1]">
              <tr>
                <th className="p-4 pl-6">Driver Name</th>
                <th className="p-4">Contact Number</th>
                <th className="p-4">License Number</th>
                <th className="p-4">Class Permit</th>
                <th className="p-4">Regulatory Expiry</th>
                <th className="p-4">Safety Performance Score</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f7f2]">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-[#627267] font-semibold">
                    No drivers found matching your active filter keywords.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => {
                  const expired = isLicenseExpired(driver.licenseExpiry);
                  return (
                    <tr key={driver.licenseNumber} className="hover:bg-[#fcfdfe] transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-bold text-[#1c221e]">{driver.name}</div>
                        {expired && <div className="text-[9px] text-red-600 font-extrabold uppercase mt-0.5 tracking-wider">Permit Blocked</div>}
                      </td>
                      <td className="p-4 font-bold text-[#1c221e]">{driver.contactNumber || 'N/A'}</td>
                      <td className="p-4 font-mono font-bold text-[#627267]">{driver.licenseNumber}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full bg-[#f3f7f2] text-[#436e22] text-[11px] font-bold">
                          {driver.licenseCategory}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className={`font-mono font-bold ${expired ? 'text-red-600' : 'text-[#1c221e]'}`}>
                          {driver.licenseExpiry}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <span className={`text-sm font-mono font-extrabold ${getScoreColor(driver.safetyScore)}`}>
                            {driver.safetyScore}/100
                          </span>
                          <div className="w-20 bg-[#f0f6f1] h-1.5 rounded-full overflow-hidden border border-[#e2ede4]">
                            <div 
                              className={`h-full ${getScoreProgressColor(driver.safetyScore)}`} 
                              style={{ width: `${driver.safetyScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{renderDriverStatusPill(driver.status)}</td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="Edit Operator specs"
                            onClick={() => handleOpenEdit(driver)}
                            className="p-1.5 rounded-lg text-[#526357] hover:text-[#1c221e] hover:bg-[#f3f7f2] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {driver.status !== 'Suspended' && (
                            <button
                              title="Suspend Operator"
                              onClick={() => handleQuickSuspend(driver.licenseNumber)}
                              className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <ShieldX className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            title="De-register Operator"
                            onClick={() => handleDeleteDriver(driver.licenseNumber, driver.status)}
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

        {/* LEGEND ROW BELOW TABLE */}
        <div className="bg-[#fcfdfe] p-5 border-t border-[#f0f6f1] flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="text-[10px] font-bold text-[#627267] uppercase tracking-wider">
            Roster Status Mapping Guide:
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2 text-[10px] text-[#526357] font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8ac959] border border-[#a7e274]"></span>
              <span>Available (Permitted)</span>
            </span>
            <span className="flex items-center gap-2 text-[10px] text-[#526357] font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4299e1] border border-[#63b3ed]"></span>
              <span>On Trip (Active Duty)</span>
            </span>
            <span className="flex items-center gap-2 text-[10px] text-[#526357] font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e8940c] border border-[#f6ad55]"></span>
              <span>Off Duty (Unassigned)</span>
            </span>
            <span className="flex items-center gap-2 text-[10px] text-[#526357] font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f56565] border border-[#fc8181]"></span>
              <span>Suspended (Penalty)</span>
            </span>
          </div>
        </div>
      </div>

      {/* ADD DRIVER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#e2ede4] w-full max-w-md rounded-[28px] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 bg-[#f3f7f2] border-b border-[#e2ede4] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1c221e] flex items-center justify-center">
                  <Users className="w-4.5 h-4.5 text-[#a7e274]" />
                </div>
                <h3 className="font-sans font-extrabold text-sm text-[#1c221e]">Register Operator Profile</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-[#627267] hover:text-[#1c221e] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateDriver} className="p-6 space-y-4">
              {formError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-800 text-xs rounded-xl flex items-center gap-2.5">
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-red-600" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                  OPERATOR FULL NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Johnathan Doe"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    LICENSE PERMIT NUMBER
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LIC-4422-A"
                    value={licenseInput}
                    onChange={(e) => setLicenseInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    CONTACT PHONE NUMBER
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +1 (555) 234-5678"
                    value={contactInput}
                    onChange={(e) => setContactInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    LICENSE CLASS
                  </label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  >
                    <option value="Class A CDL">Class A CDL</option>
                    <option value="Class B CDL">Class B CDL</option>
                    <option value="Class C Standard">Class C Standard</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    SAFETY RATING (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    placeholder="e.g. 95"
                    value={scoreInput}
                    onChange={(e) => setScoreInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                  LICENSE REGULATORY EXPIRY DATE
                </label>
                <input
                  type="date"
                  required
                  value={expiryInput}
                  onChange={(e) => setExpiryInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
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
                  className="px-5 py-2.5 bg-[#1c221e] hover:bg-[#2b352e] text-white text-xs font-bold rounded-full transition-all cursor-pointer"
                >
                  Save Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DRIVER MODAL */}
      {showEditModal && editingDriver && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#e2ede4] w-full max-w-md rounded-[28px] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 bg-[#f3f7f2] border-b border-[#e2ede4] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1c221e] flex items-center justify-center">
                  <Users className="w-4.5 h-4.5 text-[#a7e274]" />
                </div>
                <h3 className="font-sans font-extrabold text-sm text-[#1c221e]">Edit Driver: {editingDriver.licenseNumber}</h3>
              </div>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingDriver(null);
                }}
                className="text-[#627267] hover:text-[#1c221e] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditDriverSubmit} className="p-6 space-y-4">
              {editError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-800 text-xs rounded-xl flex items-center gap-2.5">
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-red-600" />
                  <span className="font-semibold">{editError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                  OPERATOR FULL NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Johnathan Doe"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    LICENSE PERMIT NUMBER (READ-ONLY)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingDriver.licenseNumber}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#526357] font-mono font-bold outline-none cursor-not-allowed opacity-75"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    CONTACT PHONE NUMBER
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +1 (555) 234-5678"
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    LICENSE CLASS
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  >
                    <option value="Class A CDL">Class A CDL</option>
                    <option value="Class B CDL">Class B CDL</option>
                    <option value="Class C Standard">Class C Standard</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    SAFETY RATING (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    placeholder="e.g. 95"
                    value={editScore}
                    onChange={(e) => setEditScore(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    LICENSE REGULATORY EXPIRY DATE
                  </label>
                  <input
                    type="date"
                    required
                    value={editExpiry}
                    onChange={(e) => setEditExpiry(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    STATUS
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f3f7f2]">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDriver(null);
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
