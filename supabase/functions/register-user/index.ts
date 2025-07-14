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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { id, email, firstName, lastName, role } = await req.json()

    console.log('Registering user:', { id, email, firstName, lastName, role })

    // Cache timestamp for consistency and performance
    const timestamp = new Date().toISOString()
    const fullName = `${firstName} ${lastName}`

    // Create user in main gebruikers table with verification
    const { data: userData, error: userError } = await supabase.from('gebruikers').upsert(
      {
        id,
        email,
        naam: fullName,
        rol: role,
        profiel_compleet: false,
        aangemaakt_op: timestamp,
        bijgewerkt_op: timestamp,
      },
      {
        onConflict: 'id',
      }
    ).select()

    if (userError) {
      console.error('Error creating user:', userError)
      throw userError
    }

    if (!userData || userData.length === 0) {
      console.error('User creation failed - no data returned')
      throw new Error('Failed to create user record')
    }

    console.log('User created successfully:', userData[0])

    // Create role-specific record with optimized approach
    if (role === 'huurder') {
      console.log('Creating huurder record for user:', id)
      const { data: huurderData, error: huurderError } = await supabase.from('huurders').upsert(
        {
          id,
          aangemaakt_op: timestamp,
          bijgewerkt_op: timestamp,
        },
        {
          onConflict: 'id',
        }
      ).select()

      if (huurderError) {
        console.error('Error creating huurder:', {
          error: huurderError,
          code: huurderError.code,
          message: huurderError.message,
          details: huurderError.details,
          hint: huurderError.hint
        })
        throw huurderError
      }

      if (!huurderData || huurderData.length === 0) {
        console.error('Huurder creation failed - no data returned')
        throw new Error('Failed to create huurder record')
      }

      console.log('Huurder created successfully:', huurderData[0])
    } else if (role === 'verhuurder') {
      // Optimized: Remove .select() for non-critical verification
      const { error: verhuurderError } = await supabase.from('verhuurders').upsert(
        {
          id,
          bedrijfsnaam: fullName,
          aantal_woningen: 0,
          aangemaakt_op: timestamp,
          bijgewerkt_op: timestamp,
        },
        {
          onConflict: 'id',
        }
      )

      if (verhuurderError) {
        console.error('Error creating verhuurder:', verhuurderError)
        throw verhuurderError
      }
      console.log('Verhuurder created successfully for user:', id)
    } else if (role === 'beoordelaar') {
      // Optimized: Remove .select() for non-critical verification
      const { error: beoordelaarError } = await supabase.from('beoordelaars').upsert(
        {
          id,
          aangemaakt_op: timestamp,
          bijgewerkt_op: timestamp,
        },
        {
          onConflict: 'id',
        }
      )

      if (beoordelaarError) {
        console.error('Error creating beoordelaar:', beoordelaarError)
        throw beoordelaarError
      }
      console.log('Beoordelaar created successfully for user:', id)
    }

    // Note: gebruiker_rollen table operations removed as the table doesn't exist in current schema
    // Role information is already stored in the gebruikers table via the 'rol' column

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
