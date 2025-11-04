// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'

// Supabase Auth Hook for sending all authentication emails
// This replaces Supabase's default email system with custom branded emails

interface AuthHookPayload {
  email_action_type: 'signup' | 'recovery' | 'invite' | 'magic_link' | 'email_change_current' | 'email_change_new' | 'reauthentication';
  user: {
    id: string;
    email: string;
    email_confirmed_at?: string;
    phone?: string;
    created_at: string;
    updated_at: string;
    user_metadata: {
      first_name?: string;
      last_name?: string;
      role?: string;
      [key: string]: any;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
}

serve(async (req: Request) => {
  try {
    // Get the webhook secret
    const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') ?? '';
    
    if (!hookSecret) {
      console.error('Missing SEND_EMAIL_HOOK_SECRET environment variable');
      return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get payload and headers for verification
    const payloadText = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    // Verify the webhook signature
    const wh = new Webhook(hookSecret.replace('v1,whsec_', ''));
    const payload: AuthHookPayload = wh.verify(payloadText, headers) as AuthHookPayload;
    
    console.log('Auth hook triggered:', {
      actionType: payload.email_data.email_action_type,
      email: payload.user.email,
      userId: payload.user.id,
      siteUrl: payload.email_data.site_url,
      redirectTo: payload.email_data.redirect_to
    });

    const resendKey = Deno.env.get('RESEND_API_KEY') ?? '';
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'team@huurly.nl';
    
    if (!resendKey) {
      console.error('Missing RESEND_API_KEY environment variable');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract user data
    const { email, user_metadata } = payload.user;
    const firstName = user_metadata?.first_name || 'daar';
    const role = user_metadata?.role || 'huurder';
    
    // Build confirmation URL - must go through Supabase auth/v1/verify endpoint
    // This endpoint will verify the token and redirect to your app with a valid session
    // Note: site_url might already include /auth/v1, so we need to handle that
    let baseUrl = payload.email_data.site_url;
    
    // Remove /auth/v1 suffix if it exists to avoid duplication
    if (baseUrl.endsWith('/auth/v1')) {
      baseUrl = baseUrl.slice(0, -8); // Remove '/auth/v1'
    }
    
    const confirmationUrl = `${baseUrl}/auth/v1/verify?token=${payload.email_data.token_hash}&type=${payload.email_data.email_action_type}&redirect_to=${payload.email_data.redirect_to}`;
    
    console.log('Base URL:', baseUrl);
    console.log('Confirmation URL constructed:', confirmationUrl);

    let emailHtml = '';
    let subject = '';

    // Generate email based on action type
    switch (payload.email_data.email_action_type) {
      case 'signup':
        subject = `Welkom bij Huurly, ${firstName}! 🏠`;
        emailHtml = generateSignupEmail(firstName, role, confirmationUrl);
        break;
      
      case 'recovery':
        subject = 'Wachtwoord herstellen - Huurly';
        emailHtml = generateRecoveryEmail(firstName, confirmationUrl);
        break;
      
      case 'magic_link':
        subject = 'Je Huurly inloglink';
        emailHtml = generateMagicLinkEmail(firstName, confirmationUrl);
        break;
      
      case 'email_change_current':
      case 'email_change_new':
        subject = 'Bevestig je nieuwe e-mailadres - Huurly';
        emailHtml = generateEmailChangeEmail(firstName, confirmationUrl);
        break;
      
      case 'invite':
        subject = 'Je bent uitgenodigd voor Huurly';
        emailHtml = generateInviteEmail(firstName, confirmationUrl);
        break;
      
      default:
        console.warn('Unknown email action type:', payload.email_data.email_action_type);
        subject = 'Huurly - Bevestiging vereist';
        emailHtml = generateGenericEmail(firstName, confirmationUrl);
    }

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
        subject,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      return new Response(
        JSON.stringify({ error: `Failed to send email: ${errorText}` }),
        { status: emailResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await emailResponse.json();
    console.log('Auth email sent successfully:', {
      actionType: payload.email_data.email_action_type,
      email,
      messageId: result.id
    });

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Auth hook error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to process auth hook' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// Email template generators
function generateSignupEmail(firstName: string, role: string, confirmationUrl: string): string {
  const roleContent = role === 'huurder' ? {
    greeting: 'Welkom bij Huurly',
    intro: 'Je bent succesvol geregistreerd als huurder op ons platform. Om te beginnen, bevestig eerst je e-mailadres.',
    nextSteps: [
      'Bevestig je e-mailadres (klik op de knop hieronder)',
      'Log in op je account',
      'Activeer je account via de eenmalige betaling',
      'Vul je profiel volledig in met persoonlijke informatie',
      'Maak je profiel zichtbaar voor verhuurders'
    ],
    tip: 'Hoe completer je profiel, hoe groter de kans dat verhuurders contact met je opnemen!'
  } : {
    greeting: 'Welkom bij Huurly',
    intro: 'Je bent succesvol geregistreerd als verhuurder op ons platform. Om te beginnen, bevestig eerst je e-mailadres.',
    nextSteps: [
      'Bevestig je e-mailadres (klik op de knop hieronder)',
      'Log in op je account',
      'Vul je bedrijfsinformatie in',
      'Plaats je eerste woning',
      'Bekijk profielen van geverifieerde huurders'
    ],
    tip: 'Verhuurders met complete woningprofielen ontvangen gemiddeld 3x meer reacties!'
  };

  return generateEmailTemplate(
    `${roleContent.greeting}! 🏠`,
    `
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
    `,
    confirmationUrl,
    'Bevestig je E-mail Adres',
    'Na bevestiging kun je direct inloggen en je account activeren.'
  );
}

function generateRecoveryEmail(firstName: string, recoveryUrl: string): string {
  return generateEmailTemplate(
    'Wachtwoord Herstellen 🔐',
    `
      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
        Hoi ${firstName},
      </p>
      
      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
        We hebben een verzoek ontvangen om je wachtwoord opnieuw in te stellen. 
        Klik op de onderstaande knop om een nieuw wachtwoord in te stellen.
      </p>
      
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
        <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
          <strong>⚠️ Belangrijk:</strong> Deze link is 60 minuten geldig. 
          Als je dit verzoek niet hebt gedaan, kun je deze e-mail negeren.
        </p>
      </div>
    `,
    recoveryUrl,
    'Stel Nieuw Wachtwoord In',
    'Als de knop niet werkt, kopieer en plak dan deze link in je browser.'
  );
}

function generateMagicLinkEmail(firstName: string, magicLinkUrl: string): string {
  return generateEmailTemplate(
    'Je Inloglink 🔗',
    `
      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
        Hoi ${firstName},
      </p>
      
      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
        Klik op de onderstaande knop om direct in te loggen op je Huurly account. 
        Je hoeft geen wachtwoord in te voeren!
      </p>
      
      <div style="background-color: #f0f4ff; border-left: 4px solid #667eea; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
        <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
          <strong>💡 Tip:</strong> Deze magische link is 60 minuten geldig en kan maar één keer gebruikt worden.
        </p>
      </div>
    `,
    magicLinkUrl,
    'Inloggen bij Huurly',
    'Als je niet hebt gevraagd om in te loggen, kun je deze e-mail negeren.'
  );
}

function generateEmailChangeEmail(firstName: string, confirmationUrl: string): string {
  return generateEmailTemplate(
    'Bevestig je Nieuwe E-mailadres ✉️',
    `
      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
        Hoi ${firstName},
      </p>
      
      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
        We hebben een verzoek ontvangen om je e-mailadres te wijzigen. 
        Bevestig je nieuwe e-mailadres door op de onderstaande knop te klikken.
      </p>
      
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
        <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
          <strong>⚠️ Belangrijk:</strong> Als je dit verzoek niet hebt gedaan, 
          neem dan onmiddellijk contact met ons op via team@huurly.nl
        </p>
      </div>
    `,
    confirmationUrl,
    'Bevestig Nieuw E-mailadres',
    'Deze link is 24 uur geldig.'
  );
}

function generateInviteEmail(firstName: string, inviteUrl: string): string {
  return generateEmailTemplate(
    'Je bent Uitgenodigd! 🎉',
    `
      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
        Hoi ${firstName},
      </p>
      
      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
        Je bent uitgenodigd om deel te nemen aan Huurly! 
        Klik op de onderstaande knop om je uitnodiging te accepteren en je account in te stellen.
      </p>
    `,
    inviteUrl,
    'Accepteer Uitnodiging',
    'Deze uitnodiging is 72 uur geldig.'
  );
}

function generateGenericEmail(firstName: string, actionUrl: string): string {
  return generateEmailTemplate(
    'Actie Vereist',
    `
      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
        Hoi ${firstName},
      </p>
      
      <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
        Er is een actie vereist voor je Huurly account. 
        Klik op de onderstaande knop om door te gaan.
      </p>
    `,
    actionUrl,
    'Doorgaan',
    ''
  );
}

// Base email template
function generateEmailTemplate(
  title: string,
  content: string,
  actionUrl: string,
  buttonText: string,
  footerNote: string
): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
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
                                ${title}
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            ${content}
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${actionUrl}" 
                                   style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                    ${buttonText}
                                </a>
                            </div>
                            
                            ${footerNote ? `
                            <p style="margin: 20px 0; color: #666666; font-size: 14px; text-align: center;">
                                ${footerNote}
                            </p>
                            ` : ''}
                            
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                                <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.5;">
                                    Als de knop niet werkt, kopieer en plak deze link in je browser:<br>
                                    <a href="${actionUrl}" style="color: #667eea; word-break: break-all;">${actionUrl}</a>
                                </p>
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
}
