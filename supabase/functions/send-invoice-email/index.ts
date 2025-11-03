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
    const { 
      email, 
      customerName, 
      amount, 
      currency = 'EUR',
      transactionId,
      subscriptionType = 'yearly'
    } = await req.json();

    if (!email || !customerName || !amount || !transactionId) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: email, customerName, amount, transactionId' 
        }),
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

    // Generate invoice number based on date (format: HRL-YYYY-MMDD-XXXX)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const invoiceNumber = `HRL-${year}-${month}${day}-${random}`;

    // Format dates
    const invoiceDate = now.toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Calculate amounts (amount includes 21% BTW)
    const totalAmount = amount / 100; // Convert cents to euros
    const amountExclBTW = totalAmount / 1.21;
    const btwAmount = totalAmount - amountExclBTW;

    // Format currency
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: currency
      }).format(value);
    };

    const serviceDescription = subscriptionType === 'yearly' 
      ? 'Huurly Jaarabonnement (12 maanden)'
      : 'Huurly Platform Toegang';

    // HTML invoice template
    const emailHtml = `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factuur ${invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 650px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="width: 50%; vertical-align: top;">
                                        <h1 style="margin: 0 0 5px; color: #333333; font-size: 28px; font-weight: bold;">
                                            FACTUUR
                                        </h1>
                                        <p style="margin: 0; color: #666666; font-size: 14px;">
                                            ${invoiceNumber}
                                        </p>
                                    </td>
                                    <td style="width: 50%; vertical-align: top; text-align: right;">
                                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 12px 20px; border-radius: 6px; display: inline-block;">
                                            <p style="margin: 0; font-size: 18px; font-weight: bold;">
                                                ✓ BETAALD
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Company and Customer Info -->
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="width: 50%; vertical-align: top; padding-right: 20px;">
                                        <h3 style="margin: 0 0 10px; color: #333333; font-size: 14px; font-weight: bold; text-transform: uppercase;">
                                            Van
                                        </h3>
                                        <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
                                            <strong>CSG Online Specialist</strong><br>
                                            De Gouwe 42D<br>
                                            8253 PA Dronten<br>
                                            <br>
                                            KvK: 92868401<br>
                                            BTW: NL004983001B44<br>
                                            <br>
                                            📧 team@huurly.nl<br>
                                            🌐 huurly.nl
                                        </p>
                                    </td>
                                    <td style="width: 50%; vertical-align: top; padding-left: 20px;">
                                        <h3 style="margin: 0 0 10px; color: #333333; font-size: 14px; font-weight: bold; text-transform: uppercase;">
                                            Voor
                                        </h3>
                                        <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
                                            <strong>${customerName}</strong><br>
                                            ${email}
                                        </p>
                                        <div style="margin-top: 20px; padding: 12px; background-color: #f8f9fa; border-radius: 4px;">
                                            <p style="margin: 0 0 5px; color: #666666; font-size: 12px;">
                                                <strong>Factuurdatum:</strong> ${invoiceDate}
                                            </p>
                                            <p style="margin: 0; color: #666666; font-size: 12px;">
                                                <strong>Transactie ID:</strong> ${transactionId}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Invoice Items -->
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">
                                <!-- Table Header -->
                                <tr style="background-color: #f8f9fa;">
                                    <th style="padding: 12px; text-align: left; color: #666666; font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #e0e0e0;">
                                        Omschrijving
                                    </th>
                                    <th style="padding: 12px; text-align: right; color: #666666; font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #e0e0e0; width: 120px;">
                                        Bedrag
                                    </th>
                                </tr>
                                <!-- Service Line -->
                                <tr>
                                    <td style="padding: 16px 12px; color: #333333; font-size: 14px; border-bottom: 1px solid #e0e0e0;">
                                        ${serviceDescription}
                                    </td>
                                    <td style="padding: 16px 12px; text-align: right; color: #333333; font-size: 14px; border-bottom: 1px solid #e0e0e0;">
                                        ${formatCurrency(amountExclBTW)}
                                    </td>
                                </tr>
                                <!-- Subtotal -->
                                <tr>
                                    <td style="padding: 12px; color: #666666; font-size: 14px; text-align: right;">
                                        <strong>Subtotaal (excl. BTW):</strong>
                                    </td>
                                    <td style="padding: 12px; text-align: right; color: #666666; font-size: 14px;">
                                        ${formatCurrency(amountExclBTW)}
                                    </td>
                                </tr>
                                <!-- BTW -->
                                <tr>
                                    <td style="padding: 12px; color: #666666; font-size: 14px; text-align: right; border-bottom: 2px solid #333333;">
                                        <strong>BTW 21%:</strong>
                                    </td>
                                    <td style="padding: 12px; text-align: right; color: #666666; font-size: 14px; border-bottom: 2px solid #333333;">
                                        ${formatCurrency(btwAmount)}
                                    </td>
                                </tr>
                                <!-- Total -->
                                <tr style="background-color: #f8f9fa;">
                                    <td style="padding: 16px 12px; color: #333333; font-size: 16px; text-align: right;">
                                        <strong>Totaal (incl. BTW):</strong>
                                    </td>
                                    <td style="padding: 16px 12px; text-align: right; color: #333333; font-size: 18px;">
                                        <strong>${formatCurrency(totalAmount)}</strong>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Payment Status -->
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px 20px; border-radius: 4px;">
                                <p style="margin: 0; color: #2e7d32; font-size: 14px; font-weight: bold;">
                                    ✓ Deze factuur is volledig betaald op ${invoiceDate}
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 15px; color: #666666; font-size: 13px; line-height: 1.6;">
                                <strong>Belangrijke informatie:</strong>
                            </p>
                            <ul style="margin: 0 0 15px; padding-left: 20px; color: #666666; font-size: 13px; line-height: 1.6;">
                                <li>Dit is een automatisch gegenereerde factuur</li>
                                <li>Let op: Dit is geen bezoekadres</li>
                                <li>Bewaar deze factuur voor je administratie</li>
                            </ul>
                            
                            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                            
                            <p style="margin: 0 0 10px; color: #666666; font-size: 13px;">
                                Vragen over deze factuur?<br>
                                Neem contact op via <a href="mailto:team@huurly.nl" style="color: #667eea; text-decoration: none;">team@huurly.nl</a>
                            </p>
                            
                            <p style="margin: 15px 0 0; color: #999999; font-size: 11px;">
                                © ${now.getFullYear()} Huurly - CSG Online Specialist<br>
                                Deze factuur is digitaal aangemaakt en daarom geldig zonder handtekening.
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

    // Send invoice email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Huurly Facturatie <${fromEmail}>`,
        to: [email],
        subject: `Factuur ${invoiceNumber} - Huurly`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      return new Response(
        JSON.stringify({ error: `Failed to send invoice: ${errorText}` }),
        { headers, status: emailResponse.status }
      );
    }

    const result = await emailResponse.json();
    console.log('Invoice email sent successfully:', { 
      email, 
      invoiceNumber,
      amount: totalAmount,
      messageId: result.id 
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        invoiceNumber,
        messageId: result.id 
      }),
      { headers, status: 200 }
    );

  } catch (err) {
    console.error('Send invoice email error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to send invoice' }),
      { headers, status: 500 }
    );
  }
});
