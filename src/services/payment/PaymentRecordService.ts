
import { supabase } from '../../integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '../../lib/database';
import { ErrorHandler } from '../../lib/errors';
import { Tables, TablesInsert } from '../../integrations/supabase/types';
import { logger } from '../../lib/logger';

export type PaymentRecord = Tables<'betalingen'>;
export type PaymentRecordInsert = TablesInsert<'betalingen'>;

export class PaymentRecordService extends DatabaseService {
  async createPaymentRecord(paymentData: PaymentRecordInsert): Promise<PaymentRecord> {
    try {
      const { data, error } = await supabase
        .from('betalingen')
        .insert(paymentData)
        .select()
        .single();

      if (error) {
        logger.error('Error creating payment record:', error);
        throw error;
      }

      logger.info('Payment record created', { paymentId: data.id });
      return data;
    } catch (error) {
      logger.error('Error creating payment record:', error);
      throw error;
    }
  }

  async updatePaymentRecord(paymentId: string, updates: Partial<PaymentRecord>): Promise<PaymentRecord> {
    try {
      const { data, error } = await supabase
        .from('betalingen')
        .update(updates)
        .eq('id', paymentId)
        .select()
        .single();

      if (error) {
        logger.error('Error updating payment record:', error);
        throw error;
      }

      logger.info('Payment record updated', { paymentId });
      return data;
    } catch (error) {
      logger.error('Error updating payment record:', error);
      throw error;
    }
  }

  async getUserPayments(userId: string): Promise<DatabaseResponse<PaymentRecord[]>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(userId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: ErrorHandler.normalize('Geen toegang tot betalingsgegevens'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('betalingen')
        .select('*')
        .eq('gebruiker_id', userId)
        .order('bijgewerkt_op', { ascending: false });
      return { data, error };
    });
  }
}

export const paymentRecordService = new PaymentRecordService();
