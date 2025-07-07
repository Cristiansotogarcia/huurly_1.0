import { supabase } from '../integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '../lib/database';
import { logger } from '../lib/logger';

export interface ExpiringSubscription {
  id: string;
  huurder_id: string;
  eind_datum: string;
  status: string;
  expiration_reminder_sent: boolean;
}

export class SubscriptionExpirationService extends DatabaseService {
  /**
   * Check for subscriptions expiring within 2 weeks and send notifications
   */
  async checkExpiringSubscriptions(): Promise<DatabaseResponse<ExpiringSubscription[]>> {
    return this.executeQuery(async () => {
      logger.info('Checking for expiring subscriptions...');
      
      const { data, error } = await supabase.rpc('check_expiring_subscriptions');
      
      if (error) {
        logger.error('Error checking expiring subscriptions:', error);
        throw error;
      }

      logger.info('Successfully checked expiring subscriptions');
      return { data, error: null };
    });
  }

  /**
   * Expire subscriptions that have passed their end date
   */
  async expireSubscriptions(): Promise<DatabaseResponse<any>> {
    return this.executeQuery(async () => {
      logger.info('Expiring overdue subscriptions...');
      
      const { data, error } = await supabase.rpc('expire_subscriptions');
      
      if (error) {
        logger.error('Error expiring subscriptions:', error);
        throw error;
      }

      logger.info('Successfully expired overdue subscriptions');
      return { data, error: null };
    });
  }

  /**
   * Get subscriptions that will expire soon
   */
  async getExpiringSubscriptions(): Promise<DatabaseResponse<ExpiringSubscription[]>> {
    return this.executeQuery(async () => {
      const twoWeeksFromNow = new Date();
      twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
      
      const { data, error } = await supabase
        .from('abonnementen')
        .select('id, huurder_id, eind_datum, status, expiration_reminder_sent')
        .eq('status', 'actief')
        .lte('eind_datum', twoWeeksFromNow.toISOString());

      if (error) {
        logger.error('Error getting expiring subscriptions:', error);
        throw error;
      }

      return { data, error: null };
    });
  }

  /**
   * Get user's subscription expiration info
   */
  async getUserSubscriptionExpiration(userId: string): Promise<DatabaseResponse<ExpiringSubscription | null>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('abonnementen')
        .select('id, huurder_id, eind_datum, status, expiration_reminder_sent')
        .eq('huurder_id', userId)
        .eq('status', 'actief')
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error is ok
        logger.error('Error getting user subscription expiration:', error);
        throw error;
      }

      return { data: data || null, error: null };
    });
  }
}

export const subscriptionExpirationService = new SubscriptionExpirationService();