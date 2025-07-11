import React, { useState } from 'react';

// Placeholder interfaces until proper types are created
interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'ideal';
  name: string;
  last_four?: string;
  expiry?: string;
  is_default: boolean;
}

interface PaymentFormProps {
  amount: number;
  description: string;
  paymentMethods?: PaymentMethod[];
  onSubmit: (paymentData: {
    amount: number;
    payment_method_id: string;
    description: string;
  }) => void;
  onAddPaymentMethod?: () => void;
  isLoading?: boolean;
}

/**
 * Payment form component for processing payments
 */
export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  description,
  paymentMethods = [],
  onSubmit,
  onAddPaymentMethod,
  isLoading = false
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(
    paymentMethods.find(pm => pm.is_default)?.id || paymentMethods[0]?.id || ''
  );
  const [showNewPaymentForm, setShowNewPaymentForm] = useState(false);
  const [newPaymentData, setNewPaymentData] = useState({
    card_number: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    cardholder_name: ''
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPaymentMethod && !showNewPaymentForm) {
      return;
    }

    onSubmit({
      amount,
      payment_method_id: selectedPaymentMethod,
      description
    });
  };

  const getPaymentMethodIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'card':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'bank':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'ideal':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit}>
        {/* Payment Summary */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Betaling</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Beschrijving:</span>
              <span className="font-medium">{description}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Bedrag:</span>
              <span className="text-xl font-bold text-gray-900">{formatCurrency(amount)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Betaalmethode</h3>
          
          {paymentMethods.length > 0 && (
            <div className="space-y-3 mb-4">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPaymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={method.id}
                    checked={selectedPaymentMethod === method.id}
                    onChange={(e) => {
                      setSelectedPaymentMethod(e.target.value);
                      setShowNewPaymentForm(false);
                    }}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="text-gray-600">
                      {getPaymentMethodIcon(method.type)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{method.name}</div>
                      {method.last_four && (
                        <div className="text-sm text-gray-600">
                          •••• •••• •••• {method.last_four}
                          {method.expiry && ` • ${method.expiry}`}
                        </div>
                      )}
                      {method.is_default && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Standaard
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`w-4 h-4 border-2 rounded-full ${
                    selectedPaymentMethod === method.id
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedPaymentMethod === method.id && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Add New Payment Method */}
          <button
            type="button"
            onClick={() => {
              setShowNewPaymentForm(!showNewPaymentForm);
              setSelectedPaymentMethod('');
            }}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Nieuwe betaalmethode toevoegen</span>
            </div>
          </button>
        </div>

        {/* New Payment Method Form */}
        {showNewPaymentForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 mb-4">Nieuwe creditcard</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kaartnummer
                </label>
                <input
                  type="text"
                  value={newPaymentData.card_number}
                  onChange={(e) => setNewPaymentData(prev => ({ ...prev, card_number: e.target.value }))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={19}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Naam op kaart
                </label>
                <input
                  type="text"
                  value={newPaymentData.cardholder_name}
                  onChange={(e) => setNewPaymentData(prev => ({ ...prev, cardholder_name: e.target.value }))}
                  placeholder="Jan Jansen"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vervaldatum
                </label>
                <div className="flex space-x-2">
                  <select
                    value={newPaymentData.expiry_month}
                    onChange={(e) => setNewPaymentData(prev => ({ ...prev, expiry_month: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Maand</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month.toString().padStart(2, '0')}>
                        {month.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newPaymentData.expiry_year}
                    onChange={(e) => setNewPaymentData(prev => ({ ...prev, expiry_year: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Jaar</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  value={newPaymentData.cvv}
                  onChange={(e) => setNewPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                  placeholder="123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (!selectedPaymentMethod && !showNewPaymentForm)}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? 'Bezig met betalen...' : `Betaal ${formatCurrency(amount)}`}
        </button>

        {/* Security Notice */}
        <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Uw betaling wordt veilig verwerkt</span>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;