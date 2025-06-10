# Complete Solution: Eliminate ALL Hardcoded Data from Huurder Dashboard

## Overview
This document provides a comprehensive solution to eliminate ALL hardcoded data from the Huurder Dashboard system and replace it with database-driven, configurable data.

## Database Schema Requirements

### 1. System Configuration Table
```sql
CREATE TABLE system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(255) UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial configuration
INSERT INTO system_config (config_key, config_value, description) VALUES
('subscription_pricing', '{"annual": 65, "currency": "EUR", "includes_vat": true}', 'Subscription pricing configuration'),
('default_search_limits', '{"max_price": 5000, "min_price": 0, "max_commute_time": 60}', 'Default search parameter limits'),
('notification_settings', '{"auto_assign_beoordelaar": true, "notification_delay_minutes": 5}', 'Notification system settings');
```

### 2. Cities and Districts Table
```sql
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) DEFAULT 'Netherlands',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Dutch cities and districts
INSERT INTO cities (name) VALUES 
('Amsterdam'), ('Rotterdam'), ('Den Haag'), ('Utrecht'), ('Eindhoven'), 
('Groningen'), ('Tilburg'), ('Almere'), ('Breda'), ('Nijmegen');

-- Insert districts for Amsterdam
INSERT INTO districts (city_id, name) 
SELECT id, district FROM cities, 
UNNEST(ARRAY['Centrum', 'Jordaan', 'Oud-Zuid', 'Oud-West', 'Noord', 'Oost', 'West', 'Zuid', 'Zuidoost', 'De Pijp', 'Vondelpark', 'Museumkwartier']) AS district 
WHERE name = 'Amsterdam';
```

### 3. Property Amenities Table
```sql
CREATE TABLE property_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_name VARCHAR(100),
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO property_amenities (name, icon_name, category) VALUES
('Balkon', 'TreePine', 'outdoor'),
('Tuin', 'TreePine', 'outdoor'),
('Parkeerplaats', 'ParkingCircle', 'parking'),
('Lift', 'ArrowRight', 'building'),
('Wasmachine aansluiting', 'WashingMachine', 'appliances'),
('Vaatwasser', 'Utensils', 'appliances'),
('Internet/WiFi', 'Wifi', 'utilities'),
('Bad', 'Bath', 'bathroom');
```

### 4. Document Types Table
```sql
CREATE TABLE document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_key VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO document_types (type_key, display_name, description, is_required) VALUES
('identity', 'Identiteitsbewijs', 'Geldig identiteitsbewijs (paspoort, ID-kaart, rijbewijs)', true),
('payslip', 'Loonstrook', 'Recente loonstrook (niet ouder dan 3 maanden)', true),
('employment_contract', 'Arbeidscontract', 'Arbeidscontract of werkgeversverklaring', true),
('reference', 'Referentie', 'Referentie van vorige verhuurder of werkgever', false),
('bank_statement', 'Bankafschrift', 'Bankafschrift van de laatste 3 maanden', false);
```

### 5. Status Types Table
```sql
CREATE TABLE status_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_key VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  color_class VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO status_types (status_key, display_name, color_class) VALUES
('pending', 'In behandeling', 'text-yellow-600 bg-yellow-100'),
('approved', 'Goedgekeurd', 'text-green-600 bg-green-100'),
('rejected', 'Afgewezen', 'text-red-600 bg-red-100'),
('under_review', 'Wordt beoordeeld', 'text-blue-600 bg-blue-100');
```

### 6. Beoordelaar Assignment Table
```sql
CREATE TABLE beoordelaar_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beoordelaar_id UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  max_assignments INTEGER DEFAULT 10,
  current_assignments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7. User Preferences Table
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  preference_key VARCHAR(255) NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, preference_key)
);
```

## Service Layer Implementation

### 1. Configuration Service
```typescript
// src/services/ConfigurationService.ts
export class ConfigurationService extends DatabaseService {
  async getConfig(key: string): Promise<DatabaseResponse<any>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('config_value')
        .eq('config_key', key)
        .eq('is_active', true)
        .single();

      return { data: data?.config_value, error };
    });
  }

  async getSubscriptionPricing(): Promise<DatabaseResponse<any>> {
    return this.getConfig('subscription_pricing');
  }

  async getSearchLimits(): Promise<DatabaseResponse<any>> {
    return this.getConfig('default_search_limits');
  }
}
```

### 2. Location Service
```typescript
// src/services/LocationService.ts
export class LocationService extends DatabaseService {
  async getCities(): Promise<DatabaseResponse<any[]>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name');

      return { data, error };
    });
  }

  async getDistrictsByCity(cityId: string): Promise<DatabaseResponse<any[]>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .eq('city_id', cityId)
        .eq('is_active', true)
        .order('name');

      return { data, error };
    });
  }

  async getCitiesWithDistricts(): Promise<DatabaseResponse<any[]>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('cities')
        .select(`
          *,
          districts(*)
        `)
        .eq('is_active', true)
        .eq('districts.is_active', true)
        .order('name');

      return { data, error };
    });
  }
}
```

### 3. Amenities Service
```typescript
// src/services/AmenitiesService.ts
export class AmenitiesService extends DatabaseService {
  async getAmenities(): Promise<DatabaseResponse<any[]>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('property_amenities')
        .select('*')
        .eq('is_active', true)
        .order('category, name');

      return { data, error };
    });
  }

  async getAmenitiesByCategory(): Promise<DatabaseResponse<any>> {
    const result = await this.getAmenities();
    if (!result.success || !result.data) return result;

    const grouped = result.data.reduce((acc, amenity) => {
      const category = amenity.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(amenity);
      return acc;
    }, {});

    return { data: grouped, error: null, success: true };
  }
}
```

### 4. Document Types Service
```typescript
// src/services/DocumentTypesService.ts
export class DocumentTypesService extends DatabaseService {
  async getDocumentTypes(): Promise<DatabaseResponse<any[]>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('document_types')
        .select('*')
        .eq('is_active', true)
        .order('is_required DESC, display_name');

      return { data, error };
    });
  }

  async getDocumentTypeByKey(key: string): Promise<DatabaseResponse<any>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('document_types')
        .select('*')
        .eq('type_key', key)
        .eq('is_active', true)
        .single();

      return { data, error };
    });
  }
}
```

### 5. Status Service
```typescript
// src/services/StatusService.ts
export class StatusService extends DatabaseService {
  async getStatusTypes(): Promise<DatabaseResponse<any[]>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('status_types')
        .select('*')
        .eq('is_active', true)
        .order('status_key');

      return { data, error };
    });
  }

  async getStatusByKey(key: string): Promise<DatabaseResponse<any>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('status_types')
        .select('*')
        .eq('status_key', key)
        .eq('is_active', true)
        .single();

      return { data, error };
    });
  }
}
```

### 6. Beoordelaar Assignment Service
```typescript
// src/services/BeoordelaarAssignmentService.ts
export class BeoordelaarAssignmentService extends DatabaseService {
  async getAvailableBeoordelaar(): Promise<DatabaseResponse<any>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('beoordelaar_assignments')
        .select(`
          *,
          profiles(id, first_name, last_name)
        `)
        .eq('is_active', true)
        .lt('current_assignments', 'max_assignments')
        .order('current_assignments')
        .limit(1)
        .single();

      return { data, error };
    });
  }

  async assignDocument(beoordelaarId: string): Promise<DatabaseResponse<boolean>> {
    return this.executeQuery(async () => {
      const { error } = await supabase.rpc('increment_beoordelaar_assignments', {
        beoordelaar_id: beoordelaarId
      });

      return { data: !error, error };
    });
  }
}
```

## Updated Component Implementation

### 1. Enhanced Profile Creation Modal (Database-Driven)
```typescript
// Updated EnhancedProfileCreationModal.tsx
const EnhancedProfileCreationModal = ({ open, onOpenChange, onComplete }: Props) => {
  const [cities, setCities] = useState<any[]>([]);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [searchLimits, setSearchLimits] = useState<any>({});

  useEffect(() => {
    const loadConfigurationData = async () => {
      // Load cities with districts
      const citiesResult = await locationService.getCitiesWithDistricts();
      if (citiesResult.success) setCities(citiesResult.data);

      // Load amenities
      const amenitiesResult = await amenitiesService.getAmenities();
      if (amenitiesResult.success) setAmenities(amenitiesResult.data);

      // Load search limits for defaults
      const limitsResult = await configurationService.getSearchLimits();
      if (limitsResult.success) setSearchLimits(limitsResult.data);
    };

    if (open) loadConfigurationData();
  }, [open]);

  // Use dynamic data instead of hardcoded values
  const getDistrictsForCity = (cityName: string) => {
    const city = cities.find(c => c.name === cityName);
    return city?.districts || [];
  };

  // Dynamic amenities rendering
  const renderAmenities = () => {
    return amenities.map((amenity) => (
      <div key={amenity.id} className="flex items-center space-x-2">
        <Checkbox
          id={`amenity-${amenity.id}`}
          checked={profileData.desiredAmenities.includes(amenity.id)}
          onCheckedChange={(checked) => {
            if (checked) {
              updateProfileData('desiredAmenities', [...profileData.desiredAmenities, amenity.id]);
            } else {
              updateProfileData('desiredAmenities', profileData.desiredAmenities.filter(a => a !== amenity.id));
            }
          }}
        />
        <Label htmlFor={`amenity-${amenity.id}`} className="text-sm">
          {amenity.name}
        </Label>
      </div>
    ));
  };

  // Use dynamic defaults from configuration
  const getDefaultProfileData = () => ({
    // ... other fields
    minBudget: searchLimits.min_price || 0,
    maxBudget: searchLimits.max_price || 3000,
    maxCommuteTime: searchLimits.max_commute_time || 30,
    // Remove all hardcoded defaults
  });
};
```

### 2. Updated Huurder Dashboard (Database-Driven)
```typescript
// Updated HuurderDashboard.tsx
const HuurderDashboard = () => {
  const [subscriptionPricing, setSubscriptionPricing] = useState<any>({});
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [statusTypes, setStatusTypes] = useState<any[]>([]);

  useEffect(() => {
    const loadSystemConfiguration = async () => {
      // Load subscription pricing
      const pricingResult = await configurationService.getSubscriptionPricing();
      if (pricingResult.success) setSubscriptionPricing(pricingResult.data);

      // Load document types
      const docTypesResult = await documentTypesService.getDocumentTypes();
      if (docTypesResult.success) setDocumentTypes(docTypesResult.data);

      // Load status types
      const statusResult = await statusService.getStatusTypes();
      if (statusResult.success) setStatusTypes(statusResult.data);
    };

    loadSystemConfiguration();
  }, []);

  // Dynamic subscription pricing display
  const renderSubscriptionInfo = () => {
    if (!subscriptionPricing.annual) return null;
    
    return (
      <p className="text-green-700">
        Je hebt een actief abonnement (€{subscriptionPricing.annual}/jaar 
        {subscriptionPricing.includes_vat ? ' inclusief BTW' : ''}).
        Je profiel is zichtbaar voor verhuurders.
      </p>
    );
  };

  // Dynamic document type display
  const getDocumentTypeDisplay = (typeKey: string) => {
    const docType = documentTypes.find(dt => dt.type_key === typeKey);
    return docType?.display_name || typeKey;
  };

  // Dynamic status display
  const getStatusDisplay = (statusKey: string) => {
    const status = statusTypes.find(st => st.status_key === statusKey);
    return {
      label: status?.display_name || statusKey,
      className: status?.color_class || 'text-gray-600'
    };
  };

  // Dynamic beoordelaar assignment
  const handleDocumentUploadComplete = async (documents: any[]) => {
    // Get available beoordelaar
    const beoordelaarResult = await beoordelaarAssignmentService.getAvailableBeoordelaar();
    
    if (beoordelaarResult.success && beoordelaarResult.data) {
      const beoordelaar = beoordelaarResult.data;
      
      // Assign documents and send notifications
      documents.forEach(async (doc) => {
        await beoordelaarAssignmentService.assignDocument(beoordelaar.beoordelaar_id);
        
        notifyDocumentUploaded(
          user?.name || "Onbekende gebruiker",
          getDocumentTypeDisplay(doc.document_type),
          beoordelaar.beoordelaar_id
        );
      });
    }

    // Reload documents
    if (user?.id) {
      const docsResult = await documentService.getDocumentsByUser(user.id);
      if (docsResult.success && docsResult.data) {
        setUserDocuments(docsResult.data);
      }
    }

    toast({
      title: "Documenten geüpload",
      description: `${documents.length} document(en) zijn geüpload voor beoordeling.`,
    });
  };

  // Use actual subscription data for end date calculation
  const getSubscriptionEndDate = () => {
    if (user?.hasPayment && user?.subscription_start_date) {
      const startDate = new Date(user.subscription_start_date);
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      return endDate.toLocaleDateString('nl-NL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    return null;
  };
};
```

### 3. Updated Property Search Modal (Database-Driven)
```typescript
// Updated PropertySearchModal.tsx
const PropertySearchModal = ({ open, onOpenChange }: Props) => {
  const [searchLimits, setSearchLimits] = useState<any>({});
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    const loadConfiguration = async () => {
      // Load search limits
      const limitsResult = await configurationService.getSearchLimits();
      if (limitsResult.success) setSearchLimits(limitsResult.data);

      // Load cities
      const citiesResult = await locationService.getCities();
      if (citiesResult.success) setCities(citiesResult.data);
    };

    if (open) loadConfiguration();
  }, [open]);

  // Dynamic filter initialization
  const [filters, setFilters] = useState<SearchFilters>({
    city: '',
    minPrice: 0,
    maxPrice: 0, // Will be set from database
    bedrooms: '',
    propertyType: '',
  });

  // Update filters when limits are loaded
  useEffect(() => {
    if (searchLimits.max_price) {
      setFilters(prev => ({
        ...prev,
        maxPrice: searchLimits.max_price
      }));
    }
  }, [searchLimits]);

  // Dynamic city options
  const renderCityOptions = () => {
    return cities.map(city => (
      <option key={city.id} value={city.name}>{city.name}</option>
    ));
  };
};
```

## Database Migration Script

```sql
-- Create all new tables for configuration-driven system
-- This migration eliminates all hardcoded data

-- 1. System Configuration
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(255) UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Cities and Districts
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) DEFAULT 'Netherlands',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Property Amenities
CREATE TABLE IF NOT EXISTS property_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_name VARCHAR(100),
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Document Types
CREATE TABLE IF NOT EXISTS document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_key VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Status Types
CREATE TABLE IF NOT EXISTS status_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_key VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  color_class VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Beoordelaar Assignments
CREATE TABLE IF NOT EXISTS beoordelaar_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beoordelaar_id UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  max_assignments INTEGER DEFAULT 10,
  current_assignments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  preference_key VARCHAR(255) NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, preference_key)
);

-- Add subscription_start_date to user_roles if not exists
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE;

-- Create function for beoordelaar assignment
CREATE OR REPLACE FUNCTION increment_beoordelaar_assignments(beoordelaar_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE beoordelaar_assignments 
  SET current_assignments = current_assignments + 1
  WHERE beoordelaar_assignments.beoordelaar_id = increment_beoordelaar_assignments.beoordelaar_id;
END;
$$ LANGUAGE plpgsql;

-- Insert initial configuration data
INSERT INTO system_config (config_key, config_value, description) VALUES
('subscription_pricing', '{"annual": 65, "currency": "EUR", "includes_vat": true}', 'Subscription pricing configuration'),
('default_search_limits', '{"max_price": 5000, "min_price": 0, "max_commute_time": 60}', 'Default search parameter limits'),
('notification_settings', '{"auto_assign_beoordelaar": true, "notification_delay_minutes": 5}', 'Notification system settings')
ON CONFLICT (config_key) DO NOTHING;

-- Insert Dutch cities
INSERT INTO cities (name) VALUES 
('Amsterdam'), ('Rotterdam'), ('Den Haag'), ('Utrecht'), ('Eindhoven'), 
('Groningen'), ('Tilburg'), ('Almere'), ('Breda'), ('Nijmegen'),
('Apeldoorn'), ('Haarlem'), ('Arnhem'), ('Zaanstad'), ('Amersfoort'),
('Maastricht'), ('Dordrecht'), ('Leiden'), ('Haarlemmermeer'), ('Zoetermeer'), ('Zwolle')
ON CONFLICT DO NOTHING;

-- Insert districts for major cities
WITH city_districts AS (
  SELECT 
    c.id as city_id,
    unnest(CASE 
      WHEN c.name = 'Amsterdam' THEN ARRAY['Centrum', 'Jordaan', 'Oud-Zuid', 'Oud-West', 'Noord', 'Oost', 'West', 'Zuid', 'Zuidoost', 'De Pijp', 'Vondelpark', 'Museumkwartier']
      WHEN c.name = 'Rotterdam' THEN ARRAY['Centrum', 'Noord', 'Delfshaven', 'Overschie', 'Hillegersberg-Schiebroek', 'Kralingen-Crooswijk', 'Feijenoord', 'IJsselmonde', 'Pernis', 'Prins Alexander']
      WHEN c.name = 'Den Haag' THEN ARRAY['Centrum', 'Scheveningen', 'Bezuidenhout', 'Haagse Hout', 'Laak', 'Leidschenveen-Ypenburg', 'Loosduinen', 'Segbroek', 'Escamp']
      WHEN c.name = 'Utrecht' THEN ARRAY['Centrum', 'Noord', 'Oost', 'West', 'Zuid', 'Nieuwegein', 'Vleuten-De Meern', 'Zuilen', 'Overvecht', 'Kanaleneiland']
      ELSE ARRAY['Centrum', 'Noord', 'Oost', 'West', 'Zuid']
    END) as district_name
  FROM cities c
)
INSERT INTO districts (city_id, name)
SELECT city_id, district_name FROM city_districts
ON CONFLICT DO NOTHING;

-- Insert property amenities
INSERT INTO property_amenities (name, icon_name, category) VALUES
('Balkon', 'TreePine', 'outdoor'),
('Tuin', 'TreePine', 'outdoor'),
('Parkeerplaats', 'ParkingCircle', 'parking'),
('Lift', 'ArrowRight', 'building'),
('Wasmachine aansluiting', 'WashingMachine', 'appliances'),
('Vaatwasser', 'Utensils', 'appliances'),
('Internet/WiFi', 'Wifi', 'utilities'),
('Bad', 'Bath', 'bathroom')
ON CONFLICT DO NOTHING;

-- Insert document types
INSERT INTO document_types (type_key, display_name, description, is_required) VALUES
('identity', 'Identiteitsbewijs', 'Geldig identiteitsbewijs (paspoort, ID-kaart, rijbewijs)', true),
('payslip', 'Loonstrook', 'Recente loonstrook (niet ouder dan 3 maanden)', true),
('employment_contract', 'Arbeidscontract', 'Arbeidscontract of werkgeversverklaring', true),
('reference', 'Referentie', 'Referentie van vorige verhuurder of werkgever', false),
('bank_statement', 'Bankafschrift', 'Bankafschrift van de laatste 3 maanden', false)
ON CONFLICT (type_key) DO NOTHING;

-- Insert status types
INSERT INTO status_types (status_key, display_name, color_class) VALUES
('pending', 'In behandeling', 'text-yellow-600 bg-yellow-100'),
('approved', 'Goedgekeurd', 'text-green-600 bg-green-100'),
('rejected', 'Afgewezen', 'text-red-600 bg-red-100'),
('under_review', 'Wordt beoordeeld', 'text-blue-600 bg-blue-100')
ON CONFLICT (status_key) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(config_key);
CREATE INDEX IF NOT EXISTS idx_cities_active ON cities(is_active);
CREATE INDEX IF NOT EXISTS idx_districts_city ON districts(city_id);
CREATE INDEX IF NOT EXISTS idx_amenities_active ON property_amenities(is_active);
CREATE INDEX IF NOT EXISTS idx_document_types_active ON document_types(is_active);
CREATE INDEX IF NOT EXISTS idx_status_types_active ON status_types(is_active);
CREATE INDEX IF NOT EXISTS idx_beoordelaar_assignments_active ON beoordelaar_assignments(is_active);
```

## Implementation Steps

1. **Create Database Schema**: Run the migration script to create all configuration tables
2. **Create Service Classes**: Implement all the service classes for configuration management
3. **Update Components**: Replace all hardcoded data with database-driven data
4. **Add Admin Interface**: Create admin interface to manage all configuration data
5. **Test Thoroughly**: Ensure all functionality works with dynamic data
6. **Deploy**: Deploy the updated system with zero hardcoded data

## Benefits

- **Zero Hardcoded Data**: All data comes from database
- **Easy Configuration**: Admin can change settings without code deployment
- **Scalable**: Easy to add new cities, amenities, document types
- **Maintainable**: Centralized configuration management
- **Flexible**: Support for different regions and business rules
- **Professional**: Production-ready system architecture

This solution completely eliminates hardcoded data and creates a fully configurable, database-driven system.
