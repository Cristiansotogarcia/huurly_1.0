import React from 'react';

// Placeholder interfaces until proper types are created
interface Application {
  id: string;
  property_title: string;
  property_location: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  submitted_at: string;
  move_in_date: string;
  monthly_rent: number;
}

interface ApplicationListProps {
  applications: Application[];
  onViewDetails?: (applicationId: string) => void;
  onWithdraw?: (applicationId: string) => void;
  isLoading?: boolean;
}

const getStatusColor = (status: Application['status']) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'approved': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'withdrawn': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: Application['status']) => {
  switch (status) {
    case 'pending': return 'In behandeling';
    case 'approved': return 'Goedgekeurd';
    case 'rejected': return 'Afgewezen';
    case 'withdrawn': return 'Ingetrokken';
    default: return 'Onbekend';
  }
};

/**
 * Application list component for displaying user's rental applications
 */
export const ApplicationList: React.FC<ApplicationListProps> = ({
  applications,
  onViewDetails,
  onWithdraw,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Geen aanvragen</h3>
        <p className="mt-1 text-sm text-gray-500">Je hebt nog geen huurverzoeken ingediend.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <div key={application.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
                  {application.property_title}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium self-start ${
                  getStatusColor(application.status)
                }`}>
                  {getStatusText(application.status)}
                </span>
              </div>
              
              <div className="flex items-center text-gray-600 mb-2">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">{application.property_location}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Huurprijs:</span>
                  <span className="ml-1">€{application.monthly_rent.toLocaleString()}/maand</span>
                </div>
                <div>
                  <span className="font-medium">Ingediend:</span>
                  <span className="ml-1">
                    {new Date(application.submitted_at).toLocaleDateString('nl-NL')}
                  </span>
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <span className="font-medium">Gewenste datum:</span>
                  <span className="ml-1">
                    {new Date(application.move_in_date).toLocaleDateString('nl-NL')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4 pt-4 border-t">
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(application.id)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Details
              </button>
            )}
            {onWithdraw && application.status === 'pending' && (
              <button
                onClick={() => onWithdraw(application.id)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Intrekken
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApplicationList;