import { createClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';
import { StorageService } from '../lib/storage';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY);
const storageService = new StorageService();

async function createAuditLog(action: string, tableName: string, recordId: string) {
  // Placeholder implementation until audit_logs table exists
  console.log('Audit log:', { action, tableName, recordId });
}

async function cleanupDeletedAccounts() {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - 30);

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id')
    .not('marked_for_deletion_at', 'is', null)
    .lte('marked_for_deletion_at', threshold.toISOString());

  if (error) {
    console.error('Error fetching users for cleanup:', error);
    return;
  }

  for (const user of users || []) {
    try {
      const { data: documents } = await supabase
        .from('user_documents')
        .select('id, file_path')
        .eq('user_id', user.id);

      for (const doc of documents || []) {
        await supabase.from('user_documents').delete().eq('id', doc.id);
        await storageService.deleteFile(doc.file_path);
        await createAuditLog('DELETE', 'user_documents', doc.id);
      }

      await supabase.from('profiles').delete().eq('id', user.id);
      await createAuditLog('DELETE', 'profiles', user.id);

      try {
        await supabase.auth.admin.deleteUser(user.id);
      } catch (authError) {
        console.error(`Error deleting auth user ${user.id}:`, authError);
      }

      console.log(`Cleaned up user ${user.id}`);
    } catch (err) {
      console.error('Cleanup error for user', user.id, err);
    }
  }
}

cleanupDeletedAccounts();
