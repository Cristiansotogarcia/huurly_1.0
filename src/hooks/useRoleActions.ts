import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { enhancedLogger as logger } from '@/lib/logger';
import { UserRole } from '@/types';
import { getDefaultDashboardRoute } from '@/utils/roleUtils';

/**
 * Generic modal state interface
 */
export interface ModalState {
  [key: string]: boolean;
}

/**
 * Base actions available to all roles
 */
export interface BaseRoleActions {
  handleLogout: () => Promise<void>;
  handleSettings: () => void;
  handleHelpSupport: () => void;
  handleReportIssue: () => void;
  modals: ModalState;
  openModal: (modalName: string) => void;
  closeModal: (modalName: string) => void;
  closeAllModals: () => void;
}

/**
 * Configuration for role-specific actions
 */
export interface RoleActionsConfig {
  role: UserRole;
  defaultModals?: string[];
  customActions?: Record<string, (...args: any[]) => void>;
}

/**
 * Generic hook factory for role-based actions
 * Eliminates duplicate code across role-specific hooks
 */
export const useRoleActions = (config: RoleActionsConfig): BaseRoleActions & Record<string, any> => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Initialize modal state with default modals
  const defaultModalNames = config.defaultModals || ['settings', 'helpSupport', 'issueReport'];
  const initialModalState = defaultModalNames.reduce((acc, modalName) => {
    acc[modalName] = false;
    return acc;
  }, {} as ModalState);
  
  const [modals, setModals] = useState<ModalState>(initialModalState);

  /**
   * Generic modal management
   */
  const openModal = (modalName: string) => {
    logger.log(`Opening ${modalName} modal for ${config.role}`);
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: string) => {
    logger.log(`Closing ${modalName} modal for ${config.role}`);
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  const closeAllModals = () => {
    logger.log(`Closing all modals for ${config.role}`);
    const closedState = Object.keys(modals).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as ModalState);
    setModals(closedState);
  };

  /**
   * Standardized logout handler
   */
  const handleLogout = async () => {
    try {
      logger.log(`${config.role} logging out`);
      await signOut();
      // signOut already handles navigation and toast notifications
    } catch (error) {
      logger.error(`Logout failed for ${config.role}:`, error);
      toast({
        title: 'Fout bij uitloggen',
        description: 'Er is een fout opgetreden. Probeer het opnieuw.',
        variant: 'destructive',
      });
    }
  };

  /**
   * Standardized settings handler
   */
  const handleSettings = () => {
    logger.log(`Opening settings for ${config.role}`);
    openModal('settings');
  };

  /**
   * Standardized help & support handler
   */
  const handleHelpSupport = () => {
    logger.log(`${config.role} navigating to help and support`);
    navigate('/help-support');
  };

  /**
   * Standardized issue reporting handler
   */
  const handleReportIssue = () => {
    logger.log(`${config.role} navigating to issue reporting`);
    navigate('/issue-reporting');
  };

  /**
   * Navigate to role-specific dashboard
   */
  const handleGoToDashboard = () => {
    const dashboardRoute = getDefaultDashboardRoute(config.role);
    logger.log(`${config.role} navigating to dashboard: ${dashboardRoute}`);
    navigate(dashboardRoute);
  };

  // Base actions object
  const baseActions: BaseRoleActions = {
    handleLogout,
    handleSettings,
    handleHelpSupport,
    handleReportIssue,
    modals,
    openModal,
    closeModal,
    closeAllModals,
  };

  // Add custom actions if provided
  const customActions = config.customActions || {};
  
  // Add common utility actions
  const utilityActions = {
    handleGoToDashboard,
  };

  return {
    ...baseActions,
    ...utilityActions,
    ...customActions,
  };
};

/**
 * Specific hook for tenant actions
 */
export const useTenantActions = () => {
  return useRoleActions({
    role: 'huurder',
    defaultModals: ['settings', 'search', 'helpSupport', 'issueReport'],
    customActions: {
      onStartSearch: () => {
        logger.log('Starting property search');
        const navigate = useNavigate();
        navigate('/property-search');
      },
    },
  });
};

/**
 * Specific hook for landlord actions
 */
export const useLandlordActions = () => {
  const navigate = useNavigate();
  
  return useRoleActions({
    role: 'verhuurder',
    defaultModals: ['settings', 'propertyModal', 'helpSupport', 'issueReport'],
    customActions: {
      handleManageProperties: () => {
        logger.log('Navigate to property management');
        navigate('/properties');
      },
      handleSearchTenants: () => {
        logger.log('Navigate to tenant search');
        navigate('/zoek-huurders');
      },
    },
  });
};

/**
 * Specific hook for admin actions
 */
export const useAdminActions = () => {
  const navigate = useNavigate();
  
  return useRoleActions({
    role: 'beheerder',
    defaultModals: ['settings', 'helpSupport'],
    customActions: {
      handleManageUsers: () => {
        logger.log('Navigate to user management');
        navigate('/admin/users');
      },
      handleManageProperties: () => {
        logger.log('Navigate to property management');
        navigate('/admin/properties');
      },
      handleViewAuditLogs: () => {
        logger.log('Navigate to audit logs');
        navigate('/admin/audit-logs');
      },
    },
  });
};

/**
 * Specific hook for reviewer actions
 */
export const useReviewerActions = () => {
  const navigate = useNavigate();
  
  return useRoleActions({
    role: 'beoordelaar',
    defaultModals: ['settings', 'helpSupport'],
    customActions: {
      handleReviewDocuments: () => {
        logger.log('Navigate to document review');
        navigate('/beoordelaar/documents');
      },
      handleViewApplications: () => {
        logger.log('Navigate to application review');
        navigate('/beoordelaar/applications');
      },
    },
  });
};