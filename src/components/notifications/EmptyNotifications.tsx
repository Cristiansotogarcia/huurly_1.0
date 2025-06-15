
import React from 'react';
import { Bell } from 'lucide-react';

export const EmptyNotifications: React.FC = () => {
  return (
    <div className="p-8 text-center">
      <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Geen notificaties
      </h3>
      <p className="text-gray-600 text-sm">
        Je hebt momenteel geen notificaties. We houden je op de hoogte van belangrijke updates.
      </p>
    </div>
  );
};
