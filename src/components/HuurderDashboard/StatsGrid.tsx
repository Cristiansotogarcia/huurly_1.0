
import { Eye, Calendar, FileText, CheckCircle } from "lucide-react";

interface StatsGridProps {
  stats: {
    profileViews: number;
    invitations: number;
    applications: number;
    acceptedApplications: number;
  };
  isLoadingStats: boolean;
}

export const StatsGrid = ({ stats, isLoadingStats }: StatsGridProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Profiel weergaven</p>
            <p className="text-2xl font-bold text-gray-900">{isLoadingStats ? '...' : stats.profileViews}</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Uitnodigingen</p>
            <p className="text-2xl font-bold text-gray-900">{isLoadingStats ? '...' : stats.invitations}</p>
          </div>
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Aanvragen</p>
            <p className="text-2xl font-bold text-gray-900">{isLoadingStats ? '...' : stats.applications}</p>
          </div>
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Geaccepteerd</p>
            <p className="text-2xl font-bold text-gray-900">{isLoadingStats ? '...' : stats.acceptedApplications}</p>
          </div>
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
