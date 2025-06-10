const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMjU4MjgsImV4cCI6MjA2NDYwMTgyOH0.3ukJCXs7f1HOO7y7ZgfpnSIalolB1LYbFpRtLd6ZyNE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestPendingDocument() {
  console.log('🔧 Creating test pending document for beoordelaar dashboard...\n');

  try {
    // 1. Find a huurder user (check different role values)
    console.log('1. Looking for huurder users...');
    
    // Try different possible role values
    const roleVariants = ['huurder', 'Huurder', 'tenant'];
    let huurderUsers = null;
    
    for (const roleVariant of roleVariants) {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', roleVariant)
        .limit(1);
      
      if (!error && data && data.length > 0) {
        huurderUsers = data;
        console.log(`✅ Found huurder users with role: "${roleVariant}"`);
        break;
      }
    }

    // If no users found in user_roles, try to get any user from profiles
    if (!huurderUsers || huurderUsers.length === 0) {
      console.log('No users found in user_roles, checking profiles table...');
      const { data: profileUsers, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (!profileError && profileUsers && profileUsers.length > 0) {
        huurderUsers = [{ user_id: profileUsers[0].id }];
        console.log('✅ Found user from profiles table');
      }
    }

    // If still no users, use the known user ID from the error logs
    if (!huurderUsers || huurderUsers.length === 0) {
      console.log('Using known user ID from error logs...');
      huurderUsers = [{ user_id: 'd972aa83-a190-4a57-8ea1-1eb46cc2f4d2' }];
      console.log('✅ Using known user ID');
    }

    if (!huurderUsers || huurderUsers.length === 0) {
      console.log('❌ No users found at all');
      return;
    }

    // 2. Create test pending documents
    console.log('\n2. Creating test pending documents...');
    
    const testDocuments = [
      {
        user_id: huurderUsers[0].user_id,
        document_type: 'identity',
        file_name: 'test_identiteitsbewijs.pdf',
        file_path: 'documents/identity/test/test_identity.pdf',
        file_size: 1024000,
        mime_type: 'application/pdf',
        status: 'pending'
      },
      {
        user_id: huurderUsers[0].user_id,
        document_type: 'payslip',
        file_name: 'test_loonstrook.pdf',
        file_path: 'documents/payslip/test/test_payslip.pdf',
        file_size: 512000,
        mime_type: 'application/pdf',
        status: 'pending'
      },
      {
        user_id: huurderUsers[0].user_id,
        document_type: 'employment_contract',
        file_name: 'test_arbeidscontract.pdf',
        file_path: 'documents/employment/test/test_contract.pdf',
        file_size: 768000,
        mime_type: 'application/pdf',
        status: 'pending'
      }
    ];

    for (const doc of testDocuments) {
      const { data: newDoc, error: createError } = await supabase
        .from('user_documents')
        .insert(doc)
        .select()
        .single();

      if (createError) {
        console.error(`❌ Error creating ${doc.document_type} document:`, createError);
      } else {
        console.log(`✅ Created ${doc.document_type} document: ${newDoc.id}`);
      }
    }

    // 3. Verify documents were created
    console.log('\n3. Verifying created documents...');
    const { data: allDocs, error: verifyError } = await supabase
      .from('user_documents')
      .select('*');

    if (verifyError) {
      console.error('❌ Error verifying documents:', verifyError);
    } else {
      console.log(`✅ Total documents in database: ${allDocs?.length || 0}`);
      
      const pendingDocs = allDocs?.filter(doc => doc.status === 'pending') || [];
      console.log(`✅ Pending documents: ${pendingDocs.length}`);
      
      if (pendingDocs.length > 0) {
        console.log('\n📋 Pending documents created:');
        pendingDocs.forEach(doc => {
          console.log(`- ${doc.file_name} (${doc.document_type}) - User: ${doc.user_id}`);
        });
        
        console.log('\n🎉 SUCCESS! The beoordelaar dashboard should now show pending documents!');
        console.log('🔄 Refresh the beoordelaar dashboard to see the documents.');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createTestPendingDocument();
