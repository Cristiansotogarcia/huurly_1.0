#!/usr/bin/env node

/**
 * Huurly Supabase Schema Audit Script (CommonJS)
 * Connects to live database and performs comprehensive schema analysis
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

class SchemaAuditor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      summary: {
        tables: 0,
        indexes: 0,
        constraints: 0,
        policies: 0,
        issues: 0,
        warnings: 0
      },
      tables: {},
      indexes: [],
      constraints: [],
      policies: [],
      issues: [],
      recommendations: []
    };
  }

  async audit() {
    console.log('🔍 Starting Supabase Schema Audit...\n');
    
    try {
      await this.auditTables();
      await this.auditDataIntegrity();
      await this.generateReport();
      
      console.log('\n✅ Audit completed successfully!');
      console.log(`📊 Found ${this.results.summary.issues} issues and ${this.results.summary.warnings} warnings`);
      
    } catch (error) {
      console.error('❌ Audit failed:', error);
      throw error;
    }
  }

  async auditTables() {
    console.log('📋 Auditing tables...');
    
    // Get table names from our TypeScript types
    const expectedTables = [
      'profiles', 'user_roles', 'tenant_profiles', 'properties', 'property_images',
      'property_applications', 'property_offers', 'user_documents', 'payment_records',
      'messages', 'notifications', 'viewing_invitations', 'viewing_slots',
      'document_access_requests', 'household_info', 'household_members',
      'audit_logs', 'subscribers'
    ];

    const tables = {};
    let accessibleTables = 0;
    
    for (const tableName of expectedTables) {
      try {
        const { data, error } = await supabase.from(tableName).select('*').limit(1);
        if (!error) {
          tables[tableName] = { 
            exists: true, 
            accessible: true,
            sample_record: data && data.length > 0 ? 'Has data' : 'Empty'
          };
          accessibleTables++;
          console.log(`   ✅ ${tableName} - accessible`);
        } else {
          tables[tableName] = { exists: false, error: error.message };
          this.addIssue('warning', `Table ${tableName} not accessible`, error.message);
          console.log(`   ❌ ${tableName} - ${error.message}`);
        }
      } catch (err) {
        tables[tableName] = { exists: false, error: err.message };
        this.addIssue('warning', `Table ${tableName} not accessible`, err.message);
        console.log(`   ❌ ${tableName} - ${err.message}`);
      }
    }
    
    this.results.tables = tables;
    this.results.summary.tables = accessibleTables;
    console.log(`   Found ${accessibleTables}/${expectedTables.length} accessible tables`);
  }

  async auditDataIntegrity() {
    console.log('🔍 Auditing data integrity...');
    
    // Check for duplicate field issue mentioned in original audit
    await this.checkDuplicateFields();
    
    // Check for data consistency
    await this.checkDataConsistency();
    
    // Check table relationships
    await this.checkTableRelationships();
  }

  async checkDuplicateFields() {
    console.log('   Checking for duplicate fields...');
    
    // Check if is_looking_for_place exists in both profiles and tenant_profiles
    try {
      const { data: profilesData } = await supabase.from('profiles').select('is_looking_for_place').limit(1);
      const { data: tenantProfilesData } = await supabase.from('tenant_profiles').select('is_looking_for_place').limit(1);
      
      if (profilesData !== null && tenantProfilesData !== null) {
        this.addIssue('critical', 
          'Duplicate field: is_looking_for_place exists in both profiles and tenant_profiles',
          'This can cause data synchronization issues. The original audit recommended removing from one table and adding sync mechanism.'
        );
      }
    } catch (err) {
      console.log(`   Could not check duplicate fields: ${err.message}`);
    }
  }

  async checkDataConsistency() {
    console.log('   Checking data consistency...');
    
    try {
      // Check for properties with invalid rent amounts
      const { data: invalidRent, error: rentError } = await supabase
        .from('properties')
        .select('id, rent_amount')
        .lte('rent_amount', 0);
        
      if (!rentError && invalidRent && invalidRent.length > 0) {
        this.addIssue('warning', 
          `Found ${invalidRent.length} properties with invalid rent amounts (≤ 0)`,
          'Properties should have positive rent amounts'
        );
      }

      // Check for users with invalid ages
      const { data: invalidAge, error: ageError } = await supabase
        .from('tenant_profiles')
        .select('id, age')
        .or('age.lt.18,age.gt.120');
        
      if (!ageError && invalidAge && invalidAge.length > 0) {
        this.addIssue('warning',
          `Found ${invalidAge.length} tenant profiles with invalid ages`,
          'Ages should be between 18 and 120'
        );
      }

      // Check for missing required fields
      const { data: missingNames, error: nameError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .or('first_name.is.null,last_name.is.null');
        
      if (!nameError && missingNames && missingNames.length > 0) {
        this.addIssue('warning',
          `Found ${missingNames.length} profiles with missing names`,
          'User profiles should have both first and last names'
        );
      }

    } catch (err) {
      this.addIssue('warning', 'Could not perform data consistency checks', err.message);
    }
  }

  async checkTableRelationships() {
    console.log('   Checking table relationships...');
    
    try {
      // Check for orphaned tenant profiles
      const { data: orphanedProfiles, error: profileError } = await supabase
        .from('tenant_profiles')
        .select('id, user_id')
        .limit(100);
        
      if (!profileError && orphanedProfiles) {
        console.log(`   Found ${orphanedProfiles.length} tenant profiles`);
      }

      // Check for orphaned property applications
      const { data: orphanedApplications, error: appError } = await supabase
        .from('property_applications')
        .select('id, property_id, tenant_id')
        .limit(100);
        
      if (!appError && orphanedApplications) {
        console.log(`   Found ${orphanedApplications.length} property applications`);
      }

      // Check for properties without landlords
      const { data: orphanedProperties, error: propError } = await supabase
        .from('properties')
        .select('id, landlord_id')
        .is('landlord_id', null);
        
      if (!propError && orphanedProperties && orphanedProperties.length > 0) {
        this.addIssue('warning',
          `Found ${orphanedProperties.length} properties without landlords`,
          'All properties should have a valid landlord_id'
        );
      }

    } catch (err) {
      this.addIssue('warning', 'Could not perform relationship checks', err.message);
    }
  }

  addIssue(severity, title, description) {
    this.results.issues.push({
      severity,
      title,
      description,
      timestamp: new Date().toISOString()
    });
    
    if (severity === 'critical') {
      this.results.summary.issues++;
    } else {
      this.results.summary.warnings++;
    }
  }

  addRecommendation(title, sql) {
    this.results.recommendations.push({
      title,
      sql,
      timestamp: new Date().toISOString()
    });
  }

  async generateReport() {
    const reportPath = path.join(process.cwd(), 'docs', 'live-schema-audit-report.md');
    
    const report = `# Live Supabase Schema Audit Report

**Generated:** ${this.results.timestamp}  
**Database:** ${SUPABASE_URL}  
**Audit Type:** Live Database Connection Test

## Executive Summary

- **Tables Accessible:** ${this.results.summary.tables}
- **Critical Issues:** ${this.results.summary.issues}
- **Warnings:** ${this.results.summary.warnings}
- **Recommendations:** ${this.results.recommendations.length}

## Connection Status

${Object.keys(this.results.tables).map(table => {
  const tableInfo = this.results.tables[table];
  const status = tableInfo.accessible ? '✅' : '❌';
  const info = tableInfo.accessible ? tableInfo.sample_record : tableInfo.error;
  return `- ${status} **${table}** - ${info}`;
}).join('\n')}

## Critical Issues

${this.results.issues.filter(i => i.severity === 'critical').map(issue => 
  `### ❌ ${issue.title}

${issue.description}

**Timestamp:** ${issue.timestamp}
`
).join('\n')}

## Warnings

${this.results.issues.filter(i => i.severity === 'warning').map(issue => 
  `### ⚠️ ${issue.title}

${issue.description}

**Timestamp:** ${issue.timestamp}
`
).join('\n')}

## Schema Comparison with Expected Structure

Based on the TypeScript types in \`src/integrations/supabase/types.ts\`, the following tables are expected:

### Core Tables
- **profiles** - User basic information
- **user_roles** - Role and subscription management  
- **tenant_profiles** - Detailed tenant information
- **properties** - Property listings
- **property_applications** - Tenant applications
- **user_documents** - Document verification
- **payment_records** - Payment tracking

### Supporting Tables
- **messages** - Communication system
- **notifications** - User notifications
- **viewing_invitations** - Property viewing coordination
- **viewing_slots** - Viewing time management
- **property_images** - Property photos
- **property_offers** - Landlord offers to tenants

### Utility Tables
- **document_access_requests** - Document sharing workflow
- **household_info** - Household composition details
- **household_members** - Individual household members
- **audit_logs** - System audit trail
- **subscribers** - Subscription management

## Recommendations from Previous Audit

Based on the comprehensive audit from June 11, 2025, the following issues were identified:

### High Priority
1. **Fix duplicate is_looking_for_place field** - Remove from either profiles or tenant_profiles
2. **Add verified document re-upload prevention** - Prevent re-uploading approved documents
3. **Implement profile verification workflow** - Add verification status tracking
4. **Add performance indexes** - Critical for matching logic

### Medium Priority
1. **Add data integrity constraints** - Age validation, positive amounts, etc.
2. **Implement document access audit trail** - Track who accesses what documents
3. **Add geographic search optimization** - For location-based matching
4. **Enhance email/phone validation** - Dutch format validation

## Next Steps

1. **Review Critical Issues** - Address any critical issues found in this live audit
2. **Compare with Migration Files** - Verify that recent migrations have been applied
3. **Performance Testing** - Test query performance on large datasets
4. **Security Review** - Verify RLS policies are working correctly
5. **Data Migration** - If schema changes are needed, plan migration strategy

---

*Report generated by Huurly Live Schema Auditor on ${this.results.timestamp}*
`;

    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 Report saved to: ${reportPath}`);
  }
}

// Run the audit
async function runAudit() {
  const auditor = new SchemaAuditor();
  await auditor.audit();
}

runAudit().catch(console.error);
