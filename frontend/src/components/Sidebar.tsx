import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MindlapLogo } from './MindlapLogo';
import { LayoutDashboard, Users, FileText, Calendar, Folder, UserCheck, ShieldCheck, Download, CalendarCheck } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { effectiveRole } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['owner', 'admin', 'operation_manager', 'ccd', 'psychologist'] },
    { label: 'Clients Directory', path: '/clients', icon: Users, roles: ['owner', 'admin', 'operation_manager', 'ccd', 'psychologist'] },
    { label: 'Centralized Schedule', path: '/centralized-schedule', icon: CalendarCheck, roles: ['owner', 'admin', 'operation_manager'] },
    { label: 'Case Histories', path: '/case-histories', icon: FileText, roles: ['owner', 'admin', 'operation_manager', 'psychologist'] },
    { label: 'Appointments', path: '/appointments', icon: Calendar, roles: ['owner', 'admin', 'operation_manager', 'ccd'] },
    { label: 'Documents & Consent', path: '/documents', icon: Folder, roles: ['owner', 'admin', 'operation_manager'] },
    { label: 'Staff Management', path: '/staff', icon: UserCheck, roles: ['owner', 'admin'] },
    { label: 'Security Audit Log', path: '/audit-logs', icon: ShieldCheck, roles: ['owner', 'admin', 'operation_manager'] },
    { label: 'Export Data', path: '/export', icon: Download, roles: ['owner', 'admin', 'operation_manager'] },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 flex items-center border-b border-slate-800 bg-slate-950/40">
        <MindlapLogo variant="dark" size="md" showSubtitle={true} />
      </div>

      {/* Nav Menu */}
      <nav className="p-4 flex-1 flex flex-col gap-1">
        {navItems.filter(item => item.roles.includes(effectiveRole)).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-300 border-l-4 border-purple-500 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
        <div>Mindlap Healthcare Platform v3.0</div>
        <div className="text-[10px] text-slate-600">HIPAA & GDPR Compliant</div>
      </div>
    </aside>
  );
};
