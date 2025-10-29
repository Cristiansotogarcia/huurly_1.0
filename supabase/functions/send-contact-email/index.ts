import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  const origin = req.headers.get('origin')
  const headers = corsHeaders
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers, status: 200 })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Alleen POST-verzoeken zijn toegestaan.',
      uiMessage: 'Alleen POST-verzoeken zijn toegestaan.'
    }), { status: 400 })
  }

  try {
    const contentType = req.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return new Response(JSON.stringify({
        error: 'Niet-ondersteund inhoudstype. Alleen application/json wordt ondersteund.',
        uiMessage: 'Niet-ondersteund inhoudstype. Alleen application/json wordt ondersteund.'
      }), { status: 400, headers })
    }

    const body = await req.json()
    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({
        error: 'Alle velden zijn verplicht.',
        uiMessage: 'Alle velden zijn verplicht.'
      }), { status: 400, headers })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({
        error: 'Ongeldig e-mailadres.',
        uiMessage: 'Ongeldig e-mailadres.'
      }), { status: 400, headers })
    }

    const resendKey = Deno.env.get('RESEND_API_KEY') ?? ''
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? ''
    if (!resendKey || !fromEmail) {
      console.error('Missing RESEND_API_KEY or RESEND_FROM_EMAIL environment variable')
      return new Response(JSON.stringify({
        error: 'Email service not configured',
        uiMessage: 'E-mailservice is niet geconfigureerd. Neem contact op met de beheerder.'
      }), { status: 500 })
    }

    // Send email to team@huurly.nl
    const emailSubject = `Contact Formulier: ${subject}`
    const emailHtml = `
      <h2>Nieuw contactformulier bericht</h2>
      <p><strong>Naam:</strong> ${name}</p>
      <p><strong>E-mail:</strong> ${email}</p>
      <p><strong>Onderwerp:</strong> ${subject}</p>
      <p><strong>Bericht:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p>Dit bericht is verzonden via het contactformulier op Huurly.nl</p>
    `

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: ['team@huurly.nl'],
        subject: emailSubject,
        html: emailHtml,
        reply_to: email, // Allow replying directly to the sender
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Resend API error:', errorText)
      let status = 500
      if (emailResponse.status >= 400 && emailResponse.status < 500) {
        status = emailResponse.status
      }
      return new Response(JSON.stringify({
        error: `Failed to send email: ${errorText}`,
        uiMessage: 'E-mail verzenden is mislukt. Probeer het later opnieuw.'
      }), { headers, status })
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Bericht succesvol verzonden!'
    }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Send contact email error:', err)
    return new Response(JSON.stringify({
      error: err.message || err,
      uiMessage: 'Er is een onverwachte fout opgetreden bij het versturen van de e-mail.'
    }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
