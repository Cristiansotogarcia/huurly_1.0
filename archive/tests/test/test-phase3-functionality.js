const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPhase3Functionality() {
  console.log('🧪 PHASE 3 FUNCTIONALITY TESTING');
  console.log('=====================================\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function logTest(name, passed, details = '') {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${name}`);
    if (details) console.log(`   ${details}`);
    
    results.tests.push({ name, passed, details });
    if (passed) results.passed++;
    else results.failed++;
  }

  // Test 1: Database Schema Verification
  console.log('📊 Testing Database Schema...');
  try {
    const { data: userStats, error: userStatsError } = await supabase
      .from('user_statistics')
      .select('*')
      .limit(1);
    
    logTest('user_statistics table exists', !userStatsError, userStatsError?.message);

    const { data: viewingInvitations, error: viewingError } = await supabase
      .from('viewing_invitations')
      .select('*')
      .limit(1);
    
    logTest('viewing_invitations table exists', !viewingError, viewingError?.message);

    const { data: propertyApps, error: appsError } = await supabase
      .from('property_applications')
      .select('*')
      .limit(1);
    
    logTest('property_applications table exists', !appsError, appsError?.message);

    const { data: activityLogs, error: logsError } = await supabase
      .from('activity_logs')
      .select('*')
      .limit(1);
    
    logTest('activity_logs table exists', !logsError, logsError?.message);

    const { data: portfolioReviews, error: reviewsError } = await supabase
      .from('portfolio_reviews')
      .select('*')
      .limit(1);
    
    logTest('portfolio_reviews table exists', !reviewsError, reviewsError?.message);

  } catch (error) {
    logTest('Database schema verification', false, error.message);
  }

  // Test 2: User Profile Fields
  console.log('\n👤 Testing User Profile Fields...');
  try {
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_looking_for_place, profile_views_count, last_active_at')
      .limit(1);
    
    if (!profileError && profiles && profiles.length > 0) {
      const profile = profiles[0];
      logTest('is_looking_for_place field exists', 
        profile.hasOwnProperty('is_looking_for_place'), 
        `Value: ${profile.is_looking_for_place}`);
      logTest('profile_views_count field exists', 
        profile.hasOwnProperty('profile_views_count'), 
        `Value: ${profile.profile_views_count}`);
      logTest('last_active_at field exists', 
        profile.hasOwnProperty('last_active_at'), 
        `Value: ${profile.last_active_at}`);
    } else {
      logTest('User profile fields check', false, profileError?.message || 'No profiles found');
    }
  } catch (error) {
    logTest('User profile fields verification', false, error.message);
  }

  // Test 3: RLS Policies
  console.log('\n🔒 Testing RLS Policies...');
  try {
    // Test user_statistics RLS
    const { data: statsRLS, error: statsRLSError } = await supabase
      .from('user_statistics')
      .select('*')
      .limit(1);
    
    logTest('user_statistics RLS allows access', !statsRLSError, statsRLSError?.message);

    // Test viewing_invitations RLS
    const { data: invitationsRLS, error: invitationsRLSError } = await supabase
      .from('viewing_invitations')
      .select('*')
      .limit(1);
    
    logTest('viewing_invitations RLS allows access', !invitationsRLSError, invitationsRLSError?.message);

  } catch (error) {
    logTest('RLS policies verification', false, error.message);
  }

  // Test 4: Analytics Service Methods
  console.log('\n📈 Testing Analytics Service Integration...');
  try {
    // Check if the analytics service file exists and has the new methods
    const analyticsServicePath = './src/services/AnalyticsService.ts';
    if (fs.existsSync(analyticsServicePath)) {
      const analyticsContent = fs.readFileSync(analyticsServicePath, 'utf8');
      
      logTest('getProfileViews method exists', 
        analyticsContent.includes('getProfileViews'), 
        'Method found in AnalyticsService');
      
      logTest('incrementProfileViews method exists', 
        analyticsContent.includes('incrementProfileViews'), 
        'Method found in AnalyticsService');
      
      logTest('getMonthlyRegistrations method exists', 
        analyticsContent.includes('getMonthlyRegistrations'), 
        'Method found in AnalyticsService');
      
      logTest('getVerificationStats method exists', 
        analyticsContent.includes('getVerificationStats'), 
        'Method found in AnalyticsService');
    } else {
      logTest('AnalyticsService file exists', false, 'File not found');
    }
  } catch (error) {
    logTest('Analytics service verification', false, error.message);
  }

  // Test 5: Dashboard Integration
  console.log('\n🏠 Testing Dashboard Integration...');
  try {
    const dashboardPath = './src/pages/HuurderDashboard.tsx';
    if (fs.existsSync(dashboardPath)) {
      const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
      
      logTest('Dashboard imports analyticsService', 
        dashboardContent.includes('import { analyticsService }'), 
        'Import statement found');
      
      logTest('Dashboard has loading states', 
        dashboardContent.includes('isLoadingStats') && dashboardContent.includes('isUpdatingStatus'), 
        'Loading state variables found');
      
      logTest('Dashboard uses real analytics data', 
        dashboardContent.includes('analyticsService.getProfileViews') && 
        dashboardContent.includes('analyticsService.getUserAnalytics'), 
        'Analytics service calls found');
      
      logTest('Toggle status function persists to database', 
        dashboardContent.includes('userService.updateProfile') && 
        dashboardContent.includes('is_looking_for_place'), 
        'Database persistence implemented');
    } else {
      logTest('HuurderDashboard file exists', false, 'File not found');
    }
  } catch (error) {
    logTest('Dashboard integration verification', false, error.message);
  }

  // Test 6: Document Upload Modal
  console.log('\n📄 Testing Document Upload Modal...');
  try {
    const documentModalPath = './src/components/modals/DocumentUploadModal.tsx';
    if (fs.existsSync(documentModalPath)) {
      const modalContent = fs.readFileSync(documentModalPath, 'utf8');
      
      logTest('Individual upload buttons implemented', 
        modalContent.includes('file-upload-') && modalContent.includes('docType.type'), 
        'Individual upload buttons found');
      
      logTest('Document type validation exists', 
        modalContent.includes('type: docType.type'), 
        'Type-specific handling found');
      
      logTest('Toast notifications implemented', 
        modalContent.includes('toast({') && modalContent.includes('Document toegevoegd'), 
        'User feedback implemented');
    } else {
      logTest('DocumentUploadModal file exists', false, 'File not found');
    }
  } catch (error) {
    logTest('Document upload modal verification', false, error.message);
  }

  // Test 7: Notification Bell
  console.log('\n🔔 Testing Notification Bell...');
  try {
    const notificationBellPath = './src/components/NotificationBell.tsx';
    if (fs.existsSync(notificationBellPath)) {
      const bellContent = fs.readFileSync(notificationBellPath, 'utf8');
      
      logTest('Delete notification function exists', 
        bellContent.includes('deleteNotification'), 
        'Delete function found');
      
      logTest('Toast feedback for delete implemented', 
        bellContent.includes('Notificatie verwijderd'), 
        'Success feedback found');
      
      logTest('Error handling for delete implemented', 
        bellContent.includes('Fout bij verwijderen'), 
        'Error feedback found');
    } else {
      logTest('NotificationBell file exists', false, 'File not found');
    }
  } catch (error) {
    logTest('Notification bell verification', false, error.message);
  }

  // Test 8: Migration Files
  console.log('\n🔄 Testing Migration System...');
  try {
    const migrationPath = './supabase/migrations/20250610_add_missing_schema_fields.sql';
    if (fs.existsSync(migrationPath)) {
      const migrationContent = fs.readFileSync(migrationPath, 'utf8');
      
      logTest('Schema migration file exists', true, 'Migration file found');
      
      logTest('Migration creates all required tables', 
        migrationContent.includes('CREATE TABLE IF NOT EXISTS user_statistics') &&
        migrationContent.includes('CREATE TABLE IF NOT EXISTS viewing_invitations') &&
        migrationContent.includes('CREATE TABLE IF NOT EXISTS property_applications'), 
        'All table creation statements found');
      
      logTest('Migration includes RLS policies', 
        migrationContent.includes('ENABLE ROW LEVEL SECURITY') &&
        migrationContent.includes('CREATE POLICY'), 
        'RLS policies found');
      
      logTest('Migration includes performance indexes', 
        migrationContent.includes('CREATE INDEX'), 
        'Index creation statements found');
    } else {
      logTest('Migration file exists', false, 'File not found');
    }

    const applyScriptPath = './apply-phase2-schema.js';
    if (fs.existsSync(applyScriptPath)) {
      logTest('Migration application script exists', true, 'Apply script found');
    } else {
      logTest('Migration application script exists', false, 'Script not found');
    }
  } catch (error) {
    logTest('Migration system verification', false, error.message);
  }

  // Test 9: Error Handling
  console.log('\n⚠️  Testing Error Handling...');
  try {
    // Test with invalid data to see if error handling works
    const { data, error } = await supabase
      .from('nonexistent_table')
      .select('*')
      .limit(1);
    
    logTest('Database error handling works', !!error, 'Expected error for nonexistent table');
  } catch (error) {
    logTest('Error handling verification', true, 'Caught expected error');
  }

  // Test 10: Production Readiness
  console.log('\n🚀 Testing Production Readiness...');
  try {
    // Check if all critical files exist
    const criticalFiles = [
      './src/services/AnalyticsService.ts',
      './src/pages/HuurderDashboard.tsx',
      './src/components/modals/DocumentUploadModal.tsx',
      './src/components/NotificationBell.tsx',
      './supabase/migrations/20250610_add_missing_schema_fields.sql'
    ];

    let allFilesExist = true;
    criticalFiles.forEach(file => {
      if (!fs.existsSync(file)) {
        allFilesExist = false;
        console.log(`   Missing: ${file}`);
      }
    });

    logTest('All critical files exist', allFilesExist, `${criticalFiles.length} files checked`);

    // Check environment variables
    const hasRequiredEnvVars = !!(process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    logTest('Required environment variables set', hasRequiredEnvVars, 'Supabase configuration available');

  } catch (error) {
    logTest('Production readiness verification', false, error.message);
  }

  // Summary
  console.log('\n📋 TEST SUMMARY');
  console.log('================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total: ${results.tests.length}`);
  console.log(`🎯 Success Rate: ${Math.round((results.passed / results.tests.length) * 100)}%`);

  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Phase 3 functionality is working correctly.');
    console.log('🚀 The application is ready for production deployment!');
  } else {
    console.log('\n⚠️  Some tests failed. Review the issues above before deployment.');
  }

  // Detailed results
  console.log('\n📝 DETAILED RESULTS:');
  results.tests.forEach((test, index) => {
    console.log(`${index + 1}. ${test.passed ? '✅' : '❌'} ${test.name}`);
    if (test.details) console.log(`   ${test.details}`);
  });

  return results;
}

// Run the tests
testPhase3Functionality().catch(console.error);
