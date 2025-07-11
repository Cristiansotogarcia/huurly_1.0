
import { useRoleActions } from './useRoleActions';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const useVerhuurderActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const customActions = {
    searchProperties: () => navigate('/verhuurder/woningen/zoeken'),
    viewProperty: (propertyId: string) => navigate(`/verhuurder/woningen/${propertyId}`),
    manageProperties: () => navigate('/verhuurder/woningen'),
    addProperty: () => navigate('/verhuurder/woningen/toevoegen'),
    editProperty: (propertyId: string) => navigate(`/verhuurder/woningen/${propertyId}/bewerken`),
    deleteProperty: async (propertyId: string) => {
      // This would typically call a service to delete the property
      toast({
        title: "Woning verwijderd",
        description: "De woning is succesvol verwijderd.",
      });
    },
  };

  return useRoleActions({ role: 'verhuurder', customActions });
};
