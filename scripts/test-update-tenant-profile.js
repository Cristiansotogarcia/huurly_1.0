const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testUpdate() {
  try {
    console.log('Testing tenant profile update...');
    
    const userId = '929577f0-2124-4157-98e5-81656d0b8e83';
    
    // First, let's see what's currently in the table
    console.log('\n1. Getting current data...');
    const { data: currentData, error: getCurrentError } = await supabase
      .from('tenant_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (getCurrentError) {
      console.log('Error getting current data:', getCurrentError);
      return;
    }
    
    console.log('Current data keys:', Object.keys(currentData || {}).sort());
    
    // Test with minimal update data
    console.log('\n2. Testing minimal update...');
    const minimalUpdate = {
      user_id: userId,
      first_name: 'Cristian',
      last_name: 'Soto Garcia',
      phone: '+31630116270'
    };
    
    const { data: updateData, error: updateError } = await supabase
      .from('tenant_profiles')
      .update(minimalUpdate)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (updateError) {
      console.log('Minimal update error:', updateError);
    } else {
      console.log('Minimal update successful');
    }
    
    // Test with one problematic field at a time
    console.log('\n3. Testing individual fields...');
    const testFields = [
      { nationality: 'Nederlandse' },
      { sex: 'man' },
      { marital_status: 'single' },
      { has_children: false },
      { number_of_children: 0 },
      { children_ages: [] },
      { has_partner: false },
      { preferred_districts: ['Centrum'] },
      { max_commute_time: 30 },
      { transportation_preference: 'public_transport' },
      { furnished_preference: 'no_preference' },
      { desired_amenities: [] },
      { smoking_details: null }
    ];
    
    for (const field of testFields) {
      const fieldName = Object.keys(field)[0];
      const fieldValue = field[fieldName];
      
      const { error: fieldError } = await supabase
        .from('tenant_profiles')
        .update({ user_id: userId, [fieldName]: fieldValue })
        .eq('user_id', userId);
        
      if (fieldError) {
        console.log(`❌ Field '${fieldName}' failed:`, fieldError.message);
      } else {
        console.log(`✅ Field '${fieldName}' works`);
      }
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testUpdate();
