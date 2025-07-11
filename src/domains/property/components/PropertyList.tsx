import React from 'react';
import { PropertyCard } from './PropertyCard';

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

interface PropertyListProps {
  properties: Property[];
  onPropertyView?: (propertyId: string) => void;
  onPropertyFavorite?: (propertyId: string) => void;
  favoritedProperties?: string[];
  isLoading?: boolean;
  emptyMessage?: string;
  viewMode?: 'grid' | 'list';
}

/**
 * Property list component for displaying multiple properties
 */
export const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  onPropertyView,
  onPropertyFavorite,
  favoritedProperties = [],
  isLoading = false,
  emptyMessage = 'Geen woningen gevonden',
  viewMode = 'grid'
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Loading skeleton */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Geen woningen</h3>
        <p className="mt-1 text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  const gridClasses = viewMode === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'space-y-4';

  return (
    <div className={gridClasses}>
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onView={onPropertyView}
          onFavorite={onPropertyFavorite}
          isFavorited={favoritedProperties.includes(property.id)}
          showActions={true}
        />
      ))}
    </div>
  );
};

export default PropertyList;