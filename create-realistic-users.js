// Create realistic users for each role directly in Supabase database
const SUPABASE_URL = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAyNTgyOCwiZXhwIjoyMDY0NjAxODI4fQ.1GaDpXyyXqxBzQSu7Pu3xRpF0_Y5AoQcLRQsgHmIM9I';

// Realistic user data for each role
const users = [
  {
    id: '2c655825-9713-4ecc-80e3-a77701914d3b',
    email: 'jan.verhuurder@example.com',
    first_name: 'Jan',
    last_name: 'van der Berg',
    role: 'Verhuurder',
    phone: '+31 6 12345678',
    description: 'Ervaren verhuurder met 15+ jaar ervaring in de Amsterdamse woningmarkt. Eigenaar van meerdere panden in centrum en omgeving.'
  },
  {
    id: '3c655825-9713-4ecc-80e3-a77701914d3c',
    email: 'marie.beoordelaar@example.com',
    first_name: 'Marie',
    last_name: 'Jansen',
    role: 'Beoordelaar',
    phone: '+31 6 87654321',
    description: 'Gecertificeerd documentbeoordelaar met expertise in identiteitsverificatie en inkomenstoetsing. 8 jaar ervaring in de vastgoedsector.'
  },
  {
    id: '4c655825-9713-4ecc-80e3-a77701914d3d',
    email: 'admin.beheerder@example.com',
    first_name: 'Admin',
    last_name: 'Beheerder',
    role: 'Beheerder',
    phone: '+31 6 11223344',
    description: 'Systeembeheerder verantwoordelijk voor platform onderhoud, gebruikersbeheer en technische ondersteuning.'
  }
];

async function createRealisticUsers() {
  console.log('🔄 Creating realistic users for each role...');
  
  try {
    for (const user of users) {
      console.log(`\n👤 Creating ${user.role}: ${user.first_name} ${user.last_name}`);
      
      // 1. Create auth user with encrypted password
      console.log('📝 Creating auth.users entry...');
      const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          password: 'Admin123@@',
          email_confirm: true,
          user_metadata: {
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role
          }
        })
      });
      
      if (authResponse.ok) {
        const authUser = await authResponse.json();
        console.log(`✅ Auth user created with ID: ${authUser.id}`);
        
        // Use the actual user ID from auth response
        const actualUserId = authUser.id;
        
        // 2. Create profile
        console.log('📝 Creating profile...');
        const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            id: actualUserId,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            bio: user.description
          })
        });
        
        if (profileResponse.ok) {
          console.log(`✅ Profile created for ${user.first_name}`);
        } else {
          const error = await profileResponse.text();
          console.log(`⚠️ Profile creation failed: ${error}`);
        }
        
        // 3. Create user role
        console.log('📝 Creating user role...');
        const roleResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id: actualUserId,
            role: user.role,
            subscription_status: 'active',
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          })
        });
        
        if (roleResponse.ok) {
          console.log(`✅ Role ${user.role} assigned to ${user.first_name}`);
        } else {
          const error = await roleResponse.text();
          console.log(`⚠️ Role assignment failed: ${error}`);
        }
        
        // 4. Create role-specific data
        if (user.role === 'Verhuurder') {
          await createVerhuurderData(actualUserId, user);
        } else if (user.role === 'Beoordelaar') {
          await createBeoordelaarData(actualUserId, user);
        } else if (user.role === 'Beheerder') {
          await createBeheerderData(actualUserId, user);
        }
        
      } else {
        const error = await authResponse.text();
        console.log(`❌ Auth user creation failed: ${error}`);
      }
    }
    
    console.log('\n🎉 All realistic users created successfully!');
    
    // Verify the created users
    console.log('\n🔍 Verifying created users...');
    await verifyUsers();
    
  } catch (error) {
    console.error('❌ Error creating users:', error);
  }
}

async function createVerhuurderData(userId, user) {
  console.log('🏠 Creating Verhuurder-specific data...');
  
  // Create sample properties for the landlord
  const properties = [
    {
      id: `prop-${userId}-1`,
      landlord_id: userId,
      title: 'Modern Appartement Amsterdam Centrum',
      description: 'Prachtig 2-kamer appartement in het hart van Amsterdam. Volledig gemeubileerd met moderne voorzieningen.',
      address: 'Prinsengracht 123',
      city: 'Amsterdam',
      postal_code: '1015 DT',
      price: 1850.00,
      bedrooms: 2,
      bathrooms: 1,
      area: 75.0,
      property_type: 'apartment',
      status: 'available',
      features: ['Gemeubileerd', 'Balkon', 'Wasmachine', 'Vaatwasser']
    },
    {
      id: `prop-${userId}-2`,
      landlord_id: userId,
      title: 'Ruime Woning Utrecht',
      description: 'Karakteristieke 3-kamer woning met tuin in rustige buurt Utrecht.',
      address: 'Oudegracht 456',
      city: 'Utrecht',
      postal_code: '3511 AB',
      price: 1650.00,
      bedrooms: 3,
      bathrooms: 2,
      area: 95.0,
      property_type: 'house',
      status: 'available',
      features: ['Tuin', 'Parkeerplaats', 'Huisdieren toegestaan']
    }
  ];
  
  for (const property of properties) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/properties`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(property)
    });
    
    if (response.ok) {
      console.log(`✅ Property created: ${property.title}`);
    } else {
      const error = await response.text();
      console.log(`⚠️ Property creation failed: ${error}`);
    }
  }
}

async function createBeoordelaarData(userId, user) {
  console.log('📋 Creating Beoordelaar-specific data...');
  
  // Create sample notifications for document reviews
  const notifications = [
    {
      id: `notif-${userId}-1`,
      user_id: userId,
      type: 'document_review',
      title: 'Nieuwe documenten ter beoordeling',
      message: '3 nieuwe documenten wachten op uw beoordeling.',
      read: false,
      created_at: new Date().toISOString()
    },
    {
      id: `notif-${userId}-2`,
      user_id: userId,
      type: 'system',
      title: 'Beoordelingsrichtlijnen bijgewerkt',
      message: 'De richtlijnen voor documentbeoordeling zijn bijgewerkt. Bekijk de nieuwe versie.',
      read: false,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  for (const notification of notifications) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(notification)
    });
    
    if (response.ok) {
      console.log(`✅ Notification created: ${notification.title}`);
    } else {
      const error = await response.text();
      console.log(`⚠️ Notification creation failed: ${error}`);
    }
  }
}

async function createBeheerderData(userId, user) {
  console.log('⚙️ Creating Beheerder-specific data...');
  
  // Create audit log entries
  const auditLogs = [
    {
      user_id: userId,
      action: 'USER_CREATED',
      table_name: 'profiles',
      record_id: userId,
      new_values: JSON.stringify({
        role: 'Beheerder',
        action: 'System administrator account created'
      }),
      created_at: new Date().toISOString()
    },
    {
      user_id: userId,
      action: 'SYSTEM_MAINTENANCE',
      table_name: 'system',
      record_id: 'maintenance-001',
      new_values: JSON.stringify({
        type: 'Database optimization',
        status: 'completed'
      }),
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  for (const log of auditLogs) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/audit_logs`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(log)
    });
    
    if (response.ok) {
      console.log(`✅ Audit log created: ${log.action}`);
    } else {
      const error = await response.text();
      console.log(`⚠️ Audit log creation failed: ${error}`);
    }
  }
  
  // Create admin notifications
  const adminNotifications = [
    {
      id: `notif-${userId}-admin-1`,
      user_id: userId,
      type: 'system_alert',
      title: 'Systeem Status Update',
      message: 'Alle systemen operationeel. Database performance optimaal.',
      read: false,
      created_at: new Date().toISOString()
    }
  ];
  
  for (const notification of adminNotifications) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(notification)
    });
    
    if (response.ok) {
      console.log(`✅ Admin notification created: ${notification.title}`);
    }
  }
}

async function verifyUsers() {
  const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*,user_roles(*)`, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (verifyResponse.ok) {
    const profiles = await verifyResponse.json();
    console.log(`✅ Verification: ${profiles.length} users found`);
    profiles.forEach(profile => {
      const role = profile.user_roles?.[0]?.role || 'No role';
      console.log(`   - ${profile.first_name} ${profile.last_name}: ${role}`);
    });
  }
}

// Run the user creation
createRealisticUsers();
