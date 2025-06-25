import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

class APITester {
  constructor() {
    this.results = {
      authentication: [],
      profiles: [],
      documents: [],
      properties: [],
      matching: [],
      payments: [],
      notifications: [],
      overall: {
        total_tests: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
    this.testUser = null;
  }

  async runAllTests() {
    console.log('🧪 Starting comprehensive API endpoint testing...\n');
    
    try {
      await this.testAuthentication();
      await this.testProfileManagement();
      await this.testDocumentManagement();
      await this.testPropertyManagement();
      await this.testMatchingSystem();
      await this.testPaymentSystem();
      await this.testNotificationSystem();
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ API testing failed:', error.message);
      process.exit(1);
    }
  }

  async testAuthentication() {
    console.log('🔐 Testing Authentication & Authorization...');
    
    // Test 1: User Registration
    await this.runTest('authentication', 'User Registration', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: `test-${Date.now()}@huurly.test`,
        password: process.env.TEST_USER_PASSWORD || 'TestPassword123!'
      });
      
      if (error) throw new Error(`Registration failed: ${error.message}`);
      if (!data.user) throw new Error('No user data returned');
      
      this.testUser = data.user;
      return { success: true, data: { userId: data.user.id } };
    });

    // Test 2: User Login
    await this.runTest('authentication', 'User Login', async () => {
      if (!this.testUser) throw new Error('No test user available');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: this.testUser.email,
        password: process.env.TEST_USER_PASSWORD || 'TestPassword123!'
      });
      
      if (error) throw new Error(`Login failed: ${error.message}`);
      if (!data.user) throw new Error('No user data returned');
      
      return { success: true, data: { userId: data.user.id } };
    });

    // Test 3: Session Management
    await this.runTest('authentication', 'Session Management', async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw new Error(`Session check failed: ${error.message}`);
      if (!session) throw new Error('No active session found');
      
      return { success: true, data: { sessionId: session.access_token.substring(0, 10) + '...' } };
    });

    // Test 4: Role Assignment
    await this.runTest('authentication', 'Role Assignment', async () => {
      if (!this.testUser) throw new Error('No test user available');
      
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: this.testUser.id,
          role: 'huurder',
          is_active: true
        })
        .select()
        .single();
      
      if (error) throw new Error(`Role assignment failed: ${error.message}`);
      if (!data) throw new Error('No role data returned');
      
      return { success: true, data: { role: data.role } };
    });

    console.log('✅ Authentication tests completed\n');
  }

  async testProfileManagement() {
    console.log('👤 Testing Profile Management...');
    
    // Test 1: Profile Creation
    await this.runTest('profiles', 'Profile Creation', async () => {
      if (!this.testUser) throw new Error('No test user available');
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: this.testUser.id,
          first_name: 'Test',
          last_name: 'User',
          email: this.testUser.email
        })
        .select()
        .single();
      
      if (error) throw new Error(`Profile creation failed: ${error.message}`);
      if (!data) throw new Error('No profile data returned');
      
      return { success: true, data: { profileId: data.id } };
    });

    // Test 2: Tenant Profile Creation
    await this.runTest('profiles', 'Tenant Profile Creation', async () => {
      if (!this.testUser) throw new Error('No test user available');
      
      const { data, error } = await supabase
        .from('tenant_profiles')
        .insert({
          user_id: this.testUser.id,
          first_name: 'Test',
          last_name: 'Tenant',
          age: 25,
          profession: 'Software Developer',
          monthly_income: 3500,
          preferred_location: 'Amsterdam',
          max_rent: 1500,
          is_looking_for_place: true
        })
        .select()
        .single();
      
      if (error) throw new Error(`Tenant profile creation failed: ${error.message}`);
      if (!data) throw new Error('No tenant profile data returned');
      
      return { success: true, data: { tenantProfileId: data.id } };
    });

    // Test 3: Profile Update
    await this.runTest('profiles', 'Profile Update', async () => {
      if (!this.testUser) throw new Error('No test user available');
      
      const { data, error } = await supabase
        .from('tenant_profiles')
        .update({
          bio: 'Updated bio for testing',
          preferred_bedrooms: 2
        })
        .eq('user_id', this.testUser.id)
        .select()
        .single();
      
      if (error) throw new Error(`Profile update failed: ${error.message}`);
      if (!data) throw new Error('No updated profile data returned');
      
      return { success: true, data: { updated: true } };
    });

    // Test 4: Profile Retrieval
    await this.runTest('profiles', 'Profile Retrieval', async () => {
      if (!this.testUser) throw new Error('No test user available');
      
      const { data, error } = await supabase
        .from('tenant_profiles')
        .select('*')
        .eq('user_id', this.testUser.id)
        .single();
      
      if (error) throw new Error(`Profile retrieval failed: ${error.message}`);
      if (!data) throw new Error('No profile data found');
      
      return { success: true, data: { profileExists: true, fields: Object.keys(data).length } };
    });

    console.log('✅ Profile management tests completed\n');
  }

  async testDocumentManagement() {
    console.log('📄 Testing Document Management...');
    
    // Test 1: Document Upload Simulation
    await this.runTest('documents', 'Document Upload', async () => {
      if (!this.testUser) throw new Error('No test user available');
      
      const { data, error } = await supabase
        .from('user_documents')
        .insert({
          user_id: this.testUser.id,
          document_type: 'identity',
          file_name: 'test-id.pdf',
          file_path: '/documents/test-id.pdf',
          file_size: 1024000,
          mime_type: 'application/pdf',
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw new Error(`Document upload failed: ${error.message}`);
      if (!data) throw new Error('No document data returned');
      
      return { success: true, data: { documentId: data.id, status: data.status } };
    });

    // Test 2: Document Status Update
    await this.runTest('documents', 'Document Status Update', async () => {
      if (!this.testUser) throw new Error('No test user available');
      
      const { data, error } = await supabase
        .from('user_documents')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('user_id', this.testUser.id)
        .eq('document_type', 'identity')
        .select()
        .single();
      
      if (error) throw new Error(`Document status update failed: ${error.message}`);
      if (!data) throw new Error('No updated document data returned');
      
      return { success: true, data: { status: data.status } };
    });

    // Test 3: Document Retrieval
    await this.runTest('documents', 'Document Retrieval', async () => {
      if (!this.testUser) throw new Error('No test user available');
      
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', this.testUser.id);
      
      if (error) throw new Error(`Document retrieval failed: ${error.message}`);
      if (!data) throw new Error('No documents found');
      
      return { success: true, data: { documentCount: data.length } };
    });

    console.log('✅ Document management tests completed\n');
  }

  async testPropertyManagement() {
    console.log('🏠 Testing Property Management...');
    
    // Test 1: Property Creation
    await this.runTest('properties', 'Property Creation', async () => {
      if (!this.testUser) throw new Error('No test user available');
      
      const { data, error } = await supabase
        .from('properties')
        .insert({
          landlord_id: this.testUser.id,
          title: 'Test Property',
          description: 'A beautiful test property',
          address: 'Test Street 123',
          city: 'Amsterdam',
          rent_amount: 1200,
          bedrooms: 2,
          status: 'active'
        })
        .select()
        .single();
      
      if (error) throw new Error(`Property creation failed: ${error.message}`);
      if (!data) throw new Error('No property data returned');
      
      return { success: true, data: { propertyId: data.id, title: data.title } };
    });

    // Test 2: Property Search
    await this.runTest('properties', 'Property Search', async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .eq('city', 'Amsterdam')
        .lte('rent_amount', 1500);
      
      if (error) throw new Error(`Property search failed: ${error.message}`);
      
      return { success: true, data: { propertiesFound: data?.length || 0 } };
    });

    // Test 3: Property Update
    await this.runTest('properties', 'Property Update', async () => {
      if (!this.testUser) throw new Error('No test user available');
      
      const { data, error } = await supabase
        .from('properties')
        .update({
          description: 'Updated test property description',
          rent_amount: 1300
        })
        .eq('landlord_id', this.testUser.id)
        .select()
        .single();
      
      if (error) throw new Error(`Property update failed: ${error.message}`);
      if (!data) throw new Error('No updated property data returned');
      
      return { success: true, data: { updated: true, newRent: data.rent_amount } };
    });

    console.log('✅ Property management tests completed\n');
  }

  async testMatchingSystem() {
    console.log('🎯 Testing Matching System...');
    
    // Test 1: Property Application
    await this.runTest('matching', 'Property Application', async () => {
      if (!this.testUser) throw new Error('No test user available');
      
      // First get a property to apply to
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('status', 'active')
        .limit(1);
      
      if (!properties || properties.length === 0) {
        throw new Error('No active properties found for application test');
      }
      
      const { data, error } = await supabase
        .from('property_applications')
        .insert({
          property_id: properties[0].id,
          tenant_id: this.testUser.id,
          application_message: 'Test application message',
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw new Error(`Property application failed: ${error.message}`);
      if (!data) throw new Error('No application data returned');
      
      return { success: true, data: { applicationId: data.id, status: data.status } };
    });

    // Test 2: Viewing Invitation
    await this.runTest('matching', 'Viewing Invitation', async () => {
      if (!this.testUser) throw new Error('No test user available');
      
      const { data, error } = await supabase
        .from('viewing_invitations')
        .insert({
          tenant_id: this.testUser.id,
          landlord_id: this.testUser.id, // Self for testing
          property_address: 'Test Street 123, Amsterdam',
          proposed_date: '2025-06-15 14:00:00',
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw new Error(`Viewing invitation failed: ${error.message}`);
      if (!data) throw new Error('No invitation data returned');
      
      return { success: true, data: { invitationId: data.id, status: data.status } };
    });

    console.log('✅ Matching system tests completed\n');
  }

  async testPaymentSystem() {
    console.log('💳 Testing Payment System...');
    
    // Test 1: Payment Record Creation
    await this.runTest('payments', 'Payment Record Creation', async () => {
      if (!this.testUser) throw new Error('No test user available');
      
      const { data, error } = await supabase
        .from('payment_records')
        .insert({
          user_id: this.testUser.id,
          email: this.testUser.email,
          user_type: 'huurder',
          amount: 2500, // 25.00 EUR in cents
          currency: 'EUR',
          status: 'pending',
          description: 'Test subscription payment'
        })
        .select()
        .single();
      
      if (error) throw new Error(`Payment record creation failed: ${error.message}`);
      if (!data) throw new Error('No payment data returned');
      
      return { success: true, data: { paymentId: data.id, amount: data.amount } };
    });

    // Test 2: Payment Status Update
    await this.runTest('payments', 'Payment Status Update', async () => {
      if (!this.testUser) throw new Error('No test user available');
      
      const { data, error } = await supabase
        .from('payment_records')
        .update({
          status: 'completed',
          stripe_payment_intent_id: 'pi_test_123456'
        })
        .eq('user_id', this.testUser.id)
        .eq('status', 'pending')
        .select()
        .single();
      
      if (error) throw new Error(`Payment status update failed: ${error.message}`);
      if (!data) throw new Error('No updated payment data returned');
      
      return { success: true, data: { status: data.status } };
    });

    console.log('✅ Payment system tests completed\n');
  }

  async testNotificationSystem() {
    console.log('🔔 Testing Notification System...');
    
    // Test 1: Notification Creation
    await this.runTest('notifications', 'Notification Creation', async () => {
      if (!this.testUser) throw new Error('No test user available');
      
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: this.testUser.id,
          type: 'document_approved',
          title: 'Document Approved',
          message: 'Your identity document has been approved',
          read: false
        })
        .select()
        .single();
      
      if (error) throw new Error(`Notification creation failed: ${error.message}`);
      if (!data) throw new Error('No notification data returned');
      
      return { success: true, data: { notificationId: data.id, type: data.type } };
    });

    // Test 2: Notification Retrieval
    await this.runTest('notifications', 'Notification Retrieval', async () => {
      if (!this.testUser) throw new Error('No test user available');
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', this.testUser.id)
        .order('created_at', { ascending: false });
      
      if (error) throw new Error(`Notification retrieval failed: ${error.message}`);
      
      return { success: true, data: { notificationCount: data?.length || 0 } };
    });

    // Test 3: Mark Notification as Read
    await this.runTest('notifications', 'Mark as Read', async () => {
      if (!this.testUser) throw new Error('No test user available');
      
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', this.testUser.id)
        .eq('read', false)
        .select();
      
      if (error) throw new Error(`Mark as read failed: ${error.message}`);
      
      return { success: true, data: { updatedCount: data?.length || 0 } };
    });

    console.log('✅ Notification system tests completed\n');
  }

  async runTest(category, testName, testFunction) {
    this.results.overall.total_tests++;
    
    try {
      const result = await testFunction();
      this.results[category].push({
        name: testName,
        status: 'PASS',
        result: result,
        timestamp: new Date().toISOString()
      });
      this.results.overall.passed++;
      console.log(`  ✅ ${testName}: PASS`);
    } catch (error) {
      this.results[category].push({
        name: testName,
        status: 'FAIL',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      this.results.overall.failed++;
      console.log(`  ❌ ${testName}: FAIL - ${error.message}`);
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.results.overall,
      test_results: this.results,
      recommendations: this.generateRecommendations()
    };

    // Write report to file
    const reportPath = path.join(process.cwd(), 'docs', 'api-test-results.md');
    const markdownReport = this.formatAsMarkdown(report);
    
    fs.writeFileSync(reportPath, markdownReport);
    
    console.log('\n📋 API TEST SUMMARY');
    console.log('===================');
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log(`⚠️ Warnings: ${report.summary.warnings}`);
    console.log(`📊 Total: ${report.summary.total_tests}`);
    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }

  formatAsMarkdown(report) {
    let markdown = `# API Endpoint Test Results\n\n`;
    markdown += `**Generated:** ${report.timestamp}\n\n`;
    
    markdown += `## Summary\n\n`;
    markdown += `- ✅ **Passed:** ${report.summary.passed}\n`;
    markdown += `- ❌ **Failed:** ${report.summary.failed}\n`;
    markdown += `- ⚠️ **Warnings:** ${report.summary.warnings}\n`;
    markdown += `- 📊 **Total Tests:** ${report.summary.total_tests}\n\n`;

    const categories = [
      { key: 'authentication', title: '🔐 Authentication & Authorization' },
      { key: 'profiles', title: '👤 Profile Management' },
      { key: 'documents', title: '📄 Document Management' },
      { key: 'properties', title: '🏠 Property Management' },
      { key: 'matching', title: '🎯 Matching System' },
      { key: 'payments', title: '💳 Payment System' },
      { key: 'notifications', title: '🔔 Notification System' }
    ];

    categories.forEach(category => {
      if (report.test_results[category.key].length > 0) {
        markdown += `## ${category.title}\n\n`;
        report.test_results[category.key].forEach(test => {
          const icon = test.status === 'PASS' ? '✅' : '❌';
          markdown += `### ${icon} ${test.name}\n\n`;
          markdown += `**Status:** ${test.status}\n\n`;
          if (test.status === 'PASS') {
            markdown += `**Result:** ${JSON.stringify(test.result.data, null, 2)}\n\n`;
          } else {
            markdown += `**Error:** ${test.error}\n\n`;
          }
          markdown += `**Timestamp:** ${test.timestamp}\n\n`;
          markdown += `---\n\n`;
        });
      }
    });

    markdown += `## Recommendations\n\n`;
    report.recommendations.forEach(rec => {
      markdown += `- ${rec}\n`;
    });

    return markdown;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.overall.failed > 0) {
      recommendations.push('🔴 **URGENT:** Address all failing API endpoints immediately');
      recommendations.push('🔧 Review database schema and RLS policies for failing tests');
    }
    
    if (this.results.authentication.some(t => t.status === 'FAIL')) {
      recommendations.push('🔐 Fix authentication issues before proceeding with other tests');
    }
    
    if (this.results.overall.passed > 0) {
      recommendations.push('✅ Continue with frontend integration testing for passing endpoints');
    }
    
    recommendations.push('📋 Set up automated API testing in CI/CD pipeline');
    recommendations.push('📊 Monitor API performance and error rates');
    recommendations.push('🧪 Add more comprehensive test cases for edge scenarios');
    
    return recommendations;
  }
}

// Run the API tests
const tester = new APITester();
tester.runAllTests().catch(console.error);
