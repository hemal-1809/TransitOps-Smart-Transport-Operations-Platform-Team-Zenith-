import React, { useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { Settings, Shield, Check, X, CheckCircle2 } from 'lucide-react';

export default function SettingsRBAC() {
  const { userName, setUserName, permissionsByRole, user } = useTransit();
  
  // Local profile states
  const [nameInput, setNameInput] = useState(userName);
  const [profileSaved, setProfileSaved] = useState(false);

  // Form submit handler
  const handleProfileSave = (e) => {
    e.preventDefault();
    setProfileSaved(false);

    if (!nameInput.trim()) return;

    setUserName(nameInput.trim());
    localStorage.setItem('transitops_username', nameInput.trim());
    setProfileSaved(true);

    // Auto-clear notification
    setTimeout(() => setProfileSaved(false), 3000);
  };

  // Permission modules columns definitions
  const modules = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'vehicles', label: 'Vehicles' },
    { key: 'drivers', label: 'Drivers' },
    { key: 'trips', label: 'Trips' },
    { key: 'maintenance', label: 'Maintenance' },
    { key: 'expenses', label: 'Expenses' },
    { key: 'reports', label: 'Reports/Charts' },
    { key: 'settings', label: 'Settings' }
  ];

  const roles = [
    'Fleet Manager',
    'Dispatcher',
    'Safety Officer',
    'Financial Analyst'
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-extrabold text-[#1c221e] tracking-tight">Admin Settings & RBAC Control Board</h2>
        <p className="text-xs text-[#526357] font-medium">Configure terminal sessions, edit credentials, and inspect corporate role clearance tables.</p>
      </div>

      {/* TWO COLUMN SIDE-BY-SIDE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Profile Form (5 columns) */}
        <div className="lg:col-span-5 bg-white border border-[#e2ede4] rounded-[28px] overflow-hidden shadow-sm h-fit">
          <div className="p-5 bg-[#fcfdfe] border-b border-[#f0f6f1] flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#1c221e] uppercase tracking-wider font-sans">User Profile Configuration</span>
            <span className="text-[10px] font-bold text-[#627267] uppercase bg-[#f3f7f2] px-2.5 py-1 rounded-full">Active Session</span>
          </div>

          <form onSubmit={handleProfileSave} className="p-6 space-y-4">
            {profileSaved && (
              <div className="p-4 bg-[#edf7ec] border border-[#d2edd0] text-[#3d7a3a] text-xs rounded-xl flex items-center gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-[#3d7a3a]" />
                <span className="font-semibold">Profile settings updated successfully! Header tags updated.</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                FULL DISPATCHER OPERATOR NAME
              </label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="w-full px-4 py-2.5 bg-[#f3f7f2] border-0 rounded-full text-sm text-[#1c221e] placeholder-[#7d93a6] focus:outline-none focus:ring-2 focus:ring-[#8ac959]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono font-bold text-[#627267] tracking-wider uppercase">
                AUTHENTICATED EMAIL CREDENTIALS
              </label>
              <input
                type="text"
                disabled
                value={user ? user.email : 'system-admin@transitops.com'}
                className="w-full px-4 py-2.5 bg-[#f3f7f2]/50 border-0 rounded-full text-sm text-[#627267] select-all cursor-not-allowed font-mono font-bold"
              />
              <p className="text-[9px] font-bold text-[#627267] mt-1 pl-1">
                Your email is bound to your active RBAC token and cannot be edited.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1c221e] hover:bg-[#2b352e] text-white font-bold text-xs rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-[#1c221e]/10 active:scale-98"
            >
              <span>Save Profile Config</span>
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Permissions Matrix (7 columns) */}
        <div className="lg:col-span-7 bg-white border border-[#e2ede4] rounded-[28px] overflow-hidden shadow-sm">
          <div className="p-5 bg-[#fcfdfe] border-b border-[#f0f6f1] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1c221e] flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-[#a7e274]" />
            </div>
            <span className="text-xs font-extrabold text-[#1c221e] uppercase tracking-wider font-sans">Role Permission Clearance Matrix</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fcfdfe] text-[9px] font-bold uppercase text-[#627267] border-b border-[#f0f6f1]">
                <tr>
                  <th className="p-4 pl-6 font-sans font-extrabold text-[#1c221e]">Terminal Role</th>
                  {modules.map((m) => (
                    <th key={m.key} className="p-2 text-center font-mono font-bold text-xs">{m.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f7f2]">
                {roles.map((roleName) => {
                  const rPermissions = permissionsByRole[roleName] || {};
                  const isUserRole = user && user.role === roleName;

                  return (
                    <tr 
                      key={roleName} 
                      className={`hover:bg-[#fcfdfe] transition-colors ${
                        isUserRole ? 'bg-[#edf7ec]/50 border-l-4 border-[#8ac959]' : ''
                      }`}
                    >
                      <td className="p-4 pl-6">
                        <div className="font-extrabold text-[#1c221e]">{roleName}</div>
                        {isUserRole && (
                          <div className="text-[8px] font-mono text-[#3d7a3a] uppercase font-black tracking-widest mt-1">
                            Your Active Role
                          </div>
                        )}
                      </td>

                      {/* Render checklist matrix items */}
                      {modules.map((m) => {
                        const hasAccess = rPermissions[m.key];

                        return (
                          <td key={m.key} className="p-2 text-center">
                            <div className="flex items-center justify-center">
                              {hasAccess ? (
                                <div className="w-6 h-6 rounded-full bg-[#edf7ec] border border-[#d2edd0] flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 text-[#3d7a3a] stroke-[3.5]" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                                  <X className="w-3 h-3 text-red-500/70 stroke-[3]" />
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Guidelines */}
          <div className="bg-[#f3f7f2] p-5 border-t border-[#e2ede4] text-[11px] text-[#526357] leading-relaxed font-sans">
            <span className="font-extrabold text-[#1c221e] uppercase tracking-wide block mb-1.5">Audit Policy Notes</span>
            Permissions are enforced at the app routing layer. To inspect restricted views, logout and sign back in using one of our quick pre-fill demonstration accounts on the login deck.
          </div>
        </div>
      </div>
    </div>
  );
}
