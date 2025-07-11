import React, { useState } from 'react';

// Placeholder interfaces until proper types are created
interface ApplicationFormData {
  property_id: string;
  message: string;
  move_in_date: string;
  income: number;
  employment_status: string;
  references: string;
  pets: boolean;
  smoking: boolean;
  additional_info?: string;
}

interface ApplicationFormProps {
  propertyId: string;
  propertyTitle?: string;
  onSubmit: (data: ApplicationFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'employed', label: 'In dienst' },
  { value: 'self_employed', label: 'Zelfstandig' },
  { value: 'student', label: 'Student' },
  { value: 'unemployed', label: 'Werkloos' },
  { value: 'retired', label: 'Gepensioneerd' }
];

/**
 * Application form component for submitting rental applications
 */
export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  propertyId,
  propertyTitle,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<ApplicationFormData>({
    property_id: propertyId,
    message: '',
    move_in_date: '',
    income: 0,
    employment_status: 'employed',
    references: '',
    pets: false,
    smoking: false,
    additional_info: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationFormData, string>>>({});

  const handleInputChange = (field: keyof ApplicationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ApplicationFormData, string>> = {};

    if (!formData.message.trim()) newErrors.message = 'Bericht is verplicht';
    if (!formData.move_in_date) newErrors.move_in_date = 'Gewenste inhuurdatum is verplicht';
    if (formData.income <= 0) newErrors.income = 'Inkomen moet groter zijn dan 0';
    if (!formData.references.trim()) newErrors.references = 'Referenties zijn verplicht';

    // Check if move-in date is in the future
    if (formData.move_in_date && new Date(formData.move_in_date) <= new Date()) {
      newErrors.move_in_date = 'Inhuurdatum moet in de toekomst liggen';
    }

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
        <h2 className="text-2xl font-bold text-gray-900">Huurverzoek Indienen</h2>
        {propertyTitle && (
          <p className="text-gray-600 mt-1">Voor: {propertyTitle}</p>
        )}
        <p className="text-gray-600 mt-2">
          Vul onderstaande gegevens in om je huurverzoek in te dienen.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Persoonlijk bericht *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.message ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Vertel iets over jezelf en waarom je geïnteresseerd bent in deze woning..."
          />
          {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
        </div>

        {/* Move-in Date and Income */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gewenste inhuurdatum *
            </label>
            <input
              type="date"
              value={formData.move_in_date}
              onChange={(e) => handleInputChange('move_in_date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.move_in_date ? 'border-red-300' : 'border-gray-300'
              }`}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.move_in_date && <p className="mt-1 text-sm text-red-600">{errors.move_in_date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maandelijks netto inkomen (€) *
            </label>
            <input
              type="number"
              value={formData.income}
              onChange={(e) => handleInputChange('income', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.income ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="3000"
              min="0"
            />
            {errors.income && <p className="mt-1 text-sm text-red-600">{errors.income}</p>}
          </div>
        </div>

        {/* Employment Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Werkstatus *
          </label>
          <select
            value={formData.employment_status}
            onChange={(e) => handleInputChange('employment_status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {EMPLOYMENT_STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* References */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Referenties *
          </label>
          <textarea
            value={formData.references}
            onChange={(e) => handleInputChange('references', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.references ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Geef contactgegevens van referenties (vorige verhuurders, werkgevers, etc.)"
          />
          {errors.references && <p className="mt-1 text-sm text-red-600">{errors.references}</p>}
        </div>

        {/* Pets and Smoking */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.pets}
                onChange={(e) => handleInputChange('pets', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Ik heb huisdieren</span>
            </label>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.smoking}
                onChange={(e) => handleInputChange('smoking', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Ik rook</span>
            </label>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aanvullende informatie
          </label>
          <textarea
            value={formData.additional_info}
            onChange={(e) => handleInputChange('additional_info', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Eventuele aanvullende informatie die relevant kan zijn..."
          />
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Belangrijk</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Zorg ervoor dat alle informatie correct en volledig is</li>
                  <li>De verhuurder kan aanvullende documenten opvragen</li>
                  <li>Je ontvangt een bevestiging na het indienen van je aanvraag</li>
                </ul>
              </div>
            </div>
          </div>
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
            {isLoading ? 'Indienen...' : 'Aanvraag Indienen'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;