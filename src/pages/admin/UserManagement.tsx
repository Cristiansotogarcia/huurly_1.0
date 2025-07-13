import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/standard/DataTable';
import { CreateUserModal } from '@/components/modals/CreateUserModal';
import { useToast } from '@/hooks/use-toast';
import { UserService, userService } from '@/services/UserService';
import { Users, UserPlus, Search, Filter, Download, RotateCcw, Mail } from 'lucide-react';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await userService.getAllUsers();
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        throw new Error(result.error?.message || 'Failed to load users');
      }
    } catch (error) {
      toast({
        title: 'Fout bij laden gebruikers',
        description: 'Er is een fout opgetreden bij het laden van gebruikers.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (action: string, userId: string, userData?: any) => {
    try {
      switch (action) {
        case 'activate':
          const activateResult = await userService.activateUser(userId);
          if (activateResult.success) {
            toast({
              title: 'Gebruiker geactiveerd',
              description: 'De gebruiker is succesvol geactiveerd.',
            });
          } else {
            throw new Error(activateResult.error?.message || 'Fout bij activeren');
          }
          break;
        case 'deactivate':
          const suspendResult = await userService.suspendUser(userId);
          if (suspendResult.success) {
            toast({
              title: 'Gebruiker gedeactiveerd',
              description: 'De gebruiker is succesvol gedeactiveerd.',
            });
          } else {
            throw new Error(suspendResult.error?.message || 'Fout bij deactiveren');
          }
          break;

        default:
          break;
      }
      loadUsers(); // Refresh the list
    } catch (error) {
      toast({
        title: 'Actie mislukt',
        description: error instanceof Error ? error.message : 'Er is een fout opgetreden bij het uitvoeren van de actie.',
        variant: 'destructive',
      });
    }
  };

  const exportUsers = () => {
    // TODO: Implement user export functionality
    toast({
      title: 'Export gestart',
      description: 'De gebruikerslijst wordt geëxporteerd naar CSV.',
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.naam?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.rol === selectedRole;
    return matchesSearch && matchesRole;
  });

  const userColumns = [
    {
      key: 'naam',
      header: 'Naam',
      render: (user: any) => (
        <div>
          <div className="font-medium">{user.naam}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      )
    },
    {
      key: 'rol',
      header: 'Rol',
      render: (user: any) => {
        const roleColors = {
          huurder: 'bg-blue-100 text-blue-800',
          verhuurder: 'bg-green-100 text-green-800',
          beoordelaar: 'bg-purple-100 text-purple-800',
          beheerder: 'bg-red-100 text-red-800'
        };
        return (
          <Badge className={roleColors[user.rol as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
            {user.rol}
          </Badge>
        );
      }
    },
    {
      key: 'aangemaakt_op',
      header: 'Registratiedatum',
      render: (user: any) => new Date(user.aangemaakt_op).toLocaleDateString('nl-NL')
    },
    {
      key: 'status',
      header: 'Status',
      render: (user: any) => (
        <Badge variant={user.profiel_compleet ? 'default' : 'secondary'}>
          {user.profiel_compleet ? 'Actief' : 'Incompleet'}
        </Badge>
      )
    }
  ];

  const userActions = [
    {
      label: 'Activeren',
      action: 'activate',
      variant: 'outline' as const,
      icon: Users
    },
    {
      label: 'Deactiveren',
      action: 'deactivate',
      variant: 'outline' as const,
      icon: Users
    },

  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gebruikersbeheer</h1>
            <p className="text-gray-600">Beheer alle gebruikers in het systeem</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={exportUsers} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporteren
            </Button>
            <Button onClick={() => setShowCreateUserModal(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Nieuwe gebruiker
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal gebruikers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Huurders</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.rol === 'huurder').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verhuurders</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.rol === 'verhuurder').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actieve profielen</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.profiel_compleet).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Zoek op naam of e-mail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white"
                >
                  <option value="all">Alle rollen</option>
                  <option value="huurder">Huurders</option>
                  <option value="verhuurder">Verhuurders</option>
                  <option value="beoordelaar">Beoordelaars</option>
                  <option value="beheerder">Beheerders</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Gebruikers ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredUsers}
              columns={userColumns}
              actions={userActions}
              onAction={handleUserAction}
              loading={loading}
              emptyMessage="Geen gebruikers gevonden"
            />
          </CardContent>
        </Card>

        {/* Create User Modal */}
        <CreateUserModal
          isOpen={showCreateUserModal}
          onClose={() => setShowCreateUserModal(false)}
          onUserCreated={loadUsers}
        />
      </div>
    </div>
  );
};

export default UserManagementPage;