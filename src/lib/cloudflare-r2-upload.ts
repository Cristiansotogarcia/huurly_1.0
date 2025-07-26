import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  url: string | null;
  error: Error | null;
  success: boolean;
}

export interface FileValidation {
  isValid: boolean;
  error?: string;
}

export class CloudflareR2UploadService {
  private readonly PROFILE_MAX_FILE_SIZE = 5 * 1024 * 1024;   // 5 MB
  private readonly COVER_MAX_FILE_SIZE   = 10 * 1024 * 1024;  // 10 MB
  private readonly DOC_MAX_FILE_SIZE     = 50 * 1024 * 1024;  // 50 MB – adjust at will
  private readonly ALLOWED_TYPES         = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  private readonly ALLOWED_DOC_TYPES     = ['pdf', 'doc', 'docx', 'txt', 'xlsx']; // add / remove as needed

  /**
   * Convert R2 URL to custom domain URL
   */
  private getPublicUrl(filePath: string): string {
    // Check if this is an image file (Profile, Cover, or in beelden bucket)
    if (filePath.includes('Profile') || filePath.includes('Cover') || filePath.includes('beelden')) {
      // Use custom domain for images
      return `https://beelden.huurly.nl/${filePath}`;
    }
    
    // For documents, use the documents custom domain
    return `https://documents.huurly.nl/${filePath}`;
  }

  /**
   * Extract file path from R2 URL
   */
  private extractFilePathFromUrl(url: string): string {
    // Extract path from URLs like:
    // https://5c65d8c11ba2e5ee7face692ed22ad1c.r2.cloudflarestorage.com/beelden/Profile/...
    const match = url.match(/\/beelden\/(.+)$/) || url.match(/\/documents\/(.+)$/);
    if (match) {
      return match[1]; // Return the path after /beelden/ or /documents/
    }
    
    // Fallback: try to extract everything after the last bucket name
    const bucketMatch = url.match(/\/(beelden|documents)\/(.+)$/);
    if (bucketMatch) {
      return bucketMatch[2];
    }
    
    // If no bucket found, return the path as-is
    return url.split('/').slice(-2).join('/'); // Take last 2 parts (folder/filename)
  }

  /* ------------------------------------------------------------------ */
  validateFile(
    file: File,
    type: 'profile' | 'cover' | 'document'
  ): FileValidation {
    const limits = {
      profile: { size: this.PROFILE_MAX_FILE_SIZE, label: '5MB' },
      cover:   { size: this.COVER_MAX_FILE_SIZE,   label: '10MB' },
      document:{ size: this.DOC_MAX_FILE_SIZE,     label: '50MB' }
    };

    const limit = limits[type];
    if (file.size > limit.size) {
      return { isValid: false, error: `Bestand is te groot. Maximum grootte is ${limit.label}.` };
    }

    const allowed = type === 'document' ? this.ALLOWED_DOC_TYPES : this.ALLOWED_TYPES;
    const ext     = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowed.includes(ext)) {
      return {
        isValid: false,
        error: `Bestandstype niet toegestaan. Toegestane types: ${allowed.join(', ')}.`
      };
    }

    return { isValid: true };
  }

  /* ------------------------------------------------------------------ */
  private async uploadViaEdge(
    file: File,
    userId: string,
    folder: string,
    functionName: 'cloudflare-r2-upload' | 'cloudflare-r2-upload-documents' = 'cloudflare-r2-upload'
  ): Promise<UploadResult> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey     = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        throw new Error('Supabase configuratie ontbreekt (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('folder', folder);

      const res = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          apikey: anonKey,
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: formData
      });

      let payload: any = null;
      try { payload = await res.json(); } catch {}
      if (!res.ok || !payload?.success) {
        const msg = payload?.error || `Upload function error: ${res.status}`;
        throw new Error(msg);
      }
      return { url: payload.url ?? null, error: null, success: true };
    } catch (err) {
      console.error('UploadViaEdge error:', err);
      return { url: null, error: err as Error, success: false };
    }
  }

  /* ------------------------------------------------------------------ */
  async uploadProfilePicture(file: File, userId: string): Promise<UploadResult> {
    const validation = this.validateFile(file, 'profile');
    if (!validation.isValid) return { url: null, error: new Error(validation.error), success: false };
    if (!userId) return { url: null, error: new Error('User not authenticated'), success: false };

    const result = await this.uploadViaEdge(file, userId, 'Profile');
    if (!result.success || !result.url) return result;

    // Convert R2 URL to custom domain URL
    const filePath = this.extractFilePathFromUrl(result.url);
    const customDomainUrl = this.getPublicUrl(filePath);
    
    const { error } = await supabase
      .from('huurders')
      .update({ profiel_foto: customDomainUrl })
      .eq('id', userId);
    if (error) {
      console.error('Error updating profiel_foto:', error);
      return { url: null, error: new Error('Kon profielfoto niet opslaan in database.'), success: false };
    }
    return result;
  }

  async uploadCoverPhoto(file: File, userId: string): Promise<UploadResult> {
    const validation = this.validateFile(file, 'cover');
    if (!validation.isValid) return { url: null, error: new Error(validation.error), success: false };
    if (!userId) return { url: null, error: new Error('User not authenticated'), success: false };

    const result = await this.uploadViaEdge(file, userId, 'Cover');
    if (!result.success || !result.url) return result;

    // Convert R2 URL to custom domain URL
    const filePath = this.extractFilePathFromUrl(result.url);
    const customDomainUrl = this.getPublicUrl(filePath);
    
    const { error } = await supabase
      .from('huurders')
      .update({ cover_foto: customDomainUrl })
      .eq('id', userId);
    if (error) {
      console.error('Error updating cover_foto:', error);
      return { url: null, error: new Error('Kon coverfoto niet opslaan in database.'), success: false };
    }
    return result;
  }

  /* NEW: documents ----------------------------------------------------- */
  async uploadDocument(file: File, userId: string): Promise<UploadResult> {
    const validation = this.validateFile(file, 'document');
    if (!validation.isValid) return { url: null, error: new Error(validation.error), success: false };
    if (!userId) return { url: null, error: new Error('User not authenticated'), success: false };

    const result = await this.uploadViaEdge(file, userId, 'Documents', 'cloudflare-r2-upload-documents');
    if (!result.success || !result.url) return result;

    /* Optional: store in your documents table */
    // const { error } = await supabase.from('documents').insert({ user_id: userId, url: result.url });
    // if (error) { ... }

    return result;
  }

  /* ------------------------------------------------------------------ */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}

export const cloudflareR2UploadService = new CloudflareR2UploadService();