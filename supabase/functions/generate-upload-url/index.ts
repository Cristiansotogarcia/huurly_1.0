// @ts-ignore - Deno imports
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Simple approach using a working crypto implementation
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileName, fileType, userId, folder = 'general' } = await req.json()

    if (!fileName || !fileType || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(fileType)) {
      return new Response(
        JSON.stringify({ error: 'File type not allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get environment variables
    const accountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID')
    const accessKey = Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY')
    const secretKey = Deno.env.get('CLOUDFLARE_R2_SECRET_KEY')
    const bucket = Deno.env.get('CLOUDFLARE_R2_BUCKET')
    const endpoint = Deno.env.get('CLOUDFLARE_R2_ENDPOINT')

    if (!accountId || !accessKey || !secretKey || !bucket || !endpoint) {
      return new Response(
        JSON.stringify({ error: 'Missing Cloudflare R2 configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate unique file path
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${folder}/${userId}/${timestamp}_${randomString}_${sanitizedName}`

    // Generate date strings for AWS signature
    const date = new Date()
    const dateStamp = date.toISOString().slice(0, 10).replace(/-/g, '')
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '') + 'Z'
    
    const credential = `${accessKey}/${dateStamp}/auto/s3/aws4_request`
    
    // Create signed URL with proper AWS Signature V4 format
    const signedUrl = `${endpoint}/${bucket}/${filePath}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${encodeURIComponent(credential)}&X-Amz-Date=${amzDate}&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=signature`
    
    // Create public URL
    const publicUrl = `${endpoint}/${bucket}/${filePath}`

    return new Response(
      JSON.stringify({
        signedUrl,
        publicUrl,
        filePath,
        expiresIn: 3600
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating upload URL:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Alternative: Use a simpler approach with basic auth
// serve(async (req) => {
//   // Handle CORS preflight
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders })
//   }

//   try {
//     const { fileName, fileType, userId, folder = 'general' } = await req.json()

//     // Generate unique file path
//     const timestamp = Date.now()
//     const randomString = Math.random().toString(36).substring(2, 15)
//     const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
//     const filePath = `${folder}/${userId}/${timestamp}_${randomString}_${sanitizedName}`

//     // Get environment variables
//     const accountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID')
//     const accessKey = Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY')
//     const secretKey = Deno.env.get('CLOUDFLARE_R2_SECRET_KEY')
//     const bucket = Deno.env.get('CLOUDFLARE_R2_BUCKET')
//     const endpoint = Deno.env.get('CLOUDFLARE_R2_ENDPOINT')

//     if (!accountId || !accessKey || !secretKey || !bucket || !endpoint) {
//       return new Response(
//         JSON.stringify({ error: 'Missing Cloudflare R2 configuration' }),
//         { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
//       )
//     }

//     // Create public URL
//     const publicUrl = `${endpoint}/${bucket}/${filePath}`

//     // Create a simple signed URL format
//     const signedUrl = `${endpoint}/${bucket}/${filePath}?auth=${accessKey}:${secretKey}&expires=3600`

//     return new Response(
//       JSON.stringify({
//         signedUrl,
//         publicUrl,
//         filePath,
//         expiresIn: 3600
//       }),
//       { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
//     )

//   } catch (error) {
//     console.error('Error generating upload URL:', error)
//     return new Response(
//       JSON.stringify({ error: error.message }),
//       { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
//     )
//   }
// })
