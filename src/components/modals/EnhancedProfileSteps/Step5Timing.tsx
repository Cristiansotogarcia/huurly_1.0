import React from "react";
import { Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import EnhancedDatePicker from "../EnhancedDatePicker";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  handleDateSelect: (field: string, date: Date | undefined) => void;
}

const Step5Timing: React.FC<Props> = ({ formData, handleInputChange, handleDateSelect }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 mb-4">
      <Clock className="h-5 w-5 text-blue-600" />
      <h3 className="text-lg font-semibold">Timing & Beschikbaarheid</h3>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Gewenste intrekdatum</Label>
        <EnhancedDatePicker
          selected={formData.move_in_date_preferred}
          onSelect={(date) => handleDateSelect('move_in_date_preferred', date)}
          placeholder="Selecteer datum"
        />
      </div>
      
      <div>
        <Label>Vroegst mogelijke intrekdatum</Label>
        <EnhancedDatePicker
          selected={formData.move_in_date_earliest}
          onSelect={(date) => handleDateSelect('move_in_date_earliest', date)}
          placeholder="Selecteer datum"
        />
      </div>
    </div>

    <div className="flex items-center space-x-2">
      <Checkbox
        id="availability_flexible"
        checked={formData.availability_flexible}
        onCheckedChange={(checked) => handleInputChange('availability_flexible', checked)}
      />
      <Label htmlFor="availability_flexible">Ik ben flexibel met de intrekdatum</Label>
    </div>

    <div>
      <Label htmlFor="reason_for_moving">Reden voor verhuizing</Label>
      <Textarea
        id="reason_for_moving"
        value={formData.reason_for_moving}
        onChange={(e) => handleInputChange('reason_for_moving', e.target.value)}
        placeholder="Waarom zoek je een nieuwe woning?"
        rows={3}
      />
    </div>
  </div>
);

export default Step5Timing;
