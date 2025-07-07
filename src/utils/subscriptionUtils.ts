import { supabase } from '../integrations/supabase/client';

/**
 * Utility functions for subscription management
 * These can be used for debugging and manual fixes
 */

/**
 * Manually update a subscription status
 * USE WITH CAUTION - Only for debugging/fixing stuck subscriptions
 */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  newStatus: 'actief' | 'gepauzeerd' | 'geannuleerd' | 'verlopen' | 'wachtend'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('abonnementen')
      .update({ status: newStatus, bijgewerkt_op: new Date().toISOString() })
      .eq('id', subscriptionId)
      .select();

    if (error) {
      console.error('Failed to update subscription status:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Successfully updated subscription status:', data);
    return { success: true };
  } catch (error) {
    console.error('Error updating subscription status:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get all subscriptions for a user (for debugging)
 */
export async function getAllUserSubscriptions(userId: string) {
  try {
    const { data, error } = await supabase
      .from('abonnementen')
      .select('*')
      .eq('huurder_id', userId)
      .order('aangemaakt_op', { ascending: false });

    if (error) {
      console.error('Failed to fetch user subscriptions:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error', 
      data: null 
    };
  }
}

/**
 * Find and fix stuck 'wachtend' subscriptions
 * This function can be called manually to fix payment issues
 */
export async function fixStuckSubscriptions(userId: string): Promise<{
  success: boolean;
  fixed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let fixed = 0;

  try {
    // Get all 'wachtend' subscriptions for the user
    const { data: pendingSubscriptions, error } = await supabase
      .from('abonnementen')
      .select('*')
      .eq('huurder_id', userId)
      .eq('status', 'wachtend')
      .order('aangemaakt_op', { ascending: false });

    if (error) {
      errors.push(`Failed to fetch pending subscriptions: ${error.message}`);
      return { success: false, fixed: 0, errors };
    }

    if (!pendingSubscriptions || pendingSubscriptions.length === 0) {
      console.log('No pending subscriptions found for user:', userId);
      return { success: true, fixed: 0, errors: [] };
    }

    console.log(`Found ${pendingSubscriptions.length} pending subscription(s) for user:`, userId);

    // For each pending subscription, check if it should be activated
    for (const subscription of pendingSubscriptions) {
      if (subscription.stripe_subscription_id) {
        // Check if this subscription was created more than 5 minutes ago
        // (reasonable time for webhook to have processed)
        const createdAt = new Date(subscription.aangemaakt_op);
        const now = new Date();
        const minutesOld = (now.getTime() - createdAt.getTime()) / (1000 * 60);

        if (minutesOld > 5) {
          console.log(`⚠️ Subscription ${subscription.id} is ${minutesOld.toFixed(1)} minutes old and still pending`);
          console.log('🔧 Consider manually activating this subscription if payment was successful');
          
          // You could uncomment the following lines to automatically activate old pending subscriptions
          // WARNING: Only do this if you're sure the payment was successful!
          /*
          const updateResult = await updateSubscriptionStatus(subscription.id, 'actief');
          if (updateResult.success) {
            fixed++;
            console.log('✅ Automatically activated subscription:', subscription.id);
          } else {
            errors.push(`Failed to activate subscription ${subscription.id}: ${updateResult.error}`);
          }
          */
        }
      }
    }

    return { success: true, fixed, errors };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error');
    return { success: false, fixed, errors };
  }
}

// Export for console debugging
if (typeof window !== 'undefined') {
  (window as any).subscriptionUtils = {
    updateSubscriptionStatus,
    getAllUserSubscriptions,
    fixStuckSubscriptions
  };
}