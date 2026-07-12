import React from 'react';
import { useTransit } from '../context/TransitContext';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Navigation, 
  Wrench, 
  Fuel, 
  BarChart3, 
  Settings,
  LogOut,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView }) {
  const { logoutUser, user, isTabVisible } = useTransit();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vehicles', label: 'Vehicles', icon: Truck },
    { id: 'drivers', label: 'Drivers', icon: Users },
    { id: 'trips', label: 'Trips', icon: Navigation },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'expenses', label: 'Expenses & Fuel', icon: Fuel },
    { id: 'reports', label: 'Analytics', icon: BarChart3 },
  ];

  if (!user) return null;

  return (
    <aside id="sidebar-rail" className="fixed left-4 top-4 bottom-4 w-20 bg-white border border-[#e2ede4] rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col justify-between items-center py-6 z-30">
      {/* Brand Launcher Icon */}
      <div className="flex flex-col items-center">
        <div className="group relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8ac959] to-[#bbf093] flex items-center justify-center shadow-sm cursor-pointer transition-transform hover:scale-105">
          <Truck className="w-6 h-6 text-[#1c221e] stroke-[2.5]" />
          {/* Tooltip */}
          <div className="absolute left-16 bg-[#1c221e] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-50">
            TransitOps Fleet System
          </div>
        </div>
        <div className="w-8 h-[2px] bg-[#e2ede4] my-6"></div>
      </div>

      {/* Primary Navigation Hub */}
      <nav className="flex-1 flex flex-col gap-3.5 items-center justify-start w-full px-2 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => {
          const visible = isTabVisible(item.id);
          if (!visible) return null;

          const IconComponent = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              id={`nav-btn-${item.id}`}
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className="group relative w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer"
            >
              {/* Highlight backdrop */}
              <div 
                className={`absolute inset-0 rounded-full transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#a7e274] scale-100 shadow-[0_4px_14px_rgba(167,226,116,0.35)]' 
                    : 'bg-transparent group-hover:bg-[#f3f7f2] scale-90 group-hover:scale-100'
                }`}
              />
              
              {/* Icon */}
              <IconComponent 
                className={`w-[19px] h-[19px] relative z-10 transition-colors ${
                  isActive ? 'text-[#1c221e] stroke-[2.5]' : 'text-[#627267] group-hover:text-[#1c221e]'
                }`} 
              />

              {/* Smart Hover Tooltip */}
              <div className="absolute left-14 bg-[#1c221e] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-50">
                {item.label}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Controls & Operator Session */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        <div className="w-8 h-[2px] bg-[#e2ede4] my-2"></div>

        {/* Dynamic Settings Gear button (Routable Settings) - Prominent light-green/lime circle matching mockup */}
        {isTabVisible('settings') && (
          <button
            id="nav-btn-settings"
            onClick={() => setCurrentView('settings')}
            className={`group relative w-12 h-12 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 shadow-[0_4px_16px_rgba(167,226,116,0.45)] hover:shadow-[0_6px_22px_rgba(167,226,116,0.6)] hover:scale-105 active:scale-95 ${
              currentView === 'settings' 
                ? 'bg-[#a7e274] ring-2 ring-[#1c221e]/15 scale-105' 
                : 'bg-[#a7e274]'
            }`}
          >
            <Settings 
              className="w-[21px] h-[21px] text-[#1c221e] stroke-[2.5] relative z-10 transition-transform duration-500 ease-out group-hover:rotate-90" 
            />
            <div className="absolute left-15 bg-[#1c221e] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-50">
              Admin & Permissions
            </div>
          </button>
        )}

        {/* Logout (Styled identically to the exit button) */}
        <button
          id="btn-logout"
          onClick={logoutUser}
          className="group relative w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 text-[#ea5d5d] hover:bg-red-50 cursor-pointer"
        >
          <LogOut className="w-[19px] h-[19px] relative z-10" />
          <div className="absolute left-14 bg-[#ea5d5d] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-50">
            Sign Out Session
          </div>
        </button>

        {/* Tiny Active Role dot indicator */}
        <div className="group relative mt-3 cursor-help">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1c221e] to-[#2e3731] text-white flex items-center justify-center text-xs font-bold font-mono">
            {user.role[0]}
          </div>
          <div className="absolute left-14 bg-[#1c221e] text-white text-[10px] font-sans px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md z-50">
            Role: <span className="text-[#a7e274] font-bold">{user.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
