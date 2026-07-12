import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { Fuel, Plus, IndianRupee, X, AlertTriangle, Scale, CreditCard } from 'lucide-react';

export default function FuelExpenses({ searchQuery }) {
  const { 
    expenses, 
    maintenance, 
    vehicles, 
    addFuelLog, 
    addExpense 
  } = useTransit();

  // Modal control states
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [formError, setFormError] = useState('');

  // Form states
  const [vehicleReg, setVehicleReg] = useState('');
  const [liters, setLiters] = useState('');
  const [cost, setCost] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tolls'); // for misc expenses

  // Pre-select vehicle
  React.useEffect(() => {
    if (vehicles.length > 0 && !vehicleReg) {
      setVehicleReg(vehicles[0].registration);
    }
  }, [vehicles, vehicleReg]);

  const handleFuelSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!vehicleReg || !liters || !cost || !description) {
      setFormError('All fields are required.');
      return;
    }

    const litersNum = parseFloat(liters);
    const costNum = parseFloat(cost);

    if (isNaN(litersNum) || litersNum <= 0) {
      setFormError('Fuel volume must be a positive number.');
      return;
    }

    if (isNaN(costNum) || costNum <= 0) {
      setFormError('Fuel cost must be a positive number.');
      return;
    }

    addFuelLog({
      vehicleReg,
      liters: litersNum,
      cost: costNum,
      description: description.trim()
    });

    // Reset Form
    setLiters('');
    setCost('');
    setDescription('');
    setShowFuelModal(false);
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!vehicleReg || !cost || !description) {
      setFormError('All fields are required.');
      return;
    }

    const costNum = parseFloat(cost);
    if (isNaN(costNum) || costNum <= 0) {
      setFormError('Expense cost must be a positive number.');
      return;
    }

    addExpense({
      vehicleReg,
      cost: costNum,
      description: `${category}: ${description.trim()}`
    });

    // Reset Form
    setCost('');
    setDescription('');
    setShowExpenseModal(false);
  };

  // --- DYNAMIC LEDGER SUMMARY CALCULATIONS ---
  const fuelTotal = expenses
    .filter(e => e.type === 'Fuel')
    .reduce((sum, item) => sum + item.cost, 0);

  const miscTotal = expenses
    .filter(e => e.type === 'Expense')
    .reduce((sum, item) => sum + item.cost, 0);

  // Sum of all maintenance records in the database
  const maintenanceTotal = maintenance.reduce((sum, item) => sum + item.cost, 0);

  const totalOperationalCost = fuelTotal + miscTotal + maintenanceTotal;

  // Filter expenses list based on search query
  const filteredLedger = expenses.filter(item => {
    const v = vehicles.find(veh => veh.registration === item.vehicleReg);
    const vName = v ? v.name : '';
    const matchSearch = searchQuery
      ? (item.vehicleReg.toLowerCase().includes(searchQuery.toLowerCase()) ||
         vName.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#1c221e] tracking-tight">Fuel & Operational Expense Audits</h2>
          <p className="text-xs text-[#526357] font-medium">File terminal fuel receipts, index transit tolls, and tally global operational cost sheets.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setFormError('');
              setShowFuelModal(true);
            }}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-white border border-[#e2ede4] hover:bg-[#fcfdfe] text-[#1c221e] font-bold text-xs rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Fuel className="w-4 h-4 text-[#8ac959]" />
            <span>+ Fuel Log</span>
          </button>
          
          <button
            onClick={() => {
              setFormError('');
              setShowExpenseModal(true);
            }}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-[#1c221e] hover:bg-[#2b352e] text-white font-bold text-xs rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <IndianRupee className="w-4 h-4 text-[#a7e274]" />
            <span>+ Expense</span>
          </button>
        </div>
      </div>

      {/* COMPONENT SUMMARY BLOCK METRIC TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Box 1: Sage Yellow-Green */}
        <div className="bg-[#f0f4e8] border border-[#d4dcc5]/50 p-5 rounded-[24px] shadow-sm">
          <span className="text-[10px] font-bold uppercase text-[#454c35] tracking-wider">Accumulated Fuel Cost</span>
          <p className="text-2xl font-black font-mono text-[#2b331f] mt-2">₹{fuelTotal.toLocaleString()}</p>
        </div>
        
        {/* Box 2: Lavender */}
        <div className="bg-[#e4e7f4] border border-[#ccd1e2]/50 p-5 rounded-[24px] shadow-sm">
          <span className="text-[10px] font-bold uppercase text-[#4c5570] tracking-wider">Indexed Repair Shop Costs</span>
          <p className="text-2xl font-black font-mono text-[#1e2638] mt-2">₹{maintenanceTotal.toLocaleString()}</p>
        </div>
 
        {/* Box 3: Teal */}
        <div className="bg-[#e5f3f0] border border-[#c0dfd7]/50 p-5 rounded-[24px] shadow-sm">
          <span className="text-[10px] font-bold uppercase text-[#2e4c44] tracking-wider">Misc Operational Fees</span>
          <p className="text-2xl font-black font-mono text-[#112d26] mt-2">₹{miscTotal.toLocaleString()}</p>
        </div>
      </div>

      {/* EXPENSE LEDGER TABLE (BENTO CONTAINER) */}
      <div className="bg-white border border-[#e2ede4] rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
        <div className="p-6 bg-[#fcfdfe] border-b border-[#f0f6f1]">
          <span className="text-sm font-extrabold text-[#1c221e] tracking-tight">Corporate General Ledger</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-[#fcfdfe] text-[10px] font-bold uppercase text-[#627267] border-b border-[#f0f6f1]">
            <tr>
              <th className="p-4 pl-6">Voucher ID</th>
              <th className="p-4">Vehicle</th>
              <th className="p-4">Date Logged</th>
              <th className="p-4">Type</th>
              <th className="p-4">Fuel Volume</th>
              <th className="p-4">Expense Description</th>
              <th className="p-4 pr-6 text-right">Debit Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f7f2]">
            {filteredLedger.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-12 text-center text-[#627267] font-semibold">
                  No active ledger vouchers logged matching the query filters.
                </td>
              </tr>
            ) : (
              filteredLedger.map((item) => {
                const vehicle = vehicles.find((v) => v.registration === item.vehicleReg);

                return (
                  <tr key={item.id} className="hover:bg-[#fcfdfe] transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-[#627267]">{item.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-[#1c221e]">{vehicle ? vehicle.name : 'Unknown'}</div>
                      <div className="text-[10px] font-mono text-[#627267] mt-0.5">{item.vehicleReg}</div>
                    </td>
                    <td className="p-4 font-mono text-[#1c221e]">{item.date}</td>
                    <td className="p-4">
                      {item.type === 'Fuel' ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#edf7ec] text-[#3d7a3a] border border-[#d2edd0] uppercase tracking-wider">Fuel</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#f5eef4] text-[#805ad5] border border-[#e2cbdc] uppercase tracking-wider">Expense</span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-bold text-[#1c221e]">
                      {item.liters > 0 ? `${item.liters} L` : '—'}
                    </td>
                    <td className="p-4 font-sans font-medium text-[#526357]">{item.description}</td>
                    <td className="p-4 pr-6 text-right font-mono font-extrabold text-[#1c221e]">
                      ₹{item.cost.toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* COMPUTED HIGHLIGHT STAT ROW AT BOTTOM OF TABLE (Premium Dark Row matching mockup) */}
        <div className="bg-[#1c221e] text-white p-6 border-t border-[#e2ede4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f3f7f2]/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-[#a7e274]" />
            </div>
            <div>
              <span className="text-[9px] font-mono uppercase text-[#a7e274] tracking-wider font-extrabold">Tally Formula</span>
              <p className="text-xs text-gray-400 font-medium leading-none mt-1">Sum total of (Fuel Logs + Miscellaneous Vouchers + Repair Order Costs)</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-mono uppercase text-[#627267] tracking-wider block font-extrabold mb-1.5">TOTAL OPERATIONAL DEBIT</span>
            <span className="text-lg font-mono font-black text-[#a7e274] px-4 py-1.5 bg-[#a7e274]/15 border border-[#a7e274]/35 rounded-full">
              ₹{totalOperationalCost.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* FUEL LOG MODAL */}
      {showFuelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#e2ede4] w-full max-w-md rounded-[28px] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 bg-[#f3f7f2] border-b border-[#e2ede4] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1c221e] flex items-center justify-center">
                  <Fuel className="w-4.5 h-4.5 text-[#a7e274]" />
                </div>
                <h3 className="font-sans font-extrabold text-sm text-[#1c221e]">Log Fleet Fuel Voucher</h3>
              </div>
              <button onClick={() => setShowFuelModal(false)} className="text-[#627267] hover:text-[#1c221e] transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFuelSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-800 text-xs rounded-xl flex items-center gap-2.5">
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-red-600" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                  SELECT TARGET VEHICLE
                </label>
                <select
                  value={vehicleReg}
                  onChange={(e) => setVehicleReg(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                >
                  {vehicles.map((v) => (
                    <option key={v.registration} value={v.registration}>
                      {v.name} ({v.registration})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    FUEL VOLUME (LITERS)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 150"
                    value={liters}
                    onChange={(e) => setLiters(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    TOTAL COST (INR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 11400"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                  REFILLING POINT DETAIL
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shell Terminal Highway #99"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f3f7f2]">
                <button
                  type="button"
                  onClick={() => setShowFuelModal(false)}
                  className="px-5 py-2.5 bg-[#f3f7f2] hover:bg-[#e2ede4] text-[#1c221e] text-xs font-bold rounded-full transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1c221e] hover:bg-[#2b352e] text-white text-xs font-bold rounded-full transition-all cursor-pointer"
                >
                  Save Fuel Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MISC EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#e2ede4] w-full max-w-md rounded-[28px] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 bg-[#f3f7f2] border-b border-[#e2ede4] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1c221e] flex items-center justify-center">
                  <IndianRupee className="w-4.5 h-4.5 text-[#a7e274]" />
                </div>
                <h3 className="font-sans font-extrabold text-sm text-[#1c221e]">Log General Operation Fee</h3>
              </div>
              <button onClick={() => setShowExpenseModal(false)} className="text-[#627267] hover:text-[#1c221e] transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-800 text-xs rounded-xl flex items-center gap-2.5">
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-red-600" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                  SELECT TARGET VEHICLE
                </label>
                <select
                  value={vehicleReg}
                  onChange={(e) => setVehicleReg(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                >
                  {vehicles.map((v) => (
                    <option key={v.registration} value={v.registration}>
                      {v.name} ({v.registration})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    EXPENSE CATEGORY
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  >
                    <option value="Tolls">Tolls & Parking</option>
                    <option value="Fines">Compliance Fines</option>
                    <option value="Equipment">Spare Parts / Bulbs</option>
                    <option value="Insurance">Insurance / Admin</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                    AMOUNT DEBITED (INR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 1500"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                  TRANSACTION DETAIL / DESCRIPTION
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Toll road highway transit pass or wiper blade"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f3f7f2]">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-5 py-2.5 bg-[#f3f7f2] hover:bg-[#e2ede4] text-[#1c221e] text-xs font-bold rounded-full transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1c221e] hover:bg-[#2b352e] text-white text-xs font-bold rounded-full transition-all cursor-pointer"
                >
                  Save Expense Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
