import React, { useState } from 'react';

// Placeholder interfaces until proper types are created
interface Application {
  id: string;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
  property_title: string;
  property_location: string;
  monthly_rent: number;
  move_in_date: string;
  personal_message: string;
  monthly_income: number;
  employment_status: string;
  references: Array<{
    name: string;
    relationship: string;
    phone: string;
    email: string;
  }>;
  has_pets: boolean;
  pet_details?: string;
  is_smoker: boolean;
  additional_info?: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ApplicationReviewProps {
  application: Application;
  onApprove?: (applicationId: string, notes?: string) => void;
  onReject?: (applicationId: string, reason: string) => void;
  onRequestMoreInfo?: (applicationId: string, message: string) => void;
  isLandlord?: boolean;
  isLoading?: boolean;
}

/**
 * Application review component for landlords to review tenant applications
 */
export const ApplicationReview: React.FC<ApplicationReviewProps> = ({
  application,
  onApprove,
  onReject,
  onRequestMoreInfo,
  isLandlord = false,
  isLoading = false
}) => {
  const [showActions, setShowActions] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'info' | null>(null);
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  const handleAction = () => {
    if (actionType === 'approve' && onApprove) {
      onApprove(application.id, notes || undefined);
    } else if (actionType === 'reject' && onReject) {
      onReject(application.id, reason);
    } else if (actionType === 'info' && onRequestMoreInfo) {
      onRequestMoreInfo(application.id, message);
    }
    
    // Reset form
    setActionType(null);
    setNotes('');
    setReason('');
    setMessage('');
    setShowActions(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Huurverzoek van {application.tenant_name}
            </h2>
            <p className="text-sm text-gray-600">
              Ingediend op {new Date(application.submitted_at).toLocaleDateString('nl-NL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            application.status === 'approved' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {application.status === 'pending' ? 'In behandeling' :
             application.status === 'approved' ? 'Goedgekeurd' : 'Afgewezen'}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Property Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Woning</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900">{application.property_title}</p>
            <p className="text-gray-600">{application.property_location}</p>
            <p className="text-gray-600">Huurprijs: {formatCurrency(application.monthly_rent)}/maand</p>
            <p className="text-gray-600">
              Gewenste intrekdatum: {new Date(application.move_in_date).toLocaleDateString('nl-NL')}
            </p>
          </div>
        </div>

        {/* Tenant Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Huurder informatie</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Naam</label>
              <p className="text-gray-900">{application.tenant_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <p className="text-gray-900">{application.tenant_email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefoon</label>
              <p className="text-gray-900">{application.tenant_phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Maandinkomen</label>
              <p className="text-gray-900">{formatCurrency(application.monthly_income)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Werkstatus</label>
              <p className="text-gray-900">{application.employment_status}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Huisdieren</label>
              <p className="text-gray-900">
                {application.has_pets ? 'Ja' : 'Nee'}
                {application.pet_details && ` - ${application.pet_details}`}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Roker</label>
              <p className="text-gray-900">{application.is_smoker ? 'Ja' : 'Nee'}</p>
            </div>
          </div>
        </div>

        {/* Personal Message */}
        {application.personal_message && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Persoonlijk bericht</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">{application.personal_message}</p>
            </div>
          </div>
        )}

        {/* References */}
        {application.references && application.references.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Referenties</h3>
            <div className="space-y-3">
              {application.references.map((reference, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium">Naam:</span> {reference.name}
                    </div>
                    <div>
                      <span className="font-medium">Relatie:</span> {reference.relationship}
                    </div>
                    <div>
                      <span className="font-medium">Telefoon:</span> {reference.phone}
                    </div>
                    <div>
                      <span className="font-medium">E-mail:</span> {reference.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Information */}
        {application.additional_info && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Aanvullende informatie</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">{application.additional_info}</p>
            </div>
          </div>
        )}

        {/* Actions for Landlords */}
        {isLandlord && application.status === 'pending' && (
          <div className="border-t pt-6">
            {!showActions ? (
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setActionType('approve');
                    setShowActions(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={isLoading}
                >
                  Goedkeuren
                </button>
                <button
                  onClick={() => {
                    setActionType('reject');
                    setShowActions(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={isLoading}
                >
                  Afwijzen
                </button>
                <button
                  onClick={() => {
                    setActionType('info');
                    setShowActions(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  Meer info vragen
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {actionType === 'approve' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opmerkingen (optioneel)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Voeg eventuele opmerkingen toe..."
                    />
                  </div>
                )}

                {actionType === 'reject' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reden voor afwijzing *
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Geef een reden voor de afwijzing..."
                      required
                    />
                  </div>
                )}

                {actionType === 'info' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bericht *
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Welke aanvullende informatie heb je nodig?"
                      required
                    />
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={handleAction}
                    disabled={isLoading || 
                      (actionType === 'reject' && !reason.trim()) ||
                      (actionType === 'info' && !message.trim())
                    }
                    className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 ${
                      actionType === 'approve' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' :
                      actionType === 'reject' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' :
                      'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? 'Bezig...' : 
                     actionType === 'approve' ? 'Goedkeuren' :
                     actionType === 'reject' ? 'Afwijzen' : 'Versturen'
                    }
                  </button>
                  <button
                    onClick={() => {
                      setShowActions(false);
                      setActionType(null);
                      setNotes('');
                      setReason('');
                      setMessage('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    disabled={isLoading}
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationReview;