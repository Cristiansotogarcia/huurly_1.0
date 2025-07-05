import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Property } from '@/services/PropertyService';
import { Plus, Eye, Edit, Trash2, MapPin, Home, Euro } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PropertyManagementProps {
  properties: Property[];
  onCreateProperty: () => void;
  onEditProperty: (property: Property) => void;
  onDeleteProperty: (propertyId: string) => void;
  onViewProperty: (property: Property) => void;
  loading?: boolean;
}

export const PropertyManagement: React.FC<PropertyManagementProps> = ({
  properties,
  onCreateProperty,
  onEditProperty,
  onDeleteProperty,
  onViewProperty,
  loading = false,
}) => {
  const { toast } = useToast();

  const handleDelete = async (property: Property) => {
    if (window.confirm(`Weet je zeker dat je "${property.titel}" wilt verwijderen?`)) {
      try {
        await onDeleteProperty(property.id);
        toast({
          title: 'Woning verwijderd',
          description: 'De woning is succesvol verwijderd.',
        });
      } catch (error) {
        toast({
          title: 'Fout',
          description: 'Er is een fout opgetreden bij het verwijderen van de woning.',
          variant: 'destructive',
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'actief':
        return 'bg-green-100 text-green-800';
      case 'verhuurd':
        return 'bg-blue-100 text-blue-800';
      case 'inactief':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'actief':
        return 'Beschikbaar';
      case 'verhuurd':
        return 'Verhuurd';
      case 'inactief':
        return 'Niet Actief';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-32 w-full"></div>
        <div className="skeleton h-32 w-full"></div>
        <div className="skeleton h-32 w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mijn Woningen</h2>
          <p className="text-gray-600 mt-1">Beheer je woningaanbod</p>
        </div>
        <Button onClick={onCreateProperty} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nieuwe Woning
        </Button>
      </div>

      {properties.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nog geen woningen toegevoegd
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Begin met het toevoegen van je eerste woning om huurders aan te trekken.
            </p>
            <Button onClick={onCreateProperty} className="flex items-center gap-2 mx-auto">
              <Plus className="w-4 h-4" />
              Eerste Woning Toevoegen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-100 relative">
                {property.foto_urls && property.foto_urls.length > 0 ? (
                  <img
                    src={property.foto_urls[0]}
                    alt={property.titel}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className={getStatusColor(property.status)}>
                    {getStatusText(property.status)}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg leading-tight">{property.titel}</CardTitle>
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {property.adres}, {property.stad}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600 flex items-center">
                      <Euro className="w-5 h-5 mr-1" />
                      {property.huurprijs.toLocaleString('nl-NL')}
                    </span>
                    <span className="text-sm text-gray-500">per maand</span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{property.aantal_kamers || 'N/A'} kamers</span>
                    <span>{property.oppervlakte || 'N/A'} m²</span>
                    <span className="capitalize">{property.woning_type}</span>
                  </div>

                  {property.beschrijving && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {property.beschrijving}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewProperty(property)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Bekijk
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditProperty(property)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(property)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};