import { Resend } from '@resend/node';
import { supabase } from '../integrations/supabase/client';
import { logger } from '../lib/logger';
import { DatabaseService } from '../lib/database';

import documentSubmissionTemplate from '../templates/emails/documentSubmission.html?raw';
import documentApprovedTemplate from '../templates/emails/documentApproved.html?raw';
import documentRejectedTemplate from '../templates/emails/documentRejected.html?raw';
import paymentConfirmationTemplate from '../templates/emails/paymentConfirmation.html?raw';

const resend = new Resend(import.meta.env.RESEND_API_KEY as string);

export type EmailTemplate =
  | 'documentSubmission'
  | 'documentApproved'
  | 'documentRejected'
  | 'paymentConfirmation';

const templates: Record<EmailTemplate, string> = {
  documentSubmission: documentSubmissionTemplate,
  documentApproved: documentApprovedTemplate,
  documentRejected: documentRejectedTemplate,
  paymentConfirmation: paymentConfirmationTemplate,
};

export class EmailService extends DatabaseService {
  private from = (import.meta.env.RESEND_FROM_EMAIL as string) || 'noreply@example.com';

  private async userWantsEmail(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('notificatie_voorkeuren')
        .select('email_opt_out')
        .eq('gebruiker_id', userId)
        .single();
      if (error) {
        logger.error('Voorkeuren ophalen mislukt', error);
      }
      return !(data?.email_opt_out);
    } catch (e) {
      logger.error('Fout bij controleren voorkeuren', e);
      return false;
    }
  }

  async sendTemplateEmail(userId: string, to: string, subject: string, template: EmailTemplate) {
    const allow = await this.userWantsEmail(userId);
    if (!allow) {
      logger.info('Gebruiker heeft e-mails uitgeschakeld', { userId, subject });
      return;
    }
    try {
      await resend.emails.send({
        from: this.from,
        to,
        subject,
        html: templates[template],
      });
      logger.info('E-mail verzonden', { to, subject });
    } catch (error) {
      logger.error('E-mail verzenden mislukt', error);
    }
  }
}

export const emailService = new EmailService();
