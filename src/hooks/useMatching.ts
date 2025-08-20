import { useState, useEffect } from 'react';
import { MatchingService, MatchResult } from '../services/MatchingService';
import { useAuth } from './useAuth';

export interface UseMatchingReturn {
  matches: MatchResult[];
  recommendations: MatchResult[];
  matchHistory: any[];
  savedMatches: any[];
  isLoading: boolean;
  error: string | null;
  refreshMatches: () => Promise<void>;
  refreshRecommendations: (limit?: number) => Promise<void>;
  saveMatch: (propertyId: string, score: number) => Promise<void>;
  updatePreferences: (preferences: any) => Promise<void>;
  getMatchDetails: (propertyId: string) => Promise<any>;
}

export const useMatching = (): UseMatchingReturn => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [recommendations, setRecommendations] = useState<MatchResult[]>([]);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [savedMatches, setSavedMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load matches for current tenant
   */
  const loadMatches = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const results = await MatchingService.getMatches(user.id);
      setMatches(results);
    } catch (err) {
      setError('Failed to load matches');
      console.error('Error loading matches:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load recommendations for current tenant
   */
  const loadRecommendations = async (limit: number = 10) => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const results = await MatchingService.getRecommendations(user.id, limit);
      setRecommendations(results);
    } catch (err) {
      setError('Failed to load recommendations');
      console.error('Error loading recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load match history for current tenant
   */
  const loadMatchHistory = async () => {
    if (!user?.id) return;
    
    try {
      const results = await MatchingService.getMatchHistory(user.id);
      setMatchHistory(results);
    } catch (err) {
      setError('Failed to load match history');
      console.error('Error loading match history:', err);
    }
  };

  /**
   * Load saved matches for current tenant
   */
  const loadSavedMatches = async () => {
    if (!user?.id) return;
    
    try {
      const results = await MatchingService.getSavedMatches(user.id);
      setSavedMatches(results);
    } catch (err) {
      setError('Failed to load saved matches');
      console.error('Error loading saved matches:', err);
    }
  };

  /**
   * Refresh matches
   */
  const refreshMatches = async () => {
    await loadMatches();
  };

  /**
   * Refresh recommendations
   */
  const refreshRecommendations = async (limit: number = 10) => {
    await loadRecommendations(limit);
  };

  /**
   * Save a match
   */
  const saveMatch = async (propertyId: string, score: number) => {
    if (!user?.id) return;
    
    try {
      await MatchingService.saveMatch(user.id, propertyId, score, 'saved');
      await loadSavedMatches(); // Refresh saved matches
    } catch (err) {
      setError('Failed to save match');
      console.error('Error saving match:', err);
    }
  };

  /**
   * Update match preferences
   */
  const updatePreferences = async (preferences: any) => {
    if (!user?.id) return;
    
    try {
      await MatchingService.updateMatchPreferences(user.id, preferences);
      await refreshMatches(); // Refresh matches with new preferences
    } catch (err) {
      setError('Failed to update preferences');
      console.error('Error updating preferences:', err);
    }
  };

  /**
   * Get property details
   */
  const getMatchDetails = async (propertyId: string) => {
    try {
      return await MatchingService.getPropertyDetails(propertyId);
    } catch (err) {
      setError('Failed to load property details');
      console.error('Error loading property details:', err);
      return null;
    }
  };

  // Load initial data
  useEffect(() => {
    if (user?.id) {
      loadMatches();
      loadRecommendations();
      loadMatchHistory();
      loadSavedMatches();
    }
  }, [user?.id]);

  return {
    matches,
    recommendations,
    matchHistory,
    savedMatches,
    isLoading,
    error,
    refreshMatches,
    refreshRecommendations,
    saveMatch,
    updatePreferences,
    getMatchDetails
  };
};
