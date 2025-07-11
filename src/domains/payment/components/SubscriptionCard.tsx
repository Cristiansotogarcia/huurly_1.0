import React from 'react';

// Placeholder interfaces until proper types are created
interface SubscriptionCardData {
  id: string;
  plan_name: string;
  plan_type: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  current_period_start: string;
  current_period_end: string;
  next_billing_date?: string;
  amount: number;
  currency: string;
  billing_interval: 'monthly' | 'yearly';
  features: string[];
  usage?: {
    properties_listed: number;
    max_properties: number;
    applications_received: number;
    max_applications: number;
  };
  auto_renew: boolean;
}

interface SubscriptionCardProps {
  subscription: SubscriptionCardData;
  onUpgrade?: () => void;
  onDowngrade?: () => void;
  onCancel?: () => void;
  onReactivate?: () => void;
  onManageBilling?: () => void;
  showUsage?: boolean;
}

/**
 * Subscription card component for displaying subscription information
 */
export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onUpgrade,
  onDowngrade,
  onCancel,
  onReactivate,
  onManageBilling,
  showUsage = true
}) => {
  const {
    plan_name,
    plan_type,
    status,
    current_period_start,
    current_period_end,
    next_billing_date,
    amount,
    currency,
    billing_interval,
    features,
    usage,
    auto_renew
  } = subscription;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: SubscriptionCardData['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: SubscriptionCardData['status']) => {
    switch (status) {
      case 'active': return 'Actief';
      case 'cancelled': return 'Geannuleerd';
      case 'expired': return 'Verlopen';
      case 'pending': return 'In behandeling';
      default: return 'Onbekend';
    }
  };

  const getPlanColor = (plan_type: SubscriptionCardData['plan_type']) => {
    switch (plan_type) {
      case 'basic': return 'bg-blue-500';
      case 'premium': return 'bg-purple-500';
      case 'enterprise': return 'bg-gold-500';
      default: return 'bg-gray-500';
    }
  };

  const getPlanIcon = (plan_type: SubscriptionCardData['plan_type']) => {
    switch (plan_type) {
      case 'basic':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'premium':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'enterprise':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getUsagePercentage = (used: number, max: number) => {
    return Math.min((used / max) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const isNearExpiry = () => {
    const endDate = new Date(current_period_end);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className={`${getPlanColor(plan_type)} px-6 py-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              {getPlanIcon(plan_type)}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{plan_name}</h3>
              <p className="text-sm opacity-90">
                {formatCurrency(amount, currency)}/{billing_interval === 'monthly' ? 'maand' : 'jaar'}
              </p>
            </div>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
            getStatusColor(status)
          } bg-white`}>
            {getStatusText(status)}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Billing Information */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Factuurinformatie</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Huidige periode:</span>
              <p className="font-medium">
                {new Date(current_period_start).toLocaleDateString('nl-NL')} - {' '}
                {new Date(current_period_end).toLocaleDateString('nl-NL')}
              </p>
            </div>
            {next_billing_date && status === 'active' && (
              <div>
                <span className="text-gray-600">Volgende factuur:</span>
                <p className="font-medium">
                  {new Date(next_billing_date).toLocaleDateString('nl-NL')}
                </p>
                {isNearExpiry() && (
                  <p className="text-xs text-orange-600 mt-1">
                    Vernieuwt binnenkort
                  </p>
                )}
              </div>
            )}
            <div>
              <span className="text-gray-600">Automatische verlenging:</span>
              <p className="font-medium">
                {auto_renew ? 'Ingeschakeld' : 'Uitgeschakeld'}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Factureringsinterval:</span>
              <p className="font-medium">
                {billing_interval === 'monthly' ? 'Maandelijks' : 'Jaarlijks'}
              </p>
            </div>
          </div>
        </div>

        {/* Usage Information */}
        {showUsage && usage && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Gebruik</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Woningen geplaatst</span>
                  <span className="text-sm font-medium">
                    {usage.properties_listed} / {usage.max_properties}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      getUsageColor(getUsagePercentage(usage.properties_listed, usage.max_properties))
                    }`}
                    style={{
                      width: `${getUsagePercentage(usage.properties_listed, usage.max_properties)}%`
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Aanvragen ontvangen</span>
                  <span className="text-sm font-medium">
                    {usage.applications_received} / {usage.max_applications}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      getUsageColor(getUsagePercentage(usage.applications_received, usage.max_applications))
                    }`}
                    style={{
                      width: `${getUsagePercentage(usage.applications_received, usage.max_applications)}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Inbegrepen functies</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {status === 'active' && (
            <>
              {onUpgrade && plan_type !== 'enterprise' && (
                <button
                  onClick={onUpgrade}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Upgraden
                </button>
              )}
              
              {onDowngrade && plan_type !== 'basic' && (
                <button
                  onClick={onDowngrade}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Downgraden
                </button>
              )}
              
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Annuleren
                </button>
              )}
            </>
          )}
          
          {(status === 'cancelled' || status === 'expired') && onReactivate && (
            <button
              onClick={onReactivate}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Heractiveren
            </button>
          )}
          
          {onManageBilling && (
            <button
              onClick={onManageBilling}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Facturering beheren
            </button>
          )}
        </div>

        {/* Warnings */}
        {status === 'cancelled' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Abonnement geannuleerd
                </p>
                <p className="text-sm text-yellow-700">
                  Je abonnement blijft actief tot {new Date(current_period_end).toLocaleDateString('nl-NL')}.
                </p>
              </div>
            </div>
          </div>
        )}

        {isNearExpiry() && status === 'active' && !auto_renew && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Abonnement verloopt binnenkort
                </p>
                <p className="text-sm text-orange-700">
                  Je abonnement verloopt op {new Date(current_period_end).toLocaleDateString('nl-NL')}. 
                  Schakel automatische verlenging in om onderbreking te voorkomen.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCard;