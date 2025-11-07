// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

console.log('Unsubscribe handler function starting...')

serve(async (req: Request) => {
  const url = new URL(req.url)
  
  // Handle GET request - show unsubscribe form
  if (req.method === 'GET') {
    const userId = url.searchParams.get('user')
    const type = url.searchParams.get('type') || 'reminders'
    
    if (!userId) {
      return new Response(generateErrorPage('Ongeldige link'), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        status: 400
      })
    }
    
    return new Response(generateUnsubscribePage(userId, type), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      status: 200
    })
  }
  
  // Handle POST request - process unsubscribe
  if (req.method === 'POST') {
    try {
      const formData = await req.formData()
      const userId = formData.get('user_id') as string
      const action = formData.get('action') as string
      const reason = formData.get('reason') as string
      
      if (!userId || !action) {
        return new Response(generateErrorPage('Ontbrekende gegevens'), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
          status: 400
        })
      }
      
      // Initialize Supabase Admin Client
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      
      if (action === 'unsubscribe') {
        // Unsubscribe from reminders
        const { error } = await supabaseAdmin
          .from('email_preferences')
          .upsert({
            user_id: userId,
            unsubscribed_from_reminders: true,
            unsubscribed_at: new Date().toISOString(),
            unsubscribe_reason: reason || 'Niet opgegeven'
          }, {
            onConflict: 'user_id'
          })
        
        if (error) {
          console.error('Error unsubscribing user:', error)
          return new Response(generateErrorPage('Er ging iets mis. Probeer het later opnieuw.'), {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
            status: 500
          })
        }
        
        return new Response(generateSuccessPage('unsubscribe'), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
          status: 200
        })
        
      } else if (action === 'delete') {
        // Delete account completely
        try {
          // Delete user (this will cascade to all related records)
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
          
          if (deleteError) {
            console.error('Error deleting user:', deleteError)
            return new Response(generateErrorPage('Account verwijderen mislukt. Neem contact op met support.'), {
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
              status: 500
            })
          }
          
          return new Response(generateSuccessPage('delete'), {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
            status: 200
          })
          
        } catch (error) {
          console.error('Error in delete process:', error)
          return new Response(generateErrorPage('Er ging iets mis. Neem contact op met team@huurly.nl'), {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
            status: 500
          })
        }
      }
      
      return new Response(generateErrorPage('Ongeldige actie'), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        status: 400
      })
      
    } catch (error) {
      console.error('Unsubscribe error:', error)
      return new Response(generateErrorPage('Er ging iets mis. Probeer het later opnieuw.'), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        status: 500
      })
    }
  }
  
  return new Response('Method not allowed', { status: 405 })
})

// ============================================================================
// HTML PAGE GENERATORS
// ============================================================================

function generateUnsubscribePage(userId: string, type: string): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Afmelden - Huurly</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 600px;
            width: 100%;
            padding: 40px;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .options {
            margin: 30px 0;
        }
        .option {
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .option:hover {
            border-color: #667eea;
            background-color: #f8f9ff;
        }
        .option input[type="radio"] {
            margin-right: 10px;
        }
        .option label {
            cursor: pointer;
            display: block;
            font-weight: 500;
            color: #333;
        }
        .option-desc {
            margin-top: 8px;
            color: #666;
            font-size: 14px;
        }
        .reason {
            margin: 20px 0;
        }
        .reason label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
        }
        .reason textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-family: inherit;
            font-size: 14px;
            resize: vertical;
            min-height: 80px;
        }
        .reason textarea:focus {
            outline: none;
            border-color: #667eea;
        }
        .buttons {
            display: flex;
            gap: 15px;
            margin-top: 30px;
        }
        button {
            flex: 1;
            padding: 14px 24px;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        .btn-secondary {
            background: #f5f5f5;
            color: #666;
        }
        .btn-secondary:hover {
            background: #e0e0e0;
        }
        .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .warning p {
            margin: 0;
            color: #856404;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            font-size: 14px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔕 Email Voorkeuren</h1>
        <p>We vinden het jammer dat je geen emails meer wilt ontvangen. Kies hieronder wat je wilt doen:</p>
        
        <form method="POST" id="unsubscribeForm">
            <input type="hidden" name="user_id" value="${userId}">
            
            <div class="options">
                <div class="option" onclick="selectOption('unsubscribe')">
                    <label>
                        <input type="radio" name="action" value="unsubscribe" id="opt_unsubscribe" required>
                        <strong>Stop met herinneringen, behoud account</strong>
                    </label>
                    <div class="option-desc">
                        Je ontvangt geen reminder emails meer, maar je account blijft actief. 
                        Je kunt nog steeds inloggen en gebruik maken van Huurly.
                    </div>
                </div>
                
                <div class="option" onclick="selectOption('delete')">
                    <label>
                        <input type="radio" name="action" value="delete" id="opt_delete" required>
                        <strong>Verwijder mijn account compleet</strong>
                    </label>
                    <div class="option-desc">
                        Je account en alle gegevens worden permanent verwijderd. 
                        Deze actie kan niet ongedaan worden gemaakt.
                    </div>
                </div>
            </div>
            
            <div class="reason">
                <label for="reason">Waarom meld je je af? (optioneel)</label>
                <textarea 
                    name="reason" 
                    id="reason" 
                    placeholder="Je feedback helpt ons om Huurly te verbeteren..."
                ></textarea>
            </div>
            
            <div class="warning" id="deleteWarning" style="display: none;">
                <p><strong>⚠️ Let op:</strong> Als je je account verwijdert, worden al je gegevens permanent gewist en kun je niet meer inloggen.</p>
            </div>
            
            <div class="buttons">
                <button type="button" class="btn-secondary" onclick="window.history.back()">
                    Annuleren
                </button>
                <button type="submit" class="btn-primary">
                    Bevestigen
                </button>
            </div>
        </form>
        
        <div class="footer">
            <p>Heb je vragen? Neem contact op via <a href="mailto:team@huurly.nl" style="color: #667eea;">team@huurly.nl</a></p>
        </div>
    </div>
    
    <script>
        function selectOption(type) {
            document.getElementById('opt_' + type).checked = true;
            
            // Show warning for delete option
            const warning = document.getElementById('deleteWarning');
            if (type === 'delete') {
                warning.style.display = 'block';
            } else {
                warning.style.display = 'none';
            }
        }
        
        // Show warning when delete is selected
        document.getElementById('opt_delete').addEventListener('change', function() {
            document.getElementById('deleteWarning').style.display = 'block';
        });
        
        document.getElementById('opt_unsubscribe').addEventListener('change', function() {
            document.getElementById('deleteWarning').style.display = 'none';
        });
        
        // Confirm before submitting delete
        document.getElementById('unsubscribeForm').addEventListener('submit', function(e) {
            const action = document.querySelector('input[name="action"]:checked').value;
            if (action === 'delete') {
                if (!confirm('Weet je zeker dat je je account wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.')) {
                    e.preventDefault();
                }
            }
        });
    </script>
</body>
</html>
  `
}

function generateSuccessPage(action: string): string {
  const title = action === 'delete' ? 'Account Verwijderd' : 'Afgemeld'
  const message = action === 'delete' 
    ? 'Je account is succesvol verwijderd. Al je gegevens zijn permanent gewist.'
    : 'Je bent afgemeld voor reminder emails. Je account blijft actief en je kunt nog steeds inloggen.'
  
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Huurly</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 500px;
            width: 100%;
            padding: 40px;
            text-align: center;
        }
        .icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        h1 {
            color: #333;
            margin-bottom: 15px;
            font-size: 28px;
        }
        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        a {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        a:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">✅</div>
        <h1>${title}</h1>
        <p>${message}</p>
        ${action !== 'delete' ? '<a href="https://huurly.nl">Terug naar Huurly</a>' : ''}
        <p style="margin-top: 30px; font-size: 14px; color: #999;">
            Bedankt voor je tijd bij Huurly.
        </p>
    </div>
</body>
</html>
  `
}

function generateErrorPage(message: string): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fout - Huurly</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 500px;
            width: 100%;
            padding: 40px;
            text-align: center;
        }
        .icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        h1 {
            color: #d32f2f;
            margin-bottom: 15px;
            font-size: 28px;
        }
        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">❌</div>
        <h1>Er ging iets mis</h1>
        <p>${message}</p>
        <p>Neem contact op met <a href="mailto:team@huurly.nl">team@huurly.nl</a> als het probleem blijft bestaan.</p>
    </div>
</body>
</html>
  `
}
