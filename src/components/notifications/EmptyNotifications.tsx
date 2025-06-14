
import { Bell } from 'lucide-react';

export const EmptyNotifications = () => {
  return (
    <div className="text-center py-8 text-gray-500">
      <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p className="text-sm">Geen notificaties</p>
      <p className="text-xs text-gray-400 mt-1">
        Je ontvangt hier updates over je activiteiten
      </p>
    </div>
  );
};
