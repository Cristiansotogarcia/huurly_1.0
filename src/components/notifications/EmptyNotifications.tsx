
import { Bell } from 'lucide-react';

export const EmptyNotifications = () => {
  return (
    <div className="p-6 text-center">
      <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 font-medium">Geen notificaties</p>
      <p className="text-sm text-gray-500 mt-1">Je hebt momenteel geen nieuwe notificaties</p>
    </div>
  );
};
