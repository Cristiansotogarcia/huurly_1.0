
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Calendar } from 'lucide-react';

const EnhancedDatePicker = ({ 
  selected, 
  onSelect, 
  placeholder = "Selecteer datum",
  disabled
}: {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
}) => {
  return (
    <Input
      type="date"
      value={selected ? selected.toISOString().split('T')[0] : ''}
      onChange={(e) => {
        const date = e.target.value ? new Date(e.target.value) : undefined;
        onSelect(date);
      }}
      placeholder={placeholder}
    />
  );
};

interface Step5TimingProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  handleDateSelect: (field: 'date_of_birth' | 'move_in_date_preferred' | 'move_in_date_earliest', date: Date | undefined) => void;
}

export default function Step5Timing({ formData, handleInputChange, handleDateSelect }: Step5TimingProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold">Timing & Beschikbaarheid</h2>
        </div>
        <p className="text-gray-600">Wanneer wil je verhuizen?</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="move_in_date_preferred">Gewenste inhuurdatum</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <EnhancedDatePicker
              selected={formData.move_in_date_preferred}
              onSelect={(date) => handleDateSelect('move_in_date_preferred', date)}
              placeholder="Gewenste datum"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="move_in_date_earliest">Vroegst mogelijke datum</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <EnhancedDatePicker
              selected={formData.move_in_date_earliest}
              onSelect={(date) => handleDateSelect('move_in_date_earliest', date)}
              placeholder="Vroegste datum"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="availability_flexible"
            checked={formData.availability_flexible}
            onCheckedChange={(checked) => handleInputChange('availability_flexible', checked)}
          />
          <Label htmlFor="availability_flexible">Ik ben flexibel met de datum</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lease_duration_preference">Gewenste huurperiode</Label>
        <Select value={formData.lease_duration_preference} onValueChange={(value) => handleInputChange('lease_duration_preference', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecteer voorkeur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6_maanden">6 maanden</SelectItem>
            <SelectItem value="1_jaar">1 jaar</SelectItem>
            <SelectItem value="2_jaar">2 jaar</SelectItem>
            <SelectItem value="langer">Langer dan 2 jaar</SelectItem>
            <SelectItem value="flexibel">Flexibel</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
