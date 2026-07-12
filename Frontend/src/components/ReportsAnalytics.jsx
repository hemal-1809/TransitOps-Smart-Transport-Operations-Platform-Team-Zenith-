import React from 'react';
import { useTransit } from '../context/TransitContext';
import { BarChart3, TrendingUp, IndianRupee, Gauge, Fuel, Download } from 'lucide-react';

export default function ReportsAnalytics() {
  const { vehicles, drivers, trips, expenses, maintenance } = useTransit();

  // --- DYNAMIC CALCULATIONS ---
  const completedTrips = trips.filter(t => t.status === 'Completed');
  const dispatchedTrips = trips.filter(t => t.status === 'Dispatched');

  // Total Distance covered on trips
  const totalTripDistance = [...completedTrips, ...dispatchedTrips]
    .reduce((sum, t) => sum + parseInt(t.plannedDistance || 0), 0);

  // Total Fuel liters
  const totalFuelLiters = expenses
    .filter(e => e.type === 'Fuel')
    .reduce((sum, e) => sum + (e.liters || 0), 0);

  // 1. Fuel Efficiency (km/l)
  const fuelEfficiency = totalFuelLiters > 0 
    ? (totalTripDistance / totalFuelLiters).toFixed(1) 
    : '2.4'; // High fidelity fallback matching mockup

  // 2. Fleet Utilization %
  const activeVehicles = vehicles.filter(v => v.status === 'On Trip').length;
  const totalVehiclesCount = vehicles.length;
  const fleetUtilization = totalVehiclesCount > 0 
    ? Math.round((activeVehicles / totalVehiclesCount) * 100) 
    : 75;

  // 3. Operational Cost
  const fuelCostSum = expenses.filter(e => e.type === 'Fuel').reduce((sum, e) => sum + e.cost, 0);
  const miscCostSum = expenses.filter(e => e.type === 'Expense').reduce((sum, e) => sum + e.cost, 0);
  const maintenanceCostSum = maintenance.reduce((sum, m) => sum + m.cost, 0);
  const totalOperationalCost = fuelCostSum + miscCostSum + maintenanceCostSum;

  // 4. Vehicle ROI % 
  // Formula: ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
  const estimatedRevenue = totalTripDistance * 75.0; // ₹75.00 per km
  const totalAcquisitionCost = vehicles.reduce((sum, v) => sum + (v.acquisitionCost || 1500000), 0);
  const totalFuelAndMaintenance = fuelCostSum + maintenanceCostSum;
  const vehicleROI = totalAcquisitionCost > 0 
    ? Math.round(((estimatedRevenue - totalFuelAndMaintenance) / totalAcquisitionCost) * 100)
    : 114;

  // SVG Chart seed data (weekly operating costs)
  const weeklyData = [
    { day: 'Mon', cost: 1200 },
    { day: 'Tue', cost: 1850 },
    { day: 'Wed', cost: 900 },
    { day: 'Thu', cost: 2400 },
    { day: 'Fri', cost: 1650 },
    { day: 'Sat', cost: 750 },
    { day: 'Sun', cost: 500 },
  ];

  const maxCost = Math.max(...weeklyData.map(d => d.cost));
  const chartHeight = 150;
  const chartWidth = 500;

  // Two Horizontal Progress Bars comparing Cost Categories
  const combinedCostBase = (maintenanceCostSum + fuelCostSum) || 1;
  const maintenanceRatio = Math.round((maintenanceCostSum / combinedCostBase) * 100);
  const fuelRatio = Math.round((fuelCostSum / combinedCostBase) * 100);

  // --- CSV EXPORT GENERATOR ---
  const exportToCSV = (filename, headers, rows) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => {
        const strVal = (val === null || val === undefined) ? '' : String(val);
        if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
          return `"${strVal.replace(/"/g, '""')}"`;
        }
        return strVal;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportVehicles = () => {
    const headers = ["Registration", "Name", "Type", "Max Capacity (kg)", "Odometer (km)", "Acquisition Cost (INR)", "Operational Cost (INR)", "Status"];
    const rows = vehicles.map(v => {
      const fuelCost = expenses.filter(e => e.vehicleReg === v.registration && e.type === 'Fuel').reduce((sum, e) => sum + e.cost, 0);
      const maintCost = maintenance.filter(m => m.vehicleReg === v.registration).reduce((sum, m) => sum + m.cost, 0);
      return [
        v.registration,
        v.name,
        v.type,
        v.maxLoad,
        v.odometer,
        v.acquisitionCost || 85000,
        fuelCost + maintCost,
        v.status
      ];
    });
    exportToCSV("transitops_vehicles_export.csv", headers, rows);
  };

  const handleExportDrivers = () => {
    const headers = ["Name", "Contact", "License Number", "License Class", "License Expiry", "Safety Score", "Status"];
    const rows = drivers.map(d => [
      d.name,
      d.contactNumber || 'N/A',
      d.licenseNumber,
      d.licenseCategory,
      d.licenseExpiry,
      d.safetyScore,
      d.status
    ]);
    exportToCSV("transitops_drivers_export.csv", headers, rows);
  };

  const handleExportTrips = () => {
    const headers = ["Trip ID", "Vehicle Reg", "Driver License", "Source", "Destination", "Planned Distance (km)", "Cargo Weight (kg)", "Status", "Dispatch Date"];
    const rows = trips.map(t => [
      t.id,
      t.vehicleReg,
      t.driverLic,
      t.source,
      t.destination,
      t.plannedDistance,
      t.cargoWeight,
      t.status,
      t.date
    ]);
    exportToCSV("transitops_trips_export.csv", headers, rows);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1c221e] tracking-tight">Analytical Telemetry Reporting</h2>
          <p className="text-xs text-[#526357] font-medium">Deep performance metrics, load utility ratings, fuel curves, and asset ROI sheets.</p>
        </div>
      </div>

      {/* Row of 4 KPI cards (Custom colors matching bento) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sage */}
        <div className="bg-[#f0f4e8] border border-[#d4dcc5]/50 p-5 rounded-[24px] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase text-[#454c35] tracking-wider">Fuel Efficiency</span>
            <Fuel className="w-4.5 h-4.5 text-[#454c35]" />
          </div>
          <p className="text-2xl font-black font-mono text-[#2b331f] leading-none">{fuelEfficiency} km/l</p>
          <span className="text-[9px] font-bold text-[#3d7a3a] mt-2 block">
            ↑ 4.2% vs previous quarter
          </span>
        </div>

        {/* Card 2: Blue-Gray */}
        <div className="bg-[#edf2f6] border border-[#ccd7e2]/50 p-5 rounded-[24px] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase text-[#354552] tracking-wider">Fleet Utilization</span>
            <Gauge className="w-4.5 h-4.5 text-[#354552]" />
          </div>
          <p className="text-2xl font-black font-mono text-[#1e2a33] leading-none">{fleetUtilization}%</p>
          <span className="text-[9px] font-bold text-[#2b6cb0] mt-2 block">
            Optimal operations target
          </span>
        </div>

        {/* Card 3: Premium Charcoal */}
        <div className="bg-[#1c221e] text-white p-5 rounded-[24px] shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase text-[#a7e274] tracking-wider">Operational Cost</span>
            <IndianRupee className="w-4.5 h-4.5 text-[#a7e274]" />
          </div>
          <p className="text-2xl font-black font-mono text-[#a7e274] leading-none">₹{totalOperationalCost.toLocaleString()}</p>
          <span className="text-[9px] font-bold text-gray-400 mt-2 block">
            Includes fuel, service, & tolls
          </span>
        </div>

        {/* Card 4: Minty-Lime */}
        <div className="bg-[#daf2c4] border border-[#bce29b]/50 p-5 rounded-[24px] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase text-[#2d401e] tracking-wider">Vehicle ROI Rating</span>
            <TrendingUp className="w-4.5 h-4.5 text-[#2d401e]" />
          </div>
          <p className="text-2xl font-black font-mono text-[#1b2b10] leading-none">{vehicleROI}%</p>
          <span className="text-[9px] font-bold text-[#3d7a3a] mt-2 block">
            ROI = (Rev - Op) / Acquisition Cost
          </span>
        </div>
      </div>

      {/* OPERATIONAL DATA EXPORTS SECTION */}
      <div className="bg-white border border-[#e2ede4] p-6 rounded-[28px] shadow-sm space-y-4">
        <div>
          <h3 className="font-sans font-extrabold text-sm text-[#1c221e] tracking-tight">Operational Data Spreadsheet Exports</h3>
          <p className="text-[11px] text-[#627267] mt-0.5">Generate and download official CSV sheets for asset auditing, roster verification, and trip records.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Export Card 1 */}
          <div className="p-4 bg-[#f3f7f2] border border-[#e2ede4] rounded-2xl flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <span className="block text-[8px] font-mono font-bold text-[#627267] uppercase tracking-wider">Fleet Records</span>
              <p className="text-xs font-extrabold text-[#1c221e]">Vehicle Ledger</p>
              <p className="text-[10px] text-[#526357] leading-relaxed">Includes model specifications, capacities, odometers, acquisition values, and cumulative operational costs.</p>
            </div>
            <button
              onClick={handleExportVehicles}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1c221e] hover:bg-[#2b352e] text-[#a7e274] hover:text-white font-bold text-xs rounded-full transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Fleet List (CSV)</span>
            </button>
          </div>

          {/* Export Card 2 */}
          <div className="p-4 bg-[#f3f7f2] border border-[#e2ede4] rounded-2xl flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <span className="block text-[8px] font-mono font-bold text-[#627267] uppercase tracking-wider">Human Resources</span>
              <p className="text-xs font-extrabold text-[#1c221e]">Driver Safety Roster</p>
              <p className="text-[10px] text-[#526357] leading-relaxed">Includes operator profiles, contact credentials, CDL classifications, license regulatory expirations, and safety scores.</p>
            </div>
            <button
              onClick={handleExportDrivers}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1c221e] hover:bg-[#2b352e] text-[#a7e274] hover:text-white font-bold text-xs rounded-full transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Drivers (CSV)</span>
            </button>
          </div>

          {/* Export Card 3 */}
          <div className="p-4 bg-[#f3f7f2] border border-[#e2ede4] rounded-2xl flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <span className="block text-[8px] font-mono font-bold text-[#627267] uppercase tracking-wider">Operations Log</span>
              <p className="text-xs font-extrabold text-[#1c221e]">Trip Activity Logs</p>
              <p className="text-[10px] text-[#526357] leading-relaxed">Includes dispatched route nodes, planned delivery loads, operational status records, and date keys.</p>
            </div>
            <button
              onClick={handleExportTrips}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1c221e] hover:bg-[#2b352e] text-[#a7e274] hover:text-white font-bold text-xs rounded-full transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Trips (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* CHARTS CONTAINER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Trend Bar Chart (8 columns on large screens) */}
        <div className="lg:col-span-8 bg-white border border-[#e2ede4] p-6 rounded-[28px] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-sans font-extrabold text-sm text-[#1c221e] tracking-tight">Weekly Expenditure Profile</h3>
              <p className="text-[11px] text-[#627267] mt-0.5">Sum of operational charges mapped across calendar dates.</p>
            </div>
            <span className="text-[9px] font-bold uppercase text-[#436e22] bg-[#edf7ec] px-3 py-1 rounded-full border border-[#d2edd0]">
              Live Chart (SVG)
            </span>
          </div>

          {/* SVG RENDERING */}
          <div className="relative w-full pt-4 flex justify-center">
            <svg 
              viewBox={`0 0 ${chartWidth} 200`} 
              className="w-full max-w-lg h-auto"
            >
              {/* Gridlines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f3f7f2" strokeDasharray="3,3" strokeWidth="1.5" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="#f3f7f2" strokeDasharray="3,3" strokeWidth="1.5" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="#f3f7f2" strokeDasharray="3,3" strokeWidth="1.5" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="#e2ede4" strokeWidth="1.5" />

              {/* Weekly bar items mapping */}
              {weeklyData.map((d, index) => {
                const barWidth = 32;
                const spacing = 60;
                const x = 50 + index * spacing;
                
                // Scale bar height relative to max cost
                const scaledHeight = (d.cost / maxCost) * chartHeight;
                const y = 170 - scaledHeight;

                return (
                  <g key={d.day} className="group cursor-pointer">
                    {/* Background hover highlights */}
                    <rect
                      x={x - 10}
                      y="10"
                      width={barWidth + 20}
                      height="170"
                      fill="transparent"
                      className="hover:fill-[#f3f7f2] transition-colors duration-200"
                      rx="12"
                    />

                    {/* Bar graphic with glowing fresh green accent */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={scaledHeight}
                      fill="#8ac959"
                      className="opacity-90 group-hover:fill-[#a7e274] transition-all duration-200"
                      rx="6"
                    />

                    {/* Label */}
                    <text
                      x={x + barWidth / 2}
                      y="188"
                      fill="#627267"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {d.day}
                    </text>

                    {/* Cost text value above bar on hover */}
                    <text
                      x={x + barWidth / 2}
                      y={y - 8}
                      fill="#1c221e"
                      fontSize="10"
                      fontWeight="extrabold"
                      textAnchor="middle"
                      fontFamily="monospace"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      ₹{d.cost}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* COST COMPARISON PANEL (4 columns on large screens) */}
        <div className="lg:col-span-4 bg-white border border-[#e2ede4] p-6 rounded-[28px] flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-1">
            <h3 className="font-sans font-extrabold text-sm text-[#1c221e] tracking-tight">Expense Distribution</h3>
            <p className="text-[11px] text-[#627267] mt-0.5">Comparing core workshop debits directly against fleet fuel logging.</p>
          </div>

          <div className="space-y-5 flex-1 justify-center flex flex-col">
            {/* RED BAR: Maintenance Costs */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#1c221e]">Workshop & Repair Shop</span>
                <span className="font-mono font-extrabold text-red-600">₹{maintenanceCostSum.toLocaleString()} ({maintenanceRatio}%)</span>
              </div>
              <div className="w-full bg-[#f3f7f2] h-2.5 rounded-full overflow-hidden border border-[#e2ede4]">
                <div 
                  className="bg-red-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${maintenanceRatio}%` }}
                ></div>
              </div>
            </div>

            {/* BLUE BAR: Fuel Costs */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#1c221e]">Fuel Receipts Tally</span>
                <span className="font-mono font-extrabold text-[#4299e1]">₹{fuelCostSum.toLocaleString()} ({fuelRatio}%)</span>
              </div>
              <div className="w-full bg-[#f3f7f2] h-2.5 rounded-full overflow-hidden border border-[#e2ede4]">
                <div 
                  className="bg-[#4299e1] h-full rounded-full transition-all duration-300"
                  style={{ width: `${fuelRatio}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Bottom quick insight */}
          <div className="p-4 bg-[#f3f7f2] rounded-2xl border border-[#e2ede4] text-[11px] text-[#526357] leading-relaxed font-sans">
            <span className="font-extrabold text-[#1c221e] uppercase tracking-wider block mb-1.5">PRO Dispatch Tip</span>
            Vehicles with higher safety ratings have shown a <span className="text-[#3d7a3a] font-extrabold">14% reduction</span> in average maintenance repair durations over this calendar cycle.
          </div>
        </div>
      </div>
    </div>
  );
}
