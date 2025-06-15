import React from "react";
import { Heart } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

const Step8ProfileMotivation: React.FC<Props> = ({ formData, handleInputChange }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 mb-4">
      <Heart className="h-5 w-5 text-blue-600" />
      <h3 className="text-lg font-semibold">Profiel & Motivatie</h3>
    </div>
    <div>
      <Label htmlFor="bio">Beschrijf jezelf (bio)</Label>
      <Textarea id="bio" value={formData.bio} onChange={e => handleInputChange("bio", e.target.value)} placeholder="Vertel iets over jezelf, je hobbies, levensstijl..." rows={4} />
    </div>
    <div>
      <Label htmlFor="motivation">Motivatie</Label>
      <Textarea id="motivation" value={formData.motivation} onChange={e => handleInputChange("motivation", e.target.value)} placeholder="Waarom ben je de ideale huurder? Wat maakt je bijzonder?" rows={4} />
    </div>
  </div>
);

export default Step8ProfileMotivation;
