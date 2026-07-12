import React, { useState, useEffect } from 'react';
import { TransitProvider, useTransit } from './context/TransitContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

// Import Screens
import Authentication from './components/Authentication';
import Dashboard from './components/Dashboard';
import VehicleRegistry from './components/VehicleRegistry';
import DriversSafety from './components/DriversSafety';
import TripDispatcher from './components/TripDispatcher';
import Maintenance from './components/Maintenance';
import FuelExpenses from './components/FuelExpenses';
import ReportsAnalytics from './components/ReportsAnalytics';
import SettingsRBAC from './components/SettingsRBAC';

function AppContent() {
  const { user, isTabVisible } = useTransit();
  const [currentView, setCurrentView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-protect and fallback routing logic
  // If the user's role shifts and they are no longer authorized for the active tab, 
  // gracefully force-re-route them back to the dashboard.
  useEffect(() => {
    if (user && !isTabVisible(currentView)) {
      setCurrentView('dashboard');
    }
  }, [user, currentView]);

  // Reset search queries on page transition to prevent filter stickiness (Jakob's Law)
  useEffect(() => {
    setSearchQuery('');
  }, [currentView]);

  // Authentication gate
  if (!user) {
    return <Authentication />;
  }

  // Map current view string to its respective screen component
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard searchQuery={searchQuery} setCurrentView={setCurrentView} />;
      case 'vehicles':
        return <VehicleRegistry searchQuery={searchQuery} />;
      case 'drivers':
        return <DriversSafety searchQuery={searchQuery} />;
      case 'trips':
        return <TripDispatcher />;
      case 'maintenance':
        return <Maintenance searchQuery={searchQuery} />;
      case 'expenses':
        return <FuelExpenses searchQuery={searchQuery} />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'settings':
        return <SettingsRBAC />;
      default:
        return <Dashboard searchQuery={searchQuery} />;
    }
  };

  // Helper for topbar placeholder texts based on view to guide operators
  const getSearchPlaceholder = () => {
    switch (currentView) {
      case 'vehicles':
        return 'Search vehicles by model or registration number...';
      case 'drivers':
        return 'Search operator profiles by name or CDL license...';
      case 'maintenance':
        return 'Search maintenance logs by description or ID...';
      case 'expenses':
        return 'Search expense ledger, fuel stops, and tolls...';
      default:
        return 'Search platform operations, dispatch logs, and routes...';
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f7f2] text-[#1c221e] flex font-sans antialiased">
      {/* Persistent Left Navigation Panel (Floating vertical thin rail) */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Content Pane (Indented to offset the thin sidebar rail) */}
      <div className="flex-1 flex flex-col pl-28 pr-6 py-4 min-h-screen overflow-hidden">
        {/* Top telemetry and search header */}
        <TopBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          placeholder={getSearchPlaceholder()} 
          currentView={currentView}
          setCurrentView={setCurrentView}
        />

        {/* Scrollable Core Screen View Area */}
        <main className="mt-5 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}

// Wrap Content with the Context provider
export default function App() {
  return (
    <TransitProvider>
      <AppContent />
    </TransitProvider>
  );
}
