import { serve } from "http/server";
import { createClient} from "@supabase/supabase-js";
import { corsHeaders } from '../_shared/cors.ts';
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
serve(async (req) => {
  const origin = req.headers.get('origin')
  const headers = corsHeaders(origin)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers, status: 200 })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Alleen POST-verzoeken zijn toegestaan.', uiMessage: 'Alleen POST-verzoeken zijn toegestaan.' }), { status: 400 })
  }
  try {
    const hookSecret = (Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string)?.replace('v1,whsec_', '')
    const payload = await req.text()
    const headersObj = Object.fromEntries(req.headers)
    const wh = new Webhook(hookSecret)
    let verified
    try {
      verified = wh.verify(payload, headersObj)
    } catch (verifyErr) {
      console.error('Webhook verificatie mislukt:', verifyErr)
      return new Response(JSON.stringify({ error: 'Webhook verificatie mislukt', uiMessage: 'Verificatie van de aanvraag is mislukt.' }), { status: 401 })
    }
    const { user, email_data } = verified
    // Remove duplicate declarations below
    // const emailType = payload.type
    // const email: string = payload.data.email
    const emailType = email_data?.type
    const email = user?.email
    
    // Handle different email types
    const emailType = payload.type
    const email: string = payload.data.email
    
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
      default:
        console.log('Unsupported email type:', emailType)
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