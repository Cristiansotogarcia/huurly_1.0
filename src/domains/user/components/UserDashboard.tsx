import React from 'react';
import { User, UserStatistics } from '../types/User';

interface UserDashboardProps {
  user: User;
  statistics: UserStatistics;
  onNavigate?: (path: string) => void;
}

/**
 * User dashboard component showing overview and quick actions
 */
export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  statistics,
  onNavigate
}) => {
  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            {user.profile.avatar_url ? (
              <img
                src={user.profile.avatar_url}
                alt="Profielfoto"
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-medium text-blue-600">
                {user.profile.first_name.charAt(0)}{user.profile.last_name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welkom terug, {user.profile.first_name}!
            </h1>
            <p className="text-gray-600">
              Hier is een overzicht van je activiteiten
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Actieve Aanvragen</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.active_applications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Goedgekeurde Aanvragen</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.approved_applications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Favorieten</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.favorite_properties}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bekeken Woningen</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.viewed_properties}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Snelle Acties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => handleNavigation('/properties/search')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Zoek Woningen</p>
              <p className="text-sm text-gray-600">Vind je ideale woning</p>
            </div>
          </button>

          <button
            onClick={() => handleNavigation('/applications')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Mijn Aanvragen</p>
              <p className="text-sm text-gray-600">Bekijk je aanvragen</p>
            </div>
          </button>

          <button
            onClick={() => handleNavigation('/profile')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Profiel Bewerken</p>
              <p className="text-sm text-gray-600">Update je gegevens</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recente Activiteit</h2>
        {statistics.recent_activity && statistics.recent_activity.length > 0 ? (
          <div className="space-y-3">
            {statistics.recent_activity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.created_at).toLocaleDateString('nl-NL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Nog geen recente activiteit
          </p>
        )}
      </div>

      {/* Account Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
              user.verification.email_verified ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <svg className={`w-6 h-6 ${
                user.verification.email_verified ? 'text-green-600' : 'text-red-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">E-mail</p>
            <p className={`text-xs ${
              user.verification.email_verified ? 'text-green-600' : 'text-red-600'
            }`}>
              {user.verification.email_verified ? 'Geverifieerd' : 'Niet geverifieerd'}
            </p>
          </div>

          <div className="text-center">
            <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
              user.verification.phone_verified ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <svg className={`w-6 h-6 ${
                user.verification.phone_verified ? 'text-green-600' : 'text-red-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">Telefoon</p>
            <p className={`text-xs ${
              user.verification.phone_verified ? 'text-green-600' : 'text-red-600'
            }`}>
              {user.verification.phone_verified ? 'Geverifieerd' : 'Niet geverifieerd'}
            </p>
          </div>

          <div className="text-center">
            <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
              user.verification.identity_verified ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <svg className={`w-6 h-6 ${
                user.verification.identity_verified ? 'text-green-600' : 'text-red-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">Identiteit</p>
            <p className={`text-xs ${
              user.verification.identity_verified ? 'text-green-600' : 'text-red-600'
            }`}>
              {user.verification.identity_verified ? 'Geverifieerd' : 'Niet geverifieerd'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;