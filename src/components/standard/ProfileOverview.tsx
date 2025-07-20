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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button variant="outline" onClick={onEdit}>Bewerken</Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h3 className="font-semibold flex items-center">
              <section.icon className={`mr-2 h-5 w-5 ${section.iconColor}`} /> {section.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {section.fields.map((field) => {
                if (field.isHidden) return null;
                const displayValue = (field.value !== null && field.value !== undefined && field.value !== '') ? field.value : 'N.v.t.';
                if (typeof displayValue === 'object') {
                  return null;
                }
                return <p key={field.label}><strong>{field.label}:</strong> {displayValue}</p>;
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ProfileOverview;