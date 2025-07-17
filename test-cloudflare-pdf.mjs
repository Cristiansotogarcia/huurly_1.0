import { config } from 'dotenv';

// Load environment variables
config();

async function testCloudflarePDFUpload() {
  console.log('=== Testing Cloudflare R2 Upload with PDF ===');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !anonKey) {
    console.error('❌ Missing Supabase configuration. Please check your .env file.');
    process.exit(1);
  }
  
  try {
    // Create a simple PDF content
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Hello from Cloudflare R2 PDF test!) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000178 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
270
%%EOF`;
    
    const testFile = new Blob([pdfContent], { type: 'application/pdf' });
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', testFile, 'test-upload.pdf');
    formData.append('userId', 'test-user-123');
    formData.append('folder', 'test-uploads');
    
    console.log('Uploading test PDF...');
    console.log('File size:', testFile.size, 'bytes');
    console.log('File type:', testFile.type);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/cloudflare-r2-upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`
      },
      body: formData
    });
    
    const result = await response.json();
    console.log('Upload Response:', response.status, result);
    
    if (response.ok && result.success) {
      console.log('\n✅ Upload successful!');
      console.log('File URL:', result.url);
      console.log('File Path:', result.path);
      
      // Test if the file is accessible
      console.log('\nTesting file accessibility...');
      const fileResponse = await fetch(result.url);
      console.log('File access:', fileResponse.status, fileResponse.ok ? '✅ Accessible' : '❌ Not accessible');
      
      if (fileResponse.ok) {
        console.log('✅ PDF file is successfully uploaded and accessible!');
      }
    } else {
      console.log('\n❌ Upload failed:', result.error);
    }
    
  } catch (error) {
    console.error('Error testing upload:', error);
  }
}

testCloudflarePDFUpload();
