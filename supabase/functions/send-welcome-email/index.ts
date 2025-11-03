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
    const { email, firstName, role } = await req.json();

    if (!email || !firstName || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, firstName, role' }),
        { status: 400, headers }
      );
    }

    const resendKey = Deno.env.get('RESEND_API_KEY') ?? '';
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'team@huurly.nl';

    if (!resendKey) {
      console.error('Missing RESEND_API_KEY environment variable');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { headers, status: 500 }
      );
    }

    // Role-specific content
    const roleContent = role === 'huurder' ? {
      greeting: 'Welkom bij Huurly',
      intro: 'Je bent succesvol geregistreerd als huurder op ons platform.',
      nextSteps: [
        'Vul je profiel volledig in met persoonlijke informatie',
        'Maak je profiel zichtbaar voor verhuurders',
        'Begin met zoeken naar je ideale woning'
      ],
      tip: 'Hoe completer je profiel, hoe groter de kans dat verhuurders contact met je opnemen!'
    } : {
      greeting: 'Welkom bij Huurly',
      intro: 'Je bent succesvol geregistreerd als verhuurder op ons platform.',
      nextSteps: [
        'Vul je bedrijfsinformatie in',
        'Plaats je eerste woning',
        'Bekijk profielen van geverifieerde huurders',
        'Vind de perfecte match voor je woning'
      ],
      tip: 'Verhuurders met complete woningprofielen ontvangen gemiddeld 3x meer reacties!'
    };

    // HTML email template
    const emailHtml = `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welkom bij Huurly</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                                ${roleContent.greeting}! 🏠
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Hoi ${firstName},
                            </p>
                            
                            <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                                ${roleContent.intro}
                            </p>
                            
                            <h2 style="margin: 0 0 20px; color: #333333; font-size: 20px; font-weight: bold;">
                                Je volgende stappen:
                            </h2>
                            
                            <ol style="margin: 0 0 30px; padding-left: 20px; color: #333333; font-size: 16px; line-height: 1.8;">
                                ${roleContent.nextSteps.map(step => `<li style="margin-bottom: 10px;">${step}</li>`).join('')}
                            </ol>
                            
                            <div style="background-color: #f0f4ff; border-left: 4px solid #667eea; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
                                    <strong>💡 Tip:</strong> ${roleContent.tip}
                                </p>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="https://huurly.nl/login" 
                                   style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                    Naar Dashboard
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 10px; color: #666666; font-size: 14px; line-height: 1.6;">
                                Heb je vragen? We helpen je graag!
                            </p>
                            <p style="margin: 0 0 15px; color: #666666; font-size: 14px;">
                                📧 <a href="mailto:team@huurly.nl" style="color: #667eea; text-decoration: none;">team@huurly.nl</a><br>
                                🌐 <a href="https://huurly.nl" style="color: #667eea; text-decoration: none;">huurly.nl</a>
                            </p>
                            
                            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                            
                            <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.5;">
                                Met vriendelijke groet,<br>
                                Het Huurly Team
                            </p>
                            
                            <p style="margin: 15px 0 0; color: #999999; font-size: 11px; line-height: 1.5;">
                                Je ontvangt deze e-mail omdat je je hebt geregistreerd op Huurly.<br>
                                © ${new Date().getFullYear()} Huurly - CSG Online Specialist
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
        from: `Huurly <${fromEmail}>`,
        to: [email],
        subject: `Welkom bij Huurly, ${firstName}! 🏠`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      return new Response(
        JSON.stringify({ error: `Failed to send email: ${errorText}` }),
        { headers, status: emailResponse.status }
      );
    }

    const result = await emailResponse.json();
    console.log('Welcome email sent successfully:', { email, role, messageId: result.id });

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { headers, status: 200 }
    );

  } catch (err) {
    console.error('Send welcome email error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to send welcome email' }),
      { headers, status: 500 }
    );
  }
});
