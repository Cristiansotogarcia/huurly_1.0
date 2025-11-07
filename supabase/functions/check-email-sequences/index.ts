// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'
import { 
  generateUnverifiedEmailTemplate, 
  generateUnpaidEmailTemplate, 
  generateIncompleteProfileEmailTemplate 
} from './email-templates.ts'

console.log('Email sequence checker function starting...')

// Email sequence timing configuration (in days)
const SEQUENCE_TIMING = {
  unverified: [2, 5, 7], // Day 2, 5, 7 after signup
  unpaid: [1, 3, 7, 14], // Day 1, 3, 7, 14 after verification
  incomplete_profile: [1, 3, 7, 14] // Day 1, 3, 7, 14 after payment
}

// Delete unverified accounts after 8 days
const DELETE_UNVERIFIED_AFTER_DAYS = 8

interface UserToEmail {
  user_id: string
  email: string
  email_confirmed_at: string | null
  created_at: string
  user_metadata: {
    first_name?: string
    last_name?: string
    role?: string
  }
  days_since_signup: number
  days_since_verification?: number
  days_since_payment?: number
  has_active_subscription: boolean
  profile_complete: boolean
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    const resendKey = Deno.env.get('RESEND_API_KEY') ?? ''
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'team@huurly.nl'
    const bccEmail = Deno.env.get('EMAIL_BCC_MONITORING') ?? 'team@huurly.nl'
    const siteUrl = Deno.env.get('SUPABASE_URL')?.replace('/v1', '') ?? 'https://huurly.nl'

    if (!resendKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    console.log('Starting email sequence check...')

    // ============================================================================
    // SEQUENCE A: Unverified Email Reminders
    // ============================================================================
    await processUnverifiedSequence(supabaseAdmin, resendKey, fromEmail, bccEmail, siteUrl)

    // ============================================================================
    // SEQUENCE B: Verified but Unpaid Reminders
    // ============================================================================
    await processUnpaidSequence(supabaseAdmin, resendKey, fromEmail, bccEmail, siteUrl)

    // ============================================================================
    // SEQUENCE C: Paid but Incomplete Profile Reminders
    // ============================================================================
    await processIncompleteProfileSequence(supabaseAdmin, resendKey, fromEmail, bccEmail, siteUrl)

    // ============================================================================
    // Delete unverified accounts after 8 days
    // ============================================================================
    await deleteExpiredUnverifiedAccounts(supabaseAdmin)

    return new Response(
      JSON.stringify({ success: true, message: 'Email sequences processed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error processing email sequences:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// ============================================================================
// SEQUENCE A: Process Unverified Users
// ============================================================================
async function processUnverifiedSequence(
  supabaseAdmin: any,
  resendKey: string,
  fromEmail: string,
  bccEmail: string,
  siteUrl: string
) {
  console.log('Processing unverified email sequence...')

  // Get users who haven't verified their email
  const { data: unverifiedUsers, error: queryError } = await supabaseAdmin
    .from('auth.users')
    .select('id, email, email_confirmed_at, created_at, raw_user_meta_data')
    .is('email_confirmed_at', null)
    .order('created_at', { ascending: false })

  if (queryError) {
    console.error('Error fetching unverified users:', queryError)
    return
  }

  console.log(`Found ${unverifiedUsers?.length || 0} unverified users`)

  for (const user of unverifiedUsers || []) {
    const daysSinceSignup = Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Determine which email to send based on days since signup
    let emailNumber = 0
    if (daysSinceSignup >= SEQUENCE_TIMING.unverified[2]) emailNumber = 3 // Day 7
    else if (daysSinceSignup >= SEQUENCE_TIMING.unverified[1]) emailNumber = 2 // Day 5
    else if (daysSinceSignup >= SEQUENCE_TIMING.unverified[0]) emailNumber = 1 // Day 2

    if (emailNumber > 0) {
      await sendSequenceEmail(
        supabaseAdmin,
        user,
        'unverified',
        emailNumber,
        resendKey,
        fromEmail,
        bccEmail,
        siteUrl
      )
    }
  }
}

// ============================================================================
// SEQUENCE B: Process Verified but Unpaid Users
// ============================================================================
async function processUnpaidSequence(
  supabaseAdmin: any,
  resendKey: string,
  fromEmail: string,
  bccEmail: string,
  siteUrl: string
) {
  console.log('Processing unpaid user sequence...')

  // Get users who verified email but don't have active subscription
  const { data: unpaidUsers, error } = await supabaseAdmin.rpc('get_unpaid_verified_users')

  if (error) {
    console.error('Error fetching unpaid users:', error)
    return
  }

  console.log(`Found ${unpaidUsers?.length || 0} unpaid but verified users`)

  for (const user of unpaidUsers || []) {
    const daysSinceVerification = Math.floor(
      (Date.now() - new Date(user.email_confirmed_at).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Determine which email to send
    let emailNumber = 0
    if (daysSinceVerification >= SEQUENCE_TIMING.unpaid[3]) emailNumber = 4 // Day 14
    else if (daysSinceVerification >= SEQUENCE_TIMING.unpaid[2]) emailNumber = 3 // Day 7
    else if (daysSinceVerification >= SEQUENCE_TIMING.unpaid[1]) emailNumber = 2 // Day 3
    else if (daysSinceVerification >= SEQUENCE_TIMING.unpaid[0]) emailNumber = 1 // Day 1

    if (emailNumber > 0) {
      await sendSequenceEmail(
        supabaseAdmin,
        user,
        'unpaid',
        emailNumber,
        resendKey,
        fromEmail,
        bccEmail,
        siteUrl
      )
    }
  }
}

// ============================================================================
// SEQUENCE C: Process Paid but Incomplete Profile Users
// ============================================================================
async function processIncompleteProfileSequence(
  supabaseAdmin: any,
  resendKey: string,
  fromEmail: string,
  bccEmail: string,
  siteUrl: string
) {
  console.log('Processing incomplete profile sequence...')

  // Get users with active subscription but incomplete profile
  const { data: incompleteUsers, error } = await supabaseAdmin.rpc('get_paid_incomplete_users')

  if (error) {
    console.error('Error fetching incomplete profile users:', error)
    return
  }

  console.log(`Found ${incompleteUsers?.length || 0} users with incomplete profiles`)

  for (const user of incompleteUsers || []) {
    // Get payment date from lifecycle events or abonnement table
    const { data: paymentEvent } = await supabaseAdmin
      .from('user_lifecycle_events')
      .select('created_at')
      .eq('user_id', user.id)
      .eq('event_type', 'payment_completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!paymentEvent) continue

    const daysSincePayment = Math.floor(
      (Date.now() - new Date(paymentEvent.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Determine which email to send
    let emailNumber = 0
    if (daysSincePayment >= SEQUENCE_TIMING.incomplete_profile[3]) emailNumber = 4 // Day 14
    else if (daysSincePayment >= SEQUENCE_TIMING.incomplete_profile[2]) emailNumber = 3 // Day 7
    else if (daysSincePayment >= SEQUENCE_TIMING.incomplete_profile[1]) emailNumber = 2 // Day 3
    else if (daysSincePayment >= SEQUENCE_TIMING.incomplete_profile[0]) emailNumber = 1 // Day 1

    if (emailNumber > 0) {
      await sendSequenceEmail(
        supabaseAdmin,
        user,
        'incomplete_profile',
        emailNumber,
        resendKey,
        fromEmail,
        bccEmail,
        siteUrl
      )
    }
  }
}

// ============================================================================
// Send Email Helper Function
// ============================================================================
async function sendSequenceEmail(
  supabaseAdmin: any,
  user: any,
  sequenceType: string,
  emailNumber: number,
  resendKey: string,
  fromEmail: string,
  bccEmail: string,
  siteUrl: string
) {
  // Check if user should receive this email
  const { data: shouldSend } = await supabaseAdmin.rpc('should_send_email', {
    p_user_id: user.id,
    p_sequence_type: sequenceType,
    p_email_number: emailNumber
  })

  if (!shouldSend) {
    console.log(`Skipping email for user ${user.email}: already sent or unsubscribed`)
    return
  }

  const firstName = user.raw_user_meta_data?.first_name || user.user_metadata?.first_name || 'daar'
  const role = user.raw_user_meta_data?.role || user.user_metadata?.role || 'huurder'

  // Generate email content based on sequence type
  let subject = ''
  let htmlContent = ''

  if (sequenceType === 'unverified') {
    const result = generateUnverifiedEmailTemplate(firstName, emailNumber, siteUrl, user.id)
    subject = result.subject
    htmlContent = result.html
  } else if (sequenceType === 'unpaid') {
    const result = generateUnpaidEmailTemplate(firstName, role, emailNumber, siteUrl)
    subject = result.subject
    htmlContent = result.html
  } else if (sequenceType === 'incomplete_profile') {
    const result = generateIncompleteProfileEmailTemplate(firstName, role, emailNumber, siteUrl)
    subject = result.subject
    htmlContent = result.html
  }

  // Send email via Resend
  try {
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Huurly <${fromEmail}>`,
        to: [user.email],
        bcc: [bccEmail], // BCC to team for monitoring
        subject,
        html: htmlContent,
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error(`Failed to send ${sequenceType} email #${emailNumber} to ${user.email}:`, errorText)
      
      // Log failed attempt
      await supabaseAdmin.from('email_sequence_log').insert({
        user_id: user.id,
        sequence_type: sequenceType,
        email_number: emailNumber,
        status: 'failed',
        error_message: errorText
      })
      return
    }

    const result = await emailResponse.json()
    console.log(`Sent ${sequenceType} email #${emailNumber} to ${user.email}`)

    // Log successful send
    await supabaseAdmin.from('email_sequence_log').insert({
      user_id: user.id,
      sequence_type: sequenceType,
      email_number: emailNumber,
      status: 'sent',
      resend_message_id: result.id
    })

  } catch (error) {
    console.error(`Error sending email to ${user.email}:`, error)
    
    // Log error
    await supabaseAdmin.from('email_sequence_log').insert({
      user_id: user.id,
      sequence_type: sequenceType,
      email_number: emailNumber,
      status: 'failed',
      error_message: error.message
    })
  }
}

// ============================================================================
// Delete Expired Unverified Accounts
// ============================================================================
async function deleteExpiredUnverifiedAccounts(supabaseAdmin: any) {
  console.log('Checking for expired unverified accounts to delete...')

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - DELETE_UNVERIFIED_AFTER_DAYS)

  const { data: expiredUsers, error } = await supabaseAdmin
    .from('auth.users')
    .select('id, email, created_at')
    .is('email_confirmed_at', null)
    .lt('created_at', cutoffDate.toISOString())

  if (error) {
    console.error('Error fetching expired users:', error)
    return
  }

  console.log(`Found ${expiredUsers?.length || 0} expired unverified accounts`)

  for (const user of expiredUsers || []) {
    try {
      // Delete user (cascade will handle related records)
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
      
      if (deleteError) {
        console.error(`Failed to delete user ${user.email}:`, deleteError)
      } else {
        console.log(`Deleted expired unverified account: ${user.email}`)
      }
    } catch (error) {
      console.error(`Error deleting user ${user.email}:`, error)
    }
  }
}
