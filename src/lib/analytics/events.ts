/**
 * Analytics Event Tracking
 * Tracks events in both Google Analytics 4 and Meta Pixel
 */

// TypeScript declarations for global analytics functions
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

/**
 * Track user sign up event
 */
export const trackSignUp = (role: 'huurder' | 'verhuurder') => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'sign_up', {
      method: 'email',
      user_role: role,
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'CompleteRegistration', {
      content_name: role,
      status: 'completed',
    });
  }

  console.log('Analytics: Sign up tracked', { role });
};

/**
 * Track profile completion
 */
export const trackProfileComplete = (userId: string, role: string) => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'profile_complete', {
      user_id: userId,
      user_role: role,
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: 'Profile Complete',
      content_category: role,
    });
  }

  console.log('Analytics: Profile complete tracked', { userId, role });
};

/**
 * Track payment initiation (when user starts checkout)
 */
export const trackPaymentInitiated = (amount: number, currency = 'EUR') => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: currency,
      value: amount,
      items: [{
        item_id: 'huurly_subscription',
        item_name: 'Huurly Jaarabonnement',
        price: amount,
        quantity: 1,
      }],
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value: amount,
      currency: currency,
      content_name: 'Huurly Subscription',
    });
  }

  console.log('Analytics: Payment initiated tracked', { amount, currency });
};

/**
 * Track successful payment
 */
export const trackPaymentComplete = (
  transactionId: string,
  amount: number,
  currency = 'EUR'
) => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: amount,
      currency: currency,
      items: [{
        item_id: 'huurly_subscription',
        item_name: 'Huurly Jaarabonnement',
        price: amount,
        quantity: 1,
      }],
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      value: amount,
      currency: currency,
      content_name: 'Huurly Subscription',
      content_ids: [transactionId],
    });
  }

  console.log('Analytics: Payment complete tracked', { transactionId, amount, currency });
};

/**
 * Track property view (for verhuurders viewing tenant profiles or huurders viewing properties)
 */
export const trackPropertyView = (
  propertyId: string,
  propertyType: 'tenant_profile' | 'property_listing'
) => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'view_item', {
      item_id: propertyId,
      content_type: propertyType,
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: [propertyId],
      content_type: propertyType,
    });
  }

  console.log('Analytics: Property view tracked', { propertyId, propertyType });
};

/**
 * Track search action
 */
export const trackSearch = (searchTerm: string, searchType: 'properties' | 'tenants') => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm,
      search_type: searchType,
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'Search', {
      search_string: searchTerm,
      content_category: searchType,
    });
  }

  console.log('Analytics: Search tracked', { searchTerm, searchType });
};

/**
 * Track match made (when verhuurder favorites a tenant or vice versa)
 */
export const trackMatch = (matchType: 'favorite' | 'application') => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'generate_lead', {
      lead_type: matchType,
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: matchType,
    });
  }

  console.log('Analytics: Match tracked', { matchType });
};

/**
 * Track message sent
 */
export const trackMessageSent = (recipientType: 'verhuurder' | 'huurder') => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'message_sent', {
      recipient_type: recipientType,
    });
  }

  // Meta Pixel - using Contact event
  if (window.fbq) {
    window.fbq('track', 'Contact', {
      content_name: 'Message',
      content_category: recipientType,
    });
  }

  console.log('Analytics: Message sent tracked', { recipientType });
};

/**
 * Track custom event (for flexibility)
 */
export const trackCustomEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', eventName, parameters);
  }

  // Meta Pixel - track as custom event
  if (window.fbq) {
    window.fbq('trackCustom', eventName, parameters);
  }

  console.log('Analytics: Custom event tracked', { eventName, parameters });
};
