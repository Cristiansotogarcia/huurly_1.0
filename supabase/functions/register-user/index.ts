import { serve } from 'http/server'
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors'

serve(async (req) => {
  console.log('Function invoked. Method:', req.method, 'Origin:', req.headers.get('origin'));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
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
