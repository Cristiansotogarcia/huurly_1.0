
import React from 'react';
import { DashboardHeader, DashboardContent } from '@/components/dashboard';
import { LoadingState } from '@/components/states';
import { useBeheerderDashboard } from '@/hooks/useBeheerderDashboard';
import { useBeheerderActions } from '@/hooks/useBeheerderActions';
import UserManagement from '@/components/standard/UserManagement';
import { StatsGrid } from '@/components/standard/StatsGrid';
import { Users, Home, FileText } from 'lucide-react';
import { withAuth } from '@/hocs/withAuth';
import { User } from '@/types';

interface BeheerderDashboardProps {
  user: User;
}

const BeheerderDashboard: React.FC<BeheerderDashboardProps> = ({ user }) => {
  const { stats, users, loading: dataLoading } = useBeheerderDashboard();
  const actions = useBeheerderActions();

  if (dataLoading) {
    return <LoadingState />;
  }

  const beheerderStats = [
    {
      title: 'Totaal Gebruikers',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue-600',
      loading: dataLoading,
    },
    {
      title: 'Actieve Panden',
      value: stats.totalProperties || 0,
      icon: Home,
      color: 'green-600',
      loading: dataLoading,
    },
    {
      title: 'Documenten in Afwachting',
      value: stats.pendingDocuments,
      icon: FileText,
      color: 'orange-600',
      loading: dataLoading,
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DashboardHeader user={user} onLogout={actions.handleLogout} />
      <DashboardContent>
        <h1 className="text-3xl font-bold text-gray-800">Beheerder Dashboard</h1>
        <StatsGrid stats={beheerderStats} />

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-700">User Management</h2>
          <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
            <UserManagement users={users} onManageUser={actions.handleManageUsers} />
          </div>
        </div>
      </DashboardContent>
    </div>
  );
};

export default withAuth(BeheerderDashboard, 'beheerder');
