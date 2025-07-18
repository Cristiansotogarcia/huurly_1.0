import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from '../_shared/cors.ts';

/* helpers -------------------------------------------------------------- */
async function sign(key: Uint8Array, msg: string) {
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', k, new TextEncoder().encode(msg));
}
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');

async function sigV4(
  access: string,
  secret: string,
  region: string,
  method: string,
  path: string,
  hdrs: Record<string, string>,
  payloadHash: string,
) {
  const now   = new Date();
  const amzDt = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date  = amzDt.slice(0, 8);

  hdrs['x-amz-date'] = amzDt;

  const canonicalHeaders = Object.keys(hdrs).sort()
    .map(k => `${k.toLowerCase()}:${hdrs[k].trim()}\n`).join('');
  const signedHeaders = Object.keys(hdrs).sort().map(k => k.toLowerCase()).join(';');

  const canonicalRequest = [
    method, path, '', canonicalHeaders, signedHeaders, payloadHash
  ].join('\n');

  const scope     = `${date}/${region}/s3/aws4_request`;
  const strToSign = [
    'AWS4-HMAC-SHA256', amzDt, scope,
    hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest)))
  ].join('\n');

  const kDate    = await sign(new TextEncoder().encode('AWS4' + secret), date);
  const kRegion  = await sign(new Uint8Array(kDate), region);
  const kService = await sign(new Uint8Array(kRegion), 's3');
  const kSigning = await sign(new Uint8Array(kService), 'aws4_request');
  const signature= await sign(new Uint8Array(kSigning), strToSign);

  hdrs['Authorization'] =
    `AWS4-HMAC-SHA256 Credential=${access}/${scope}, SignedHeaders=${signedHeaders}, Signature=${hex(signature)}`;
}

/* --------------------------------------------------------------------- */
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST')    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });

  try {
    const access = Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY_ID')!;
    const secret = Deno.env.get('CLOUDFLARE_R2_SECRET_KEY')!;
    const bucket = Deno.env.get('CLOUDFLARE_R2_BUCKET') || 'documents';
    const endpoint = Deno.env.get('CLOUDFLARE_R2_ENDPOINT')!;
    const region   = 'auto';

    const fd       = await req.formData();
    const fileAny  = fd.get('file');
    const userId   = fd.get('userId');
    const folder   = (fd.get('folder') as string) || 'general';

    if (!(fileAny instanceof File))            return new Response(JSON.stringify({ error: 'Missing file' }), { status: 400, headers: corsHeaders });
    if (!userId || typeof userId !== 'string') return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400, headers: corsHeaders });

    const file    = fileAny;
    const ts      = Date.now();
    const rnd     = Math.random().toString(36).slice(2, 12);
    const safe    = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const objPath = `${folder}/${userId}/${ts}_${rnd}_${safe}`;

    /* ✅ FIXED: include bucket in path */
    const uploadUrl     = `${endpoint}/${bucket}/${objPath}`;
    const canonicalPath = `/${bucket}/${objPath}`;

    const buf   = await file.arrayBuffer();
    const hash  = hex(await crypto.subtle.digest('SHA-256', buf));
    const host  = new URL(endpoint).host;

    const hdrs: Record<string, string> = {
      'Content-Type'        : file.type,
      'Content-Length'      : file.size.toString(),
      'Host'                : host,
      'x-amz-content-sha256': hash,
      'x-amz-acl'           : 'public-read'
    };

    await sigV4(access, secret, region, 'PUT', canonicalPath, hdrs, hash);

    const put = await fetch(uploadUrl, { method: 'PUT', headers: hdrs, body: new Uint8Array(buf) });

    if (!put.ok) {
      const txt = await put.text();
      return new Response(JSON.stringify({ error: 'Upload failed', status: put.status, detail: txt }), { status: put.status, headers: corsHeaders });
    }

    const publicUrl = `https://documents.huurly.nl/${objPath}`;

    return new Response(JSON.stringify({
      success : true,
      url     : publicUrl,
      path    : `${bucket}/${objPath}`,
      fileName: file.name
    }), { headers: corsHeaders });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
});