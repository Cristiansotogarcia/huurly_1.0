
import { Bell, Check, FileText, Calendar, AlertTriangle, UserCheck } from 'lucide-react';
import React from 'react';

export const getNotificationIcon = (type: string): React.ReactElement => {
  switch (type) {
    case 'document_uploaded':
    case 'document_approved':
    case 'document_rejected':
      return React.createElement(FileText, { className: "w-4 h-4" });
    case 'viewing_invitation':
      return React.createElement(Calendar, { className: "w-4 h-4" });
    case 'property_application':
      return React.createElement(UserCheck, { className: "w-4 h-4" });
    case 'system_announcement':
      return React.createElement(AlertTriangle, { className: "w-4 h-4" });
    default:
      return React.createElement(Bell, { className: "w-4 h-4" });
  }
};

export const getNotificationColor = (type: string): string => {
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
