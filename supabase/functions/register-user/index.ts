import { serve } from 'http/server'
import { createClient } from '@supabase/supabase-js'
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://www.huurly.nl',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { id, email, firstName, lastName, role } = await req.json()

    const { error } = await supabase.from('gebruikers').upsert(
      {
        id,
        email,
        naam: `${firstName} ${lastName}`,
        rol: role,
      },
      {
        onConflict: 'id',
      }
    )

    if (error) throw error

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
