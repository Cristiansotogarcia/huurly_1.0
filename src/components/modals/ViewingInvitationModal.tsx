import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, User, Send, CheckCircle } from 'lucide-react';
import { BaseModal, BaseModalActions, useModalState, useModalForm } from './BaseModal';

interface ViewingInvitationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: any;
  property: any;
  onInvitationSent: (invitationData: any) => void;
}

interface InvitationData {
  date: string;
  time: string;
  message: string;
  duration: number;
  requirements: string;
}

const initialData: InvitationData = {
  date: '',
  time: '',
  message: '',
  duration: 30,
  requirements: '',
};

const validateForm = (data: InvitationData): boolean => {
  return !!(data.date && data.time);
};

const ViewingInvitationModal = ({ 
  open, 
  onOpenChange, 
  tenant, 
  property, 
  onInvitationSent 
}: ViewingInvitationModalProps) => {
  const { toast } = useToast();
  const { isSubmitting, setIsSubmitting } = useModalState();
  const { data: invitationData, updateField, resetForm, isValid } = useModalForm(initialData, validateForm);

  const handleSendInvitation = async () => {
    if (!invitationData.date || !invitationData.time) {
      toast({
        title: "Datum en tijd vereist",
        description: "Selecteer een datum en tijd voor de bezichtiging.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const invitation = {
        id: `invitation-${Date.now()}`,
        tenantId: tenant.id,
        propertyId: property.id,
        scheduledDate: `${invitationData.date}T${invitationData.time}:00Z`,
        message: invitationData.message,
        duration: invitationData.duration,
        requirements: invitationData.requirements,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      onInvitationSent(invitation);
      onOpenChange(false);
      
      toast({
        title: "Uitnodiging verzonden!",
        description: `${tenant.firstName} ${tenant.lastName} heeft een uitnodiging ontvangen voor ${invitationData.date} om ${invitationData.time}.`
      });

      // Reset form
      resetForm();
      
    } catch (error) {
      toast({
        title: "Fout bij verzenden",
        description: "Er is iets misgegaan bij het verzenden van de uitnodiging.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  if (!tenant || !property) {
    return null;
  }

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title="Bezichtiging Inplannen"
      icon={Calendar}
      size="2xl"
    >
      <div className="space-y-6">
          {/* Tenant & Property Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Huurder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <img 
                    src={tenant.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face'} 
                    alt={`${tenant.firstName} ${tenant.lastName}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{tenant.firstName} {tenant.lastName}</h4>
                    <p className="text-sm text-gray-600">{tenant.profession}</p>
                    <p className="text-sm text-gray-600">{tenant.email}</p>
                    <Badge variant={tenant.verificationStatus === 'approved' ? 'default' : 'secondary'} className="text-xs mt-1">
                      {tenant.verificationStatus === 'approved' ? 'Geverifieerd' : 'In behandeling'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Woning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-semibold">{property.title}</h4>
                  <p className="text-sm text-gray-600">{property.address}, {property.city}</p>
                  <p className="text-sm text-gray-600">{property.bedrooms} slaapkamer(s) • {property.propertyType}</p>
                  <p className="text-lg font-bold text-dutch-blue mt-2">€{property.rent}/maand</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Date & Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Datum & Tijd</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">Datum *</Label>
                  <Input
                    id="date"
                    type="date"
                    min={getMinDate()}
                    value={invitationData.date}
                    onChange={(e) => updateField('date', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="time">Tijd *</Label>
                  <select
                    id="time"
                    value={invitationData.time}
                    onChange={(e) => updateField('time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dutch-blue"
                  >
                    <option value="">Selecteer tijd</option>
                    {getTimeSlots().map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="duration">Duur (minuten)</Label>
                  <select
                    id="duration"
                    value={invitationData.duration}
                    onChange={(e) => updateField('duration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dutch-blue"
                  >
                    <option value={15}>15 minuten</option>
                    <option value={30}>30 minuten</option>
                    <option value={45}>45 minuten</option>
                    <option value={60}>60 minuten</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Persoonlijk Bericht</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="message">Bericht aan huurder (optioneel)</Label>
                <Textarea
                  id="message"
                  value={invitationData.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  placeholder="Bijvoorbeeld: Hallo! Ik zou graag een bezichtiging inplannen. Neem gerust contact op als je vragen hebt."
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {invitationData.message.length}/500 karakters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vereisten & Instructies</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="requirements">Wat moet de huurder meebrengen? (optioneel)</Label>
                <Textarea
                  id="requirements"
                  value={invitationData.requirements}
                  onChange={(e) => updateField('requirements', e.target.value)}
                  placeholder="Bijvoorbeeld: Identiteitsbewijs, loonstrook, referenties..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {invitationData.date && invitationData.time && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-green-800">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Uitnodiging Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span>
                      {new Date(invitationData.date).toLocaleDateString('nl-NL', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span>{invitationData.time} ({invitationData.duration} minuten)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span>{property.address}, {property.city}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        <BaseModalActions
          cancelAction={{
            label: 'Annuleren',
            onClick: () => onOpenChange(false)
          }}
          primaryAction={{
            label: 'Uitnodiging Verzenden',
            onClick: handleSendInvitation,
            disabled: !isValid,
            loading: isSubmitting,
            className: 'bg-green-600 hover:bg-green-700'
          }}
        />
      </div>
    </BaseModal>
  );
};

export default ViewingInvitationModal;
