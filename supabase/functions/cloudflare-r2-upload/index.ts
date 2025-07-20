import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from '../_shared/cors.ts';

// Simple HMAC-SHA256 implementation for signing
async function sign(key: ArrayBuffer | Uint8Array, message: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key instanceof Uint8Array ? key : key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
}

// Convert ArrayBuffer to hex string
function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generate AWS Signature Version 4
async function generateSignature(
  secretKey: string,
  date: string,
  region: string,
  service: string,
  stringToSign: string
): Promise<string> {
  const kDate = await sign(new TextEncoder().encode('AWS4' + secretKey), date);
  const kRegion = await sign(kDate, region);
  const kService = await sign(kRegion, service);
  const kSigning = await sign(kService, 'aws4_request');
  const signature = await sign(kSigning, stringToSign);
  return toHex(signature);
}

// Create authorization header for S3
async function createAuthorizationHeader(
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  service: string,
  method: string,
  path: string,
  headers: Record<string, string>,
  payloadHash: string
): Promise<string> {
  const now = new Date();
  const date = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = date.slice(0, 8);
  
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map(key => `${key.toLowerCase()}:${headers[key].trim()}\n`)
    .join('');
  
  const signedHeaders = Object.keys(headers)
    .sort()
    .map(key => key.toLowerCase())
    .join(';');
  
  const canonicalRequest = [
    method,
    path,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');
  
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    date,
    credentialScope,
    toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest)))
  ].join('\n');
  
  const signature = await generateSignature(secretAccessKey, dateStamp, region, service, stringToSign);
  
  return `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Get Cloudflare R2 credentials from environment
    const accountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');
    const accessKeyId = Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY_ID');
    const secretAccessKey = Deno.env.get('CLOUDFLARE_R2_SECRET_KEY');
    const bucketName = Deno.env.get('CLOUDFLARE_R2_BUCKET');
    const endpoint = Deno.env.get('CLOUDFLARE_R2_ENDPOINT');

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !endpoint) {
      console.error('Missing environment variables:', {
        accountId: !!accountId,
        accessKeyId: !!accessKeyId,
        secretAccessKey: !!secretAccessKey,
        bucketName: !!bucketName,
        endpoint: !!endpoint
      });
      return new Response(
        JSON.stringify({ error: 'Missing Cloudflare R2 credentials' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse the multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const folder = formData.get('folder') as string || 'general';

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'File type not allowed' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File size must be less than 10MB' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate unique file path
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${folder}/${userId}/${timestamp}_${randomString}_${sanitizedName}`;

    // Read file content
    const fileBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);
    
    // Calculate SHA256 hash of the file
    const fileHash = toHex(await crypto.subtle.digest('SHA-256', fileBuffer));

    // Prepare headers for S3 upload
    const uploadUrl = `${endpoint}/${bucketName}/${encodeURIComponent(filePath)}`;
    const host = new URL(endpoint).host;
    
    const headers: Record<string, string> = {
      'Content-Type': file.type,
      'Content-Length': file.size.toString(),
      'Host': host,
      'x-amz-content-sha256': fileHash,
      'x-amz-date': new Date().toISOString().replace(/[:-]|\.\d{3}/g, ''),
    };

    // Add ACL for public read
    headers['x-amz-acl'] = 'public-read';

    // Create authorization header
    const authorization = await createAuthorizationHeader(
      accessKeyId,
      secretAccessKey,
      'auto',
      's3',
      'PUT',
      `/${bucketName}/${filePath}`,
      headers,
      fileHash
    );

    headers['Authorization'] = authorization;

    // Upload to Cloudflare R2
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: headers,
      body: fileBytes,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudflare R2 upload error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Failed to upload file to Cloudflare R2: ${response.status} ${errorText}` }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create public URL
    const publicUrl = `${endpoint}/${bucketName}/${filePath}`;

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: publicUrl,
        path: filePath,
        fileName: file.name
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in cloudflare-r2-upload:', error);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
