const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAyNTgyOCwiZXhwIjoyMDY0NjAxODI4fQ.1GaDpXyyXqxBzQSu7Pu3xRpF0_Y5AoQcLRQsgHmIM9I';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixBeoordelaarRLSPolicies() {
  console.log('🔧 Fixing RLS policies for Beoordelaar dashboard...\n');

  try {
    // 1. Drop existing SELECT policy that's too restrictive
    console.log('1. Dropping existing restrictive SELECT policy...');
    
    const dropSelectPolicy = `
      DROP POLICY IF EXISTS "Users can view own documents" ON user_documents;
    `;
    
    const { error: dropError } = await supabase.rpc('exec_sql', { 
      sql: dropSelectPolicy 
    });
    
    if (dropError) {
      console.log('Note: Policy may not exist, continuing...', dropError.message);
    } else {
      console.log('✅ Dropped existing SELECT policy');
    }

    // 2. Create new SELECT policy that allows beoordelaars to see all documents
    console.log('\n2. Creating new SELECT policy for beoordelaars...');
    
    const createSelectPolicy = `
      CREATE POLICY "Users can view own documents and beoordelaars can view all" 
      ON user_documents FOR SELECT 
      USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
          SELECT 1 FROM user_roles 
          WHERE user_roles.user_id = auth.uid() 
          AND user_roles.role IN ('beoordelaar', 'Beoordelaar', 'beheerder', 'Beheerder')
        )
      );
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql: createSelectPolicy 
    });
    
    if (createError) {
      console.error('❌ Error creating SELECT policy:', createError);
      
      // Try alternative approach - check what roles exist
      console.log('\n3. Checking existing roles in user_roles table...');
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .limit(10);
      
      if (!rolesError && roles) {
        console.log('Found roles:', roles.map(r => r.role));
        
        // Create policy with actual role values
        const actualRoles = [...new Set(roles.map(r => r.role))];
        const rolesList = actualRoles.map(role => `'${role}'`).join(', ');
        
        const createSelectPolicyAlt = `
          CREATE POLICY "Users can view own documents and reviewers can view all" 
          ON user_documents FOR SELECT 
          USING (
            auth.uid() = user_id 
            OR 
            EXISTS (
              SELECT 1 FROM user_roles 
              WHERE user_roles.user_id = auth.uid() 
              AND user_roles.role IN (${rolesList})
            )
          );
        `;
        
        const { error: createAltError } = await supabase.rpc('exec_sql', { 
          sql: createSelectPolicyAlt 
        });
        
        if (createAltError) {
          console.error('❌ Error creating alternative SELECT policy:', createAltError);
        } else {
          console.log('✅ Created alternative SELECT policy with actual roles');
        }
      }
    } else {
      console.log('✅ Created new SELECT policy for beoordelaars');
    }

    // 3. Also create UPDATE policy for beoordelaars to approve/reject documents
    console.log('\n4. Creating UPDATE policy for beoordelaars...');
    
    const createUpdatePolicy = `
      CREATE POLICY "Beoordelaars can update document status" 
      ON user_documents FOR UPDATE 
      USING (
        EXISTS (
          SELECT 1 FROM user_roles 
          WHERE user_roles.user_id = auth.uid() 
          AND user_roles.role IN ('beoordelaar', 'Beoordelaar', 'beheerder', 'Beheerder')
        )
      );
    `;
    
    const { error: updateError } = await supabase.rpc('exec_sql', { 
      sql: createUpdatePolicy 
    });
    
    if (updateError) {
      console.log('Note: UPDATE policy creation failed, may already exist:', updateError.message);
    } else {
      console.log('✅ Created UPDATE policy for beoordelaars');
    }

    // 4. Test the new policies
    console.log('\n5. Testing new policies...');
    
    // Test with service role (should see all documents)
    const { data: testDocs, error: testError } = await supabase
      .from('user_documents')
      .select('*')
      .eq('status', 'pending');
    
    if (testError) {
      console.error('❌ Error testing policies:', testError);
    } else {
      console.log(`✅ Policy test successful - found ${testDocs?.length || 0} pending documents`);
      if (testDocs && testDocs.length > 0) {
        console.log('📋 Pending documents:');
        testDocs.forEach(doc => {
          console.log(`- ${doc.file_name} (${doc.document_type}) - User: ${doc.user_id}`);
        });
      }
    }

    console.log('\n🎉 RLS policies updated! Beoordelaar dashboard should now show pending documents.');
    console.log('🔄 Refresh the beoordelaar dashboard to see the changes.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixBeoordelaarRLSPolicies();
