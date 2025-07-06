
import { supabase } from '../../integrations/supabase/client.ts';
import { DatabaseService, DatabaseResponse } from '../../lib/database.ts';
import { ErrorHandler } from '../../lib/errors.ts';
import { Tables, TablesInsert } from '../../integrations/supabase/types.ts';
import { logger } from '../../lib/logger.ts';

export type PaymentRecord = Tables<'abonnementen'>;
export type PaymentRecordInsert = TablesInsert<'abonnementen'>;

export class PaymentRecordService extends DatabaseService {
  async createPaymentRecord(paymentData: PaymentRecordInsert): Promise<PaymentRecord> {
    try {
      // Ensure required fields are present
      if (!paymentData.huurder_id || !paymentData.bedrag) {
        const missingFields = [];
        if (!paymentData.huurder_id) missingFields.push('huurder_id');
        if (!paymentData.bedrag) missingFields.push('bedrag');
        
        const error = new Error(`Missing required fields: ${missingFields.join(', ')}`);
        logger.error('Error creating payment record: missing fields', { missingFields });
        throw error;
      }

      // Set default values if not provided
      const recordToInsert: PaymentRecordInsert = {
        ...paymentData,
        status: paymentData.status || 'pending',
        aangemaakt_op: paymentData.aangemaakt_op || new Date().toISOString(),
        bijgewerkt_op: paymentData.bijgewerkt_op || new Date().toISOString()
      };

      // Log the record we're trying to insert for debugging
      logger.info('Attempting to create payment record', { 
        record: { ...recordToInsert, huurder_id: recordToInsert.huurder_id } 
      });

      const { data, error } = await supabase
        .from('abonnementen')
        .insert(recordToInsert)
        .select()
        .single();

      if (error) {
        logger.error('Error creating payment record:', error); 
        throw error;
      }

      if (!data) {
        const noDataError = new Error('No data returned after creating payment record');
        logger.error('Error creating payment record: no data returned');
        throw noDataError;
      }

      logger.info('Payment record created successfully', { paymentId: data.id });
      return data;
    } catch (error) {
      logger.error('Error creating payment record:', error);
      throw error;
    }
  }

  async updatePaymentRecord(paymentId: string, updates: Partial<PaymentRecord>): Promise<PaymentRecord> {
    try {
      const { data, error } = await supabase
        .from('abonnementen')
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
        .from('abonnementen')
        .select('*')
        .eq('huurder_id', userId)
        .order('bijgewerkt_op', { ascending: false });
      return { data, error };
    });
  }
}

export const paymentRecordService = new PaymentRecordService();
