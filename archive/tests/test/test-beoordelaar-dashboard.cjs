const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1MDcyNzEsImV4cCI6MjA0OTA4MzI3MX0.tJcTrHjOiuOjmIbVKNmqWqpNdWbHWbmWJGHWbmWJGHW';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBeoordelaarDashboard() {
  console.log('🔍 Testing Beoordelaar Dashboard Data...\n');

  try {
    // 1. Check if user_documents table exists and has data
    console.log('1. Checking user_documents table...');
    const { data: allDocuments, error: allDocsError } = await supabase
      .from('user_documents')
      .select('*');

    if (allDocsError) {
      console.error('❌ Error accessing user_documents:', allDocsError);
      return;
    }

    console.log(`✅ Total documents in database: ${allDocuments?.length || 0}`);
    
    if (allDocuments && allDocuments.length > 0) {
      console.log('📄 Document statuses:');
      const statusCounts = allDocuments.reduce((acc, doc) => {
        acc[doc.status] = (acc[doc.status] || 0) + 1;
        return acc;
      }, {});
      console.log(statusCounts);
      
      console.log('\n📋 Sample documents:');
      allDocuments.slice(0, 3).forEach(doc => {
        console.log(`- ${doc.file_name} (${doc.document_type}) - Status: ${doc.status} - User: ${doc.user_id}`);
      });
    }

    // 2. Check specifically for pending documents
    console.log('\n2. Checking pending documents...');
    const { data: pendingDocs, error: pendingError } = await supabase
      .from('user_documents')
      .select('*')
      .eq('status', 'pending');

    if (pendingError) {
      console.error('❌ Error accessing pending documents:', pendingError);
      return;
    }

    console.log(`✅ Pending documents: ${pendingDocs?.length || 0}`);
    
    if (pendingDocs && pendingDocs.length > 0) {
      console.log('📋 Pending documents:');
      pendingDocs.forEach(doc => {
        console.log(`- ${doc.file_name} (${doc.document_type}) - User: ${doc.user_id} - Created: ${doc.created_at}`);
      });
    } else {
      console.log('ℹ️ No pending documents found. This explains why the dashboard shows empty.');
    }

    // 3. Check if we can access profiles table
    console.log('\n3. Testing profiles table access...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .limit(1);

    if (profilesError) {
      console.error('❌ Error accessing profiles table:', profilesError);
      console.log('ℹ️ This confirms the 406 error - no access to profiles table');
    } else {
      console.log('✅ Profiles table accessible');
    }

    // 4. Check beoordelaar user exists
    console.log('\n4. Checking for beoordelaar users...');
    const { data: users, error: usersError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'beoordelaar');

    if (usersError) {
      console.error('❌ Error accessing user_roles:', usersError);
    } else {
      console.log(`✅ Found ${users?.length || 0} beoordelaar users`);
      if (users && users.length > 0) {
        users.forEach(user => {
          console.log(`- Beoordelaar: ${user.user_id}`);
        });
      }
    }

    // 5. Create a test pending document if none exist
    if (!pendingDocs || pendingDocs.length === 0) {
      console.log('\n5. Creating test pending document...');
      
      // Get a huurder user
      const { data: huurderUsers } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'huurder')
        .limit(1);

      if (huurderUsers && huurderUsers.length > 0) {
        const testDoc = {
          user_id: huurderUsers[0].user_id,
          document_type: 'identity',
          file_name: 'test_identity_document.pdf',
          file_path: 'documents/identity/test/test_file.pdf',
          file_size: 1024000,
          mime_type: 'application/pdf',
          status: 'pending'
        };

        const { data: newDoc, error: createError } = await supabase
          .from('user_documents')
          .insert(testDoc)
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating test document:', createError);
        } else {
          console.log('✅ Created test pending document:', newDoc.id);
          console.log('🔄 Now the beoordelaar dashboard should show 1 pending document');
        }
      } else {
        console.log('❌ No huurder users found to create test document');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testBeoordelaarDashboard();
