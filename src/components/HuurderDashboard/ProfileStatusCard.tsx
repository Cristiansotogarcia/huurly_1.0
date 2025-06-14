
import { Switch } from "@/components/ui/switch";
import { Loader2, User } from "lucide-react";

interface ProfileStatusCardProps {
  isLookingForPlace: boolean;
  isUpdatingStatus: boolean;
  onToggleLookingStatus: () => void;
}

export const ProfileStatusCard = ({
  isLookingForPlace,
  isUpdatingStatus,
  onToggleLookingStatus
}: ProfileStatusCardProps) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Profiel Status</h3>
            <p className="text-sm text-gray-600">Beheer de zichtbaarheid van je profiel</p>
          </div>
        </div>
        {isUpdatingStatus && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
      </div>
      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
        <Switch
          id="looking-status"
          checked={isLookingForPlace}
          onCheckedChange={onToggleLookingStatus}
          disabled={isUpdatingStatus}
        />
        <label htmlFor="looking-status" className="text-sm font-medium text-gray-700 cursor-pointer">
          {isLookingForPlace ? "Ik zoek actief een woning" : "Ik zoek momenteel geen woning"}
        </label>
      </div>
    </div>
  );
};
