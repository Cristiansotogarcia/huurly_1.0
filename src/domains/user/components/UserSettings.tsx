import React, { useState } from 'react';
import { UserSettingsData as UserSettingsType } from '../types/User';

interface UserSettingsProps {
  settings: UserSettingsType;
  onSave: (settings: UserSettingsType) => void;
  isLoading?: boolean;
}

/**
 * User settings component for managing user preferences
 */
export const UserSettings: React.FC<UserSettingsProps> = ({
  settings,
  onSave,
  isLoading = false
}) => {
  const [localSettings, setLocalSettings] = useState<UserSettingsType>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key: keyof UserSettingsType, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleNestedSettingChange = (section: keyof UserSettingsType, key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any || {}),
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(localSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Instellingen</h2>
        {hasChanges && (
          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isLoading}
            >
              Annuleren
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Notification Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notificaties</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">E-mail notificaties</label>
                <p className="text-sm text-gray-500">Ontvang updates via e-mail</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.notifications.email_enabled}
                onChange={(e) => handleNestedSettingChange('notifications', 'email_enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Push notificaties</label>
                <p className="text-sm text-gray-500">Ontvang push notificaties in de browser</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.notifications.push_enabled}
                onChange={(e) => handleNestedSettingChange('notifications', 'push_enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">SMS notificaties</label>
                <p className="text-sm text-gray-500">Ontvang belangrijke updates via SMS</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.notifications.sms_enabled}
                onChange={(e) => handleNestedSettingChange('notifications', 'sms_enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Marketing e-mails</label>
                <p className="text-sm text-gray-500">Ontvang nieuws en aanbiedingen</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.notifications.marketing_enabled}
                onChange={(e) => handleNestedSettingChange('notifications', 'marketing_enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Profiel zichtbaar</label>
                <p className="text-sm text-gray-500">Maak je profiel zichtbaar voor andere gebruikers</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.privacy.profile_visible}
                onChange={(e) => handleNestedSettingChange('privacy', 'profile_visible', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Contactgegevens tonen</label>
                <p className="text-sm text-gray-500">Toon je contactgegevens aan verhuurders</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.privacy.show_contact_info}
                onChange={(e) => handleNestedSettingChange('privacy', 'show_contact_info', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Activiteit delen</label>
                <p className="text-sm text-gray-500">Deel je activiteit met andere gebruikers</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.privacy.share_activity}
                onChange={(e) => handleNestedSettingChange('privacy', 'share_activity', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weergave</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Taal</label>
              <select
                value={localSettings.display.language}
                onChange={(e) => handleNestedSettingChange('display', 'language', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="nl">Nederlands</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="fr">Français</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thema</label>
              <select
                value={localSettings.display.theme}
                onChange={(e) => handleNestedSettingChange('display', 'theme', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="light">Licht</option>
                <option value="dark">Donker</option>
                <option value="system">Systeem</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tijdzone</label>
              <select
                value={localSettings.display.timezone}
                onChange={(e) => handleNestedSettingChange('display', 'timezone', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="Europe/Amsterdam">Amsterdam (CET)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="America/New_York">New York (EST)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Twee-factor authenticatie</label>
                <p className="text-sm text-gray-500">Extra beveiliging voor je account</p>
              </div>
              <input
                type="checkbox"
                checked={localSettings.security.two_factor_enabled}
                onChange={(e) => handleNestedSettingChange('security', 'two_factor_enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Sessie timeout</label>
                <p className="text-sm text-gray-500">Automatisch uitloggen na inactiviteit</p>
              </div>
              <select
                value={localSettings.security.session_timeout}
                onChange={(e) => handleNestedSettingChange('security', 'session_timeout', parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value={30}>30 minuten</option>
                <option value={60}>1 uur</option>
                <option value={240}>4 uur</option>
                <option value={480}>8 uur</option>
                <option value={1440}>24 uur</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;