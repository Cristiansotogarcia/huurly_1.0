import React, { useState } from 'react';
import { DashboardHeader, DashboardContent } from '@/components/dashboard';
import { LoadingState } from '@/components/states';
import { useBeheerderDashboard } from '@/hooks/useBeheerderDashboard';
import { useBeheerderActions } from '@/hooks/useBeheerderActions';
import UserManagement from '@/components/standard/UserManagement';
import { CreateUserModal } from '@/components/admin/CreateUserModal';
import { StatsGrid } from '@/components/standard/StatsGrid';
import { Button } from '@/components/ui/button';
import { Users, Home, FileText, UserPlus } from 'lucide-react';
import { withAuth } from '@/hocs/withAuth';
import { User } from '@/types';

interface BeheerderDashboardProps {
  user: User;
}

const BeheerderDashboard: React.FC<BeheerderDashboardProps> = ({ user }) => {
  const { stats, users, loading: dataLoading, refresh } = useBeheerderDashboard();
  const actions = useBeheerderActions();
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

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
      value: 0, // Temporary placeholder since totalProperties doesn't exist in AdminStats
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Beheerder Dashboard</h1>
          <Button 
            onClick={() => setShowCreateUserModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Nieuwe Gebruiker
          </Button>
        </div>
        <StatsGrid stats={beheerderStats} />

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-700">User Management</h2>
          <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
            <UserManagement users={users} onManageUser={actions.handleManageUsers} />
          </div>
        </div>
      </DashboardContent>
      
      <CreateUserModal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onSuccess={() => {
          // Refresh the dashboard data after creating a user
          if (refresh) {
            refresh();
          }
        }}
      />
    </div>
  );
};

export default withAuth(BeheerderDashboard, 'beheerder');
