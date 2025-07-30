import { serve } from 'http/server'
import { createClient } from '@supabase/supabase-js'

// Enhanced CORS headers with proper origin handling
const getCorsHeaders = (origin: string | null) => {
  const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://huurly-1-0.vercel.app',
    'https://huurly.nl'
  ];
  
  const isAllowed = origin && allowedOrigins.includes(origin);
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://huurly.nl',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
    'Content-Type': 'application/json'
  };
};

serve(async (req) => {
  const origin = req.headers.get('origin')
  const headers = getCorsHeaders(origin)
  
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


    // Verify user exists in auth.users table first
    const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(id)
    
    if (authUserError || !authUser.user) {
      console.error('User not found in auth.users:', authUserError)
      throw new Error(`User with ID ${id} not found in authentication system`)
    }


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


    // Create role-specific record with optimized approach
    if (role === 'huurder') {
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
    } else if (role === 'admin' || role === 'beheerder') {
      // Handle both 'admin' (from roleMapper) and 'beheerder' (direct) roles
      const { error: beheerderError } = await supabase.from('beheerders').upsert(
        {
          id,
          aangemaakt_op: timestamp,
          bijgewerkt_op: timestamp,
        },
        {
          onConflict: 'id',
        }
      )

      if (beheerderError) {
        console.error('Error creating beheerder:', beheerderError)
        throw beheerderError
      }
    }

    // Note: gebruiker_rollen table operations removed as the table doesn't exist in current schema
    // Role information is already stored in the gebruikers table via the 'rol' column


    return new Response(JSON.stringify({ success: true }), {
      headers,
      status: 200,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Registration failed',
      details: error 
    }), {
      headers,
      status: 400,
    })
  }
})
