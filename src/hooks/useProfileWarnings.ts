import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useHuurder } from '@/hooks/useHuurder';

interface ProfileWarningsState {
  profileWarningShown: boolean;
  documentsWarningShown: boolean;
  lastShownDate: string | null;
}

const STORAGE_KEY = 'huurly-profile-warnings';

export const useProfileWarnings = () => {
  const { toast } = useToast();
  const { tenantProfile, userDocuments, isLoading } = useHuurder();
  
  const [warningsState, setWarningsState] = useState<ProfileWarningsState>({
    profileWarningShown: false,
    documentsWarningShown: false,
    lastShownDate: null,
  });

  // Load warning state from localStorage on mount
  useEffect(() => {
    const loadWarningState = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setWarningsState(parsed);
        }
      } catch (error) {
        console.error('Error loading warning state:', error);
      }
    };
    
    loadWarningState();
  }, []);

  // Save warning state to localStorage
  const saveWarningState = useCallback((newState: Partial<ProfileWarningsState>) => {
    const updatedState = { ...warningsState, ...newState };
    setWarningsState(updatedState);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
    } catch (error) {
      console.error('Error saving warning state:', error);
    }
  }, [warningsState]);

  // Check if warnings should be shown
  const checkAndShowWarnings = useCallback(() => {
    if (isLoading || !tenantProfile) return;

    const today = new Date().toDateString();
    const isSameDay = warningsState.lastShownDate === today;

    // Check profile completeness
    const requiredFields = ['profession', 'income', 'age', 'preferredLocations', 'maxRent'];
    const isProfileComplete = requiredFields.every(field => tenantProfile[field] != null);
    
    // Check documents
    const hasRequiredDocuments = userDocuments.length >= 3;

    // Show profile warning if not complete and not shown today
    if (!isProfileComplete && (!warningsState.profileWarningShown || !isSameDay)) {
      toast({
        title: "Profiel onvolledig",
        description: "Vul je profiel aan om beter zichtbaar te zijn.",
        variant: "default",
      });
      
      saveWarningState({ 
        profileWarningShown: true, 
        lastShownDate: today 
      });
    }

    // Show documents warning if missing and not shown today
    if (!hasRequiredDocuments && (!warningsState.documentsWarningShown || !isSameDay)) {
      toast({
        title: "Documenten ontbreken",
        description: "Upload ontbrekende documenten.",
        variant: "default",
      });
      
      saveWarningState({ 
        documentsWarningShown: true, 
        lastShownDate: today 
      });
    }

    // Reset warnings if tasks are completed
    if (isProfileComplete && warningsState.profileWarningShown) {
      saveWarningState({ profileWarningShown: false });
    }
    
    if (hasRequiredDocuments && warningsState.documentsWarningShown) {
      saveWarningState({ documentsWarningShown: false });
    }
  }, [
    tenantProfile, 
    userDocuments, 
    isLoading, 
    warningsState, 
    toast, 
    saveWarningState
  ]);

  // Manual reset function for testing
  const resetWarnings = useCallback(() => {
    const resetState = {
      profileWarningShown: false,
      documentsWarningShown: false,
      lastShownDate: null,
    };
    setWarningsState(resetState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetState));
    } catch (error) {
      console.error('Error resetting warning state:', error);
    }
  }, []);

  return {
    checkAndShowWarnings,
    resetWarnings,
    warningsState,
  };
};
