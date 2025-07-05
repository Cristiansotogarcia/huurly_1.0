
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { propertyService } from '@/services/PropertyService';
import { Property } from '@/services/PropertyService';
import { useState } from 'react';

export const useVerhuurderActions = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast({
        title: 'Uitgelogd',
        description: 'U bent succesvol uitgelogd.',
      });
    } catch (error) {
      logger.error('Logout failed:', error);
      toast({
        title: 'Fout bij uitloggen',
        description: 'Er is een fout opgetreden. Probeer het opnieuw.',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = (filters: any) => {
    logger.log('Searching with filters:', filters);
    // Implement search logic here
  };

  const handleViewProperty = (property: Property) => {
    logger.log('Viewing property:', property.id);
    // Could navigate to detail view or open modal
  };

  const handleAddNewProperty = () => {
    logger.log('Adding new property');
    setSelectedProperty(null);
    setShowPropertyModal(true);
  };

  const handleEditProperty = (property: Property) => {
    logger.log('Editing property:', property.id);
    setSelectedProperty(property);
    setShowPropertyModal(true);
  };

  const handleDeleteProperty = async (propertyId: string): Promise<void> => {
    try {
      const result = await propertyService.deleteProperty(propertyId);
      if (result.success) {
        toast({
          title: 'Woning verwijderd',
          description: 'De woning is succesvol verwijderd.',
        });
      } else {
        throw new Error(result.error?.message || 'Fout bij verwijderen');
      }
    } catch (error) {
      logger.error('Delete property failed:', error);
      toast({
        title: 'Fout bij verwijderen',
        description: 'Er is een fout opgetreden bij het verwijderen van de woning.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const closePropertyModal = () => {
    setShowPropertyModal(false);
    setSelectedProperty(null);
  };

  return {
    handleLogout,
    handleSearch,
    handleViewProperty,
    handleAddNewProperty,
    handleEditProperty,
    handleDeleteProperty,
    // Modal state
    selectedProperty,
    showPropertyModal,
    closePropertyModal,
  };
};
