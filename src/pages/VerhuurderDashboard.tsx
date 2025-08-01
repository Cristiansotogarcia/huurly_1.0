
import { DashboardHeader, DashboardContent } from '@/components/dashboard';
import { useVerhuurderDashboard } from '@/hooks/useVerhuurderDashboard';
import { useVerhuurderActions } from '@/hooks/useVerhuurderActions';
import { StatsGrid } from '@/components/standard/StatsGrid';
import { List, FileText, MessageSquare, Eye } from 'lucide-react';
import DataTable, { Column, Action } from '@/components/standard/DataTable';
import { withAuth } from '@/hocs/withAuth';
import { User } from '@/types';
import { Property } from '@/types';
import PropertyModal from '@/components/modals/PropertyModal';

interface VerhuurderDashboardProps {
  user: User;
}

const VerhuurderDashboard: React.FC<VerhuurderDashboardProps> = ({ user }) => {
  const { properties, stats, loading: dashboardLoading, refresh } = useVerhuurderDashboard(user?.id);
  const { handleViewProperty, handleAddNewProperty, handleEditProperty, handleDeleteProperty, handleLogout, selectedProperty, showPropertyModal, closePropertyModal } = useVerhuurderActions();

  const verhuurderStats = [
    {
      title: 'Actieve Panden',
      value: stats?.activeListings ?? 0,
      icon: List,
      color: 'blue-600',
      loading: dashboardLoading,
    },
    {
      title: 'Totaal Aanvragen',
      value: stats?.totalApplications ?? 0,
      icon: FileText,
      color: 'green-600',
      loading: dashboardLoading,
    },
    {
      title: 'Ongelezen Berichten',
      value: stats?.unreadMessages ?? 0,
      icon: MessageSquare,
      color: 'orange-600',
      loading: dashboardLoading,
    },
    {
      title: 'Profiel Weergaven',
      value: stats?.profileViews ?? 0,
      icon: Eye,
      color: 'emerald-600',
      loading: dashboardLoading,
    },
  ];

  const columns: Column<Property>[] = [
    { key: 'title', header: 'Titel', accessor: 'title' },
    { key: 'address', header: 'Adres', accessor: 'address' },
    {
      key: 'rent',
      header: 'Huurprijs',
      accessor: 'rent',
      render: (item) => `€${item.rent.toLocaleString('nl-NL')}`
    },
    {
      key: 'isActive',
      header: 'Status',
      accessor: (item) => item.isActive ? 'Actief' : 'Inactief',
      render: (item) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          item.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {item.isActive ? 'Actief' : 'Inactief'}
        </span>
      ),
    },
  ];

  const actions: Action[] = [
    {
      label: 'Bekijk',
      action: 'view',
    },
    {
      label: 'Bewerk',
      action: 'edit',
    },
    {
      label: 'Verwijder',
      action: 'delete',
      variant: 'destructive',
    },
  ];

  const handleAction = (action: string, itemId: string, itemData?: Property) => {
    switch (action) {
      case 'view':
        if (itemData) handleViewProperty(itemData);
        break;
      case 'edit':
        if (itemData) handleEditProperty(itemData);
        break;
      case 'delete':
        handleDeleteProperty(itemId);
        break;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DashboardHeader user={user} onLogout={handleLogout} />
      <DashboardContent>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Verhuurder Dashboard</h1>
        </div>
        <StatsGrid stats={verhuurderStats} />

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Mijn Panden</h2>
            <button
                onClick={handleAddNewProperty}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Nieuw Pand Toevoegen
            </button>
          </div>
          <DataTable
              columns={columns}
              data={properties}
              actions={actions}
              onAction={handleAction}
              loading={dashboardLoading}
              emptyMessage="U heeft nog geen panden toegevoegd."
            />
        </div>
      </DashboardContent>
      
      <PropertyModal
        isOpen={showPropertyModal}
        onClose={closePropertyModal}
        property={selectedProperty}
        onSave={refresh}
      />
    </div>
  );
};

export default withAuth(VerhuurderDashboard, 'verhuurder');
