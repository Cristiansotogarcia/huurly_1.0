
import { Bell, Check, FileText, Calendar, AlertTriangle, UserCheck } from 'lucide-react';

export const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'document_uploaded':
    case 'document_approved':
    case 'document_rejected':
      return <FileText className="w-4 h-4" />;
    case 'viewing_invitation':
      return <Calendar className="w-4 h-4" />;
    case 'property_application':
      return <UserCheck className="w-4 h-4" />;
    case 'system_announcement':
      return <AlertTriangle className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

export const getNotificationColor = (type: string) => {
  switch (type) {
    case 'document_approved':
      return 'text-green-600 bg-green-100';
    case 'document_rejected':
      return 'text-red-600 bg-red-100';
    case 'document_uploaded':
    case 'property_application':
      return 'text-blue-600 bg-blue-100';
    case 'viewing_invitation':
      return 'text-orange-600 bg-orange-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};
