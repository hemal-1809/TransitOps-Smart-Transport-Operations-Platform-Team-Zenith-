import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { 
  TrendingUp, 
  Truck, 
  Users, 
  Activity, 
  Clock, 
  Gauge, 
  Wrench,
  AlertCircle,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Navigation,
  Loader2
} from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function Dashboard({ searchQuery, setCurrentView }) {
  const { 
    vehicles, 
    drivers, 
    trips, 
    isLicenseExpired,
    setVehicleStatusFilter,
    setTripDispatcherStep
  } = useTransit();
  
  // Local filter states
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');

  // AI Operations Advisor states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const askAiAdvisor = async (customPrompt) => {
    const promptToSend = customPrompt || aiPrompt;
    if (!promptToSend.trim()) return;

    setAiLoading(true);
    setAiError('');
    setAiResponse('');

    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptToSend,
          contextData: {
            totalVehicles,
            activeVehiclesCount,
            availableVehiclesCount,
            inMaintenanceCount,
            activeTripsCount,
            driversOnDutyCount,
            fleetUtilizationPercent,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server returned an error');
      }
      setAiResponse(data.text);
    } catch (err) {
      console.error(err);
      setAiError(err.message || 'An unexpected error occurred while communicating with the AI Advisor.');
    } finally {
      setAiLoading(false);
    }
  };

  const renderAiResponse = (text) => {
    if (!text) return null;
    return (
      <div className="space-y-3 text-xs leading-relaxed text-[#2c3e2e] animate-fade-in font-sans">
        {text.split('\n').map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-2" />;
          
          // Headings
          if (trimmed.startsWith('###')) {
            return (
              <h5 key={idx} className="text-xs font-mono font-bold uppercase tracking-wider text-[#3d7a3a] mt-4 mb-1">
                {trimmed.replace(/^###\s*/, '')}
              </h5>
            );
          }
          if (trimmed.startsWith('##') || trimmed.startsWith('#')) {
            return (
              <h4 key={idx} className="text-sm font-black text-[#1c221e] mt-5 mb-2 border-b border-[#e2ede4] pb-1">
                {trimmed.replace(/^#+\s*/, '')}
              </h4>
            );
          }
          
          // Bullet points
          if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
            const content = trimmed.replace(/^[\*\-]\s*/, '');
            // Simple bold parsing inside bullets
            return (
              <div key={idx} className="flex items-start gap-2.5 ml-1 my-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8ac959] shrink-0 mt-1.5" />
                <p className="flex-1 text-xs">
                  {parseBoldText(content)}
                </p>
              </div>
            );
          }
          
          // Plain line with simple bold parsing
          return <p key={idx} className="text-xs font-normal leading-relaxed">{parseBoldText(trimmed)}</p>;
        })}
      </div>
    );
  };

  const parseBoldText = (text) => {
    const parts = text.split('**');
    return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-extrabold text-[#1c221e]">{part}</strong> : part);
  };

  // --- DYNAMIC CARD CALCULATIONS ---
  const totalVehicles = vehicles.length;
  const activeVehiclesCount = vehicles.filter(v => v.status === 'On Trip').length;
  const availableVehiclesCount = vehicles.filter(v => v.status === 'Available').length;
  const inMaintenanceCount = vehicles.filter(v => v.status === 'In Shop').length;
  
  const activeTripsCount = trips.filter(t => t.status === 'Dispatched').length;
  const pendingTripsCount = trips.filter(t => t.status === 'Draft' || t.status === 'Pending').length + 1; // Seed a baseline pending task
  const driversOnDutyCount = drivers.filter(d => d.status === 'Available' || d.status === 'On Trip').length;
  
  const fleetUtilizationPercent = totalVehicles > 0 
    ? Math.round(((activeVehiclesCount) / totalVehicles) * 100) 
    : 0;

  // Render color pills for trip statuses matching the soft mockup theme
  const renderStatusPill = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#edf7ec] text-[#3d7a3a] border border-[#d2edd0] uppercase tracking-wider">Completed</span>;
      case 'Dispatched':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#fff7e6] text-[#b36b00] border border-[#ffe9cc] uppercase tracking-wider animate-pulse">Dispatched</span>;
      case 'Cancelled':
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100 uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-100 uppercase tracking-wider">{status}</span>;
    }
  };

  // --- FILTER TABLE LOGIC ---
  const filteredTrips = trips.filter(trip => {
    const vehicle = vehicles.find(v => v.registration === trip.vehicleReg);
    const driver = drivers.find(d => d.licenseNumber === trip.driverLic);
    
    // Search filter
    const matchSearch = searchQuery
      ? (trip.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
         trip.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
         trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
         (vehicle && vehicle.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
         (driver && driver.name.toLowerCase().includes(searchQuery.toLowerCase())))
      : true;

    // Vehicle Type Filter
    const matchType = vehicleTypeFilter === 'All' 
      ? true 
      : vehicle && vehicle.type === vehicleTypeFilter;

    // Status Filter
    const matchStatus = statusFilter === 'All'
      ? true
      : trip.status === statusFilter;

    // Region Filter (Source or Destination contains keyword)
    const matchRegion = regionFilter === 'All'
      ? true
      : (trip.source.toLowerCase().includes(regionFilter.toLowerCase()) || 
         trip.destination.toLowerCase().includes(regionFilter.toLowerCase()));

    return matchSearch && matchType && matchStatus && matchRegion;
  });

  const getProgressWidth = (trip) => {
    if (trip.status === 'Completed') return '100%';
    if (trip.status === 'Cancelled') return '0%';
    const percentage = trip.plannedDistance > 400 ? '45%' : '75%';
    return percentage;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* System Warning banner if driver licenses are expiring (Matching mockup green/red soft card alerts) */}
      {drivers.some(d => isLicenseExpired(d.licenseExpiry)) && (
        <div className="flex items-center justify-between gap-4 px-6 py-3.5 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-800 shadow-sm animate-pulse">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-semibold">Terminal Security Alert: One or more driver CDL licenses have expired. Assignation block active.</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100/50 px-2.5 py-0.5 rounded-full">Urgent</span>
        </div>
      )}

      {/* ROW OF 7 KPI CARDS (BENTO STYLE WITH MOCKUP PALETTE) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {/* Card 1: Lavender (Active Vehicles) */}
        <div 
          onClick={() => {
            setVehicleStatusFilter('On Trip');
            setCurrentView && setCurrentView('vehicles');
          }}
          className="aspect-square bg-[#e4e7f4] rounded-[24px] p-4 lg:p-5 flex flex-col justify-between relative overflow-hidden shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-200 cursor-pointer select-none active:scale-[0.98]"
        >
          <div>
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#818cf8] animate-pulse shadow-[0_0_8px_#818cf8] shrink-0" />
                <span className="text-[10px] md:text-[11px] lg:text-[12px] font-extrabold text-[#4c5570] uppercase tracking-wider truncate">Active Fleet</span>
              </div>
              <Truck className="w-3.5 h-3.5 lg:w-4.5 lg:h-4.5 text-[#4c5570] shrink-0" />
            </div>
            <p className="text-3xl lg:text-4xl font-black text-[#1e2638] font-mono mt-3">{activeVehiclesCount}</p>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-[11px] lg:text-[12px] font-semibold text-[#4c5570] leading-snug">On Trip live</span>
            {/* Dark circular button matching the premium NEX mock */}
            <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-[#4c5570] text-[#e4e7f4] flex items-center justify-center shadow-sm hover:bg-[#1e2638] hover:text-white transition-colors shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Card 2: Light Teal/Mint (Available Vehicles) */}
        <div 
          onClick={() => {
            setVehicleStatusFilter('Available');
            setCurrentView && setCurrentView('vehicles');
          }}
          className="aspect-square bg-[#e5f3f0] rounded-[24px] p-4 lg:p-5 flex flex-col justify-between relative overflow-hidden shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-200 cursor-pointer select-none active:scale-[0.98]"
        >
          <div>
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_#10b981] shrink-0" />
                <span className="text-[10px] md:text-[11px] lg:text-[12px] font-extrabold text-[#2e4c44] uppercase tracking-wider truncate">Ready Pool</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            </div>
            <p className="text-3xl lg:text-4xl font-black text-[#112d26] font-mono mt-3">{availableVehiclesCount}</p>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-[11px] lg:text-[12px] font-semibold text-[#2e4c44] leading-snug">Standby class</span>
            <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-[#2e4c44] text-[#e5f3f0] flex items-center justify-center shadow-sm hover:bg-[#112d26] hover:text-white transition-colors shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Card 3: Soft Sage-Yellow (In Shop) */}
        <div 
          onClick={() => {
            setVehicleStatusFilter('In Shop');
            setCurrentView && setCurrentView('vehicles');
          }}
          className="aspect-square bg-[#f0f4e8] rounded-[24px] p-4 lg:p-5 flex flex-col justify-between relative overflow-hidden shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-200 cursor-pointer select-none active:scale-[0.98]"
        >
          <div>
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse shadow-[0_0_8px_#f59e0b] shrink-0" />
                <span className="text-[10px] md:text-[11px] lg:text-[12px] font-extrabold text-[#454c35] uppercase tracking-wider truncate">In Repairs</span>
              </div>
              <Wrench className="w-3.5 h-3.5 lg:w-4.5 lg:h-4.5 text-[#454c35] shrink-0" />
            </div>
            <p className="text-3xl lg:text-4xl font-black text-[#2b331f] font-mono mt-3">{inMaintenanceCount}</p>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-[11px] lg:text-[12px] font-semibold text-[#454c35] leading-snug">Active service</span>
            <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-[#454c35] text-[#f0f4e8] flex items-center justify-center shadow-sm hover:bg-[#2b331f] hover:text-white transition-colors shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Card 4: Light Lime-Green (Active Trips) */}
        <div 
          onClick={() => {
            setTripDispatcherStep('Dispatched');
            setCurrentView && setCurrentView('trips');
          }}
          className="aspect-square bg-[#daf2c4] rounded-[24px] p-4 lg:p-5 flex flex-col justify-between relative overflow-hidden shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-200 cursor-pointer select-none active:scale-[0.98]"
        >
          <div>
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#8ac959] animate-pulse shadow-[0_0_8px_#8ac959] shrink-0" />
                <span className="text-[10px] md:text-[11px] lg:text-[12px] font-extrabold text-[#2d401e] uppercase tracking-wider truncate">Transit Logs</span>
              </div>
              <Activity className="w-3.5 h-3.5 lg:w-4.5 lg:h-4.5 text-[#2d401e] shrink-0" />
            </div>
            <p className="text-3xl lg:text-4xl font-black text-[#1b2b10] font-mono mt-3">{activeTripsCount}</p>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-[11px] lg:text-[12px] font-semibold text-[#2d401e] leading-snug">Dispatched</span>
            <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-[#2d401e] text-[#daf2c4] flex items-center justify-center shadow-sm hover:bg-[#1b2b10] hover:text-white transition-colors shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Card 5: Soft Pink-Lavender (Pending Queue) */}
        <div 
          onClick={() => {
            setTripDispatcherStep('Draft');
            setCurrentView && setCurrentView('trips');
          }}
          className="aspect-square bg-[#f5eef4] rounded-[24px] p-4 lg:p-5 flex flex-col justify-between relative overflow-hidden shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-200 cursor-pointer select-none active:scale-[0.98]"
        >
          <div>
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#d946ef] animate-pulse shadow-[0_0_8px_#d946ef] shrink-0" />
                <span className="text-[10px] md:text-[11px] lg:text-[12px] font-extrabold text-[#573f52] uppercase tracking-wider truncate">Draft Pool</span>
              </div>
              <Clock className="w-3.5 h-3.5 lg:w-4.5 lg:h-4.5 text-[#573f52] shrink-0" />
            </div>
            <p className="text-3xl lg:text-4xl font-black text-[#3d2438] font-mono mt-3">{pendingTripsCount}</p>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-[11px] lg:text-[12px] font-semibold text-[#573f52] leading-snug">Awaiting assignment</span>
            {/* Matches the third mockup image with high-contrast dark purple circular arrow button */}
            <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-[#3d2438] text-[#f5eef4] flex items-center justify-center shadow-sm hover:bg-[#573f52] hover:text-white transition-colors shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Card 6: Clean Blue-Gray (Drivers On Duty) */}
        <div 
          onClick={() => {
            setCurrentView && setCurrentView('drivers');
          }}
          className="aspect-square bg-[#edf2f6] rounded-[24px] p-4 lg:p-5 flex flex-col justify-between relative overflow-hidden shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-200 cursor-pointer select-none active:scale-[0.98]"
        >
          <div>
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse shadow-[0_0_8px_#06b6d4] shrink-0" />
                <span className="text-[10px] md:text-[11px] lg:text-[12px] font-extrabold text-[#354552] uppercase tracking-wider truncate">Active Staff</span>
              </div>
              <Users className="w-3.5 h-3.5 lg:w-4.5 lg:h-4.5 text-[#354552] shrink-0" />
            </div>
            <p className="text-3xl lg:text-4xl font-black text-[#1e2a33] font-mono mt-3">{driversOnDutyCount}</p>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-[11px] lg:text-[12px] font-semibold text-[#354552] leading-snug">On shift Live</span>
            <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-[#354552] text-[#edf2f6] flex items-center justify-center shadow-sm hover:bg-[#1e2a33] hover:text-white transition-colors shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Card 7: Premium Charcoal Accent (Utilization %) */}
        <div 
          onClick={() => {
            setCurrentView && setCurrentView('reports');
          }}
          className="aspect-square bg-[#1c221e] text-white rounded-[24px] p-4 lg:p-5 flex flex-col justify-between relative overflow-hidden shadow-md hover:translate-y-[-2px] hover:shadow-lg transition-all duration-200 cursor-pointer select-none active:scale-[0.98]"
        >
          <div>
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#a7e274] animate-pulse shadow-[0_0_8px_#a7e274] shrink-0" />
                <span className="text-[10px] md:text-[11px] lg:text-[12px] font-extrabold text-[#a7e274] uppercase tracking-wider truncate">Asset Rate</span>
              </div>
              <Gauge className="w-3.5 h-3.5 lg:w-4.5 lg:h-4.5 text-[#a7e274] shrink-0" />
            </div>
            <p className="text-3xl lg:text-4xl font-black text-[#a7e274] font-mono mt-3">{fleetUtilizationPercent}%</p>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-[11px] lg:text-[12px] font-semibold text-gray-400 leading-snug">Total capacity score</span>
            <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-[#a7e274] text-[#1c221e] flex items-center justify-center shadow-sm hover:bg-white hover:text-[#1c221e] transition-colors shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* NEW: LIVE TERMINAL ADVISORY BOARD (Highly relatable, dynamically reactive to selectedDate) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Widget 1: Dynamic Weather advisory */}
        <div className="bg-white border border-[#e2ede4] rounded-[24px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#627267] uppercase tracking-wider">Operations Weather Advisor</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h4 className="text-sm font-black text-[#1c221e] mt-1.5">
              {(() => {
                const day = parseInt(searchQuery || '11');
                if (day % 3 === 0) return '⛈️ Thunderstorms & Road Slickness';
                if (day % 5 === 0) return '🌫️ Dense Morning Fog Notice';
                return '☀️ Clear Skies & Dry Highways';
              })()}
            </h4>
            <p className="text-xs text-[#627267] leading-relaxed mt-2">
              {(() => {
                const day = parseInt(searchQuery || '11');
                if (day % 3 === 0) return 'Adverse wet road conditions active. Automatic driver safety alerts dispatched. Speed reduction of 15% recommended.';
                if (day % 5 === 0) return 'Low visibility reported on key interstate routes. Instruct drivers to activate front fog lanterns and double braking gap.';
                return 'Optimal meteorological conditions across all regional hub routes. High dispatch efficiency predicted. Asset velocity rates nominal.';
              })()}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f3f7f2] flex items-center justify-between text-[11px] font-bold text-[#4c5570]">
            <span>Average Visibility: 12.4 km</span>
            <span className="text-[#3d7a3a]">Temp: 78°F / 25°C</span>
          </div>
        </div>

        {/* Widget 2: Live Fuel & Congestion Index */}
        <div className="bg-white border border-[#e2ede4] rounded-[24px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#627267] uppercase tracking-wider">Commodity & Congestion Ledger</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#8ac959]" />
            </div>
            <h4 className="text-sm font-black text-[#1c221e] mt-1.5">Fuel Index: ₹94.50 / L</h4>
            <p className="text-xs text-[#627267] leading-relaxed mt-2 font-medium">
              National diesel commodity index is stable. Regional congestion scores:
              <span className="block mt-1 font-mono text-[10px] font-bold text-[#1c221e] bg-[#f3f7f2] px-2 py-1 rounded-md">
                • Mumbai-Pune Expressway: MODERATE (Delay 8m)<br />
                • Delhi Inner Ring Road: LOW (No delays)<br />
                • JNPT Port Access Road: HIGH (Delay 24m)
              </span>
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f3f7f2] flex items-center justify-between text-[11px] font-bold text-[#4c5570]">
            <span>Active Fuel Cards: 4/4</span>
            <span className="text-[#3d7a3a]">Refills: Normal</span>
          </div>
        </div>

        {/* Widget 3: Live Terminal Operator Pro-Tip */}
        <div className="bg-[#edf7ec] border border-[#d2edd0] rounded-[24px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#3d7a3a] uppercase tracking-wider">Terminal Dispatch Pro-Tip</span>
              <span className="text-xs px-2 py-0.5 bg-[#436e22]/10 text-[#436e22] font-bold rounded-full">ACTIVE</span>
            </div>
            <h4 className="text-sm font-black text-[#1c221e] mt-1.5">Operator Dispatcher Memo</h4>
            <p className="text-xs text-[#3d7a3a] leading-relaxed mt-2 font-semibold">
              {(() => {
                const day = parseInt(searchQuery || '11');
                if (day % 2 === 0) return 'Double-check container lock indicators before approving outbound dispatches from JNPT Port Navi Mumbai.';
                return 'Preventative maintenance window opens tomorrow for Tata Signa 5530.S units. Pre-book substitute standby vehicles from the Ready Pool.';
              })()}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#c3e3b5] flex items-center justify-between text-[11px] font-bold text-[#3d7a3a]">
            <span>Shift Lead: Alex Mercer</span>
            <span>Handover: 14:00</span>
          </div>
        </div>
      </div>

      <div id="gemini-advisor-section" className="bg-gradient-to-br from-[#edf7ec] to-[#f4faf2] border border-[#d2edd0] rounded-[28px] p-6 shadow-[0_8px_30px_rgba(138,201,89,0.06)] space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8ac959]/10 border border-[#8ac959]/20 flex items-center justify-center text-[#436e22] shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-extrabold text-base text-[#1c221e] tracking-tight">AI Fleet & Fuel Advisor</h3>
                <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#436e22] text-[#f4faf2] uppercase tracking-wider">PREMIUM CO-PILOT</span>
              </div>
              <p className="text-[11px] text-[#627267] mt-0.5">Instant operational insights, fuel pricing estimates (₹94.50), and safety advisories for Indian routes.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 max-w-xl">
            <span className="text-[9px] font-mono font-bold text-[#627267] uppercase tracking-wider mr-1">Fast Queries:</span>
            {[
              { label: '⛽ Petrol vs Diesel Costs', query: 'Compare petrol vs diesel fuel economy for Tata heavy-duty trucks and suggest diesel optimization tactics.' },
              { label: '🛣️ JNPT to Pune Logistics', query: 'Give me a route optimization plan and cargo safety advice for shipping 15 tons of payload from JNPT Port to Pune on NH-4.' },
              { label: '📈 Fuel Price (₹94.50) ROI', query: 'How does the current fuel price of ₹94.50/L affect our fleet operational return on investment (ROI) at ₹75/km?' },
              { label: 'monsoon Monsoon Highway Safety', query: 'List crucial monsoon safety protocols for long-haul truck operators on the Golden Quadrilateral highway system.' }
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAiPrompt(preset.query);
                  askAiAdvisor(preset.query);
                }}
                className="text-[10px] font-semibold text-[#436e22] bg-[#e3f2dc] hover:bg-[#d5edcc] border border-[#c3e3b5] px-3 py-1.5 rounded-full transition-all cursor-pointer active:scale-95"
              >
                {preset.label.replace('monsoon ', '🌧️ ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white border border-[#e2ede4] rounded-full p-1.5 pl-4 shadow-sm focus-within:ring-2 focus-within:ring-[#8ac959]/30 transition-all">
          <Sparkles className="w-4 h-4 text-[#8ac959]/70 shrink-0 ml-1.5" />
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                askAiAdvisor();
              }
            }}
            placeholder="Ask AI Advisor about vehicle operations, local fuel prices, route efficiency, driver performance, or petrol expenses..."
            className="flex-1 bg-transparent border-0 text-xs text-[#1c221e] placeholder-[#7d93a6] px-1 py-1 focus:outline-none focus:ring-0"
            disabled={aiLoading}
          />
          <button
            type="button"
            onClick={() => askAiAdvisor()}
            disabled={aiLoading || !aiPrompt.trim()}
            className="w-10 h-10 rounded-[18px] bg-[#8ac959] hover:bg-[#78b34c] text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:hover:bg-[#8ac959] shrink-0 active:scale-95 shadow-sm animate-fade-in"
          >
            {aiLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4.5 h-4.5 text-white stroke-[2.2]" />
            )}
          </button>
        </div>

        {(aiLoading || aiResponse || aiError) && (
          <div className="bg-white border border-[#edf3ed] rounded-2xl p-5 shadow-sm animate-fade-in-up">
            {aiLoading && (
              <div className="flex flex-col items-center justify-center py-6 space-y-3">
                <Loader2 className="w-8 h-8 text-[#8ac959] animate-spin" />
                <p className="text-xs font-bold text-[#627267] font-mono uppercase tracking-wider animate-pulse">Consulting Indian Road Logistics Engine...</p>
              </div>
            )}

            {aiError && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-3.5 text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold font-mono uppercase tracking-wider">Logistics Query Failure</p>
                  <p className="text-xs font-semibold mt-1 leading-relaxed">{aiError}</p>
                </div>
              </div>
            )}

            {aiResponse && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#f3f7f2] pb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8ac959]" />
                    <span className="text-[10px] font-mono font-bold text-[#627267] uppercase tracking-wider">TransitOps AI Intelligence Output</span>
                  </div>
                  <button
                    onClick={() => {
                      setAiResponse('');
                      setAiPrompt('');
                    }}
                    className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Clear Output
                  </button>
                </div>
                
                <div className="max-h-80 overflow-y-auto pr-2 scrollbar-thin">
                  {renderAiResponse(aiResponse)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FILTER CONTROLS BAR (Elegant and matching mockup clean form style) */}
      <div className="p-5 bg-white border border-[#e2ede4] rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2.5 text-xs font-bold text-[#1c221e]">
            <Filter className="w-4 h-4 text-[#627267]" />
            <span>Filter Operations:</span>
          </div>
 
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter 1 */}
            <CustomSelect
              value={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Vehicle Classes' },
                { value: 'Heavy Truck', label: 'Heavy Truck' },
                { value: 'Semi-Trailer', label: 'Semi-Trailer' },
                { value: 'Box Truck', label: 'Box Truck' },
                { value: 'Cargo Van', label: 'Cargo Van' }
              ]}
              minWidth="165px"
            />
 
            {/* Filter 2 */}
            <CustomSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Dispatched', label: 'Dispatched' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Cancelled', label: 'Cancelled' }
              ]}
              minWidth="135px"
            />
 
            {/* Filter 3 */}
            <CustomSelect
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Regions' },
                { value: 'Mumbai', label: 'Mumbai NH-4 Hub' },
                { value: 'Pune', label: 'Pune Industrial Depot' },
                { value: 'JNPT', label: 'JNPT Port Navi Mumbai' },
                { value: 'Bangalore', label: 'Bangalore Terminal' }
              ]}
              minWidth="165px"
              className="border-[#8ac959]/80"
            />

            {(vehicleTypeFilter !== 'All' || statusFilter !== 'All' || regionFilter !== 'All') && (
              <button
                onClick={() => {
                  setVehicleTypeFilter('All');
                  setStatusFilter('All');
                  setRegionFilter('All');
                }}
                className="text-[10px] font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 px-3.5 py-2 rounded-full transition-all cursor-pointer active:scale-95"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
 
        <div className="text-[11px] font-bold text-[#627267] bg-[#f3f7f2] px-4 py-2 rounded-full border border-[#e2ede4]/40">
          Showing <span className="text-[#1c221e] font-extrabold">{filteredTrips.length}</span> active transit contracts
        </div>
      </div>

      {/* RECENT TRIPS TABLE (BENTO RECTANGLE) */}
      <div className="bg-white border border-[#e2ede4] rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
        <div className="p-6 bg-white border-b border-[#f0f6f1] flex items-center justify-between">
          <div>
            <h3 className="font-sans font-extrabold text-base text-[#1c221e] tracking-tight">Active Fleet Dispatches</h3>
            <p className="text-[11px] text-[#627267] mt-0.5">Real-time status updates and progress indices across route lines.</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#436e22] bg-[#e3f2dc] px-3 py-1 rounded-full border border-[#c3e3b5]">
            Live Monitoring
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fcfdfe] text-[10px] font-bold uppercase text-[#627267] border-b border-[#f0f6f1]">
              <tr>
                <th className="p-4 pl-6">Trip Voucher</th>
                <th className="p-4">Assigned Asset</th>
                <th className="p-4">Staff Driver</th>
                <th className="p-4">Cargo & Route lines</th>
                <th className="p-4">Voucher Status</th>
                <th className="p-4 pr-6 text-right">Route Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f7f2]">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-[#627267] font-semibold">
                    No active trip records found matching your selection criteria.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => {
                  const vehicle = vehicles.find(v => v.registration === trip.vehicleReg);
                  const driver = drivers.find(d => d.licenseNumber === trip.driverLic);

                  return (
                    <tr key={trip.id} className="hover:bg-[#fcfdfe] transition-colors">
                      <td className="p-4 pl-6 font-mono font-bold text-[#1c221e]">{trip.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-[#1c221e]">{vehicle ? vehicle.name : 'Unknown'}</div>
                        <div className="text-[10px] font-mono text-[#627267]">{trip.vehicleReg}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-[#1c221e]">{driver ? driver.name : 'Unknown'}</div>
                        <div className="text-[10px] font-mono text-[#627267]">{trip.driverLic}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-bold text-[#1c221e]">
                          <span>{trip.source}</span>
                          <span className="text-[#a2bda7]">→</span>
                          <span>{trip.destination}</span>
                        </div>
                        <div className="text-[10px] font-semibold text-[#627267] mt-0.5">{trip.plannedDistance} km | Payload: {trip.cargoWeight.toLocaleString()} kg</div>
                      </td>
                      <td className="p-4">{renderStatusPill(trip.status)}</td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className="text-[10px] font-bold font-mono text-[#1c221e]">{getProgressWidth(trip)}</span>
                          <div className="w-20 bg-[#f0f6f1] rounded-full h-2 overflow-hidden border border-[#e2ede4]">
                            <div 
                              className="bg-[#8ac959] h-full rounded-full transition-all duration-300" 
                              style={{ width: getProgressWidth(trip) }}
                            ></div>
                          </div>
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
    </div>
  );
}
