import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Search, Shield, LogOut, Eye } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, effectiveRole, setEffectiveRole, logout } = useAuth();

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'owner':
      case 'admin':
        return 'Owner (Director)';
      case 'operation_manager':
        return 'Operation Manager';
      case 'psychologist':
        return 'Psychologist / Therapist';
      case 'ccd':
        return 'CCD Staff';
      default:
        return r;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients, IDs, phone..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 rounded-full border border-slate-200 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Role View Switcher for Owner/Admin */}
        {(role === 'owner' || role === 'admin' || user?.is_superuser) && (
          <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            <Eye className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">View As Dashboard:</span>
            <select
              value={effectiveRole}
              onChange={(e) => setEffectiveRole(e.target.value as UserRole)}
              className="bg-purple-100 text-purple-900 text-xs font-bold px-2 py-0.5 rounded-full border-none outline-none cursor-pointer"
            >
              <option value="owner">Owner View</option>
              <option value="operation_manager">Operation Manager View</option>
              <option value="psychologist">Psychologist View</option>
              <option value="ccd">CCD Staff View</option>
            </select>
          </div>
        )}

        {/* Current Role Badge */}
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          <Shield className="w-3.5 h-3.5 text-purple-500" />
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Active Role:</span>
          <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
            {getRoleLabel(effectiveRole)}
          </span>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-purple-500/20">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'EV'}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800 leading-none">{user?.name || 'Dr. Eleanor Vance'}</span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase mt-0.5">{role}</span>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors ml-2"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
