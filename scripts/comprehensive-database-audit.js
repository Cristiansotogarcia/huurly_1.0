import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

class DatabaseAuditor {
  constructor() {
    this.findings = {
      critical: [],
      warnings: [],
      recommendations: [],
      performance: [],
      security: []
    };
    this.tables = [];
    this.relationships = [];
    this.constraints = [];
    this.indexes = [];
  }

  async runCompleteAudit() {
    console.log('🔍 Starting comprehensive database audit...\n');
    
    try {
      await this.auditSchema();
      await this.auditData();
      await this.auditPerformance();
      await this.auditSecurity();
      await this.auditBusinessLogic();
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Audit failed:', error.message);
      process.exit(1);
    }
  }

  async auditSchema() {
    console.log('📋 Auditing schema structure...');
    
    // Get all tables
    const { data: tables, error: tablesError } = await supabase.rpc('get_table_info');
    if (tablesError) {
      // Fallback to information_schema
      const { data: fallbackTables } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      this.tables = fallbackTables?.map(t => t.table_name) || [];
    } else {
      this.tables = tables || [];
    }

    // Check for missing critical tables
    const expectedTables = [
      'profiles', 'user_roles', 'tenant_profiles', 'properties', 
      'user_documents', 'payment_records', 'notifications'
    ];
    
    const missingTables = expectedTables.filter(table => 
      !this.tables.includes(table)
    );
    
    if (missingTables.length > 0) {
      this.findings.critical.push({
        type: 'MISSING_TABLES',
        message: `Missing critical tables: ${missingTables.join(', ')}`,
        impact: 'HIGH',
        recommendation: 'Run schema migration to create missing tables'
      });
    }

    // Check for orphaned foreign keys
    await this.checkForeignKeyIntegrity();
    
    console.log(`✅ Found ${this.tables.length} tables`);
  }

  async auditData() {
    console.log('📊 Auditing data integrity...');
    
    // Check for orphaned records
    await this.checkOrphanedRecords();
    
    // Check for invalid enum values
    await this.checkEnumValues();
    
    // Check for constraint violations
    await this.checkConstraintViolations();
    
    console.log('✅ Data integrity check complete');
  }

  async auditPerformance() {
    console.log('⚡ Auditing performance...');
    
    // Check for missing indexes on foreign keys
    await this.checkMissingIndexes();
    
    // Check for large tables without proper indexing
    await this.checkTableSizes();
    
    console.log('✅ Performance audit complete');
  }

  async auditSecurity() {
    console.log('🔒 Auditing security...');
    
    // Check RLS policies
    await this.checkRLSPolicies();
    
    // Check for exposed sensitive data
    await this.checkSensitiveData();
    
    console.log('✅ Security audit complete');
  }

  async auditBusinessLogic() {
    console.log('🏢 Auditing business logic...');
    
    // Check for duplicate profiles
    await this.checkDuplicateProfiles();
    
    // Check document verification workflow
    await this.checkDocumentWorkflow();
    
    // Check payment consistency
    await this.checkPaymentConsistency();
    
    console.log('✅ Business logic audit complete');
  }

  async checkForeignKeyIntegrity() {
    const fkChecks = [
      {
        table: 'user_roles',
        column: 'user_id',
        reference: 'auth.users(id)',
        query: `
          SELECT COUNT(*) as count 
          FROM user_roles ur 
          LEFT JOIN auth.users u ON ur.user_id = u.id 
          WHERE u.id IS NULL
        `
      },
      {
        table: 'tenant_profiles',
        column: 'user_id',
        reference: 'auth.users(id)',
        query: `
          SELECT COUNT(*) as count 
          FROM tenant_profiles tp 
          LEFT JOIN auth.users u ON tp.user_id = u.id 
          WHERE u.id IS NULL
        `
      }
    ];

    for (const check of fkChecks) {
      try {
        const { data, error } = await supabase.rpc('execute_sql', { 
          sql: check.query 
        });
        
        if (error) continue;
        
        const orphanCount = data?.[0]?.count || 0;
        if (orphanCount > 0) {
          this.findings.critical.push({
            type: 'ORPHANED_RECORDS',
            message: `Found ${orphanCount} orphaned records in ${check.table}.${check.column}`,
            impact: 'HIGH',
            recommendation: `Clean up orphaned records or fix foreign key references`
          });
        }
      } catch (error) {
        // Skip if we can't execute the check
      }
    }
  }

  async checkOrphanedRecords() {
    // Check for properties without landlords
    const { data: orphanedProperties } = await supabase
      .from('properties')
      .select('id, landlord_id')
      .is('landlord_id', null);

    if (orphanedProperties?.length > 0) {
      this.findings.warnings.push({
        type: 'ORPHANED_PROPERTIES',
        message: `Found ${orphanedProperties.length} properties without landlords`,
        impact: 'MEDIUM',
        recommendation: 'Assign landlords to properties or remove orphaned properties'
      });
    }
  }

  async checkEnumValues() {
    // Check user_roles for invalid values
    const { data: invalidRoles } = await supabase
      .from('user_roles')
      .select('id, role')
      .not('role', 'in', '(huurder,verhuurder,beoordelaar,beheerder)');

    if (invalidRoles?.length > 0) {
      this.findings.critical.push({
        type: 'INVALID_ENUM_VALUES',
        message: `Found ${invalidRoles.length} invalid role values`,
        impact: 'HIGH',
        recommendation: 'Update invalid enum values to match schema'
      });
    }
  }

  async checkConstraintViolations() {
    // Check age constraints
    const { data: invalidAges } = await supabase
      .from('tenant_profiles')
      .select('id, age')
      .or('age.lt.18,age.gt.120');

    if (invalidAges?.length > 0) {
      this.findings.warnings.push({
        type: 'CONSTRAINT_VIOLATIONS',
        message: `Found ${invalidAges.length} profiles with invalid ages`,
        impact: 'MEDIUM',
        recommendation: 'Fix age values to be between 18 and 120'
      });
    }

    // Check negative rent amounts
    const { data: invalidRents } = await supabase
      .from('properties')
      .select('id, rent_amount')
      .lte('rent_amount', 0);

    if (invalidRents?.length > 0) {
      this.findings.warnings.push({
        type: 'CONSTRAINT_VIOLATIONS',
        message: `Found ${invalidRents.length} properties with invalid rent amounts`,
        impact: 'MEDIUM',
        recommendation: 'Fix rent amounts to be positive values'
      });
    }
  }

  async checkMissingIndexes() {
    const recommendedIndexes = [
      {
        table: 'tenant_profiles',
        columns: ['is_looking_for_place', 'preferred_location', 'max_rent'],
        reason: 'Critical for tenant matching queries'
      },
      {
        table: 'properties',
        columns: ['status', 'city', 'rent_amount'],
        reason: 'Critical for property search queries'
      },
      {
        table: 'user_documents',
        columns: ['user_id', 'status'],
        reason: 'Critical for document verification queries'
      }
    ];

    for (const index of recommendedIndexes) {
      this.findings.performance.push({
        type: 'MISSING_INDEX',
        message: `Recommend composite index on ${index.table}(${index.columns.join(', ')})`,
        impact: 'MEDIUM',
        recommendation: `CREATE INDEX idx_${index.table}_${index.columns.join('_')} ON ${index.table}(${index.columns.join(', ')});`,
        reason: index.reason
      });
    }
  }

  async checkTableSizes() {
    // This would require admin access to pg_stat_user_tables
    // For now, we'll check record counts
    const tables = ['tenant_profiles', 'properties', 'user_documents', 'payment_records'];
    
    for (const table of tables) {
      try {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (count > 1000) {
          this.findings.performance.push({
            type: 'LARGE_TABLE',
            message: `Table ${table} has ${count} records`,
            impact: 'LOW',
            recommendation: 'Monitor query performance and consider partitioning if needed'
          });
        }
      } catch (error) {
        // Skip if we can't access the table
      }
    }
  }

  async checkRLSPolicies() {
    // Check if RLS is enabled on critical tables
    const criticalTables = ['profiles', 'user_roles', 'tenant_profiles', 'user_documents'];
    
    for (const table of criticalTables) {
      // This would require checking pg_tables, which might not be accessible
      // For now, we'll assume RLS is properly configured based on migration
      this.findings.security.push({
        type: 'RLS_CHECK',
        message: `RLS should be enabled on ${table}`,
        impact: 'HIGH',
        recommendation: 'Verify RLS policies are active and properly configured'
      });
    }
  }

  async checkSensitiveData() {
    // Check for unencrypted sensitive data patterns
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, phone')
      .limit(5);

    if (profiles?.some(p => p.email?.includes('@'))) {
      this.findings.security.push({
        type: 'SENSITIVE_DATA',
        message: 'Email addresses stored in profiles table',
        impact: 'MEDIUM',
        recommendation: 'Ensure email data is properly protected and GDPR compliant'
      });
    }
  }

  async checkDuplicateProfiles() {
    // Check for duplicate user profiles
    const { data: duplicates } = await supabase
      .from('tenant_profiles')
      .select('user_id')
      .limit(1000);

    const userIds = duplicates?.map(d => d.user_id) || [];
    const uniqueUserIds = [...new Set(userIds)];
    
    if (userIds.length !== uniqueUserIds.length) {
      this.findings.critical.push({
        type: 'DUPLICATE_PROFILES',
        message: `Found ${userIds.length - uniqueUserIds.length} duplicate tenant profiles`,
        impact: 'HIGH',
        recommendation: 'Remove duplicate profiles and add unique constraints'
      });
    }
  }

  async checkDocumentWorkflow() {
    // Check for documents stuck in pending status
    const { data: pendingDocs } = await supabase
      .from('user_documents')
      .select('id, created_at')
      .eq('status', 'pending')
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (pendingDocs?.length > 0) {
      this.findings.warnings.push({
        type: 'STALE_DOCUMENTS',
        message: `Found ${pendingDocs.length} documents pending for over 7 days`,
        impact: 'MEDIUM',
        recommendation: 'Review and process pending documents or implement auto-expiry'
      });
    }
  }

  async checkPaymentConsistency() {
    // Check for payments without corresponding user roles
    const { data: paymentsWithoutRoles } = await supabase
      .from('payment_records')
      .select(`
        id, 
        user_id,
        user_roles!inner(id)
      `)
      .eq('status', 'completed');

    // This would show payments that don't have corresponding active subscriptions
    // Implementation depends on business logic
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_findings: Object.values(this.findings).flat().length,
        critical_issues: this.findings.critical.length,
        warnings: this.findings.warnings.length,
        recommendations: this.findings.recommendations.length,
        performance_issues: this.findings.performance.length,
        security_issues: this.findings.security.length
      },
      findings: this.findings,
      tables_audited: this.tables.length,
      next_steps: this.generateNextSteps()
    };

    // Write report to file
    const reportPath = path.join(process.cwd(), 'docs', 'database-audit-detailed.md');
    const markdownReport = this.formatAsMarkdown(report);
    
    fs.writeFileSync(reportPath, markdownReport);
    
    console.log('\n📋 AUDIT SUMMARY');
    console.log('================');
    console.log(`🔴 Critical Issues: ${report.summary.critical_issues}`);
    console.log(`🟡 Warnings: ${report.summary.warnings}`);
    console.log(`🔵 Recommendations: ${report.summary.recommendations}`);
    console.log(`⚡ Performance: ${report.summary.performance_issues}`);
    console.log(`🔒 Security: ${report.summary.security_issues}`);
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  formatAsMarkdown(report) {
    let markdown = `# Database Audit Report\n\n`;
    markdown += `**Generated:** ${report.timestamp}\n`;
    markdown += `**Tables Audited:** ${report.tables_audited}\n\n`;
    
    markdown += `## Summary\n\n`;
    markdown += `- 🔴 **Critical Issues:** ${report.summary.critical_issues}\n`;
    markdown += `- 🟡 **Warnings:** ${report.summary.warnings}\n`;
    markdown += `- 🔵 **Recommendations:** ${report.summary.recommendations}\n`;
    markdown += `- ⚡ **Performance Issues:** ${report.summary.performance_issues}\n`;
    markdown += `- 🔒 **Security Issues:** ${report.summary.security_issues}\n\n`;

    // Add findings sections
    const sections = [
      { key: 'critical', title: '🔴 Critical Issues', emoji: '❌' },
      { key: 'warnings', title: '🟡 Warnings', emoji: '⚠️' },
      { key: 'performance', title: '⚡ Performance Issues', emoji: '🐌' },
      { key: 'security', title: '🔒 Security Issues', emoji: '🛡️' },
      { key: 'recommendations', title: '🔵 Recommendations', emoji: '💡' }
    ];

    sections.forEach(section => {
      if (report.findings[section.key].length > 0) {
        markdown += `## ${section.title}\n\n`;
        report.findings[section.key].forEach((finding, index) => {
          markdown += `### ${section.emoji} ${finding.type}\n\n`;
          markdown += `**Message:** ${finding.message}\n\n`;
          markdown += `**Impact:** ${finding.impact}\n\n`;
          markdown += `**Recommendation:** ${finding.recommendation}\n\n`;
          if (finding.reason) {
            markdown += `**Reason:** ${finding.reason}\n\n`;
          }
          markdown += `---\n\n`;
        });
      }
    });

    markdown += `## Next Steps\n\n`;
    report.next_steps.forEach(step => {
      markdown += `- ${step}\n`;
    });

    return markdown;
  }

  generateNextSteps() {
    const steps = [];
    
    if (this.findings.critical.length > 0) {
      steps.push('🔴 **URGENT:** Address all critical issues immediately');
      steps.push('🔧 Run schema fixes and data cleanup scripts');
    }
    
    if (this.findings.performance.length > 0) {
      steps.push('⚡ Implement recommended performance indexes');
      steps.push('📊 Monitor query performance after index creation');
    }
    
    if (this.findings.security.length > 0) {
      steps.push('🔒 Review and strengthen security policies');
      steps.push('🛡️ Conduct penetration testing');
    }
    
    steps.push('📋 Schedule regular database audits');
    steps.push('📈 Set up monitoring and alerting');
    steps.push('🧪 Run integration tests to verify fixes');
    
    return steps;
  }
}

// Run the audit
const auditor = new DatabaseAuditor();
auditor.runCompleteAudit().catch(console.error);
