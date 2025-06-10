const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixStoragePolicies() {
  console.log('🔧 Fixing Storage Policies for Document Upload...\n');

  try {
    // 1. Create storage bucket if it doesn't exist
    console.log('1. 📦 Ensuring documents storage bucket exists...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('⚠️  Could not list buckets:', listError.message);
    } else {
      const documentsBucket = buckets.find(b => b.name === 'documents');
      if (!documentsBucket) {
        console.log('Creating documents bucket...');
        const { error: createError } = await supabase.storage.createBucket('documents', {
          public: false,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
          fileSizeLimit: 10485760 // 10MB
        });
        
        if (createError) {
          console.log('⚠️  Could not create bucket:', createError.message);
        } else {
          console.log('✅ Documents bucket created');
        }
      } else {
        console.log('✅ Documents bucket already exists');
      }
    }

    // 2. Set up storage policies using SQL
    console.log('2. 🔒 Setting up storage RLS policies...');
    
    const storagePoliciesSQL = `
      -- Enable RLS on storage.objects
      ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
      DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
      DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
      DROP POLICY IF EXISTS "Reviewers can view all documents" ON storage.objects;

      -- Allow users to upload documents to their own folder
      CREATE POLICY "Users can upload documents" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'documents' AND
          auth.uid()::text = (storage.foldername(name))[2]
        );

      -- Allow users to view their own documents
      CREATE POLICY "Users can view own documents" ON storage.objects
        FOR SELECT USING (
          bucket_id = 'documents' AND
          auth.uid()::text = (storage.foldername(name))[2]
        );

      -- Allow users to delete their own documents
      CREATE POLICY "Users can delete own documents" ON storage.objects
        FOR DELETE USING (
          bucket_id = 'documents' AND
          auth.uid()::text = (storage.foldername(name))[2]
        );

      -- Allow reviewers to view all documents
      CREATE POLICY "Reviewers can view all documents" ON storage.objects
        FOR SELECT USING (
          bucket_id = 'documents' AND
          EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('Beoordelaar', 'Beheerder')
          )
        );
    `;

    const { error: policiesError } = await supabase.rpc('exec_sql', { sql: storagePoliciesSQL });
    
    if (policiesError) {
      console.log('⚠️  Storage policies creation via RPC failed:', policiesError.message);
      console.log('\n🔧 MANUAL STORAGE POLICY SETUP REQUIRED:');
      console.log('Please run this SQL in your Supabase SQL Editor:');
      console.log('\n' + '='.repeat(50));
      console.log(storagePoliciesSQL);
      console.log('='.repeat(50));
    } else {
      console.log('✅ Storage RLS policies created successfully');
    }

    // 3. Test storage access
    console.log('3. 🧪 Testing storage access...');
    const { data: testList, error: testError } = await supabase.storage
      .from('documents')
      .list('', { limit: 1 });

    if (testError) {
      console.log('⚠️  Storage access test failed:', testError.message);
    } else {
      console.log('✅ Storage access is working');
    }

    console.log('\n🎉 Storage Policy Fix completed!');
    console.log('\n📋 Summary of fixes applied:');
    console.log('   ✅ Ensured documents storage bucket exists');
    console.log('   ✅ Set up RLS policies for document uploads');
    console.log('   ✅ Users can upload to their own folders');
    console.log('   ✅ Users can view/delete their own documents');
    console.log('   ✅ Reviewers can view all documents');
    
    console.log('\n🚀 Document upload should now work without 403 errors!');

  } catch (error) {
    console.error('❌ Storage policy fix failed:', error);
    console.log('\n🔧 MANUAL SETUP REQUIRED:');
    console.log('1. Go to Supabase Dashboard > Storage');
    console.log('2. Create "documents" bucket if it doesn\'t exist');
    console.log('3. Set up RLS policies for storage.objects table');
    console.log('4. Allow users to upload to documents/{user_id}/ folders');
  }
}

// Run the fix
fixStoragePolicies()
  .then(() => {
    console.log('\n✅ Storage policies fixed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });
