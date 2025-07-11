import React from 'react';

// Placeholder interfaces until proper types are created
interface PaymentStatusData {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  description: string;
  reference_number: string;
  created_at: string;
  updated_at: string;
  payment_method?: {
    type: 'card' | 'bank' | 'ideal';
    last_four?: string;
  };
  error_message?: string;
  estimated_completion?: string;
  next_steps?: string[];
}

interface PaymentStatusProps {
  paymentStatus: PaymentStatusData;
  onRetry?: (paymentId: string) => void;
  onCancel?: (paymentId: string) => void;
  onContactSupport?: () => void;
  showTimeline?: boolean;
}

/**
 * Payment status component for displaying detailed payment status information
 */
export const PaymentStatusComponent: React.FC<PaymentStatusProps> = ({
  paymentStatus,
  onRetry,
  onCancel,
  onContactSupport,
  showTimeline = true
}) => {
  const {
    amount,
    status,
    description,
    reference_number,
    created_at,
    updated_at,
    payment_method,
    error_message,
    estimated_completion,
    next_steps
  } = paymentStatus;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status: PaymentStatusData['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'refunded': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: PaymentStatusData['status']) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'processing':
        return (
          <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
          </svg>
        );
      case 'refunded':
        return (
          <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusText = (status: PaymentStatusData['status']) => {
    switch (status) {
      case 'completed': return 'Voltooid';
      case 'processing': return 'Wordt verwerkt';
      case 'pending': return 'In behandeling';
      case 'failed': return 'Mislukt';
      case 'cancelled': return 'Geannuleerd';
      case 'refunded': return 'Terugbetaald';
      default: return 'Onbekend';
    }
  };

  const getStatusDescription = (status: PaymentStatusData['status']) => {
    switch (status) {
      case 'completed':
        return 'Je betaling is succesvol verwerkt en voltooid.';
      case 'processing':
        return 'Je betaling wordt momenteel verwerkt. Dit kan enkele minuten duren.';
      case 'pending':
        return 'Je betaling is ontvangen en wacht op verwerking.';
      case 'failed':
        return 'Er is een probleem opgetreden bij het verwerken van je betaling.';
      case 'cancelled':
        return 'De betaling is geannuleerd.';
      case 'refunded':
        return 'Het bedrag is terugbetaald naar je oorspronkelijke betaalmethode.';
      default:
        return 'Status onbekend.';
    }
  };

  const getPaymentMethodText = (method?: PaymentStatusData['payment_method']) => {
    if (!method) return 'Onbekend';
    
    switch (method.type) {
      case 'card':
        return method.last_four ? `Creditcard •••• ${method.last_four}` : 'Creditcard';
      case 'bank':
        return 'Bankoverschrijving';
      case 'ideal':
        return 'iDEAL';
      default:
        return 'Onbekend';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Status Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-shrink-0">
          {getStatusIcon(status)}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-900">
            Betaling {getStatusText(status)}
          </h2>
          <p className="text-lg font-medium text-gray-700">
            {formatCurrency(amount)}
          </p>
        </div>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
          getStatusColor(status)
        }`}>
          {getStatusText(status)}
        </div>
      </div>

      {/* Status Description */}
      <div className="mb-6">
        <p className="text-gray-700">
          {getStatusDescription(status)}
        </p>
      </div>

      {/* Payment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Betalingsdetails</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Beschrijving:</span>
              <span className="font-medium">{description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Referentienummer:</span>
              <span className="font-medium font-mono">{reference_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Betaalmethode:</span>
              <span className="font-medium">{getPaymentMethodText(payment_method)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bedrag:</span>
              <span className="font-medium">{formatCurrency(amount)}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Tijdsinformatie</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Gestart:</span>
              <span className="font-medium">
                {new Date(created_at).toLocaleDateString('nl-NL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Laatst bijgewerkt:</span>
              <span className="font-medium">
                {new Date(updated_at).toLocaleDateString('nl-NL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            {estimated_completion && (
              <div className="flex justify-between">
                <span className="text-gray-600">Verwachte voltooiing:</span>
                <span className="font-medium">
                  {new Date(estimated_completion).toLocaleDateString('nl-NL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error_message && (
        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-red-800">Foutmelding</h4>
                <p className="text-sm text-red-700 mt-1">{error_message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Next Steps */}
      {next_steps && next_steps.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Volgende stappen</h3>
          <ul className="space-y-2">
            {next_steps.map((step, index) => (
              <li key={index} className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timeline */}
      {showTimeline && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tijdlijn</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Betaling gestart</p>
                <p className="text-sm text-gray-600">
                  {new Date(created_at).toLocaleDateString('nl-NL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {status !== 'pending' && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'completed' ? 'bg-green-500' :
                    status === 'processing' ? 'bg-blue-500' :
                    status === 'failed' ? 'bg-red-500' :
                    status === 'cancelled' ? 'bg-gray-500' :
                    status === 'refunded' ? 'bg-purple-500' : 'bg-gray-500'
                  }`}></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Status bijgewerkt naar: {getStatusText(status)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(updated_at).toLocaleDateString('nl-NL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {status === 'failed' && onRetry && (
          <button
            onClick={() => onRetry(paymentStatus.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Opnieuw proberen
          </button>
        )}
        
        {(status === 'pending' || status === 'processing') && onCancel && (
          <button
            onClick={() => onCancel(paymentStatus.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Annuleren
          </button>
        )}
        
        {onContactSupport && (
          <button
            onClick={onContactSupport}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Contact opnemen
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusComponent;