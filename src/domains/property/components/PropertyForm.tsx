import React, { useState } from 'react';

// Placeholder interfaces until proper types are created
interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  available_from: string;
  amenities: string[];
  images: File[];
}

interface PropertyFormProps {
  initialData?: Partial<PropertyFormData>;
  onSubmit: (data: PropertyFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Appartement' },
  { value: 'house', label: 'Huis' },
  { value: 'studio', label: 'Studio' },
  { value: 'room', label: 'Kamer' },
  { value: 'commercial', label: 'Commercieel' }
];

const COMMON_AMENITIES = [
  'Balkon', 'Tuin', 'Parkeerplaats', 'Lift', 'Airconditioning',
  'Vaatwasser', 'Wasmachine', 'Droger', 'Huisdieren toegestaan',
  'Roken toegestaan', 'Gemeubileerd', 'Internet', 'Kabel TV'
];

/**
 * Property form component for creating and editing properties
 */
export const PropertyForm: React.FC<PropertyFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: initialData.title || '',
    description: initialData.description || '',
    price: initialData.price || 0,
    location: initialData.location || '',
    bedrooms: initialData.bedrooms || 1,
    bathrooms: initialData.bathrooms || 1,
    area: initialData.area || 0,
    type: initialData.type || 'apartment',
    available_from: initialData.available_from || '',
    amenities: initialData.amenities || [],
    images: initialData.images || []
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PropertyFormData, string>>>({});

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PropertyFormData, string>> = {};

    if (!formData.title.trim()) newErrors.title = 'Titel is verplicht';
    if (!formData.description.trim()) newErrors.description = 'Beschrijving is verplicht';
    if (formData.price <= 0) newErrors.price = 'Prijs moet groter zijn dan 0';
    if (!formData.location.trim()) newErrors.location = 'Locatie is verplicht';
    if (formData.area <= 0) newErrors.area = 'Oppervlakte moet groter zijn dan 0';
    if (!formData.available_from) newErrors.available_from = 'Beschikbaarheidsdatum is verplicht';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Woning Bewerken' : 'Nieuwe Woning Toevoegen'}
        </h2>
        <p className="text-gray-600 mt-1">
          Vul alle vereiste informatie in om je woning {isEditing ? 'bij te werken' : 'toe te voegen'}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titel *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Bijv. Ruim appartement in het centrum"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PROPERTY_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Location and Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Locatie *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.location ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Bijv. Amsterdam, Noord-Holland"
            />
            {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Huurprijs per maand (€) *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.price ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="1500"
              min="0"
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
          </div>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slaapkamers
            </label>
            <input
              type="number"
              value={formData.bedrooms}
              onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Badkamers
            </label>
            <input
              type="number"
              value={formData.bathrooms}
              onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Oppervlakte (m²) *
            </label>
            <input
              type="number"
              value={formData.area}
              onChange={(e) => handleInputChange('area', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.area ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="75"
              min="0"
            />
            {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area}</p>}
          </div>
        </div>

        {/* Available From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Beschikbaar vanaf *
          </label>
          <input
            type="date"
            value={formData.available_from}
            onChange={(e) => handleInputChange('available_from', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.available_from ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.available_from && <p className="mt-1 text-sm text-red-600">{errors.available_from}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Beschrijving *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Beschrijf de woning in detail..."
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Voorzieningen
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {COMMON_AMENITIES.map(amenity => (
              <label key={amenity} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Foto's
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload foto's
                  </span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG, GIF tot 10MB
                </p>
              </div>
            </div>
          </div>
          
          {/* Image Preview */}
          {formData.images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isLoading}
            >
              Annuleren
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Bezig...' : (isEditing ? 'Bijwerken' : 'Toevoegen')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;