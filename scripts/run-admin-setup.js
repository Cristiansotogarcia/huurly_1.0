#!/usr/bin/env node

// Simple Node.js runner for the admin setup script
const { execSync } = require('child_process');
const path = require('path');

// Set environment variables from Supabase secrets
// You'll need to replace these with actual values from your Supabase dashboard
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxaHVsdGl0dnBpdmxubGdvZ2VuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwODE1MiwiZXhwIjoyMDY1Njg0MTUyfQ.PMKx6C6kJGiUzPcdxaWQ6-UoqpQcBa0P6UlT3H_rUUo';

// Set environment variable
process.env.SUPABASE_SERVICE_ROLE_KEY = SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Running Admin Setup Script...\n');

try {
  // Use tsx to run the TypeScript file directly
  execSync('npx tsx scripts/setup-admin-user.ts cristiansotogarcia@gmail.com', { 
    stdio: 'inherit',
    env: { ...process.env }
  });
} catch (error) {
  console.error('❌ Failed to run admin setup script:', error.message);
  
  // Fallback: try with ts-node
  try {
    console.log('\n🔄 Trying with ts-node...\n');
    execSync('npx ts-node scripts/setup-admin-user.ts cristiansotogarcia@gmail.com', { 
      stdio: 'inherit',
      env: { ...process.env }
    });
  } catch (fallbackError) {
    console.error('❌ Fallback also failed:', fallbackError.message);
    console.log('\n💡 Manual setup required. Please check the console logs above.');
  }
}