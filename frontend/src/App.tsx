import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { CaseHistories } from './pages/CaseHistories';
import { Appointments } from './pages/Appointments';
import { StaffManagement } from './pages/StaffManagement';
import { AuditLogs } from './pages/AuditLogs';
import { OperationManagerDashboard } from './pages/OperationManagerDashboard';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex w-screen min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-8 flex-1 overflow-y-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/centralized-schedule" element={<OperationManagerDashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/case-histories" element={<CaseHistories />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
