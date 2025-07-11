import React from 'react';

// Placeholder interfaces until proper types are created
interface ApplicationStatus {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  submitted_at: string;
  updated_at: string;
  notes?: string;
  next_steps?: string[];
}

interface ApplicationStatusProps {
  applicationStatus: ApplicationStatus;
  showTimeline?: boolean;
}

const getStatusIcon = (status: ApplicationStatus['status']) => {
  switch (status) {
    case 'pending':
      return (
        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'approved':
      return (
        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'rejected':
      return (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'withdrawn':
      return (
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
        </svg>
      );
    default:
      return null;
  }
};

const getStatusColor = (status: ApplicationStatus['status']) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'approved': return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
    case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusText = (status: ApplicationStatus['status']) => {
  switch (status) {
    case 'pending': return 'In behandeling';
    case 'approved': return 'Goedgekeurd';
    case 'rejected': return 'Afgewezen';
    case 'withdrawn': return 'Ingetrokken';
    default: return 'Onbekend';
  }
};

const getStatusDescription = (status: ApplicationStatus['status']) => {
  switch (status) {
    case 'pending': 
      return 'Je aanvraag wordt momenteel beoordeeld door de verhuurder. Je ontvangt bericht zodra er een beslissing is genomen.';
    case 'approved': 
      return 'Gefeliciteerd! Je aanvraag is goedgekeurd. De verhuurder zal binnenkort contact met je opnemen voor de volgende stappen.';
    case 'rejected': 
      return 'Helaas is je aanvraag niet goedgekeurd. Je kunt andere woningen bekijken en nieuwe aanvragen indienen.';
    case 'withdrawn': 
      return 'Je hebt deze aanvraag ingetrokken. Je kunt altijd een nieuwe aanvraag indienen voor andere woningen.';
    default: 
      return 'Status onbekend.';
  }
};

/**
 * Application status component for displaying detailed status information
 */
export const ApplicationStatus: React.FC<ApplicationStatusProps> = ({
  applicationStatus,
  showTimeline = true
}) => {
  const { status, submitted_at, updated_at, notes, next_steps } = applicationStatus;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Status Header */}
      <div className="flex items-center space-x-3 mb-6">
        {getStatusIcon(status)}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Status: {getStatusText(status)}
          </h2>
          <p className="text-sm text-gray-600">
            Laatst bijgewerkt: {new Date(updated_at).toLocaleDateString('nl-NL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mb-4 ${
        getStatusColor(status)
      }`}>
        {getStatusText(status)}
      </div>

      {/* Status Description */}
      <div className="mb-6">
        <p className="text-gray-700">
          {getStatusDescription(status)}
        </p>
      </div>

      {/* Notes */}
      {notes && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Opmerkingen</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700">{notes}</p>
          </div>
        </div>
      )}

      {/* Next Steps */}
      {next_steps && next_steps.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Volgende stappen</h3>
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
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tijdlijn</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Aanvraag ingediend</p>
                <p className="text-sm text-gray-600">
                  {new Date(submitted_at).toLocaleDateString('nl-NL', {
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
                    status === 'approved' ? 'bg-green-500' : 
                    status === 'rejected' ? 'bg-red-500' : 'bg-gray-500'
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
    </div>
  );
};

export default ApplicationStatus;