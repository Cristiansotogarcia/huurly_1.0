import { serve } from 'http/server'
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Get origin from request headers
  const origin = req.headers.get('origin')
  const headers = corsHeaders(origin)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers, status: 200 });
  }

  try {
    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_KEY') ?? ''
    )

    const { id, email, firstName, lastName, role } = await req.json()

    console.log('Registering user:', { id, email, firstName, lastName, role })

    // Create user in main gebruikers table
    const { error: userError } = await supabase.from('gebruikers').upsert(
      {
        id,
        email,
        naam: `${firstName} ${lastName}`,
        rol: role,
        profiel_compleet: false,
        is_actief: true,
        aangemaakt_op: new Date().toISOString(),
        bijgewerkt_op: new Date().toISOString(),
      },
      {
        onConflict: 'id',
      }
    )

    if (userError) {
      console.error('Error creating user:', userError)
      throw userError
    }

    // Create role-specific record
    if (role === 'huurder') {
      const { error: huurderError } = await supabase.from('huurders').upsert(
        {
          id,
          voornaam: firstName,
          achternaam: lastName,
          email,
          telefoon: '',
          profiel_compleet: false,
          abonnement_actief: false,
          aangemaakt_op: new Date().toISOString(),
          bijgewerkt_op: new Date().toISOString(),
        },
        {
          onConflict: 'id',
        }
      )

      if (huurderError) {
        console.error('Error creating huurder:', huurderError)
        throw huurderError
      }
    } else if (role === 'verhuurder') {
      const { error: verhuurderError } = await supabase.from('verhuurders').upsert(
        {
          id,
          bedrijfsnaam: `${firstName} ${lastName}`,
          email,
          telefoon: '',
          profiel_compleet: true,
          aantal_woningen: 0,
          aangemaakt_op: new Date().toISOString(),
          bijgewerkt_op: new Date().toISOString(),
        },
        {
          onConflict: 'id',
        }
      )

      if (verhuurderError) {
        console.error('Error creating verhuurder:', verhuurderError)
        throw verhuurderError
      }
    } else if (role === 'beoordelaar') {
      const { error: beoordelaarError } = await supabase.from('beoordelaars').upsert(
        {
          id,
          naam: `${firstName} ${lastName}`,
          email,
          profiel_compleet: true,
          aangemaakt_op: new Date().toISOString(),
          bijgewerkt_op: new Date().toISOString(),
        },
        {
          onConflict: 'id',
        }
      )

      if (beoordelaarError) {
        console.error('Error creating beoordelaar:', beoordelaarError)
        throw beoordelaarError
      }
    }

    // Create user role record
    const { error: roleError } = await supabase.from('gebruiker_rollen').upsert(
      {
        user_id: id,
        role: role,
        subscription_status: role === 'huurder' ? 'pending' : 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )

    if (roleError) {
      console.error('Error creating role:', roleError)
      throw roleError
    }

    console.log('User registration completed successfully')

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Registration failed',
      details: error 
    }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
