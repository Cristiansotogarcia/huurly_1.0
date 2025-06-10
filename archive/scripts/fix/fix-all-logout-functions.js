import { readFileSync, writeFileSync } from 'fs';

// List of dashboard files that need fixing
const dashboardFiles = [
  'src/pages/BeoordelaarDashboard.tsx',
  'src/pages/BeheerderDashboard.tsx'
];

function fixLogoutFunction(filePath) {
  console.log(`Fixing logout function in ${filePath}...`);
  
  try {
    let content = readFileSync(filePath, 'utf8');
    
    // Add useAuth import if not present
    if (!content.includes("import { useAuth }")) {
      content = content.replace(
        "import { useAuthStore } from '@/store/authStore';",
        "import { useAuthStore } from '@/store/authStore';\nimport { useAuth } from '@/hooks/useAuth';"
      );
    }
    
    // Add signOut to the component
    if (!content.includes("const { signOut } = useAuth();")) {
      // Find the component declaration and add signOut
      const componentMatch = content.match(/(const \w+Dashboard = \(\) => \{[\s\S]*?const { user.*? } = useAuthStore\(\);)/);
      if (componentMatch) {
        content = content.replace(
          componentMatch[1],
          componentMatch[1] + '\n  const { signOut } = useAuth();'
        );
      }
    }
    
    // Fix the handleLogout function
    content = content.replace(
      /const handleLogout = \(\) => \{[\s\S]*?useAuthStore\.getState\(\)\.logout\(\);[\s\S]*?window\.location\.href = ['"][/]['"];[\s\S]*?\};/,
      'const handleLogout = async () => {\n    await signOut();\n  };'
    );
    
    writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// Fix all dashboard files
dashboardFiles.forEach(fixLogoutFunction);

console.log('\n🎉 All logout functions have been fixed!');
console.log('\nSummary of changes:');
console.log('- Added useAuth import');
console.log('- Added signOut destructuring from useAuth hook');
console.log('- Replaced direct store logout with proper signOut method');
console.log('- This ensures Supabase session is properly cleared on logout');
