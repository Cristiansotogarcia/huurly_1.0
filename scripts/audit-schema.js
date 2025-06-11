#!/usr/bin/env node

/**
 * Huurly Supabase Schema Audit Script
 * Connects to live database and performs comprehensive schema analysis
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAyNTgyOCwiZXhwIjoyMDY0NjAxODI4fQ.1GaDpXyyXqxBzQSu7Pu3xRpF0_Y5AoQcLRQsgHmIM9I';

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
      await this.auditIndexes();
      await this.auditConstraints();
      await this.auditPolicies();
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
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          t.table_name,
          COUNT(c.column_name) as column_count,
          array_agg(c.column_name ORDER BY c.ordinal_position) as columns,
          array_agg(c.data_type ORDER BY c.ordinal_position) as data_types,
          array_agg(c.is_nullable ORDER BY c.ordinal_position) as nullable
        FROM information_schema.tables t
        LEFT JOIN information_schema.columns c ON t.table_name = c.table_name AND c.table_schema = 'public'
        WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
        GROUP BY t.table_name
        ORDER BY t.table_name;
      `
    });

    if (error) {
      // Fallback method
      const tables = await this.getTablesDirectly();
      this.results.tables = tables;
    } else {
      this.results.tables = data.reduce((acc, table) => {
        acc[table.table_name] = {
          columns: table.columns,
          column_count: table.column_count,
          data_types: table.data_types,
          nullable: table.nullable
        };
        return acc;
      }, {});
    }

    this.results.summary.tables = Object.keys(this.results.tables).length;
    console.log(`   Found ${this.results.summary.tables} tables`);
  }

  async getTablesDirectly() {
    // Get table names from our TypeScript types
    const expectedTables = [
      'profiles', 'user_roles', 'tenant_profiles', 'properties', 'property_images',
      'property_applications', 'property_offers', 'user_documents', 'payment_records',
      'messages', 'notifications', 'viewing_invitations', 'viewing_slots',
      'document_access_requests', 'household_info', 'household_members',
      'audit_logs', 'subscribers'
    ];

    const tables = {};
    for (const tableName of expectedTables) {
      try {
        const { data, error } = await supabase.from(tableName).select('*').limit(0);
        if (!error) {
          tables[tableName] = { exists: true, accessible: true };
        }
      } catch (err) {
        tables[tableName] = { exists: false, error: err.message };
        this.addIssue('warning', `Table ${tableName} not accessible`, err.message);
      }
    }
    return tables;
  }

  async auditIndexes() {
    console.log('🔍 Auditing indexes...');
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname,
            tablename,
            indexname,
            indexdef
          FROM pg_indexes 
          WHERE schemaname = 'public'
          ORDER BY tablename, indexname;
        `
      });

      if (!error && data) {
        this.results.indexes = data;
        this.results.summary.indexes = data.length;
        console.log(`   Found ${data.length} indexes`);
        
        // Check for missing critical indexes
        this.checkMissingIndexes();
      } else {
        this.addIssue('warning', 'Could not retrieve index information', error?.message);
      }
    } catch (err) {
      this.addIssue('warning', 'Index audit failed', err.message);
    }
  }

  checkMissingIndexes() {
    const criticalIndexes = [
      { table: 'tenant_profiles', column: 'user_id', type: 'unique' },
      { table: 'tenant_profiles', column: 'is_looking_for_place', type: 'filter' },
      { table: 'properties', column: 'landlord_id', type: 'foreign_key' },
      { table: 'properties', column: 'status', type: 'filter' },
      { table: 'property_applications', column: 'property_id', type: 'foreign_key' },
      { table: 'property_applications', column: 'tenant_id', type: 'foreign_key' },
      { table: 'user_documents', column: 'user_id', type: 'foreign_key' },
      { table: 'user_documents', column: 'status', type: 'filter' }
    ];

    for (const index of criticalIndexes) {
      const exists = this.results.indexes.some(idx => 
        idx.tablename === index.table && 
        idx.indexdef.includes(index.column)
      );
      
      if (!exists) {
        this.addRecommendation(
          `Add index on ${index.table}.${index.column}`,
          `CREATE INDEX idx_${index.table}_${index.column} ON ${index.table}(${index.column});`
        );
      }
    }
  }

  async auditConstraints() {
    console.log('🔒 Auditing constraints...');
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT 
            tc.table_name,
            tc.constraint_name,
            tc.constraint_type,
            kcu.column_name,
            rc.referenced_table_name,
            rc.referenced_column_name
          FROM information_schema.table_constraints tc
          LEFT JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
          LEFT JOIN information_schema.referential_constraints rc 
            ON tc.constraint_name = rc.constraint_name
          WHERE tc.table_schema = 'public'
          ORDER BY tc.table_name, tc.constraint_type;
        `
      });

      if (!error && data) {
        this.results.constraints = data;
        this.results.summary.constraints = data.length;
        console.log(`   Found ${data.length} constraints`);
        
        this.checkMissingConstraints();
      }
    } catch (err) {
      this.addIssue('warning', 'Constraint audit failed', err.message);
    }
  }

  checkMissingConstraints() {
    const expectedConstraints = [
      { table: 'tenant_profiles', column: 'age', type: 'CHECK', condition: 'age >= 18 AND age <= 120' },
      { table: 'tenant_profiles', column: 'monthly_income', type: 'CHECK', condition: 'monthly_income >= 0' },
      { table: 'properties', column: 'rent_amount', type: 'CHECK', condition: 'rent_amount > 0' },
      { table: 'properties', column: 'bedrooms', type: 'CHECK', condition: 'bedrooms > 0 AND bedrooms <= 20' }
    ];

    for (const constraint of expectedConstraints) {
      const exists = this.results.constraints.some(c => 
        c.table_name === constraint.table && 
        c.constraint_type === constraint.type &&
        c.column_name === constraint.column
      );
      
      if (!exists) {
        this.addRecommendation(
          `Add ${constraint.type} constraint on ${constraint.table}.${constraint.column}`,
          `ALTER TABLE ${constraint.table} ADD CONSTRAINT check_${constraint.column}_valid CHECK (${constraint.condition});`
        );
      }
    }
  }

  async auditPolicies() {
    console.log('🛡️ Auditing RLS policies...');
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies 
          WHERE schemaname = 'public'
          ORDER BY tablename, policyname;
        `
      });

      if (!error && data) {
        this.results.policies = data;
        this.results.summary.policies = data.length;
        console.log(`   Found ${data.length} RLS policies`);
        
        this.checkRLSCoverage();
      }
    } catch (err) {
      this.addIssue('warning', 'RLS policy audit failed', err.message);
    }
  }

  checkRLSCoverage() {
    const criticalTables = [
      'profiles', 'user_roles', 'tenant_profiles', 'properties', 
      'property_applications', 'user_documents', 'payment_records'
    ];

    for (const table of criticalTables) {
      const policies = this.results.policies.filter(p => p.tablename === table);
      
      if (policies.length === 0) {
        this.addIssue('critical', `No RLS policies found for table: ${table}`, 
          'This table may be accessible without proper authorization');
      } else {
        // Check for basic CRUD policies
        const hasSelect = policies.some(p => p.cmd === 'SELECT');
        const hasInsert = policies.some(p => p.cmd === 'INSERT');
        const hasUpdate = policies.some(p => p.cmd === 'UPDATE');
        const hasDelete = policies.some(p => p.cmd === 'DELETE');
        
        if (!hasSelect) {
          this.addIssue('warning', `No SELECT policy for ${table}`, 'Users may not be able to read data');
        }
      }
    }
  }

  async auditDataIntegrity() {
    console.log('🔍 Auditing data integrity...');
    
    // Check for duplicate field issue mentioned in original audit
    await this.checkDuplicateFields();
    
    // Check for orphaned records
    await this.checkOrphanedRecords();
    
    // Check for data consistency
    await this.checkDataConsistency();
  }

  async checkDuplicateFields() {
    // Check if is_looking_for_place exists in both profiles and tenant_profiles
    const profilesHasField = this.results.tables.profiles?.columns?.includes('is_looking_for_place');
    const tenantProfilesHasField = this.results.tables.tenant_profiles?.columns?.includes('is_looking_for_place');
    
    if (profilesHasField && tenantProfilesHasField) {
      this.addIssue('critical', 
        'Duplicate field: is_looking_for_place exists in both profiles and tenant_profiles',
        'This can cause data synchronization issues. Remove from one table and add sync mechanism.'
      );
    }
  }

  async checkOrphanedRecords() {
    const orphanChecks = [
      { table: 'tenant_profiles', foreign_key: 'user_id', references: 'auth.users' },
      { table: 'properties', foreign_key: 'landlord_id', references: 'auth.users' },
      { table: 'property_applications', foreign_key: 'property_id', references: 'properties' },
      { table: 'user_documents', foreign_key: 'user_id', references: 'auth.users' }
    ];

    for (const check of orphanChecks) {
      try {
        // This would require custom SQL to check for orphaned records
        // For now, we'll add it as a recommendation to check manually
        this.addRecommendation(
          `Check for orphaned records in ${check.table}`,
          `SELECT COUNT(*) FROM ${check.table} WHERE ${check.foreign_key} NOT IN (SELECT id FROM ${check.references});`
        );
      } catch (err) {
        // Skip if we can't check
      }
    }
  }

  async checkDataConsistency() {
    // Check for business logic violations
    try {
      // Check for properties with invalid rent amounts
      const { data: invalidRent } = await supabase
        .from('properties')
        .select('id, rent_amount')
        .lte('rent_amount', 0);
        
      if (invalidRent && invalidRent.length > 0) {
        this.addIssue('warning', 
          `Found ${invalidRent.length} properties with invalid rent amounts (≤ 0)`,
          'Properties should have positive rent amounts'
        );
      }

      // Check for users with invalid ages
      const { data: invalidAge } = await supabase
        .from('tenant_profiles')
        .select('id, age')
        .or('age.lt.18,age.gt.120');
        
      if (invalidAge && invalidAge.length > 0) {
        this.addIssue('warning',
          `Found ${invalidAge.length} tenant profiles with invalid ages`,
          'Ages should be between 18 and 120'
        );
      }
    } catch (err) {
      this.addIssue('warning', 'Could not perform data consistency checks', err.message);
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

## Executive Summary

- **Tables:** ${this.results.summary.tables}
- **Indexes:** ${this.results.summary.indexes}
- **Constraints:** ${this.results.summary.constraints}
- **RLS Policies:** ${this.results.summary.policies}
- **Critical Issues:** ${this.results.summary.issues}
- **Warnings:** ${this.results.summary.warnings}
- **Recommendations:** ${this.results.recommendations.length}

## Critical Issues

${this.results.issues.filter(i => i.severity === 'critical').map(issue => 
  `### ❌ ${issue.title}\n${issue.description}\n`
).join('\n')}

## Warnings

${this.results.issues.filter(i => i.severity === 'warning').map(issue => 
  `### ⚠️ ${issue.title}\n${issue.description}\n`
).join('\n')}

## Tables Found

${Object.keys(this.results.tables).map(table => 
  `- **${table}** (${this.results.tables[table].column_count || 'unknown'} columns)`
).join('\n')}

## Recommendations

${this.results.recommendations.map((rec, index) => 
  `### ${index + 1}. ${rec.title}\n\`\`\`sql\n${rec.sql}\n\`\`\`\n`
).join('\n')}

## Indexes Analysis

${this.results.indexes.map(idx => 
  `- **${idx.tablename}.${idx.indexname}**`
).join('\n')}

## RLS Policies Analysis

${this.results.policies.map(policy => 
  `- **${policy.tablename}**: ${policy.policyname} (${policy.cmd})`
).join('\n')}

---

*Report generated by Huurly Schema Auditor*
`;

    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 Report saved to: ${reportPath}`);
  }
}

// Run the audit
const auditor = new SchemaAuditor();
auditor.audit().catch(console.error);
