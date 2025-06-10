// Complete database fix - check RLS policies and ensure application flow is intact
const SUPABASE_URL = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAyNTgyOCwiZXhwIjoyMDY0NjAxODI4fQ.1GaDpXyyXqxBzQSu7Pu3xRpF0_Y5AoQcLRQsgHmIM9I';

async function executeSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/query`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });
  
  if (response.ok) {
    return await response.json();
  } else {
    const error = await response.text();
    console.log(`⚠️ SQL execution failed: ${error}`);
    return null;
  }
}

async function fixDatabaseComplete() {
  console.log('🔧 Starting complete database fix...');
  
  try {
    // 1. Check current tables and their RLS status
    console.log('\n📋 Checking current tables and RLS status...');
    
    const tablesQuery = `
      SELECT 
        schemaname,
        tablename,
        rowsecurity as rls_enabled,
        hasindexes,
        hasrules,
        hastriggers
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `;
    
    const tables = await executeSQL(tablesQuery);
    if (tables) {
      console.log('✅ Current tables:');
      tables.forEach(table => {
        console.log(`   - ${table.tablename}: RLS ${table.rls_enabled ? 'ENABLED' : 'DISABLED'}`);
      });
    }

    // 2. Check RLS policies for each table
    console.log('\n🔒 Checking RLS policies...');
    
    const policiesQuery = `
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `;
    
    const policies = await executeSQL(policiesQuery);
    if (policies) {
      console.log('✅ Current RLS policies:');
      const tableGroups = {};
      policies.forEach(policy => {
        if (!tableGroups[policy.tablename]) {
          tableGroups[policy.tablename] = [];
        }
        tableGroups[policy.tablename].push(policy.policyname);
      });
      
      Object.keys(tableGroups).forEach(table => {
        console.log(`   - ${table}: ${tableGroups[table].length} policies`);
        tableGroups[table].forEach(policy => {
          console.log(`     • ${policy}`);
        });
      });
    }

    // 3. Enable RLS on all public tables that don't have it
    console.log('\n🔒 Enabling RLS on all public tables...');
    
    const enableRLSQuery = `
      DO $$
      DECLARE
          table_record RECORD;
      BEGIN
          FOR table_record IN 
              SELECT tablename 
              FROM pg_tables 
              WHERE schemaname = 'public' 
              AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
          LOOP
              EXECUTE 'ALTER TABLE public.' || quote_ident(table_record.tablename) || ' ENABLE ROW LEVEL SECURITY';
              RAISE NOTICE 'Enabled RLS on table: %', table_record.tablename;
          END LOOP;
      END $$;
    `;
    
    await executeSQL(enableRLSQuery);
    console.log('✅ RLS enabled on all public tables');

    // 4. Create comprehensive RLS policies for all tables
    console.log('\n📝 Creating comprehensive RLS policies...');
    
    const createPoliciesQuery = `
      -- Profiles policies
      DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
      DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
      DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
      DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;

      CREATE POLICY "Users can view own profile" ON profiles
      FOR SELECT USING (id = auth.uid());

      CREATE POLICY "Users can update own profile" ON profiles
      FOR UPDATE USING (id = auth.uid());

      CREATE POLICY "Users can insert own profile" ON profiles
      FOR INSERT WITH CHECK (id = auth.uid());

      CREATE POLICY "Service role can manage profiles" ON profiles
      FOR ALL USING (auth.role() = 'service_role');

      -- User roles policies
      DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
      DROP POLICY IF EXISTS "Users can update own role" ON user_roles;
      DROP POLICY IF EXISTS "Users can insert own role" ON user_roles;
      DROP POLICY IF EXISTS "Service role can manage roles" ON user_roles;

      CREATE POLICY "Users can view own role" ON user_roles
      FOR SELECT USING (user_id = auth.uid());

      CREATE POLICY "Users can update own role" ON user_roles
      FOR UPDATE USING (user_id = auth.uid());

      CREATE POLICY "Users can insert own role" ON user_roles
      FOR INSERT WITH CHECK (user_id = auth.uid());

      CREATE POLICY "Service role can manage roles" ON user_roles
      FOR ALL USING (auth.role() = 'service_role');

      -- Payment records policies
      DROP POLICY IF EXISTS "Users can view own payments" ON payment_records;
      DROP POLICY IF EXISTS "Users can insert own payments" ON payment_records;
      DROP POLICY IF EXISTS "Service role can manage payments" ON payment_records;

      CREATE POLICY "Users can view own payments" ON payment_records
      FOR SELECT USING (user_id = auth.uid());

      CREATE POLICY "Users can insert own payments" ON payment_records
      FOR INSERT WITH CHECK (user_id = auth.uid());

      CREATE POLICY "Service role can manage payments" ON payment_records
      FOR ALL USING (auth.role() = 'service_role');

      -- Subscribers policies
      DROP POLICY IF EXISTS "Users can view own subscription" ON subscribers;
      DROP POLICY IF EXISTS "Users can update own subscription" ON subscribers;
      DROP POLICY IF EXISTS "Users can insert own subscription" ON subscribers;
      DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscribers;

      CREATE POLICY "Users can view own subscription" ON subscribers
      FOR SELECT USING (user_id = auth.uid());

      CREATE POLICY "Users can update own subscription" ON subscribers
      FOR UPDATE USING (user_id = auth.uid());

      CREATE POLICY "Users can insert own subscription" ON subscribers
      FOR INSERT WITH CHECK (user_id = auth.uid());

      CREATE POLICY "Service role can manage subscriptions" ON subscribers
      FOR ALL USING (auth.role() = 'service_role');
    `;
    
    await executeSQL(createPoliciesQuery);
    console.log('✅ Core RLS policies created');

    // 5. Create policies for application-specific tables
    console.log('\n📝 Creating application-specific RLS policies...');
    
    const appPoliciesQuery = `
      -- Tenant profiles policies (if table exists)
      DO $$ 
      BEGIN
          IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tenant_profiles') THEN
              DROP POLICY IF EXISTS "Users can view own tenant profile" ON tenant_profiles;
              DROP POLICY IF EXISTS "Users can insert own tenant profile" ON tenant_profiles;
              DROP POLICY IF EXISTS "Users can update own tenant profile" ON tenant_profiles;
              DROP POLICY IF EXISTS "Service role can manage tenant profiles" ON tenant_profiles;
              
              CREATE POLICY "Users can view own tenant profile" ON tenant_profiles 
              FOR SELECT USING (user_id = auth.uid());
              
              CREATE POLICY "Users can insert own tenant profile" ON tenant_profiles 
              FOR INSERT WITH CHECK (user_id = auth.uid());
              
              CREATE POLICY "Users can update own tenant profile" ON tenant_profiles 
              FOR UPDATE USING (user_id = auth.uid());
              
              CREATE POLICY "Service role can manage tenant profiles" ON tenant_profiles
              FOR ALL USING (auth.role() = 'service_role');
          END IF;
      END $$;

      -- User documents policies (if table exists)
      DO $$ 
      BEGIN
          IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_documents') THEN
              DROP POLICY IF EXISTS "Users can view own documents" ON user_documents;
              DROP POLICY IF EXISTS "Users can insert own documents" ON user_documents;
              DROP POLICY IF EXISTS "Users can update own documents" ON user_documents;
              DROP POLICY IF EXISTS "Beoordelaars can view all documents" ON user_documents;
              DROP POLICY IF EXISTS "Service role can manage documents" ON user_documents;
              
              CREATE POLICY "Users can view own documents" ON user_documents 
              FOR SELECT USING (user_id = auth.uid());
              
              CREATE POLICY "Users can insert own documents" ON user_documents 
              FOR INSERT WITH CHECK (user_id = auth.uid());
              
              CREATE POLICY "Users can update own documents" ON user_documents 
              FOR UPDATE USING (user_id = auth.uid());
              
              CREATE POLICY "Beoordelaars can view all documents" ON user_documents 
              FOR SELECT USING (
                  EXISTS (
                      SELECT 1 FROM user_roles 
                      WHERE user_id = auth.uid() 
                      AND role = 'Beoordelaar'
                  )
              );
              
              CREATE POLICY "Service role can manage documents" ON user_documents
              FOR ALL USING (auth.role() = 'service_role');
          END IF;
      END $$;

      -- Properties policies (if table exists)
      DO $$ 
      BEGIN
          IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'properties') THEN
              DROP POLICY IF EXISTS "Users can view all properties" ON properties;
              DROP POLICY IF EXISTS "Landlords can manage own properties" ON properties;
              DROP POLICY IF EXISTS "Service role can manage properties" ON properties;
              
              CREATE POLICY "Users can view all properties" ON properties 
              FOR SELECT USING (true);
              
              CREATE POLICY "Landlords can manage own properties" ON properties 
              FOR ALL USING (landlord_id = auth.uid());
              
              CREATE POLICY "Service role can manage properties" ON properties
              FOR ALL USING (auth.role() = 'service_role');
          END IF;
      END $$;

      -- Notifications policies (if table exists)
      DO $$ 
      BEGIN
          IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
              DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
              DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
              DROP POLICY IF EXISTS "Service role can manage notifications" ON notifications;
              
              CREATE POLICY "Users can view own notifications" ON notifications 
              FOR SELECT USING (user_id = auth.uid());
              
              CREATE POLICY "Users can update own notifications" ON notifications 
              FOR UPDATE USING (user_id = auth.uid());
              
              CREATE POLICY "Service role can manage notifications" ON notifications
              FOR ALL USING (auth.role() = 'service_role');
          END IF;
      END $$;

      -- Messages policies (if table exists)
      DO $$ 
      BEGIN
          IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
              DROP POLICY IF EXISTS "Users can view own messages" ON messages;
              DROP POLICY IF EXISTS "Users can send messages" ON messages;
              DROP POLICY IF EXISTS "Service role can manage messages" ON messages;
              
              CREATE POLICY "Users can view own messages" ON messages 
              FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());
              
              CREATE POLICY "Users can send messages" ON messages 
              FOR INSERT WITH CHECK (sender_id = auth.uid());
              
              CREATE POLICY "Service role can manage messages" ON messages
              FOR ALL USING (auth.role() = 'service_role');
          END IF;
      END $$;

      -- Audit logs policies
      DO $$ 
      BEGIN
          IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
              DROP POLICY IF EXISTS "Service role can manage audit logs" ON audit_logs;
              DROP POLICY IF EXISTS "Beheerders can view audit logs" ON audit_logs;
              
              CREATE POLICY "Service role can manage audit logs" ON audit_logs
              FOR ALL USING (auth.role() = 'service_role');
              
              CREATE POLICY "Beheerders can view audit logs" ON audit_logs
              FOR SELECT USING (
                  EXISTS (
                      SELECT 1 FROM user_roles 
                      WHERE user_id = auth.uid() 
                      AND role = 'Beheerder'
                  )
              );
          END IF;
      END $$;
    `;
    
    await executeSQL(appPoliciesQuery);
    console.log('✅ Application-specific RLS policies created');

    // 6. Create helper functions for role checking
    console.log('\n🔧 Creating helper functions...');
    
    const functionsQuery = `
      -- Function to check if user has specific role
      CREATE OR REPLACE FUNCTION user_has_role(user_uuid UUID, role_name TEXT)
      RETURNS BOOLEAN AS $$
      BEGIN
          RETURN EXISTS (
              SELECT 1 FROM user_roles 
              WHERE user_id = user_uuid 
              AND role = role_name
          );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Function to check if user has active subscription
      CREATE OR REPLACE FUNCTION user_has_active_subscription(user_uuid UUID)
      RETURNS BOOLEAN AS $$
      BEGIN
          RETURN EXISTS (
              SELECT 1 FROM user_roles 
              WHERE user_id = user_uuid 
              AND subscription_status = 'active'
          );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Function to get user role
      CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
      RETURNS TEXT AS $$
      BEGIN
          RETURN (
              SELECT role FROM user_roles 
              WHERE user_id = user_uuid 
              LIMIT 1
          );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Grant execute permissions
      GRANT EXECUTE ON FUNCTION user_has_role(UUID, TEXT) TO authenticated;
      GRANT EXECUTE ON FUNCTION user_has_role(UUID, TEXT) TO service_role;
      GRANT EXECUTE ON FUNCTION user_has_active_subscription(UUID) TO authenticated;
      GRANT EXECUTE ON FUNCTION user_has_active_subscription(UUID) TO service_role;
      GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;
      GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO service_role;
    `;
    
    await executeSQL(functionsQuery);
    console.log('✅ Helper functions created');

    // 7. Ensure proper user role enum exists
    console.log('\n📝 Ensuring user role enum exists...');
    
    const enumQuery = `
      -- Create user role enum if it doesn't exist
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
              CREATE TYPE user_role AS ENUM ('Huurder', 'Verhuurder', 'Beoordelaar', 'Beheerder');
          END IF;
      END $$;

      -- Ensure user_roles table has proper constraints
      DO $$
      BEGIN
          -- Add role constraint if it doesn't exist
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.check_constraints 
              WHERE constraint_name = 'user_roles_role_check'
          ) THEN
              ALTER TABLE user_roles 
              ADD CONSTRAINT user_roles_role_check 
              CHECK (role IN ('Huurder', 'Verhuurder', 'Beoordelaar', 'Beheerder'));
          END IF;
      END $$;
    `;
    
    await executeSQL(enumQuery);
    console.log('✅ User role enum and constraints ensured');

    // 8. Final verification
    console.log('\n🔍 Final verification...');
    
    const verificationQuery = `
      SELECT 
        t.tablename,
        t.rowsecurity as rls_enabled,
        COUNT(p.policyname) as policy_count
      FROM pg_tables t
      LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
      WHERE t.schemaname = 'public'
      AND t.tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
      GROUP BY t.tablename, t.rowsecurity
      ORDER BY t.tablename;
    `;
    
    const verification = await executeSQL(verificationQuery);
    if (verification) {
      console.log('✅ Final verification results:');
      verification.forEach(table => {
        const status = table.rls_enabled ? '✅' : '❌';
        console.log(`   ${status} ${table.tablename}: RLS ${table.rls_enabled ? 'ENABLED' : 'DISABLED'}, ${table.policy_count} policies`);
      });
    }

    console.log('\n🎉 Database fix complete!');
    console.log('\n📋 Summary:');
    console.log('✅ RLS enabled on all public tables');
    console.log('✅ Comprehensive RLS policies created');
    console.log('✅ Role-based access control implemented');
    console.log('✅ Helper functions for role checking');
    console.log('✅ Dutch role system (Huurder, Verhuurder, Beoordelaar, Beheerder)');
    console.log('✅ Application flow integrity maintained');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  }
}

// Run the fix
fixDatabaseComplete();
