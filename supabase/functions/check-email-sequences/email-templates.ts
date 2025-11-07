// Email templates for Huurly email sequences
// All templates are in Dutch and focused on "being findable" for landlords

// ============================================================================
// BASE EMAIL TEMPLATE
// ============================================================================
function generateBaseTemplate(
  title: string,
  content: string,
  actionUrl: string,
  buttonText: string,
  footerNote: string,
  unsubscribeUrl: string
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
                            
                            ${actionUrl ? `
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${actionUrl}" 
                                   style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                    ${buttonText}
                                </a>
                            </div>
                            ` : ''}
                            
                            ${footerNote ? `
                            <p style="margin: 20px 0; color: #666666; font-size: 14px; text-align: center;">
                                ${footerNote}
                            </p>
                            ` : ''}
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
                                © ${new Date().getFullYear()} Huurly - CSG Online Specialist<br>
                                <a href="${unsubscribeUrl}" style="color: #999999; text-decoration: underline;">Afmelden van herinneringen</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `
}

// ============================================================================
// SEQUENCE A: UNVERIFIED EMAIL TEMPLATES
// ============================================================================

export function generateUnverifiedEmailTemplate(
  firstName: string,
  emailNumber: number,
  siteUrl: string,
  userId: string
): { subject: string; html: string } {
  const unsubscribeUrl = `${siteUrl}/unsubscribe?user=${userId}&type=reminders`
  
  if (emailNumber === 1) {
    // Day 2 - Friendly reminder
    return {
      subject: `${firstName}, vergeet je account niet te bevestigen 📧`,
      html: generateBaseTemplate(
        'Account Bevestigen',
        `
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          Hoi ${firstName},
        </p>
        
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          Je hebt je 2 dagen geleden geregistreerd bij Huurly, maar je account is nog niet bevestigd.
        </p>
        
        <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
          Bevestig snel je e-mailadres zodat je verder kunt met het activeren van je account en vindbaar wordt voor verhuurders!
        </p>
        
        <div style="background-color: #f0f4ff; border-left: 4px solid #667eea; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
          <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
            <strong>💡 Wist je dat:</strong> Bij Huurly hoef jij niet eindeloos te zoeken naar een woning. Verhuurders zoeken jou! 
            Maar alleen bevestigde accounts kunnen worden geactiveerd.
          </p>
        </div>
        `,
        `${siteUrl}/auth/confirm`,
        'Bevestig Mijn Account',
        'Deze link is geldig tot je account automatisch wordt verwijderd.',
        unsubscribeUrl
      )
    }
  } else if (emailNumber === 2) {
    // Day 5 - More urgent
    return {
      subject: `Laatste kans - Je Huurly account verloopt binnenkort ⚠️`,
      html: generateBaseTemplate(
        'Laatste Kans',
        `
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          Hoi ${firstName},
        </p>
        
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          Je account staat op het punt om te verlopen. <strong>Over 3 dagen</strong> wordt je account automatisch verwijderd als je je e-mailadres niet bevestigt.
        </p>
        
        <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
          Het zou zonde zijn als je deze kans misloopt om vindbaar te worden voor verhuurders!
        </p>
        
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
          <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
            <strong>⏰ Nog 3 dagen:</strong> Bevestig nu je account, anders verliezen we je gegevens!
          </p>
        </div>
        `,
        `${siteUrl}/auth/confirm`,
        'Nu Bevestigen',
        'Duurt maar 1 minuut!',
        unsubscribeUrl
      )
    }
  } else {
    // Day 7 - Final warning
    return {
      subject: `LAATSTE WAARSCHUWING: Account wordt binnen 24 uur verwijderd 🚨`,
      html: generateBaseTemplate(
        'Finale Waarschuwing',
        `
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          Hoi ${firstName},
        </p>
        
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          Dit is je <strong>laatste kans</strong>. Je Huurly account wordt <strong>morgen automatisch verwijderd</strong> als je je e-mailadres niet bevestigt.
        </p>
        
        <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
          Alle informatie die je hebt ingevuld gaat dan verloren en je zult opnieuw moeten beginnen.
        </p>
        
        <div style="background-color: #ffe5e5; border-left: 4px solid #dc3545; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
          <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
            <strong>🚨 24 uur:</strong> Dit is je laatste kans om je account te behouden!
          </p>
        </div>
        `,
        `${siteUrl}/auth/confirm`,
        'JA, Bevestig Mijn Account',
        'Anders wordt je account morgen permanent verwijderd.',
        unsubscribeUrl
      )
    }
  }
}

// ============================================================================
// SEQUENCE B: UNPAID (VERIFIED BUT NOT PAID) TEMPLATES
// ============================================================================

export function generateUnpaidEmailTemplate(
  firstName: string,
  role: string,
  emailNumber: number,
  siteUrl: string
): { subject: string; html: string } {
  const unsubscribeUrl = `${siteUrl}/unsubscribe?type=reminders`
  const activationUrl = `${siteUrl}/payment-onboarding`
  
  if (emailNumber === 1) {
    // Day 1 - Welcome to the next step
    return {
      subject: `Welkom ${firstName}! Nu je account activeren 🏡`,
      html: generateBaseTemplate(
        'Account Activeren',
        `
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          Hoi ${firstName},
        </p>
        
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          Super dat je je e-mailadres hebt bevestigd! Je bent nu één stap verwijderd van vindbaar zijn voor verhuurders.
        </p>
        
        <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
          Om je account te activeren en vindbaar te worden, is er een <strong>eenmalige betaling van €35</strong> nodig.
        </p>
        
        <h3 style="margin: 30px 0 15px; color: #333333; font-size: 18px; font-weight: bold;">
          Waarom Huurly anders is 🎯
        </h3>
        
        <ul style="margin: 0 0 30px; padding-left: 20px; color: #333333; font-size: 16px; line-height: 1.8;">
          <li style="margin-bottom: 10px;">Verhuurders zoeken actief naar huurders zoals jij</li>
          <li style="margin-bottom: 10px;">Geen eindeloos zoeken meer naar woningen</li>
          <li style="margin-bottom: 10px;">Het huis vindt jou - niet andersom</li>
          <li style="margin-bottom: 10px;">Eenmalige betaling, geen abonnement</li>
        </ul>
        
        <div style="background-color: #f0f4ff; border-left: 4px solid #667eea; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
          <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
            <strong>💰 Eenmalige betaling:</strong> €35 voor levenslange toegang. Geen verborgen kosten, geen abonnementen.
          </p>
        </div>
        `,
        activationUrl,
        'Account Activeren (€35)',
        'Word vandaag nog vindbaar voor verhuurders',
        unsubscribeUrl
      )
    }
  } else if (emailNumber === 2) {
    // Day 3 - Benefits focus
    return {
      subject: `${firstName}, verhuurders zoeken nu jouw profiel! ✨`,
      html: generateBaseTemplate(
        'Verhuurders Zijn Actief',
        `
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          Hoi ${firstName},
        </p>
        
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          Wist je dat er <strong>op dit moment verhuurders</strong> op Huurly aan het zoeken zijn naar huurders in jouw regio?
        </p>
        
        <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
          Helaas kunnen ze jou <strong>nog niet vinden</strong> omdat je account nog niet geactiveerd is.
        </p>
        
        <h3 style="margin: 30px 0 15px; color: #333333; font-size: 18px; font-weight: bold;">
          Wat gebeurt er na activatie? 🚀
        </h3>
        
        <ul style="margin: 0 0 30px; padding-left: 20px; color: #333333; font-size: 16px; line-height: 1.8;">
          <li style="margin-bottom: 10px;">Je profiel wordt zichtbaar voor verhuurders</li>
          <li style="margin-bottom: 10px;">Verhuurders kunnen je direct benaderen</li>
          <li style="margin-bottom: 10px;">Je ontvangt matches van geïnteresseerde verhuurders</li>
          <li style="margin-bottom: 10px;">Geen gedoe met eindeloos reageren op advertenties</li>
        </ul>
        
        <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
          <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
            <strong>✅ Succesverhaal:</strong> "Binnen 1 week na activatie had ik 5 reacties van verhuurders. Nu woon ik in mijn droomappartement!" - Lisa, Amsterdam
          </p>
        </div>
        `,
        activationUrl,
        'Nu Activeren (€35)',
        'Eenmalige betaling, levenslange toegang',
        unsubscribeUrl
      )
    }
  } else if (emailNumber === 3) {
    // Day 7 - Your spot is reserved
    return {
      subject: `Je plek staat nog voor je klaar, ${firstName} 💼`,
      html: generateBaseTemplate(
        'Je Plek Wacht',
        `
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          Hoi ${firstName},
        </p>
        
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          Een week geleden bevestigde je je e-mailadres. Je plek op Huurly staat nog steeds voor je klaar!
        </p>
        
        <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
          Maar... <strong>verhuurders kunnen je nog steeds niet vinden</strong>.  Activeer je account om vindbaar te worden.
        </p>
        
       <div style="background-color: #fff9e6; border-left: 4px solid #ffb74d; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
          <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
            <strong>🏠 Het huis vindt jou:</strong> Dit is het unieke concept van Huurly. Maar het werkt alleen als verhuurders je profiel kunnen zien. Activeer nu voor €35 (eenmalig).
          </p>
        </div>
        
        <h3 style="margin: 30px 0 15px; color: #333333; font-size: 18px; font-weight: bold;">
          Waarom wachten nog langer?
        </h3>
        
        <ul style="margin: 0 0 30px; padding-left: 20px; color: #333333; font-size: 16px; line-height: 1.8;">
          <li style="margin-bottom: 10px;">Elke dag dat je wacht, mis je kansen</li>
          <li style="margin-bottom: 10px;">Verhuurders zoeken actief naar huurders <strong>nu</strong></li>
          <li style="margin-bottom: 10px;">Slechts €35 voor levenslange toegang</li>
          <li style="margin-bottom: 10px;">Geen abonnement, gewoon één keer betalen</li>
        </ul>
        `,
        activationUrl,
        'Activeer Mijn Account (€35)',
        'Je bent al zo dichtbij!',
        unsubscribeUrl
      )
    }
  } else {
    // Day 14 - Last call
    return {
      subject: `Laatste oproep: Laat verhuurders jou vinden, ${firstName} ⏰`,
      html: generateBaseTemplate(
        'Laatste Oproep',
        `
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          Hoi ${firstName},
        </p>
        
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          Het is nu 2 weken geleden dat je je registreerde bij Huurly. In die tijd hebben verhuurders tientallen matches gemaakt met <strong>geactiveerde</strong> huurders.
        </p>
        
        <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
          Helaas heb jij al die kansen gemist omdat je account nog niet geactiveerd is. 😔
        </p>
        
        <h3 style="margin: 30px 0 15px; color: #333333; font-size: 18px; font-weight: bold;">
          Dit is wat je mist:
        </h3>
        
        <ul style="margin: 0 0 30px; padding-left: 20px; color: #333333; font-size: 16px; line-height: 1.8;">
          <li style="margin-bottom: 10px;">❌ Verhuurders kunnen je profiel niet zien</li>
          <li style="margin-bottom: 10px;">❌ Je ontvangt geen matches</li>
          <li style="margin-bottom: 10px;">❌ Andere huurders worden wel benaderd</li>
          <li style="margin-bottom: 10px;">❌ Je mist dagelijks nieuwe kansen</li>
        </ul>
        
        <div style="background-color: #ffe5e5; border-left: 4px solid #f44336; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
          <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
            <strong>⏰ Laatste kans:</strong> Dit is de laatste herinnering. Na dit bericht wordt je account als "slapend" gemarkeerd. Activeer nu voor €35 en word vindbaar!
          </p>
        </div>
        
        <p style="margin: 30px 0 20px; color: #333333; font-size: 16px; line-height: 1.6; text-align: center;">
          <strong>De keuze is aan jou:</strong><br>
          Blijf onzichtbaar of word vindbaar voor verhuurders.
        </p>
        `,
        activationUrl,
        'JA, Ik Wil Vindbaar Zijn (€35)',
        'Eenmalige betaling, geen abonnement',
        unsubscribeUrl
      )
    }
  }
}

// ============================================================================
// SEQUENCE C: INCOMPLETE PROFILE TEMPLATES
// ============================================================================

export function generateIncompleteProfileEmailTemplate(
  firstName: string,
  role: string,
  emailNumber: number,
  siteUrl: string
): { subject: string; html: string } {
  const unsubscribeUrl = `${siteUrl}/unsubscribe?type=reminders`
  const profileUrl = role === 'huurder' ? `${siteUrl}/dashboard` : `${siteUrl}/dashboard`
  
  if (emailNumber === 1) {
    // Day 1 - Let's complete your profile
    return {
      subject: `Welkom ${firstName}! Maak je profiel vindbaar 🎯`,
      html: generateBaseTemplate(
        'Profiel Compleet Maken',
        `
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          Hoi ${firstName},
        </p>
        
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          Gefeliciteerd! Je account is nu geactiveerd. 🎉
        </p>
        
        <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
          Er is nog één belangrijke stap: <strong>maak je profiel compleet</strong>. Verhuurders kunnen alleen complete profielen zien!
        </p>
        
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
          <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
            <strong>⚠️ Let op:</strong> Incomplete profielen worden NIET getoond aan verhuurders. Je bent nu letterlijk onzichtbaar!
          </p>
        </div>
        
        <h3 style="margin: 30px 0 15px; color: #333333; font-size: 18px; font-weight: bold;">
          Waarom je profiel invullen? 📝
        </h3>
        
        <ul style="margin: 0 0 30px; padding-left: 20px; color: #333333; font-size: 16px; line-height: 1.8;">
          <li style="margin-bottom: 10px;">Complete profielen krijgen 3x meer reacties</li>
          <li style="margin-bottom: 10px;">Verhuurders zien alleen complete profielen</li>
          <li style="margin-bottom: 10px;">Duurt maar 10 minuten of minder</li>
          <li style="margin-bottom: 10px;">Direct vindbaar na invullen</li>
        </ul>
        
        <div style="background-color: #f0f4ff; border-left: 4px solid #667eea; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
          <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
            <strong>💡 Tip:</strong> Voeg een foto toe! Profielen met foto's worden 5x vaker bekeken door verhuurders.
          </p>
        </div>
        `,
        profileUrl,
        'Profiel Nu Afmaken',
        'Duurt maar 10 minuten!',
        unsubscribeUrl
      )
    }
  } else if (emailNumber === 2) {
    // Day 3 - You're halfway there
    return {
      subject: `Je bent al halverwege, ${firstName}! 📊`,
      html: generateBaseTemplate(
        'Bijna Klaar',
        `
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          Hoi ${firstName},
        </p>
        
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          Je hebt al een geweldig begin gemaakt met je Huurly profiel, maar verhuurders kunnen je <strong>nog steeds niet vinden</strong>. 😔
        </p>
        
        <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
          Dit komt omdat alleen <strong>100% complete profielen</strong> zichtbaar zijn voor verhuurders.
        </p>
        
        <h3 style="margin: 30px 0 15px; color: #333333; font-size: 18px; font-weight: bold;">
          Wat verhuurders willen zien: 👀
        </h3>
        
        <ul style="margin: 0 0 30px; padding-left: 20px; color: #333333; font-size: 16px; line-height: 1.8;">
          <li style="margin-bottom: 10px;">📸 Een betrouwbare profielfoto</li>
          <li style="margin-bottom: 10px;">💰 Inkomensgegevens (toont stabiliteit)</li>
          <li style="margin-bottom: 10px;">🏡 Duidelijke woningvoorkeuren</li>
          <li style="margin-bottom: 10px;">📄 Je documenten op orde</li>
        </ul>
        
        <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
          <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
            <strong>✅ Succesverhaal:</strong> "Binnen 2 dagen na het compleet maken van mijn profiel kreeg ik 3 reacties van verhuurders!" - Lisa, Amsterdam
          </p>
        </div>
        
        <p style="margin: 30px 0 20px; color: #333333; font-size: 16px; line-height: 1.6; text-align: center;">
          Nog een paar minuten werk en je bent vindbaar! 🚀
        </p>
        `,
        profileUrl,
        'Laatste Stappen Voltooien',
        'Verhuurders wachten op jou!',
        unsubscribeUrl
      )
    }
  } else if (emailNumber === 3) {
    // Day 7 - Maximize your visibility
    return {
      subject: `Maximaliseer je kansen, ${firstName}! 🚀`,
      html: generateBaseTemplate(
        'Word Volledig Vindbaar',
        `
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          Hoi ${firstName},
        </p>
        
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          Een week geleden activeerde je je Huurly account. Maar je profiel is <strong>nog steeds niet zichtbaar</strong> voor verhuurders. 😔
        </p>
        
        <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
          Waarom niet? Omdat je profiel nog niet compleet is. En incomplete profielen worden simpelweg niet getoond.
        </p>
        
        <h3 style="margin: 30px 0 15px; color: #333333; font-size: 18px; font-weight: bold;">
          Verschil tussen compleet en incompleet:
        </h3>
        
        <div style="display: flex; margin: 30px 0;">
          <div style="flex: 1; padding: 15px; background-color: #ffe5e5; border-radius: 4px; margin-right: 10px;">
            <p style="margin: 0 0 10px; color: #d32f2f; font-weight: bold;">❌ Incompleet profiel:</p>
            <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px;">
              <li>Wordt NIET getoond</li>
              <li>0 verhuurders zien je</li>
              <li>Geen matches mogelijk</li>
            </ul>
          </div>
          <div style="flex: 1; padding: 15px; background-color: #e8f5e9; border-radius: 4px;">
            <p style="margin: 0 0 10px; color: #388e3c; font-weight: bold;">✅ Compleet profiel:</p>
            <ul style="margin: 0; padding-left: 20px; color: #333333; font-size: 14px;">
              <li>Direct zichtbaar</li>
              <li>Gemiddeld 8 verhuurders/week</li>
              <li>Actieve matches</li>
            </ul>
          </div>
        </div>
        
        <div style="background-color: #ffebee; border-left: 4px solid #f44336; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
          <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
            <strong>⚠️ Je hebt betaald maar bent nog onzichtbaar:</strong> Het zou zonde zijn om je investering te verspillen. 
            Maak je profiel compleet en maximaliseer je kansen!
          </p>
        </div>
        `,
        profileUrl,
        'Profiel Compleet Maken',
        'Nog maar 10 minuten werk!',
        unsubscribeUrl
      )
    }
  } else {
    // Day 14 - Landlords are searching now!
    return {
      subject: `Verhuurders bekijken nu profielen! Word vindbaar, ${firstName} 👀`,
      html: generateBaseTemplate(
        'Verhuurders Zijn Actief',
        `
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          Hoi ${firstName},
        </p>
        
        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
          <strong>OP DIT MOMENT</strong> zijn verhuurders actief aan het zoeken in jouw gebied. 
          Maar ze kunnen jou niet vinden... 😢
        </p>
        
        <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
          Waarom niet? Je profiel is nog steeds niet compleet. En incomplete profielen worden simpelweg overgeslagen.
        </p>
        
        <h3 style="margin: 30px 0 15px; color: #333333; font-size: 18px; font-weight: bold;">
          Wat je nu mist: 💔
        </h3>
        
        <ul style="margin: 0 0 30px; padding-left: 20px; color: #333333; font-size: 16px; line-height: 1.8;">
          <li style="margin-bottom: 10px;">❌ Verhuurders kunnen je profiel niet zien</li>
          <li style="margin-bottom: 10px;">❌ Je wordt overgeslagen bij zoekopdrachten</li>
          <li style="margin-bottom: 10px;">❌ Andere huurders worden wel benaderd</li>
          <li style="margin-bottom: 10px;">❌ Je mist dagelijks nieuwe kansen</li>
        </ul>
        
        <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px 20px; margin: 30px 0; border-radius: 4px;">
          <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
            <strong>📊 Feiten:</strong> Complete profielen ontvangen gemiddeld 8 profielweergaves per week van verhuurders. 
            Incomplete profielen? 0 weergaves. Het verschil is zwart-wit.
          </p>
        </div>
        
        <p style="margin: 30px 0 20px; color: #333333; font-size: 16px; line-height: 1.6; font-weight: bold; text-align: center;">
          Het huis vindt jou - maar alleen als verhuurders je kunnen zien! 🏠
        </p>
        
        <p style="margin: 20px 0 30px; color: #333333; font-size: 16px; line-height: 1.6; text-align: center;">
          Maak je profiel vandaag nog compleet en laat de verhuurders jou vinden!
        </p>
        `,
        profileUrl,
        'Maak Profiel Zichtbaar',
        'Nog een paar minuten en je bent vindbaar!',
        unsubscribeUrl
      )
    }
  }
}
