/**
 * Meta Conversions API Helper
 * 
 * Sends server-side conversion events to Meta (Facebook) for improved tracking accuracy.
 * Works alongside the Meta Pixel for event deduplication.
 * 
 * Documentation: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

/**
 * SHA256 hash function for user data
 * Meta requires sensitive customer information to be hashed before sending
 */
async function sha256Hash(data: string): Promise<string> {
  if (!data) return '';
  
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * User data interface for Meta Conversions API
 */
interface MetaUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

/**
 * Event data interface
 */
interface MetaConversionEvent {
  eventName: string;
  eventTime: number;
  eventId: string;
  eventSourceUrl: string;
  actionSource: 'website' | 'email' | 'app' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';
  userData: MetaUserData;
  customData?: {
    currency?: string;
    value?: number;
    contentName?: string;
    contentType?: string;
    [key: string]: any;
  };
}

/**
 * Send a conversion event to Meta's Conversions API
 * 
 * @param event - The event data to send
 * @param pixelId - Meta Pixel ID (from environment)
 * @param accessToken - Meta Access Token (from environment)
 * @returns Success status and any error information
 */
export async function sendMetaConversionEvent(
  event: MetaConversionEvent,
  pixelId?: string,
  accessToken?: string
): Promise<{ success: boolean; error?: string; response?: any }> {
  try {
    // Get credentials from environment
    const metaPixelId = pixelId || Deno.env.get('META_PIXEL_ID');
    const metaAccessToken = accessToken || Deno.env.get('META_ACCESS_TOKEN');

    // Validate credentials
    if (!metaPixelId || !metaAccessToken) {
      console.warn('⚠️ Meta Conversions API: Missing credentials (META_PIXEL_ID or META_ACCESS_TOKEN)');
      return {
        success: false,
        error: 'Missing Meta API credentials'
      };
    }

    console.log('📤 Preparing Meta Conversions API event:', {
      eventName: event.eventName,
      eventId: event.eventId,
      pixelId: metaPixelId
    });

    // Hash sensitive user data
    const hashedUserData: any = {};
    
    if (event.userData.email) {
      hashedUserData.em = [await sha256Hash(event.userData.email)];
    }
    
    if (event.userData.firstName) {
      hashedUserData.fn = [await sha256Hash(event.userData.firstName)];
    }
    
    if (event.userData.lastName) {
      hashedUserData.ln = [await sha256Hash(event.userData.lastName)];
    }
    
    if (event.userData.phone) {
      hashedUserData.ph = [await sha256Hash(event.userData.phone)];
    }
    
    if (event.userData.city) {
      hashedUserData.ct = [await sha256Hash(event.userData.city)];
    }
    
    if (event.userData.state) {
      hashedUserData.st = [await sha256Hash(event.userData.state)];
    }
    
    if (event.userData.zip) {
      hashedUserData.zp = [await sha256Hash(event.userData.zip)];
    }
    
    if (event.userData.country) {
      hashedUserData.country = [await sha256Hash(event.userData.country)];
    }

    // Construct the API payload according to Meta's specs
    const payload = {
      data: [{
        event_name: event.eventName,
        event_time: event.eventTime,
        event_id: event.eventId, // Critical for deduplication with Pixel
        event_source_url: event.eventSourceUrl,
        action_source: event.actionSource,
        user_data: hashedUserData,
        ...(event.customData && { custom_data: event.customData })
      }]
    };

    console.log('📤 Sending event to Meta Conversions API:', {
      eventName: event.eventName,
      eventId: event.eventId,
      hasUserData: Object.keys(hashedUserData).length > 0,
      hasCustomData: !!event.customData
    });

    // Send to Meta's Graph API
    const apiUrl = `https://graph.facebook.com/v18.0/${metaPixelId}/events?access_token=${metaAccessToken}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('❌ Meta Conversions API error:', {
        status: response.status,
        statusText: response.statusText,
        response: responseData
      });
      
      return {
        success: false,
        error: `API returned ${response.status}: ${responseData.error?.message || 'Unknown error'}`,
        response: responseData
      };
    }

    // Check for warnings or errors in the response
    if (responseData.events_received === 0) {
      console.warn('⚠️ Meta Conversions API: No events were processed', responseData);
      return {
        success: false,
        error: 'No events were processed',
        response: responseData
      };
    }

    console.log('✅ Meta Conversions API: Event sent successfully', {
      eventsReceived: responseData.events_received,
      eventId: event.eventId,
      warnings: responseData.messages || []
    });

    return {
      success: true,
      response: responseData
    };

  } catch (error: any) {
    console.error('❌ Meta Conversions API: Unexpected error', {
      error: error.message,
      stack: error.stack
    });
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Helper function to send a Purchase event
 * This is the most important event for conversion tracking
 */
export async function sendPurchaseEvent(params: {
  eventId: string;
  email: string;
  name?: string;
  amount: number;
  currency: string;
  transactionId: string;
  sourceUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  // Parse name into first and last name if provided
  const nameParts = params.name?.split(' ') || [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return await sendMetaConversionEvent({
    eventName: 'Purchase',
    eventTime: Math.floor(Date.now() / 1000), // Current Unix timestamp
    eventId: params.eventId,
    eventSourceUrl: params.sourceUrl || 'https://huurly.nl',
    actionSource: 'website',
    userData: {
      email: params.email,
      firstName: firstName,
      lastName: lastName,
      country: 'nl' // Default to Netherlands
    },
    customData: {
      currency: params.currency.toUpperCase(),
      value: params.amount / 100, // Convert from cents to dollars/euros
      content_name: 'Huurly Subscription',
      content_type: 'product'
    }
  });
}

/**
 * Helper function to send an InitiateCheckout event
 * Sent when user starts the checkout process
 */
export async function sendInitiateCheckoutEvent(params: {
  eventId: string;
  email: string;
  name?: string;
  amount: number;
  currency: string;
  sourceUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  const nameParts = params.name?.split(' ') || [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return await sendMetaConversionEvent({
    eventName: 'InitiateCheckout',
    eventTime: Math.floor(Date.now() / 1000),
    eventId: params.eventId,
    eventSourceUrl: params.sourceUrl || 'https://huurly.nl',
    actionSource: 'website',
    userData: {
      email: params.email,
      firstName: firstName,
      lastName: lastName,
      country: 'nl'
    },
    customData: {
      currency: params.currency.toUpperCase(),
      value: params.amount / 100,
      content_name: 'Huurly Subscription',
      content_type: 'product'
    }
  });
}
