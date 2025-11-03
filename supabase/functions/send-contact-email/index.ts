import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const headers = corsHeaders;
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers, status: 200 });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Only POST requests are allowed' }),
      { status: 400, headers }
    );
  }

  try {
    const { name, email, subject, message } = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Missing required fields',
          uiMessage: 'Vul alle velden in om uw bericht te versturen.'
        }),
        { status: 400, headers }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid email format',
          uiMessage: 'Vul een geldig e-mailadres in.'
        }),
        { status: 400, headers }
      );
    }

    const resendKey = Deno.env.get('RESEND_API_KEY') ?? '';
    const toEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'team@huurly.nl';

    if (!resendKey) {
      console.error('Missing RESEND_API_KEY environment variable');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Email service not configured',
          uiMessage: 'De e-mailservice is momenteel niet beschikbaar. Probeer het later opnieuw.'
        }),
        { headers, status: 500 }
      );
    }

    // Get current timestamp
    const now = new Date();
    const timestamp = now.toLocaleString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // HTML email template for contact form
    const emailHtml = `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Formulier - Huurly</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                                📧 Nieuw Contactformulier Bericht
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                                <p style="margin: 0; color: #666666; font-size: 14px;">
                                    <strong>Ontvangen op:</strong> ${timestamp}
                                </p>
                            </div>

                            <h2 style="margin: 0 0 20px; color: #333333; font-size: 20px; font-weight: bold;">
                                Contactgegevens
                            </h2>
                            
                            <table style="width: 100%; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 12px; background-color: #f8f9fa; border-bottom: 1px solid #e0e0e0;">
                                        <strong style="color: #666666; font-size: 14px;">Naam:</strong>
                                    </td>
                                    <td style="padding: 12px; background-color: #f8f9fa; border-bottom: 1px solid #e0e0e0;">
                                        <span style="color: #333333; font-size: 14px;">${name}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                                        <strong style="color: #666666; font-size: 14px;">E-mailadres:</strong>
                                    </td>
                                    <td style="padding: 12px; background-color: #ffffff; border-bottom: 1px solid #e0e0e0;">
                                        <a href="mailto:${email}" style="color: #667eea; text-decoration: none; font-size: 14px;">${email}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px; background-color: #f8f9fa; border-bottom: 1px solid #e0e0e0;">
                                        <strong style="color: #666666; font-size: 14px;">Onderwerp:</strong>
                                    </td>
                                    <td style="padding: 12px; background-color: #f8f9fa; border-bottom: 1px solid #e0e0e0;">
                                        <span style="color: #333333; font-size: 14px;">${subject}</span>
                                    </td>
                                </tr>
                            </table>

                            <h2 style="margin: 0 0 15px; color: #333333; font-size: 18px; font-weight: bold;">
                                Bericht
                            </h2>
                            
                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; border: 1px solid #e0e0e0;">
                                <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                            </div>

                            <div style="margin-top: 30px; padding: 15px; background-color: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 4px;">
                                <p style="margin: 0; color: #2e7d32; font-size: 13px;">
                                    <strong>💡 Tip:</strong> Je kunt direct reageren op dit bericht door op "Beantwoorden" te klikken in je e-mailclient.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                                Dit bericht is verzonden via het contactformulier op huurly.nl
                            </p>
                            <p style="margin: 10px 0 0; color: #999999; font-size: 11px; text-align: center;">
                                © ${now.getFullYear()} Huurly - CSG Online Specialist
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Huurly Contact <${toEmail}>`,
        to: [toEmail],
        reply_to: email, // Allow direct reply to the sender
        subject: `Contactformulier: ${subject}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Failed to send email: ${errorText}`,
          uiMessage: 'Er ging iets mis bij het verzenden van uw bericht. Probeer het later opnieuw.'
        }),
        { headers, status: emailResponse.status }
      );
    }

    const result = await emailResponse.json();
    console.log('Contact form email sent successfully:', { 
      from: email,
      subject,
      messageId: result.id 
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.id,
        uiMessage: 'Uw bericht is succesvol verzonden!'
      }),
      { headers, status: 200 }
    );

  } catch (err) {
    console.error('Send contact email error:', err);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: err.message || 'Failed to send contact email',
        uiMessage: 'Er is een onverwachte fout opgetreden. Probeer het later opnieuw.'
      }),
      { headers, status: 500 }
    );
  }
});
