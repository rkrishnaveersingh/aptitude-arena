import { createClient } from '@supabase/supabase-js';

// Safe environment variable accessor for Vite browser and testing environments
const getEnvVar = (key: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch {
    // ignore
  }
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch {
    // ignore
  }
  return '';
};

export const DEFAULT_SUPABASE_URL = 'https://mhcavtjovnyzqpbaykwu.supabase.co';
export const DEFAULT_PAPERS_BUCKET = "PYQS PAPER'S";

export const getSupabaseUrl = (): string => {
  return getEnvVar('VITE_SUPABASE_URL') || DEFAULT_SUPABASE_URL;
};

const supabaseUrl = getSupabaseUrl();
const supabaseKey = 
  getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY') || 
  getEnvVar('VITE_SUPABASE_ANON_KEY') || 
  '';

export const isSupabaseConfigured = Boolean(supabaseKey);

/**
 * Constructs direct public Supabase Storage URL for a paper PDF.
 * Uses the official bucket "PYQS PAPER'S" and Supabase getPublicUrl SDK.
 */
export const getPublicStoragePdfUrl = (filePath: string, bucketName: string = DEFAULT_PAPERS_BUCKET): string => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  const cleanPath = filePath.replace(/^\/+/, '');
  try {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(cleanPath);
    if (data?.publicUrl) return data.publicUrl;
  } catch {
    // fallback below
  }
  const baseUrl = getSupabaseUrl().replace(/\/+$/, '');
  const encodedPath = cleanPath.split('/').map(seg => encodeURIComponent(seg)).join('/');
  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucketName)}/${encodedPath}`;
};

// Safe client initialized for Supabase interactions
export const supabase = createClient(
  supabaseUrl, 
  supabaseKey || 'anon-public-key', 
  {
    auth: {
      persistSession: Boolean(supabaseKey),
      autoRefreshToken: Boolean(supabaseKey),
    },
  }
);

export interface EdgeFunctionDownloadResponse {
  success: boolean;
  paper_id?: string;
  title?: string;
  download_url?: string;
  error?: string;
}

/**
 * Downloads a paper PDF using the Supabase Edge Function:
 * GET https://mhcavtjovnyzqpbaykwu.supabase.co/functions/v1/download-paper?paper_id=<paper.id>
 */
export async function downloadPaperViaEdgeFunction(paperId: string): Promise<EdgeFunctionDownloadResponse> {
  if (!supabaseUrl || !supabaseKey) {
    return { success: false, error: 'Supabase configuration is missing' };
  }

  try {
    const endpoint = `${supabaseUrl}/functions/v1/download-paper?paper_id=${encodeURIComponent(paperId)}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      let errorMsg = `Server error ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson.error) errorMsg = errJson.error;
      } catch {
        // fallback
      }
      return { success: false, error: errorMsg };
    }

    const data: EdgeFunctionDownloadResponse = await response.json();
    if (data.success && data.download_url) {
      // Open the signed download URL from Edge Function
      try {
        if (typeof window !== 'undefined' && window.open) {
          window.open(data.download_url, '_blank', 'noopener,noreferrer');
        } else if (typeof document !== 'undefined') {
          const a = document.createElement('a');
          a.href = data.download_url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } catch {
        // fallback
      }

      return data;
    }

    return { success: false, error: data.error || 'Failed to retrieve download URL' };
  } catch (err: any) {
    console.error('Edge function download error:', err);
    return { success: false, error: err.message || 'Network error downloading paper' };
  }
}
