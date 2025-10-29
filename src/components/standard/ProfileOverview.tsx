import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ProfileField {
  label: string;
  value: string | number | undefined;
  isHidden?: boolean;
}

export interface ProfileSection {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  fields: ProfileField[];
}

interface ProfileOverviewProps {
  sections: ProfileSection[];
  title: string;
  onEdit: () => void;
  isCreating?: boolean;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({ sections, title, onEdit, isCreating = false }) => {
  if (isCreating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Profiel is nog niet aangemaakt.</p>
          <Button onClick={onEdit} className="mt-4">Profiel Aanmaken</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
        <Button
          variant="outline"
          onClick={onEdit}
          className="min-h-[44px] px-4 text-sm sm:text-base"
        >
          Bewerken
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 sm:space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold flex items-center text-base sm:text-lg">
              <section.icon className={`mr-3 h-5 w-5 sm:h-6 sm:w-6 ${section.iconColor}`} />
              {section.title}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
              {section.fields.map((field) => {
                if (field.isHidden) return null;
                const displayValue = (field.value !== null && field.value !== undefined && field.value !== '') ? field.value : 'N.v.t.';
                if (typeof displayValue === 'object') {
                  return null;
                }
                return (
                  <div key={field.label} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <p className="break-words">
                      <strong className="text-gray-700">{field.label}:</strong>{' '}
                      <span className="break-all text-gray-900">
                        {displayValue}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ProfileOverview;
