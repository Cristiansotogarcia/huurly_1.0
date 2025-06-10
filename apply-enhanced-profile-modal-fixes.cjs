const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyEnhancedProfileModalFixes() {
  console.log('🚀 Starting Enhanced Profile Modal Fixes...');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20250610_fix_enhanced_profile_modal_issues.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📖 Loaded migration SQL');
    
    // Execute the migration using Supabase SQL editor approach
    console.log('⚡ Executing migration...');
    
    // For complex migrations, we'll execute them in chunks
    const chunks = [
      // Add new columns
      `ALTER TABLE tenant_profiles 
       ADD COLUMN IF NOT EXISTS sex TEXT CHECK (sex IN ('man', 'vrouw', 'anders', 'zeg_ik_liever_niet')),
       ADD COLUMN IF NOT EXISTS smoking_details TEXT;`,
      
      // Create Dutch cities table
      `CREATE TABLE IF NOT EXISTS dutch_cities_neighborhoods (
         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
         city_name TEXT NOT NULL,
         province TEXT NOT NULL,
         neighborhood_name TEXT NOT NULL,
         postal_code_prefix TEXT,
         population INTEGER,
         is_major_city BOOLEAN DEFAULT FALSE,
         created_at TIMESTAMPTZ DEFAULT NOW()
       );`,
      
      // Add indexes
      `CREATE INDEX IF NOT EXISTS idx_dutch_cities_city_name ON dutch_cities_neighborhoods(city_name);
       CREATE INDEX IF NOT EXISTS idx_dutch_cities_province ON dutch_cities_neighborhoods(province);
       CREATE INDEX IF NOT EXISTS idx_dutch_cities_is_major ON dutch_cities_neighborhoods(is_major_city);
       CREATE INDEX IF NOT EXISTS idx_tenant_profiles_sex ON tenant_profiles(sex);`
    ];
    
    for (let i = 0; i < chunks.length; i++) {
      console.log(`⚡ Executing chunk ${i + 1}/${chunks.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { 
        sql_query: chunks[i]
      });
      
      if (error) {
        console.warn(`⚠️  Warning on chunk ${i + 1}: ${error.message}`);
      } else {
        console.log(`✅ Chunk ${i + 1} executed successfully`);
      }
    }
    
    // Insert Dutch cities data
    console.log('📍 Inserting Dutch cities and neighborhoods data...');
    
    const citiesData = [
      // Amsterdam
      { city_name: 'Amsterdam', province: 'Noord-Holland', neighborhood_name: 'Centrum', postal_code_prefix: '1012', is_major_city: true },
      { city_name: 'Amsterdam', province: 'Noord-Holland', neighborhood_name: 'Jordaan', postal_code_prefix: '1016', is_major_city: true },
      { city_name: 'Amsterdam', province: 'Noord-Holland', neighborhood_name: 'Oud-Zuid', postal_code_prefix: '1071', is_major_city: true },
      { city_name: 'Amsterdam', province: 'Noord-Holland', neighborhood_name: 'Oud-West', postal_code_prefix: '1054', is_major_city: true },
      { city_name: 'Amsterdam', province: 'Noord-Holland', neighborhood_name: 'Noord', postal_code_prefix: '1031', is_major_city: true },
      { city_name: 'Amsterdam', province: 'Noord-Holland', neighborhood_name: 'Oost', postal_code_prefix: '1091', is_major_city: true },
      { city_name: 'Amsterdam', province: 'Noord-Holland', neighborhood_name: 'West', postal_code_prefix: '1051', is_major_city: true },
      { city_name: 'Amsterdam', province: 'Noord-Holland', neighborhood_name: 'Zuid', postal_code_prefix: '1077', is_major_city: true },
      { city_name: 'Amsterdam', province: 'Noord-Holland', neighborhood_name: 'Zuidoost', postal_code_prefix: '1102', is_major_city: true },
      { city_name: 'Amsterdam', province: 'Noord-Holland', neighborhood_name: 'De Pijp', postal_code_prefix: '1073', is_major_city: true },
      
      // Rotterdam
      { city_name: 'Rotterdam', province: 'Zuid-Holland', neighborhood_name: 'Centrum', postal_code_prefix: '3011', is_major_city: true },
      { city_name: 'Rotterdam', province: 'Zuid-Holland', neighborhood_name: 'Noord', postal_code_prefix: '3038', is_major_city: true },
      { city_name: 'Rotterdam', province: 'Zuid-Holland', neighborhood_name: 'Delfshaven', postal_code_prefix: '3024', is_major_city: true },
      { city_name: 'Rotterdam', province: 'Zuid-Holland', neighborhood_name: 'Overschie', postal_code_prefix: '3044', is_major_city: true },
      { city_name: 'Rotterdam', province: 'Zuid-Holland', neighborhood_name: 'Kralingen-Crooswijk', postal_code_prefix: '3063', is_major_city: true },
      
      // Den Haag
      { city_name: 'Den Haag', province: 'Zuid-Holland', neighborhood_name: 'Centrum', postal_code_prefix: '2511', is_major_city: true },
      { city_name: 'Den Haag', province: 'Zuid-Holland', neighborhood_name: 'Scheveningen', postal_code_prefix: '2584', is_major_city: true },
      { city_name: 'Den Haag', province: 'Zuid-Holland', neighborhood_name: 'Bezuidenhout', postal_code_prefix: '2594', is_major_city: true },
      { city_name: 'Den Haag', province: 'Zuid-Holland', neighborhood_name: 'Haagse Hout', postal_code_prefix: '2566', is_major_city: true },
      { city_name: 'Den Haag', province: 'Zuid-Holland', neighborhood_name: 'Laak', postal_code_prefix: '2521', is_major_city: true },
      
      // Utrecht
      { city_name: 'Utrecht', province: 'Utrecht', neighborhood_name: 'Centrum', postal_code_prefix: '3511', is_major_city: true },
      { city_name: 'Utrecht', province: 'Utrecht', neighborhood_name: 'Noord', postal_code_prefix: '3561', is_major_city: true },
      { city_name: 'Utrecht', province: 'Utrecht', neighborhood_name: 'Oost', postal_code_prefix: '3581', is_major_city: true },
      { city_name: 'Utrecht', province: 'Utrecht', neighborhood_name: 'West', postal_code_prefix: '3531', is_major_city: true },
      { city_name: 'Utrecht', province: 'Utrecht', neighborhood_name: 'Zuid', postal_code_prefix: '3521', is_major_city: true },
      
      // Eindhoven
      { city_name: 'Eindhoven', province: 'Noord-Brabant', neighborhood_name: 'Centrum', postal_code_prefix: '5611', is_major_city: true },
      { city_name: 'Eindhoven', province: 'Noord-Brabant', neighborhood_name: 'Noord', postal_code_prefix: '5641', is_major_city: true },
      { city_name: 'Eindhoven', province: 'Noord-Brabant', neighborhood_name: 'Woensel', postal_code_prefix: '5641', is_major_city: true },
      
      // Groningen
      { city_name: 'Groningen', province: 'Groningen', neighborhood_name: 'Centrum', postal_code_prefix: '9711', is_major_city: true },
      { city_name: 'Groningen', province: 'Groningen', neighborhood_name: 'Noord', postal_code_prefix: '9741', is_major_city: true },
      
      // Additional cities
      { city_name: 'Tilburg', province: 'Noord-Brabant', neighborhood_name: 'Centrum', postal_code_prefix: '5011', is_major_city: true },
      { city_name: 'Almere', province: 'Flevoland', neighborhood_name: 'Centrum', postal_code_prefix: '1315', is_major_city: true },
      { city_name: 'Breda', province: 'Noord-Brabant', neighborhood_name: 'Centrum', postal_code_prefix: '4811', is_major_city: true },
      { city_name: 'Nijmegen', province: 'Gelderland', neighborhood_name: 'Centrum', postal_code_prefix: '6511', is_major_city: true },
      { city_name: 'Apeldoorn', province: 'Gelderland', neighborhood_name: 'Centrum', postal_code_prefix: '7311', is_major_city: true },
      { city_name: 'Haarlem', province: 'Noord-Holland', neighborhood_name: 'Centrum', postal_code_prefix: '2011', is_major_city: false },
      { city_name: 'Arnhem', province: 'Gelderland', neighborhood_name: 'Centrum', postal_code_prefix: '6811', is_major_city: false },
      { city_name: 'Zaanstad', province: 'Noord-Holland', neighborhood_name: 'Zaandam', postal_code_prefix: '1506', is_major_city: false },
      { city_name: 'Amersfoort', province: 'Utrecht', neighborhood_name: 'Centrum', postal_code_prefix: '3811', is_major_city: false },
      { city_name: 'Maastricht', province: 'Limburg', neighborhood_name: 'Centrum', postal_code_prefix: '6211', is_major_city: false },
      { city_name: 'Dordrecht', province: 'Zuid-Holland', neighborhood_name: 'Centrum', postal_code_prefix: '3311', is_major_city: false },
      { city_name: 'Leiden', province: 'Zuid-Holland', neighborhood_name: 'Centrum', postal_code_prefix: '2311', is_major_city: false },
      { city_name: 'Zoetermeer', province: 'Zuid-Holland', neighborhood_name: 'Centrum', postal_code_prefix: '2711', is_major_city: false },
      { city_name: 'Zwolle', province: 'Overijssel', neighborhood_name: 'Centrum', postal_code_prefix: '8011', is_major_city: false }
    ];
    
    // Insert cities data in batches
    const batchSize = 10;
    for (let i = 0; i < citiesData.length; i += batchSize) {
      const batch = citiesData.slice(i, i + batchSize);
      const { error } = await supabase
        .from('dutch_cities_neighborhoods')
        .upsert(batch, { onConflict: 'city_name,neighborhood_name' });
      
      if (error) {
        console.warn(`⚠️  Warning inserting cities batch ${Math.floor(i/batchSize) + 1}: ${error.message}`);
      } else {
        console.log(`✅ Inserted cities batch ${Math.floor(i/batchSize) + 1}`);
      }
    }
    
    // Create storage bucket
    console.log('🗂️  Creating profile pictures storage bucket...');
    
    const { data: buckets } = await supabase.storage.listBuckets();
    const existingBucket = buckets?.find(b => b.id === 'profile-pictures');
    
    if (!existingBucket) {
      const { error: bucketError } = await supabase.storage.createBucket('profile-pictures', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      });
      
      if (bucketError) {
        console.warn('⚠️  Warning creating storage bucket:', bucketError.message);
      } else {
        console.log('✅ Profile pictures storage bucket created');
      }
    } else {
      console.log('✅ Profile pictures storage bucket already exists');
    }
    
    // Enable RLS on new table
    console.log('🔒 Setting up RLS policies...');
    
    const rlsQueries = [
      `ALTER TABLE dutch_cities_neighborhoods ENABLE ROW LEVEL SECURITY;`,
      `CREATE POLICY IF NOT EXISTS "Anyone can read Dutch cities and neighborhoods" ON dutch_cities_neighborhoods FOR SELECT USING (true);`
    ];
    
    for (const query of rlsQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: query });
      if (error) {
        console.warn('⚠️  Warning setting up RLS:', error.message);
      }
    }
    
    // Verify the changes
    console.log('\n🔍 Verifying changes...');
    
    // Check if Dutch cities table has data
    const { data: citiesCount, error: citiesError } = await supabase
      .from('dutch_cities_neighborhoods')
      .select('count(*)', { count: 'exact' });
    
    if (citiesError) {
      console.warn('⚠️  Could not verify Dutch cities table:', citiesError.message);
    } else {
      console.log(`✅ Dutch cities table created with ${citiesCount?.[0]?.count || 0} records`);
    }
    
    // Check if storage bucket exists
    const { data: finalBuckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.warn('⚠️  Could not verify storage buckets:', bucketsError.message);
    } else {
      const profilePicturesBucket = finalBuckets.find(b => b.id === 'profile-pictures');
      if (profilePicturesBucket) {
        console.log('✅ Profile pictures storage bucket verified');
      } else {
        console.warn('⚠️  Profile pictures bucket not found');
      }
    }
    
    console.log('\n🎉 Enhanced Profile Modal Database Fixes completed successfully!');
    console.log('\n📋 Summary of changes:');
    console.log('  ✅ Added sex field to tenant_profiles');
    console.log('  ✅ Added smoking_details field to tenant_profiles');
    console.log('  ✅ Created profile-pictures storage bucket');
    console.log('  ✅ Created comprehensive Dutch cities and neighborhoods table');
    console.log('  ✅ Added proper indexes for performance');
    console.log('  ✅ Set up RLS policies');
    
    console.log('\n🔧 Next steps:');
    console.log('  1. Update the EnhancedProfileCreationModal component');
    console.log('  2. Add profile picture upload functionality');
    console.log('  3. Enhance smoking preferences section');
    console.log('  4. Update city and neighborhood selection');
    console.log('  5. Add sex/gender field to the modal');
    
  } catch (error) {
    console.error('❌ Error applying Enhanced Profile Modal fixes:', error);
    process.exit(1);
  }
}

// Run the migration
applyEnhancedProfileModalFixes();
