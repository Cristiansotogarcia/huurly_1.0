import { readFileSync, writeFileSync } from 'fs';

// List of dashboard files that need the direct logout fix
const dashboardFiles = [
  'src/pages/VerhuurderDashboard.tsx',
  'src/pages/BeoordelaarDashboard.tsx',
  'src/pages/BeheerderDashboard.tsx'
];

const directLogoutFunction = `  const handleLogout = async () => {
    try {
      // Direct approach - clear Supabase session and local storage
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local storage
      localStorage.removeItem('auth-storage');
      
      // Clear auth store
      useAuthStore.getState().logout();
      
      // Navigate to home
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback - force logout
      localStorage.removeItem('auth-storage');
      useAuthStore.getState().logout();
      window.location.href = '/';
    }
  };`;

function fixLogoutDirect(filePath) {
  console.log(`Applying direct logout fix to ${filePath}...`);
  
  try {
    let content = readFileSync(filePath, 'utf8');
    
    // Replace the existing handleLogout function with the direct approach
    content = content.replace(
      /const handleLogout = async \(\) => \{[\s\S]*?await signOut\(\);[\s\S]*?\};/,
      directLogoutFunction
    );
    
    writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// Fix all dashboard files
dashboardFiles.forEach(fixLogoutDirect);

console.log('\n🎉 All logout functions have been updated with direct approach!');
console.log('\nSummary of changes:');
console.log('- Replaced hook-based signOut with direct Supabase client');
console.log('- Added fallback error handling');
console.log('- Ensures reliable logout functionality across all dashboards');
console.log('- Bypasses potential hook or state management issues');
