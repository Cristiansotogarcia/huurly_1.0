// Unified Modal System
export { default as UnifiedModal } from './UnifiedModal';
export type { 
  UnifiedModalProps, 
  UnifiedModalActionsProps 
} from './UnifiedModal';

// Legacy modal exports (to be gradually migrated)
export { BaseModalActions, useModalState, useModalForm } from './BaseModal';
export { default as BaseModal } from './BaseModal';

// Individual modal components
export { default as CreateUserModal } from './CreateUserModal';
export { default as DocumentReviewModal } from './DocumentReviewModal';
export { default as DocumentUploadModal } from './DocumentUploadModal';
export { default as EmailConfirmationModal } from './EmailConfirmationModal';
export { default as EmailVerificationSuccessModal } from './EmailVerificationSuccessModal';
export { default as EnhancedProfileUpdateModal } from './EnhancedProfileUpdateModal';
export { default as HelpSupportModal } from './HelpSupportModal';
export { default as IssueManagementModal } from './IssueManagementModal';
export { default as IssueReportModal } from './IssueReportModal';
export { default as PaymentSuccessModal } from './PaymentSuccessModal';
export { default as ProfileModal } from './ProfileModal';
export { default as PropertyModal } from './PropertyModal';
export { default as PropertySearchModal } from './PropertySearchModal';
export { default as SettingsModal } from './SettingsModal';
export { default as SubscriptionModal } from './SubscriptionModal';
export { default as ValidationErrorModal } from './ValidationErrorModal';
export { default as ProfileFormStepper } from './ProfileFormStepper';
export { default as ProfileFormNavigation } from './ProfileFormNavigation';
export { default as MobileModalPage, useMobileModalPage } from './MobileModalPage';