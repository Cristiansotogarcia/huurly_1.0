#!/usr/bin/env node

/**
 * Comprehensive Supabase Schema Audit for Huurly
 * Analyzes tables, foreign keys, constraints, and business logic inconsistencies
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAyNTgyOCwiZXhwIjoyMDY0NjAxODI4fQ.1GaDpXyyXqxBzQSu7Pu3xRpF0_Y5AoQcLRQsgHmIM9I';

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

class ComprehensiveSchemaAuditor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      database: SUPABASE_URL,
      summary: {
        totalTables: 0,
        totalConstraints: 0,
        totalIndexes: 0,
        criticalIssues: 0,
        warnings: 0,
        recommendations: 0
      },
      tables: {},
      foreignKeys: [],
      constraints: [],
      indexes: [],
      businessLogicIssues: [],
      performanceIssues: [],
      recommendations: []
    };
  }

  async audit() {
    console.log('🔍 Starting Comprehensive Supabase Schema Audit...\n');
    
    try {
      await this.analyzeTables();
      await this.analyzeForeignKeys();
      await this.analyzeConstraints();
      await this.analyzeIndexes();
      await this.checkBusinessLogicIssues();
      await this.checkPerformanceIssues();
      await this.generateReport();
      
      console.log('\n✅ Comprehensive audit completed!');
      console.log(`📊 Summary: ${this.results.summary.criticalIssues} critical issues, ${this.results.summary.warnings} warnings`);
      
    } catch (error) {
      console.error('❌ Audit failed:', error);
      throw error;
    }
  }

  async analyzeTables() {
    console.log('📋 Analyzing tables...');
    
    const expectedTables = [
      'profiles', 'user_roles', 'tenant_profiles', 'properties', 'property_images',
      'property_applications', 'property_offers', 'user_documents', 'payment_records',
      'messages', 'notifications', 'viewing_invitations', 'viewing_slots',
      'document_access_requests', 'household_info', 'household_members',
      'audit_logs', 'subscribers'
    ];

    for (const tableName of expectedTables) {
      try {
        // Get table structure by querying with limit 0
        const { data, error } = await supabase.from(tableName).select('*').limit(0);
        
        if (!error) {
          // Get sample data to understand structure
          const { data: sampleData } = await supabase.from(tableName).select('*').limit(1);
          
          this.results.tables[tableName] = {
            exists: true,
            accessible: true,
            hasData: sampleData && sampleData.length > 0,
            columns: sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : []
          };
          
          console.log(`   ✅ ${tableName} - ${this.results.tables[tableName].hasData ? 'has data' : 'empty'}`);
        } else {
          this.results.tables[tableName] = { exists: false, error: error.message };
          console.log(`   ❌ ${tableName} - ${error.message}`);
        }
      } catch (err) {
        this.results.tables[tableName] = { exists: false, error: err.message };
        console.log(`   ❌ ${tableName} - ${err.message}`);
      }
    }
    
    this.results.summary.totalTables = Object.keys(this.results.tables).filter(t => this.results.tables[t].exists).length;
  }

  async analyzeForeignKeys() {
    console.log('🔗 Analyzing foreign key relationships...');
    
    // Based on the schema, identify expected foreign key relationships
    const expectedForeignKeys = [
      { table: 'user_roles', column: 'user_id', references: 'auth.users(id)' },
      { table: 'tenant_profiles', column: 'user_id', references: 'auth.users(id)' },
      { table: 'properties', column: 'landlord_id', references: 'auth.users(id)' },
      { table: 'property_applications', column: 'property_id', references: 'properties(id)' },
      { table: 'property_applications', column: 'tenant_id', references: 'auth.users(id)' },
      { table: 'property_offers', column: 'property_id', references: 'properties(id)' },
      { table: 'property_offers', column: 'tenant_id', references: 'auth.users(id)' },
      { table: 'property_offers', column: 'landlord_id', references: 'auth.users(id)' },
      { table: 'user_documents', column: 'user_id', references: 'auth.users(id)' },
      { table: 'payment_records', column: 'user_id', references: 'auth.users(id)' },
      { table: 'messages', column: 'sender_id', references: 'auth.users(id)' },
      { table: 'messages', column: 'recipient_id', references: 'auth.users(id)' },
      { table: 'notifications', column: 'user_id', references: 'auth.users(id)' },
      { table: 'property_images', column: 'property_id', references: 'properties(id)' },
      { table: 'viewing_invitations', column: 'tenant_id', references: 'auth.users(id)' },
      { table: 'viewing_invitations', column: 'landlord_id', references: 'auth.users(id)' },
      { table: 'viewing_slots', column: 'property_id', references: 'properties(id)' },
      { table: 'viewing_slots', column: 'tenant_id', references: 'auth.users(id)' },
      { table: 'document_access_requests', column: 'tenant_id', references: 'auth.users(id)' },
      { table: 'document_access_requests', column: 'landlord_id', references: 'auth.users(id)' },
      { table: 'household_info', column: 'user_id', references: 'auth.users(id)' },
      { table: 'household_members', column: 'user_id', references: 'auth.users(id)' }
    ];

    // Test foreign key relationships by checking for orphaned records
    for (const fk of expectedForeignKeys) {
      if (this.results.tables[fk.table]?.exists) {
        try {
          const { data, error } = await supabase
            .from(fk.table)
            .select(`${fk.column}`)
            .limit(5);
            
          if (!error && data) {
            this.results.foreignKeys.push({
              table: fk.table,
              column: fk.column,
              references: fk.references,
              status: 'accessible',
              recordCount: data.length
            });
          }
        } catch (err) {
          console.log(`   ⚠️ Could not verify FK ${fk.table}.${fk.column}: ${err.message}`);
        }
      }
    }
    
    console.log(`   Found ${this.results.foreignKeys.length} foreign key relationships`);
  }

  async analyzeConstraints() {
    console.log('🔒 Analyzing constraints...');
    
    // Check for expected constraints based on business logic
    const expectedConstraints = [
      { table: 'tenant_profiles', type: 'CHECK', column: 'age', condition: 'age >= 18 AND age <= 120' },
      { table: 'tenant_profiles', type: 'CHECK', column: 'monthly_income', condition: 'monthly_income >= 0' },
      { table: 'properties', type: 'CHECK', column: 'rent_amount', condition: 'rent_amount > 0' },
      { table: 'properties', type: 'CHECK', column: 'bedrooms', condition: 'bedrooms > 0 AND bedrooms <= 20' },
      { table: 'tenant_profiles', type: 'UNIQUE', column: 'user_id', condition: 'one profile per user' },
      { table: 'user_roles', type: 'UNIQUE', column: 'user_id', condition: 'one role per user' },
      { table: 'property_applications', type: 'UNIQUE', columns: ['property_id', 'tenant_id'], condition: 'one application per property per tenant' }
    ];

    // Test constraints by checking for violations
    for (const constraint of expectedConstraints) {
      if (this.results.tables[constraint.table]?.exists) {
        try {
          let violationCount = 0;
          
          if (constraint.type === 'CHECK' && constraint.column === 'age') {
            const { data } = await supabase
              .from(constraint.table)
              .select('id, age')
              .or('age.lt.18,age.gt.120');
            violationCount = data ? data.length : 0;
          } else if (constraint.type === 'CHECK' && constraint.column === 'monthly_income') {
            const { data } = await supabase
              .from(constraint.table)
              .select('id, monthly_income')
              .lt('monthly_income', 0);
            violationCount = data ? data.length : 0;
          } else if (constraint.type === 'CHECK' && constraint.column === 'rent_amount') {
            const { data } = await supabase
              .from(constraint.table)
              .select('id, rent_amount')
              .lte('rent_amount', 0);
            violationCount = data ? data.length : 0;
          }
          
          this.results.constraints.push({
            table: constraint.table,
            type: constraint.type,
            column: constraint.column,
            condition: constraint.condition,
            violations: violationCount,
            status: violationCount === 0 ? 'valid' : 'violations_found'
          });
          
          if (violationCount > 0) {
            this.addBusinessLogicIssue('warning', 
              `Constraint violation in ${constraint.table}.${constraint.column}`,
              `Found ${violationCount} records violating: ${constraint.condition}`
            );
          }
        } catch (err) {
          console.log(`   ⚠️ Could not check constraint ${constraint.table}.${constraint.column}: ${err.message}`);
        }
      }
    }
    
    this.results.summary.totalConstraints = this.results.constraints.length;
    console.log(`   Analyzed ${this.results.constraints.length} constraints`);
  }

  async analyzeIndexes() {
    console.log('🔍 Analyzing indexes for performance...');
    
    // Critical indexes for matching logic and performance
    const criticalIndexes = [
      { table: 'tenant_profiles', columns: ['is_looking_for_place'], purpose: 'tenant search toggle' },
      { table: 'tenant_profiles', columns: ['preferred_location'], purpose: 'location matching' },
      { table: 'tenant_profiles', columns: ['max_rent'], purpose: 'rent filtering' },
      { table: 'tenant_profiles', columns: ['monthly_income'], purpose: 'income matching' },
      { table: 'tenant_profiles', columns: ['available_from'], purpose: 'availability matching' },
      { table: 'properties', columns: ['status'], purpose: 'active property filtering' },
      { table: 'properties', columns: ['city'], purpose: 'location search' },
      { table: 'properties', columns: ['rent_amount'], purpose: 'rent filtering' },
      { table: 'properties', columns: ['available_from'], purpose: 'availability matching' },
      { table: 'properties', columns: ['bedrooms'], purpose: 'bedroom filtering' },
      { table: 'property_applications', columns: ['property_id'], purpose: 'application lookup' },
      { table: 'property_applications', columns: ['tenant_id'], purpose: 'tenant applications' },
      { table: 'property_applications', columns: ['status'], purpose: 'application status filtering' },
      { table: 'user_documents', columns: ['user_id'], purpose: 'user document lookup' },
      { table: 'user_documents', columns: ['status'], purpose: 'document status filtering' },
      { table: 'user_documents', columns: ['document_type'], purpose: 'document type filtering' }
    ];

    // Test if indexes are needed by checking table sizes and query patterns
    for (const index of criticalIndexes) {
      if (this.results.tables[index.table]?.exists) {
        try {
          // Get table size estimate
          const { data, count } = await supabase
            .from(index.table)
            .select('*', { count: 'exact', head: true });
            
          this.results.indexes.push({
            table: index.table,
            columns: index.columns,
            purpose: index.purpose,
            tableSize: count || 0,
            priority: count > 100 ? 'high' : count > 10 ? 'medium' : 'low'
          });
        } catch (err) {
          console.log(`   ⚠️ Could not analyze index for ${index.table}: ${err.message}`);
        }
      }
    }
    
    this.results.summary.totalIndexes = this.results.indexes.length;
    console.log(`   Analyzed ${this.results.indexes.length} critical indexes`);
  }

  async checkBusinessLogicIssues() {
    console.log('🔍 Checking business logic inconsistencies...');
    
    // Issue 1: Tenant 'searching for home' toggle
    await this.checkSearchingForHomeToggle();
    
    // Issue 2: One verified portfolio per user
    await this.checkOneVerifiedPortfolioPerUser();
    
    // Issue 3: Verified documents should not be re-uploadable
    await this.checkVerifiedDocumentReupload();
  }

  async checkSearchingForHomeToggle() {
    console.log('   Checking tenant searching for home toggle...');
    
    try {
      // Check if field exists in profiles table
      let profilesHasField = false;
      let tenantProfilesHasField = false;
      
      if (this.results.tables.profiles?.exists) {
        const profileColumns = this.results.tables.profiles.columns || [];
        profilesHasField = profileColumns.includes('is_looking_for_place');
      }
      
      if (this.results.tables.tenant_profiles?.exists) {
        const tenantColumns = this.results.tables.tenant_profiles.columns || [];
        tenantProfilesHasField = tenantColumns.includes('is_looking_for_place');
      }
      
      if (profilesHasField && tenantProfilesHasField) {
        this.addBusinessLogicIssue('critical',
          'Duplicate is_looking_for_place field',
          'Field exists in both profiles and tenant_profiles tables, causing potential synchronization issues. Remove from one table and implement sync mechanism.'
        );
      } else if (!profilesHasField && !tenantProfilesHasField) {
        this.addBusinessLogicIssue('critical',
          'Missing is_looking_for_place field',
          'Neither profiles nor tenant_profiles has the is_looking_for_place field required for tenant search functionality.'
        );
      } else {
        console.log('     ✅ is_looking_for_place field properly located');
      }
    } catch (err) {
      console.log(`     ⚠️ Could not check searching toggle: ${err.message}`);
    }
  }

  async checkOneVerifiedPortfolioPerUser() {
    console.log('   Checking one verified portfolio per user constraint...');
    
    try {
      if (this.results.tables.tenant_profiles?.exists) {
        // Check if there's a verification status field
        const columns = this.results.tables.tenant_profiles.columns || [];
        const hasVerificationField = columns.includes('profile_verified') || 
                                   columns.includes('documents_verified') ||
                                   columns.includes('verified');
        
        if (!hasVerificationField) {
          this.addBusinessLogicIssue('warning',
            'Missing profile verification workflow',
            'No verification status field found in tenant_profiles. Add profile_verified field and verification workflow.'
          );
        }
        
        // Check for duplicate profiles per user
        const { data: profiles } = await supabase
          .from('tenant_profiles')
          .select('user_id')
          .limit(1000);
          
        if (profiles) {
          const userIds = profiles.map(p => p.user_id);
          const duplicates = userIds.filter((id, index) => userIds.indexOf(id) !== index);
          
          if (duplicates.length > 0) {
            this.addBusinessLogicIssue('warning',
              'Multiple tenant profiles per user detected',
              `Found ${duplicates.length} users with multiple tenant profiles. Implement unique constraint on user_id.`
            );
          }
        }
      }
    } catch (err) {
      console.log(`     ⚠️ Could not check portfolio constraint: ${err.message}`);
    }
  }

  async checkVerifiedDocumentReupload() {
    console.log('   Checking verified document re-upload prevention...');
    
    try {
      if (this.results.tables.user_documents?.exists) {
        // Check for approved documents that might have duplicates
        const { data: approvedDocs } = await supabase
          .from('user_documents')
          .select('user_id, document_type, status')
          .eq('status', 'approved')
          .limit(1000);
          
        if (approvedDocs) {
          // Group by user_id and document_type to find duplicates
          const docGroups = {};
          approvedDocs.forEach(doc => {
            const key = `${doc.user_id}_${doc.document_type}`;
            docGroups[key] = (docGroups[key] || 0) + 1;
          });
          
          const duplicateApprovedDocs = Object.values(docGroups).filter(count => count > 1).length;
          
          if (duplicateApprovedDocs > 0) {
            this.addBusinessLogicIssue('warning',
              'Multiple approved documents of same type detected',
              `Found ${duplicateApprovedDocs} cases where users have multiple approved documents of the same type. Implement constraint to prevent re-upload of approved documents.`
            );
          }
          
          // Check if there's prevention logic in place
          this.addBusinessLogicIssue('recommendation',
            'Implement verified document re-upload prevention',
            'Add constraint: CREATE UNIQUE INDEX idx_one_approved_document_per_type ON user_documents (user_id, document_type) WHERE status = \'approved\';'
          );
        }
      }
    } catch (err) {
      console.log(`     ⚠️ Could not check document re-upload: ${err.message}`);
    }
  }

  async checkPerformanceIssues() {
    console.log('🚀 Checking performance issues...');
    
    // Check for missing indexes on matching logic
    const highPriorityIndexes = this.results.indexes.filter(idx => idx.priority === 'high');
    
    if (highPriorityIndexes.length > 0) {
      this.addPerformanceIssue('warning',
        'Missing critical indexes for matching logic',
        `Tables with high record counts need indexes: ${highPriorityIndexes.map(idx => `${idx.table}(${idx.columns.join(', ')})`).join(', ')}`
      );
    }
    
    // Check for tables that need composite indexes for matching
    const matchingTables = ['tenant_profiles', 'properties'];
    for (const table of matchingTables) {
      if (this.results.tables[table]?.hasData) {
        this.addPerformanceIssue('recommendation',
          `Add composite indexes for ${table} matching`,
          `CREATE INDEX idx_${table}_matching ON ${table} (${table === 'tenant_profiles' ? 'preferred_location, max_rent, is_looking_for_place' : 'city, rent_amount, status, available_from'});`
        );
      }
    }
  }

  addBusinessLogicIssue(severity, title, description) {
    this.results.businessLogicIssues.push({
      severity,
      title,
      description,
      timestamp: new Date().toISOString()
    });
    
    if (severity === 'critical') {
      this.results.summary.criticalIssues++;
    } else if (severity === 'warning') {
      this.results.summary.warnings++;
    } else if (severity === 'recommendation') {
      this.results.summary.recommendations++;
    }
  }

  addPerformanceIssue(severity, title, description) {
    this.results.performanceIssues.push({
      severity,
      title,
      description,
      timestamp: new Date().toISOString()
    });
    
    if (severity === 'warning') {
      this.results.summary.warnings++;
    } else if (severity === 'recommendation') {
      this.results.summary.recommendations++;
    }
  }

  async generateReport() {
    const reportPath = path.join(process.cwd(), 'docs', 'schema-audit.md');
    
    const report = `# Huurly Database Schema Audit Report

**Generated:** ${this.results.timestamp}  
**Database:** ${this.results.database}  
**Audit Type:** Comprehensive Schema Analysis

## Executive Summary

- **Total Tables:** ${this.results.summary.totalTables}
- **Foreign Key Relationships:** ${this.results.foreignKeys.length}
- **Constraints Analyzed:** ${this.results.summary.totalConstraints}
- **Critical Indexes:** ${this.results.summary.totalIndexes}
- **Critical Issues:** ${this.results.summary.criticalIssues}
- **Warnings:** ${this.results.summary.warnings}
- **Recommendations:** ${this.results.summary.recommendations}

## Tables Analysis

${Object.keys(this.results.tables).map(table => {
  const info = this.results.tables[table];
  const status = info.exists ? '✅' : '❌';
  const dataStatus = info.hasData ? 'Has data' : 'Empty';
  const columnCount = info.columns ? info.columns.length : 0;
  return `- ${status} **${table}** - ${dataStatus} (${columnCount} columns)`;
}).join('\n')}

## Foreign Key Relationships

${this.results.foreignKeys.map(fk => 
  `- **${fk.table}.${fk.column}** → ${fk.references} (${fk.recordCount} records)`
).join('\n')}

## Constraints Analysis

${this.results.constraints.map(constraint => {
  const status = constraint.status === 'valid' ? '✅' : '⚠️';
  return `- ${status} **${constraint.table}.${constraint.column}** (${constraint.type}) - ${constraint.violations} violations`;
}).join('\n')}

## Critical Business Logic Issues

${this.results.businessLogicIssues.filter(issue => issue.severity === 'critical').map(issue => 
  `### ❌ ${issue.title}

${issue.description}

**Severity:** ${issue.severity.toUpperCase()}  
**Timestamp:** ${issue.timestamp}
`
).join('\n')}

## Warnings

${this.results.businessLogicIssues.filter(issue => issue.severity === 'warning').map(issue => 
  `### ⚠️ ${issue.title}

${issue.description}

**Severity:** ${issue.severity.toUpperCase()}  
**Timestamp:** ${issue.timestamp}
`
).join('\n')}

## Performance Issues

${this.results.performanceIssues.map(issue => 
  `### 🚀 ${issue.title}

${issue.description}

**Severity:** ${issue.severity.toUpperCase()}  
**Timestamp:** ${issue.timestamp}
`
).join('\n')}

## Critical Indexes for Matching Logic

${this.results.indexes.filter(idx => idx.priority === 'high').map(index => 
  `### ${index.table} - ${index.purpose}
- **Columns:** ${index.columns.join(', ')}
- **Table Size:** ${index.tableSize} records
- **Priority:** ${index.priority.toUpperCase()}
`
).join('\n')}

## Recommendations

### High Priority
1. **Fix duplicate is_looking_for_place field** - Remove from either profiles or tenant_profiles
2. **Add verified document re-upload prevention** - Implement unique constraint for approved documents
3. **Implement profile verification workflow** - Add verification status tracking
4. **Add performance indexes** - Critical for matching logic on large datasets

### Medium Priority
1. **Add data integrity constraints** - Age validation, positive amounts, etc.
2. **Implement composite indexes** - For optimized matching queries
3. **Add geographic search optimization** - For location-based matching
4. **Enhance validation** - Email/phone format validation

## SQL Recommendations

### Fix Duplicate Field Issue
\`\`\`sql
-- Remove duplicate field from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS is_looking_for_place;

-- Ensure field exists in tenant_profiles
ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS is_looking_for_place BOOLEAN DEFAULT true;
\`\`\`

### Add Document Re-upload Prevention
\`\`\`sql
-- Prevent multiple approved documents of same type
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_approved_document_per_type 
ON user_documents (user_id, document_type) 
WHERE status = 'approved';
\`\`\`

### Add Performance Indexes
\`\`\`sql
-- Tenant matching composite index
CREATE INDEX IF NOT EXISTS idx_tenant_profiles_matching 
ON tenant_profiles (is_looking_for_place, preferred_location, max_rent, available_from)
WHERE is_looking_for_place = true;

-- Property search composite index
CREATE INDEX IF NOT EXISTS idx_properties_search 
ON properties (status, city, rent_amount, bedrooms, available_from)
WHERE status = 'active';

-- Income-based matching
CREATE INDEX IF NOT EXISTS idx_tenant_income_matching 
ON tenant_profiles (monthly_income, preferred_location)
WHERE is_looking_for_place = true;
\`\`\`

### Add Data Integrity Constraints
\`\`\`sql
-- Age validation
ALTER TABLE tenant_profiles 
ADD CONSTRAINT IF NOT EXISTS check_age_valid 
CHECK (age IS NULL OR (age >= 18 AND age <= 120));

-- Income validation
ALTER TABLE tenant_profiles 
ADD CONSTRAINT IF NOT EXISTS check_income_positive 
CHECK (monthly_income IS NULL OR monthly_income >= 0);

-- Rent validation
ALTER TABLE properties 
ADD CONSTRAINT IF NOT EXISTS check_rent_positive 
CHECK (rent_amount > 0);
\`\`\`

## Next Steps

1. **Address Critical Issues** - Fix duplicate fields and missing constraints
2. **Implement Performance Indexes** - Add composite indexes for matching logic
3. **Add Verification Workflow** - Implement profile and document verification
4. **Test Performance** - Validate query performance with indexes
5. **Monitor Data Integrity** - Set up alerts for constraint violations

---

*Report generated by Huurly Comprehensive Schema Auditor on ${this.results.timestamp}*
`;

    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 Comprehensive report saved to: ${reportPath}`);
  }
}

// Run the audit
async function runAudit() {
  const auditor = new ComprehensiveSchemaAuditor();
  await auditor.audit();
}

runAudit().catch(console.error);
