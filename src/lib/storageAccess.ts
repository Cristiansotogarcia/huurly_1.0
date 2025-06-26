import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

/**
 * Check if the currently authenticated user may view the documents of `userId`.
 * A user can always view their own documents. Reviewers and admins can view
 * documents of other users based on the `gebruiker_rollen` table.
 */
export async function canViewDocument(userId: string): Promise<boolean> {
  try {
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !currentUser) {
      return false;
    }

    if (currentUser.id === userId) {
      return true;
    }

    const { data, error } = await supabase
      .from('gebruiker_rollen')
      .select('role')
      .eq('user_id', currentUser.id)
      .in('role', ['reviewer', 'admin']);

    if (error) {
      logger.error('Role check error:', error);
      return false;
    }

    return (data ?? []).length > 0;
  } catch (err) {
    logger.error('canViewDocument error:', err);
    return false;
  }
}

/**
 * Return a signed URL for a document if the viewer has access. The viewer is
 * determined via `supabase.auth`. The owner id is extracted from the file path.
 */
export async function getDocumentUrl(
  filePath: string,
): Promise<string | null> {
  const ownerId = filePath.split('/')[0];
  const allowed = await canViewDocument(ownerId);
  if (!allowed) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(filePath, 60 * 60);
  if (error) {
    logger.error('Signed URL error:', error);
    return null;
  }
  return data.signedUrl;
}

/**
 * Upload a document for the authenticated user. The file will be stored under
 * `${authUser.id}/filename.ext` in the `documents` bucket.
 */
export async function uploadDocument(file: File): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }
  const filePath = `${user.id}/${file.name}`;
  const { error } = await supabase.storage
    .from('documents')
    .upload(filePath, file);
  if (error) {
    logger.error('Document upload error:', error);
    return null;
  }
  return filePath;
}

/**
 * Upload or replace the current user's profile picture. The picture is stored
 * as `${authUser.id}/profile.jpg` in the `profile-pictures` bucket.
 */
export async function uploadProfilePicture(file: File): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }
  const filePath = `${user.id}/profile.jpg`;
  const { error } = await supabase.storage
    .from('profile-pictures')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });
  if (error) {
    logger.error('Profile picture upload error:', error);
    return null;
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from('profile-pictures').getPublicUrl(filePath);
  return publicUrl;
}
