import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from './use-mobile';
import { useCallback } from 'react';

/**
 * Predefined modal routes for the application
 */
export const ModalRoutes = {
  profileEdit: {
    name: 'profileEdit',
    mobileRoute: '/mobile/profile-edit',
    desktopModal: 'EnhancedProfileUpdateModal'
  },
  documentUpload: {
    name: 'documentUpload', 
    mobileRoute: '/mobile/document-upload',
    desktopModal: 'DocumentUploadModal'
  },
  payment: {
    name: 'payment',
    mobileRoute: '/mobile/payment',
    desktopModal: 'PaymentModal'
  }
} as const;

type ModalRouteName = keyof typeof ModalRoutes;

/**
 * Hook for handling modal routing on mobile vs desktop
 * On mobile: navigates to a dedicated page
 * On desktop: returns flag to show traditional modal
 */
export const useModalRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  /**
   * Opens a modal or navigates to mobile page based on device
   */
  const openModal = useCallback((modalName: ModalRouteName, data?: any) => {
    const route = ModalRoutes[modalName];
    
    if (isMobile) {
      // Filter out any non-serializable values (e.g., functions) to prevent
      // "DataCloneError: Failed to execute 'pushState' on 'History'" when
      // React Router performs history.pushState under the hood.
      const sanitizeForHistory = (value: any): any => {
        if (value === null || typeof value !== 'object') return value;
        if (Array.isArray(value)) return value.map(sanitizeForHistory);
        const result: Record<string, any> = {};
        Object.entries(value).forEach(([k, v]) => {
          if (typeof v === 'function' || typeof v === 'symbol' || typeof v === 'undefined') return;
          result[k] = sanitizeForHistory(v);
        });
        return result;
      };

      navigate(route.mobileRoute, {
        state: {
          returnTo: location.pathname,
          modalData: sanitizeForHistory(data),
          modalName: route.name,
        },
      });
      return false; // Don't show desktop modal
    } else {
      return true; // Show desktop modal
    }
  }, [isMobile, navigate, location.pathname]);

  /**
   * Closes modal or navigates back from mobile page
   */
  const closeModal = useCallback(() => {
    if (isMobile) {
      // On mobile, navigate back to previous page
      const state = location.state as any;
      if (state?.returnTo) {
        navigate(state.returnTo, { replace: true });
      } else {
        navigate(-1);
      }
    }
  }, [isMobile, navigate, location.state]);

  /**
   * Check if we're currently on a mobile modal page
   */
  const isOnMobileModalPage = useCallback((modalName: string) => {
    const state = location.state as any;
    return isMobile && state?.modalName === modalName;
  }, [isMobile, location.state]);

  /**
   * Get modal data from navigation state (for mobile pages)
   */
  const getModalData = useCallback(() => {
    const state = location.state as any;
    return state?.modalData;
  }, [location.state]);

  return {
    openModal,
    closeModal,
    isOnMobileModalPage,
    getModalData,
    isMobile
  };
};