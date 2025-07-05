
import { DashboardHeader, DashboardContent } from '@/components/dashboard';
import { useVerhuurderDashboard } from '@/hooks/useVerhuurderDashboard';
import { useVerhuurderActions } from '@/hooks/useVerhuurderActions';
import { StatsGrid } from '@/components/standard/StatsGrid';
import { List, FileText, MessageSquare, Eye } from 'lucide-react';
import DataTable, { Column, Action } from '@/components/standard/DataTable';
import { withAuth } from '@/hocs/withAuth';
import { User } from '@/types';
import { Property } from '@/services/PropertyService';
import { PropertyModal } from '@/components/modals/PropertyModal';

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
    { header: 'Titel', accessor: 'titel' },
    { header: 'Adres', accessor: 'adres' },
    { 
      header: 'Huurprijs',
      accessor: 'huurprijs',
      render: (item) => `€${item.huurprijs.toLocaleString('nl-NL')}`
    },
    {
        header: 'Status',
        accessor: (item) => item.is_actief ? 'Actief' : 'Inactief',
        render: (item) => (
            <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.is_actief ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                {item.is_actief ? 'Actief' : 'Inactief'}
            </span>
        ),
    },
  ];

  const actions: Action<Property>[] = [
    {
      label: 'Bekijk',
      onClick: (item) => handleViewProperty(item),
    },
    {
      label: 'Bewerk',
      onClick: (item) => handleEditProperty(item),
    },
    {
      label: 'Verwijder',
      onClick: (item) => handleDeleteProperty(item.id),
    },
  ];

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
            loading={dashboardLoading}
            emptyStateMessage="U heeft nog geen panden toegevoegd."
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
