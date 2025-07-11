
import { useRoleActions } from './useRoleActions';
import { useToast } from '@/hooks/use-toast';

export const useBeheerderActions = () => {
  const { toast } = useToast();
  
  const customActions = {
    manageUsers: () => {
      // Placeholder for user management functionality
      toast({
        title: "Gebruikersbeheer",
        description: "Deze functionaliteit wordt binnenkort toegevoegd.",
      });
    },
  };

  return useRoleActions({ role: 'beheerder', customActions });
};
