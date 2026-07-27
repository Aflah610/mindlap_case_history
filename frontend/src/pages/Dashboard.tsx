import React from 'react';
import { useAuth } from '../context/AuthContext';
import { OwnerDashboard } from './OwnerDashboard';
import { OperationManagerDashboard } from './OperationManagerDashboard';
import { TherapistDashboard } from './TherapistDashboard';
import { CCDDashboard } from './CCDDashboard';

export const Dashboard: React.FC = () => {
  const { effectiveRole } = useAuth();

  switch (effectiveRole) {
    case 'owner':
    case 'admin':
      return <OwnerDashboard />;
    case 'operation_manager':
      return <OperationManagerDashboard />;
    case 'psychologist':
      return <TherapistDashboard />;
    case 'ccd':
      return <CCDDashboard />;
    default:
      return <TherapistDashboard />;
  }
};

export default Dashboard;
