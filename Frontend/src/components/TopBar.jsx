import React, { useState, useEffect, useRef } from 'react';
import { useTransit } from '../context/TransitContext';
import { 
  Search, Bell, Calendar, User, ShieldAlert, Trash2, Check, X, 
  ChevronRight, Edit3, Shield, Key, AlertTriangle, Info, CheckCircle2,
  Truck, Users, Wrench, Sparkles, Navigation
} from 'lucide-react';

export default function TopBar({ searchQuery, setSearchQuery, placeholder = "Search platform records...", currentView, setCurrentView }) {
  const { 
    user, 
    userName, 
    setUserName,
    userAvatar,
    setUserAvatar,
    selectedDate,
    setSelectedDate,
    notifications,
    markNotificationRead,
    deleteNotification,
    clearAllNotifications,
    permissionsByRole,
    vehicles,
    drivers,
    trips,
    maintenance
  } = useTransit();

  // Dropdown states
  const [showCalendar, setShowCalendar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Profile name editing states
  const [editingName, setEditingName] = useState(false);
  const [newNameInput, setNewNameInput] = useState(userName || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Accordion active tab inside Account Structure
  const [showPermissionsMatrix, setShowPermissionsMatrix] = useState(true);

  // Refs for click outside
  const calendarRef = useRef(null);
  const notificationsRef = useRef(null);
  const accountRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    setNewNameInput(userName || '');
  }, [userName]);

  // Click outside handling
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setShowAccount(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  // Pretty title depending on current view context
  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'TransitOps Terminal';
      case 'vehicles':
        return 'Fleet Registry';
      case 'drivers':
        return 'Operators Safety';
      case 'trips':
        return 'Trip Dispatcher';
      case 'maintenance':
        return 'Workshop Center';
      case 'expenses':
        return 'General Ledger';
      case 'reports':
        return 'Analytical Reports';
      case 'settings':
        return 'Admin Board';
      default:
        return 'TransitOps';
    }
  };

  // July 2026 starts on Wednesday (index 3, Sunday=0) and has 31 days
  const daysInJuly = Array.from({ length: 31 }, (_, i) => i + 1);
  const paddingBefore = Array.from({ length: 3 }, () => null);
  const julyCalendarGrid = [...paddingBefore, ...daysInJuly];

  // Helper for notification styling
  const getNotifIcon = (type) => {
    switch (type) {
      case 'danger':
        return <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-[#436e22] shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-600 shrink-0" />;
    }
  };

  const getNotifBadgeBg = (type) => {
    switch (type) {
      case 'danger': return 'bg-red-50 border-red-100 text-red-800';
      case 'warning': return 'bg-amber-50 border-amber-100 text-amber-800';
      case 'success': return 'bg-[#edf7ec] border-[#d2edd0] text-[#3d7a3a]';
      default: return 'bg-blue-50 border-blue-100 text-blue-800';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSaveName = (e) => {
    e.preventDefault();
    if (newNameInput.trim()) {
      setUserName(newNameInput.trim());
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setEditingName(false);
      }, 1200);
    }
  };

  // Human-readable long date string depending on selectedDate
  const getFormattedSelectedDate = () => {
    if (!selectedDate) return 'Saturday, July 11, 2026';
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1; // 0-indexed month
      const day = parseInt(parts[2], 10);
      
      const dateObj = new Date(year, monthIndex, day);
      
      // Get human-friendly day of week and month name
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthsOfYear = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      const dayName = daysOfWeek[dateObj.getDay()];
      const monthName = monthsOfYear[dateObj.getMonth()];
      
      return `${dayName}, ${monthName} ${day}, ${year}`;
    }
    return selectedDate;
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'vehicle':
        return <Truck className="w-3.5 h-3.5 text-blue-600" />;
      case 'driver':
        return <User className="w-3.5 h-3.5 text-emerald-600" />;
      case 'trip':
        return <Navigation className="w-3.5 h-3.5 text-amber-600" />;
      case 'maintenance':
        return <Wrench className="w-3.5 h-3.5 text-indigo-600" />;
      case 'quick':
        return <Sparkles className="w-3.5 h-3.5 text-[#8ac959]" />;
      default:
        return <Search className="w-3.5 h-3.5 text-[#627267]" />;
    }
  };

  // Dynamic search suggestions logic
  const getSuggestions = () => {
    const query = (searchQuery || '').trim().toLowerCase();
    
    if (!query) {
      // Return Popular / Suggested quick actions
      return [
        { type: 'quick', label: 'Filter Class: Heavy Trucks', query: 'Heavy Truck', view: 'vehicles', displayType: 'Preset' },
        { type: 'driver', label: 'Operator: Sarah Jenkins', query: 'Sarah Jenkins', view: 'drivers', displayType: 'Operator' },
        { type: 'trip', label: 'Voucher TRIP-1001 (Mumbai-Pune)', query: 'TRIP-1001', view: 'dashboard', displayType: 'Dispatch' },
        { type: 'maintenance', label: 'Repairs (REG-8899)', query: 'REG-8899', view: 'maintenance', displayType: 'Repair' },
      ];
    }

    const matches = [];

    // Match vehicles
    if (vehicles) {
      vehicles.forEach(v => {
        if (v.name.toLowerCase().includes(query) || v.registration.toLowerCase().includes(query)) {
          matches.push({
            type: 'vehicle',
            label: `${v.name} (${v.registration})`,
            query: v.registration,
            view: 'vehicles',
            displayType: 'Fleet Asset',
            sublabel: `Class: ${v.type} | Status: ${v.status}`
          });
        }
      });
    }

    // Match drivers
    if (drivers) {
      drivers.forEach(d => {
        if (d.name.toLowerCase().includes(query) || d.licenseNumber.toLowerCase().includes(query)) {
          matches.push({
            type: 'driver',
            label: d.name,
            query: d.name,
            view: 'drivers',
            displayType: 'Operator',
            sublabel: `CDL: ${d.licenseNumber} | Score: ${d.safetyScore}%`
          });
        }
      });
    }

    // Match trips
    if (trips) {
      trips.forEach(t => {
        if (
          t.id.toLowerCase().includes(query) || 
          t.source.toLowerCase().includes(query) || 
          t.destination.toLowerCase().includes(query)
        ) {
          matches.push({
            type: 'trip',
            label: `${t.source} → ${t.destination}`,
            query: t.id,
            view: 'dashboard',
            displayType: 'Trip Voucher',
            sublabel: `Voucher: ${t.id} | Status: ${t.status}`
          });
        }
      });
    }

    // Match maintenance
    if (maintenance) {
      maintenance.forEach(m => {
        if (m.description.toLowerCase().includes(query) || m.id.toLowerCase().includes(query) || m.vehicleReg.toLowerCase().includes(query)) {
          matches.push({
            type: 'maintenance',
            label: m.description,
            query: m.id,
            view: 'maintenance',
            displayType: 'Repair Log',
            sublabel: `ID: ${m.id} | Asset: ${m.vehicleReg}`
          });
        }
      });
    }

    return matches.slice(0, 5); // Limit to top 5 results for clean aesthetic spacing
  };

  return (
    <header id="app-header-banner" className="relative w-full min-h-[140px] bg-gradient-to-br from-[#c7daf0] via-[#dde8f5] to-[#ebf1f7] border border-[#d2e0f0] rounded-[32px] p-6 shadow-[0_12px_40px_rgba(200,215,235,0.4)] overflow-visible flex flex-col justify-between z-40">
      {/* Absolute SVG Arc lines backing matching the NEX architectural background */}
      <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply">
        <svg className="w-full h-full" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-100 250 C200 100, 400 300, 700 80 C850 -20, 950 15, 1100 50" stroke="#a2b9d4" strokeWidth="2.5" />
          <path d="M-50 200 C300 -50, 500 280, 800 120 C950 20, 1000 60, 1200 10" stroke="#b0cadc" strokeWidth="1.5" />
          <circle cx="650" cy="80" r="140" stroke="#b8cfdf" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      {/* Top row controls */}
      <div className="relative z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full overflow-visible">
        {/* Banner Logo / Page Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
            <span className="text-[#3b5266] font-extrabold text-sm tracking-tighter">T</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#223545] tracking-tight">
            {getViewTitle()}
          </h1>
        </div>

        {/* Global Search Pill Bar (matching mockup search) */}
        <div className="relative w-full max-w-md z-40" ref={searchRef}>
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
            <Search className="h-4 w-4 text-[#7d93a6]" />
          </div>
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => {
              setSearchQuery && setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full pl-11 pr-5 py-2.5 bg-white border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] shadow-[0_4px_16px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-[#8ac959] focus:bg-white transition-all animate-fade-in"
          />

          {showSuggestions && (
            <div 
              className="absolute left-0 right-0 mt-2 bg-white border border-[#e2ede4] rounded-[24px] shadow-[0_24px_60px_rgba(0,0,0,0.22)] p-4 z-50 text-[#1c221e] animate-fade-in max-w-md w-full"
              style={{ backgroundColor: '#ffffff', opacity: 1 }}
            >
              <div className="flex items-center justify-between border-b border-[#f3f7f2] pb-2 mb-2">
                <span className="text-[9px] font-mono font-bold text-[#627267] uppercase tracking-wider">
                  {searchQuery ? 'Search Match Results' : 'Suggested Fast Queries'}
                </span>
                {searchQuery && (
                  <button 
                    onClick={() => {
                      setSearchQuery && setSearchQuery('');
                    }}
                    className="text-[9px] font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Clear Search
                  </button>
                )}
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto no-scrollbar">
                {getSuggestions().length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-xs font-semibold text-[#627267]">No platform matches found.</p>
                    <p className="text-[10px] text-[#90a195] mt-0.5">Try searching registrations, names, or depots.</p>
                  </div>
                ) : (
                  getSuggestions().map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSearchQuery && setSearchQuery(item.query);
                        if (setCurrentView) {
                          setCurrentView(item.view);
                        }
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-[#f3f7f2] transition-all cursor-pointer flex items-start gap-3 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#f3f7f2] group-hover:bg-white flex items-center justify-center shrink-0 border border-[#e2ede4]/40 transition-colors">
                        {getSuggestionIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#1c221e] truncate group-hover:text-[#8ac959] transition-colors">{item.label}</span>
                          <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#edf7ec] text-[#436e22] uppercase tracking-wider shrink-0 ml-2">
                            {item.displayType}
                          </span>
                        </div>
                        {item.sublabel && (
                          <p className="text-[9px] text-[#627267] font-semibold mt-0.5 truncate">{item.sublabel}</p>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Utility Actions Deck with Clickable Dropdowns */}
        <div className="flex items-center gap-3 self-end sm:self-auto relative">
          
          {/* --- CLICKABLE CALENDAR CONTAINER --- */}
          <div className="relative" ref={calendarRef}>
            <button 
              onClick={() => {
                setShowCalendar(!showCalendar);
                setShowNotifications(false);
                setShowAccount(false);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer ${
                showCalendar ? 'bg-[#1c221e] text-[#a7e274]' : 'bg-white text-[#3b5266] hover:shadow-md'
              }`}
              title="Click to change target system date"
            >
              <Calendar className="w-4.5 h-4.5" />
            </button>

            {showCalendar && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-[#e2ede4] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-4 z-50 animate-fade-in text-[#1c221e]">
                <div className="flex items-center justify-between border-b border-[#f3f7f2] pb-2.5 mb-3">
                  <div className="text-left">
                    <span className="text-[10px] font-mono font-bold text-[#627267] uppercase tracking-wider">Operational Target</span>
                    <h4 className="text-xs font-black text-[#1c221e]">JULY 2026</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#edf7ec] text-[#436e22] rounded-full">
                    {selectedDate}
                  </span>
                </div>

                {/* Calendar Days Matrix Header */}
                <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-[#627267] font-mono mb-1">
                  <span>SU</span><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span>
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {julyCalendarGrid.map((day, idx) => {
                    if (day === null) {
                      return <div key={`pad-${idx}`} className="h-7" />;
                    }
                    const isTodayString = `2026-07-${String(day).padStart(2, '0')}`;
                    const isSelected = selectedDate === isTodayString;

                    return (
                      <button
                        key={`day-${day}`}
                        onClick={() => {
                          setSelectedDate(isTodayString);
                          setShowCalendar(false);
                        }}
                        className={`h-7 w-7 rounded-full text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[#1c221e] text-[#a7e274] scale-110 shadow-sm' 
                            : 'hover:bg-[#f3f7f2] text-[#1c221e]'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-[#f3f7f2] text-center">
                  <p className="text-[9px] text-[#627267] leading-tight font-medium">
                    Click any day in July to shift system terminal context and schedule mock dispatches.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* --- CLICKABLE NOTIFICATION CONTAINER --- */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowCalendar(false);
                setShowAccount(false);
              }}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer ${
                showNotifications ? 'bg-[#1c221e] text-[#a7e274]' : 'bg-white text-[#3b5266] hover:shadow-md'
              }`}
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-96 bg-white border border-[#e2ede4] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-4 z-50 animate-fade-in text-[#1c221e]">
                <div className="flex items-center justify-between border-b border-[#f3f7f2] pb-2.5 mb-2.5">
                  <div>
                    <h4 className="text-xs font-black text-[#1c221e]">System Alerts</h4>
                    <span className="text-[10px] text-[#627267] font-semibold">{unreadCount} unread reports active</span>
                  </div>
                  {notifications.length > 0 && (
                    <button 
                      onClick={() => clearAllNotifications()}
                      className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Notifications list */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-xs font-semibold text-[#627267]">No active security alerts.</p>
                      <p className="text-[10px] text-[#90a195] mt-0.5">Terminal telemetry is perfectly clear.</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => {
                          markNotificationRead(notif.id);
                          if (notif.view && setCurrentView) {
                            setCurrentView(notif.view);
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-[11px] leading-relaxed relative flex gap-2.5 items-start cursor-pointer transition-all hover:bg-[#fcfdfe] ${
                          notif.read ? 'bg-white opacity-60 border-[#f3f7f2]' : getNotifBadgeBg(notif.type) + ' shadow-sm'
                        }`}
                      >
                        {getNotifIcon(notif.type)}
                        
                        <div className="flex-1 pr-4">
                          <p className="font-semibold text-[#1c221e]">{notif.text}</p>
                          <span className="block text-[9px] text-[#627267] font-bold mt-1 font-mono">
                            {notif.date} {!notif.read && "● UNREAD"}
                          </span>
                        </div>

                        {/* Individual Trash can to delete notifications */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="absolute right-1.5 top-1.5 text-gray-400 hover:text-red-500 p-0.5 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#f3f7f2] flex items-center justify-between text-[10px] text-[#627267]">
                  <span>Operational logs synced</span>
                  <span className="font-mono text-[#436e22] font-bold">100% HEALTHY</span>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-[1px] h-6 bg-[#b8cfdf] mx-1 hidden sm:block"></div>

          {/* --- CLICKABLE ACCOUNT PROFILE AVATAR --- */}
          <div className="relative" ref={accountRef}>
            <div 
              onClick={() => {
                setShowAccount(!showAccount);
                setShowCalendar(false);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 cursor-pointer select-none bg-white hover:bg-[#f3f7f2] border border-[#e2ede4]/45 pl-3.5 pr-2 py-1.5 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-all active:scale-95 duration-200"
              title="Click to view detailed Account Access Structure"
            >
              <div className="text-right hidden md:block">
                <p className="text-xs font-extrabold text-[#1c221e] leading-none mb-0.5">{userName}</p>
                <p className="text-[8px] font-mono font-bold text-[#627267] uppercase tracking-widest">{user.role}</p>
              </div>
              
              <div className="relative shrink-0">
                <img 
                  src={userAvatar} 
                  alt={userName}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#8ac959] border-2 border-white rounded-full" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#8ac959] border-2 border-white rounded-full animate-ping opacity-75" />
              </div>
            </div>

            {showAccount && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-[#e2ede4] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-4.5 z-50 animate-fade-in text-[#1c221e]">
                
                {/* Account Structure Title Block */}
                <div className="text-center pb-3 border-b border-[#f3f7f2] mb-3.5">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <img 
                      src={userAvatar} 
                      alt={userName}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full object-cover border-4 border-[#f3f7f2] shadow-md mx-auto"
                    />
                    <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#8ac959] border-2 border-white rounded-full" />
                    <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#8ac959] border-2 border-white rounded-full animate-ping opacity-75" />
                  </div>
                  <h4 className="text-sm font-black text-[#1c221e] leading-tight">{userName}</h4>
                  <span className="text-[9px] font-mono font-extrabold text-[#436e22] bg-[#edf7ec] px-2.5 py-0.5 rounded-full mt-1.5 inline-block uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>

                {/* Avatar Preset Grid Selector */}
                <div className="mb-4 bg-[#fcfdfe] p-3 rounded-2xl border border-[#e2ede4] shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
                  <span className="block text-[9px] font-mono font-bold text-[#627267] uppercase tracking-wider mb-2 text-left">Select Profile Picture</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: 'Classic Officer', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80' },
                      { name: 'Elite Dispatcher', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80' },
                      { name: 'Senior Director', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80' },
                      { name: 'Ops Coordinator', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80' },
                    ].map((preset, idx) => {
                      const isSelected = userAvatar === preset.url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setUserAvatar(preset.url)}
                          className={`relative rounded-full p-0.5 transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center ${
                            isSelected ? 'ring-2 ring-[#8ac959] ring-offset-1 bg-[#8ac959]/10' : 'opacity-70 hover:opacity-100'
                          }`}
                          title={preset.name}
                        >
                          <img 
                            src={preset.url} 
                            alt={preset.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover shadow-sm"
                          />
                          {isSelected && (
                            <span className="absolute -top-0.5 -right-0.5 bg-[#8ac959] text-white rounded-full p-0.5 shadow-sm">
                              <Check className="w-2.5 h-2.5 stroke-[4px]" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Name Changer */}
                <div className="space-y-2 mb-4.5 bg-[#f3f7f2]/55 p-2.5 rounded-2xl border border-[#e2ede4]">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-[#627267] uppercase">Operator Display Identity</span>
                    {!editingName && (
                      <button 
                        onClick={() => setEditingName(true)}
                        className="text-[9px] font-bold text-[#436e22] flex items-center gap-0.5 hover:underline cursor-pointer"
                      >
                        <Edit3 className="w-2.5 h-2.5" /> Edit
                      </button>
                    )}
                  </div>

                  {editingName ? (
                    <form onSubmit={handleSaveName} className="space-y-1.5">
                      <input
                        type="text"
                        value={newNameInput}
                        onChange={(e) => setNewNameInput(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-[#e2ede4] rounded-full text-xs text-[#1c221e] focus:outline-none focus:ring-1 focus:ring-[#8ac959]"
                        autoFocus
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingName(false);
                            setNewNameInput(userName);
                          }}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-[9px] font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-2 py-1 bg-[#1c221e] text-white rounded-full text-[9px] font-bold cursor-pointer"
                        >
                          Save Name
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-xs font-bold text-[#1c221e] text-left">{userName}</p>
                  )}

                  {saveSuccess && (
                    <p className="text-[9px] font-bold text-[#3d7a3a] text-right animate-pulse">
                      ✓ Profile Name updated successfully!
                    </p>
                  )}
                </div>

                {/* Collapsible Access Clearance structure accordion (ACC STRUCTURE) */}
                <div className="border border-[#e2ede4] rounded-2xl overflow-hidden">
                  <button 
                    onClick={() => setShowPermissionsMatrix(!showPermissionsMatrix)}
                    className="w-full px-3 py-2 bg-[#fcfdfe] text-left flex items-center justify-between text-[10px] font-bold text-[#1c221e] hover:bg-[#f3f7f2]"
                  >
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#3b5266]" />
                      Clearance Structure
                    </span>
                    <ChevronRight className={`w-3 h-3 text-[#627267] transition-transform ${showPermissionsMatrix ? 'rotate-90' : ''}`} />
                  </button>

                  {showPermissionsMatrix && (
                    <div className="p-2.5 space-y-2 bg-white text-[10px] border-t border-[#e2ede4]">
                      <div className="flex justify-between text-[#627267] font-semibold">
                        <span>Node Component</span>
                        <span>Access Clearance</span>
                      </div>
                      
                      <div className="space-y-1 max-h-40 overflow-y-auto pr-0.5">
                        {Object.entries(permissionsByRole[user.role] || {}).map(([tabId, isGranted]) => (
                          <div key={tabId} className="flex justify-between items-center py-0.5 border-b border-[#fcfdfe]">
                            <span className="capitalize font-medium text-[#1c221e]">{tabId}</span>
                            <span className={`px-1.5 py-0.2 rounded font-mono text-[8px] font-bold ${
                              isGranted 
                                ? 'bg-[#edf7ec] text-[#436e22]' 
                                : 'bg-red-50 text-red-700'
                            }`}>
                              {isGranted ? 'GRANTED' : 'DENIED'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer security tag */}
                <div className="mt-3.5 pt-2 border-t border-[#f3f7f2] flex items-center justify-between text-[9px] text-[#627267] font-mono">
                  <span>Node: CLOUD-RUN-CJS</span>
                  <span className="font-bold text-[#436e22]">SECURED ACTIVE</span>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>

      {/* Floating Dynamic Welcome / Status Subtitle row */}
      <div className="relative z-0 mt-4 pt-4 border-t border-[#b8cde4]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <p className="text-xs font-semibold text-[#4f677d]">
          Welcome back, operator. Selected target operations date: <span className="text-[#1c221e] font-black">{getFormattedSelectedDate()}</span>.
        </p>
        
        {/* System Active badge */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1 bg-[#8ac959]/15 border border-[#8ac959]/35 rounded-full text-[10px] font-bold font-mono text-[#436e22]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8ac959] animate-ping" />
          <span>OPERATIONAL MODE: ON</span>
        </div>
      </div>
    </header>
  );
}
