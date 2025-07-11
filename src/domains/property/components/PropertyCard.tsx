import React from 'react';

// Placeholder interfaces until proper types are created
interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  type: string;
  available_from?: string;
}

interface PropertyCardProps {
  property: Property;
  onView?: (propertyId: string) => void;
  onFavorite?: (propertyId: string) => void;
  isFavorited?: boolean;
  showActions?: boolean;
}

/**
 * Property card component for displaying property information in a card format
 */
export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onView,
  onFavorite,
  isFavorited = false,
  showActions = true
}) => {
  const handleView = () => {
    if (onView) {
      onView(property.id);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(property.id);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleView}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}
        
        {/* Favorite Button */}
        {showActions && onFavorite && (
          <button
            onClick={handleFavorite}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg 
              className={`w-5 h-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
              fill={isFavorited ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
        
        {/* Property Type Badge */}
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {property.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Price */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {property.title}
          </h3>
          <div className="text-right">
            <p className="text-xl font-bold text-blue-600">
              €{property.price.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">per maand</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center mb-2">
          <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm text-gray-600">{property.location}</p>
        </div>

        {/* Property Details */}
        <div className="flex items-center space-x-4 mb-3">
          {property.bedrooms && (
            <div className="flex items-center">
              <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v0" />
              </svg>
              <span className="text-sm text-gray-600">{property.bedrooms} slaapkamers</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center">
              <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
              <span className="text-sm text-gray-600">{property.bathrooms} badkamers</span>
            </div>
          )}
          {property.area && (
            <div className="flex items-center">
              <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span className="text-sm text-gray-600">{property.area}m²</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {property.description}
        </p>

        {/* Available From */}
        {property.available_from && (
          <div className="flex items-center">
            <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-600">
              Beschikbaar vanaf {new Date(property.available_from).toLocaleDateString('nl-NL')}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-4 pb-4">
          <button
            onClick={handleView}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Bekijk Details
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertyCard;