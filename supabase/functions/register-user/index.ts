import { serve } from 'http/server'
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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
