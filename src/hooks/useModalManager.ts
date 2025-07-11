import { useState, useCallback } from 'react';
import { enhancedLogger as logger } from '@/lib/logger';

/**
 * Modal state interface
 */
export interface ModalState {
  [modalName: string]: boolean;
}

/**
 * Modal manager configuration
 */
export interface ModalManagerConfig {
  initialModals?: string[];
  logActions?: boolean;
  onModalOpen?: (modalName: string) => void;
  onModalClose?: (modalName: string) => void;
}

/**
 * Modal manager return type
 */
export interface ModalManager {
  modals: ModalState;
  openModal: (modalName: string) => void;
  closeModal: (modalName: string) => void;
  toggleModal: (modalName: string) => void;
  closeAllModals: () => void;
  isModalOpen: (modalName: string) => boolean;
  getOpenModals: () => string[];
}

/**
 * Custom hook for managing modal states
 * Provides a centralized way to handle multiple modals with logging and callbacks
 */
export const useModalManager = (config: ModalManagerConfig = {}): ModalManager => {
  const {
    initialModals = [],
    logActions = true,
    onModalOpen,
    onModalClose
  } = config;

  // Initialize modal state
  const initialState = initialModals.reduce((acc, modalName) => {
    acc[modalName] = false;
    return acc;
  }, {} as ModalState);

  const [modals, setModals] = useState<ModalState>(initialState);

  /**
   * Open a specific modal
   */
  const openModal = useCallback((modalName: string) => {
    if (logActions) {
      logger.log(`Opening modal: ${modalName}`);
    }
    
    setModals(prev => ({ ...prev, [modalName]: true }));
    onModalOpen?.(modalName);
  }, [logActions, onModalOpen]);

  /**
   * Close a specific modal
   */
  const closeModal = useCallback((modalName: string) => {
    if (logActions) {
      logger.log(`Closing modal: ${modalName}`);
    }
    
    setModals(prev => ({ ...prev, [modalName]: false }));
    onModalClose?.(modalName);
  }, [logActions, onModalClose]);

  /**
   * Toggle a specific modal
   */
  const toggleModal = useCallback((modalName: string) => {
    const isCurrentlyOpen = modals[modalName];
    if (isCurrentlyOpen) {
      closeModal(modalName);
    } else {
      openModal(modalName);
    }
  }, [modals, openModal, closeModal]);

  /**
   * Close all modals
   */
  const closeAllModals = useCallback(() => {
    if (logActions) {
      logger.log('Closing all modals');
    }
    
    const closedState = Object.keys(modals).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as ModalState);
    
    setModals(closedState);
    
    // Call onModalClose for each open modal
    Object.entries(modals).forEach(([modalName, isOpen]) => {
      if (isOpen) {
        onModalClose?.(modalName);
      }
    });
  }, [modals, logActions, onModalClose]);

  /**
   * Check if a specific modal is open
   */
  const isModalOpen = useCallback((modalName: string): boolean => {
    return Boolean(modals[modalName]);
  }, [modals]);

  /**
   * Get list of currently open modals
   */
  const getOpenModals = useCallback((): string[] => {
    return Object.entries(modals)
      .filter(([, isOpen]) => isOpen)
      .map(([modalName]) => modalName);
  }, [modals]);

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,
    isModalOpen,
    getOpenModals,
  };
};

/**
 * Preset modal configurations for common use cases
 */
export const ModalPresets = {
  /**
   * Standard user dashboard modals
   */
  userDashboard: {
    initialModals: ['settings', 'helpSupport', 'issueReport'],
    logActions: true,
  },

  /**
   * Property management modals
   */
  propertyManagement: {
    initialModals: ['addProperty', 'editProperty', 'deleteConfirm', 'viewDetails'],
    logActions: true,
  },

  /**
   * Document management modals
   */
  documentManagement: {
    initialModals: ['uploadDocument', 'viewDocument', 'deleteConfirm'],
    logActions: true,
  },

  /**
   * Application management modals
   */
  applicationManagement: {
    initialModals: ['viewApplication', 'respondToApplication', 'deleteConfirm'],
    logActions: true,
  },

  /**
   * Admin panel modals
   */
  adminPanel: {
    initialModals: ['userDetails', 'editUser', 'deleteConfirm', 'auditLog'],
    logActions: true,
  },
};

/**
 * Hook for user dashboard modals
 */
export const useUserDashboardModals = () => {
  return useModalManager(ModalPresets.userDashboard);
};

/**
 * Hook for property management modals
 */
export const usePropertyManagementModals = () => {
  return useModalManager(ModalPresets.propertyManagement);
};

/**
 * Hook for document management modals
 */
export const useDocumentManagementModals = () => {
  return useModalManager(ModalPresets.documentManagement);
};

/**
 * Hook for application management modals
 */
export const useApplicationManagementModals = () => {
  return useModalManager(ModalPresets.applicationManagement);
};

/**
 * Hook for admin panel modals
 */
export const useAdminPanelModals = () => {
  return useModalManager(ModalPresets.adminPanel);
};

/**
 * Utility function to create modal manager with custom configuration
 */
export const createModalManager = (config: ModalManagerConfig) => {
  return () => useModalManager(config);
};