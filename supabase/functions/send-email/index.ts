import { serve } from "http/server";
import { createClient} from "@supabase/supabase-js";
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  const origin = req.headers.get('origin')
  const headers = corsHeaders
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers, status: 200 })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Alleen POST-verzoeken zijn toegestaan.', uiMessage: 'Alleen POST-verzoeken zijn toegestaan.' }), { status: 400 })
  }
  try {
    // For now, we only support direct API calls (not webhooks)
    const contentType = req.headers.get('content-type')
    let emailType = ''
    let email = ''
    let user = null

    if (contentType?.includes('application/json')) {
      // Direct API call
      const body = await req.json()
      emailType = body.type
      email = body.data?.email || ''
      user = {
        email: email,
        user_metadata: body.data?.user_metadata || {}
      }
    } else {
      return new Response(JSON.stringify({
        error: 'Unsupported content type. Only application/json is supported.',
        uiMessage: 'Niet-ondersteund inhoudstype. Alleen application/json wordt ondersteund.'
      }), { status: 400, headers })
    }
    
    // Support multiple frontend URLs for different environments
    const getFrontendUrl = () => {
      const localUrl = Deno.env.get('FRONTEND_URL_LOCAL') ?? 'http://localhost:8080'
      const prodUrl = Deno.env.get('FRONTEND_URL_PROD') ?? 'https://huurly.nl'
      const fallbackUrl = Deno.env.get('FRONTEND_URL') ?? localUrl
      
      // Check if we're in production environment
      const isProduction = Deno.env.get('DENO_DEPLOYMENT_ID') || 
                          Deno.env.get('SUPABASE_URL')?.includes('supabase.co')
      
      return isProduction ? prodUrl : fallbackUrl
    }
    
    const frontend = getFrontendUrl()

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let emailSubject = ''
    let emailHtml = ''
    let actionLink = ''

    // Generate appropriate link based on email type
    switch (emailType) {
      case 'recovery':
        const { data: linkData, error: linkError } =
          await supabaseAdmin.auth.admin.generateLink('recovery', email, {
            redirectTo: `${frontend}/wachtwoord-herstellen`,
          })
        if (linkError || !linkData) {
          console.error('Error generating recovery link:', linkError)
          return new Response(JSON.stringify({ error: linkError?.message || 'Link generatie mislukt', uiMessage: 'Er is een fout opgetreden bij het genereren van de herstel-link. Probeer het later opnieuw.' }), { headers, status: 400 })
        }
        actionLink = linkData.action_link
        emailSubject = 'Wachtwoord herstellen'
        emailHtml = `
          <h2>Wachtwoord herstellen</h2>
          <p>Volg deze link om het wachtwoord van je account te herstellen:</p>
          <p><a href="${actionLink}">Herstel wachtwoord</a></p>
          <p>Deze link is 1 uur geldig.</p>
        `
        break
      case 'signup':
        const { data: signupData, error: signupError } =
          await supabaseAdmin.auth.admin.generateLink('signup', email, {
            redirectTo: `${frontend}/dashboard`,
          })
        if (signupError || !signupData) {
          console.error('Error generating signup link:', signupError)
          return new Response(JSON.stringify({ error: signupError?.message || 'Signup link generatie mislukt', uiMessage: 'Er is een fout opgetreden bij het genereren van de bevestigingslink. Probeer het later opnieuw.' }), { headers, status: 400 })
        }
        actionLink = signupData.action_link
        emailSubject = 'Bevestig je account'
        emailHtml = `
          <h2>Welkom bij Huurly!</h2>
          <p>Klik op de onderstaande link om je account te bevestigen:</p>
          <p><a href="${actionLink}">Bevestig account</a></p>
          <p>Deze link is 24 uur geldig.</p>
        `
        break
      case 'email_change':
        const { data: changeData, error: changeError } =
          await supabaseAdmin.auth.admin.generateLink('email_change_current', email, {
            redirectTo: `${frontend}/profiel`,
          })
        if (changeError || !changeData) {
          console.error('Error generating email change link:', changeError)
          return new Response(JSON.stringify({ error: changeError?.message || 'Email change link generatie mislukt', uiMessage: 'Er is een fout opgetreden bij het genereren van de e-mailwijzigingslink. Probeer het later opnieuw.' }), { headers, status: 400 })
        }
        actionLink = changeData.action_link
        emailSubject = 'E-mailadres wijziging bevestigen'
        emailHtml = `
          <h2>E-mailadres wijziging</h2>
          <p>Klik op de onderstaande link om je nieuwe e-mailadres te bevestigen:</p>
          <p><a href="${actionLink}">Bevestig nieuwe e-mailadres</a></p>
          <p>Deze link is 1 uur geldig.</p>
        `
        break
      case 'account_deletion':
        emailSubject = 'Account Verwijderd - Huurly'
        emailHtml = `
          <h2>Account Verwijderd</h2>
          <p>Beste ${user?.user_metadata?.first_name || 'gebruiker'},</p>
          <p>Uw account is succesvol verwijderd uit ons systeem.</p>
          <p>Alle persoonlijke gegevens, inclusief uw profiel, berichten, documenten en bestanden zijn permanent verwijderd.</p>
          <p>Als u vragen heeft of dit een vergissing was, neem dan contact met ons op.</p>
          <p>Met vriendelijke groet,<br>Het Huurly Team</p>
          <p>Dit is een automatische bevestiging. U hoeft niet te reageren op deze e-mail.</p>
        `
        break
      default:
        return new Response('Unsupported email type', { headers, status: 400 })
    }

    const resendKey = Deno.env.get('RESEND_API_KEY') ?? ''
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? ''
    if (!resendKey || !fromEmail) {
      console.error('Missing RESEND_API_KEY or RESEND_FROM_EMAIL environment variable')
      return new Response(JSON.stringify({ error: 'Email service not configured', uiMessage: 'E-mailservice is niet geconfigureerd. Neem contact op met de beheerder.' }), { headers, status: 500 })
    }
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: emailSubject,
        html: emailHtml,
      }),
    })
    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Resend API error:', errorText)
      let status = 500
      if (emailResponse.status >= 400 && emailResponse.status < 500) {
        status = emailResponse.status
      }
      return new Response(JSON.stringify({ error: `Failed to send email: ${errorText}`, uiMessage: 'E-mail verzenden is mislukt. Probeer het later opnieuw.' }), { headers, status })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Send email hook error:', err)
    return new Response(JSON.stringify({ error: err.message || err, uiMessage: 'Er is een onverwachte fout opgetreden bij het versturen van de e-mail.' }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
