import React from 'react';
import { User } from '../types/User';

interface UserProfileProps {
  user: User;
  onEdit?: () => void;
  isEditable?: boolean;
}

/**
 * User profile component for displaying user information
 */
export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onEdit,
  isEditable = false
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Profiel</h2>
        {isEditable && onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Bewerken
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Avatar */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            {user.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt="Profielfoto"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-medium text-gray-600">
                {user.profile.first_name.charAt(0)}{user.profile.last_name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {user.profile.first_name} {user.profile.last_name}
            </h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Voornaam</label>
            <p className="mt-1 text-sm text-gray-900">{user.profile.first_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Achternaam</label>
            <p className="mt-1 text-sm text-gray-900">{user.profile.last_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
          </div>
          {user.profile.phone && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefoon</label>
              <p className="mt-1 text-sm text-gray-900">{user.profile.phone}</p>
            </div>
          )}
        </div>

        {/* Address */}
        {user.profile.address && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Adres</label>
            <p className="mt-1 text-sm text-gray-900">
              {user.profile.address.street} {user.profile.address.house_number}
              {user.profile.address.house_number_addition && ` ${user.profile.address.house_number_addition}`}
              <br />
              {user.profile.address.postal_code} {user.profile.address.city}
            </p>
          </div>
        )}

        {/* Bio */}
        {user.profile.bio && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <p className="mt-1 text-sm text-gray-900">{user.profile.bio}</p>
          </div>
        )}

        {/* Verification Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Verificatiestatus</label>
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user.verification.email_verified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              E-mail {user.verification.email_verified ? 'geverifieerd' : 'niet geverifieerd'}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user.verification.phone_verified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              Telefoon {user.verification.phone_verified ? 'geverifieerd' : 'niet geverifieerd'}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user.verification.identity_verified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              Identiteit {user.verification.identity_verified ? 'geverifieerd' : 'niet geverifieerd'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;