
import { useRoleActions } from './useRoleActions';
import { useNavigate } from 'react-router-dom';

export const useHuurderActions = () => {
  const navigate = useNavigate();
  
  const customActions = {
    navigateToApplications: () => navigate('/huurder/aanvragen'),
    navigateToDocuments: () => navigate('/huurder/documenten'),
    navigateToProfile: () => navigate('/huurder/profiel'),
    navigateToProperties: () => navigate('/huurder/woningen'),
  };

  return useRoleActions({ role: 'huurder', customActions });
};
