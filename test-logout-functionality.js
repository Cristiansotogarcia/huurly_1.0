import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testLogoutFunctionality() {
  console.log('🧪 TESTING LOGOUT FUNCTIONALITY\n');
  console.log('=====================================\n');

  try {
    // Test 1: Check if we can get current session
    console.log('1. 🔍 Checking current Supabase session...\n');
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('   ❌ Error getting session:', sessionError);
    } else {
      console.log('   ✅ Session check successful');
      console.log('   📋 Current session:', session ? 'Active session found' : 'No active session');
    }

    // Test 2: Test signOut functionality
    console.log('\n2. 🔧 Testing signOut functionality...\n');
    
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.error('   ❌ SignOut error:', signOutError);
    } else {
      console.log('   ✅ SignOut successful');
    }

    // Test 3: Verify session is cleared
    console.log('\n3. ✅ Verifying session is cleared...\n');
    
    const { data: { session: afterSession }, error: afterError } = await supabase.auth.getSession();
    
    if (afterError) {
      console.error('   ❌ Error checking session after logout:', afterError);
    } else {
      console.log('   ✅ Session check after logout successful');
      console.log('   📋 Session after logout:', afterSession ? 'Session still exists (ERROR)' : 'No session (CORRECT)');
    }

    console.log('\n=====================================');
    console.log('🎯 LOGOUT TEST COMPLETE\n');

    console.log('💡 DEBUGGING SUGGESTIONS:');
    console.log('1. Check browser console for JavaScript errors');
    console.log('2. Verify useAuth hook is properly imported');
    console.log('3. Check if signOut function is being called');
    console.log('4. Test with browser dev tools network tab');
    console.log('5. Add console.log in handleLogout function');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testLogoutFunctionality().catch(console.error);
