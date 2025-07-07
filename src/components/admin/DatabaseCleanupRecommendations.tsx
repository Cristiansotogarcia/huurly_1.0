
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Trash2, AlertTriangle, CheckCircle, Code } from 'lucide-react';

interface CleanupRecommendationsProps {
  analysisData: any[];
}

const DatabaseCleanupRecommendations: React.FC<CleanupRecommendationsProps> = ({ analysisData }) => {
  // Generate specific cleanup recommendations based on analysis
  const generateRecommendations = () => {
    const recommendations = {
      immediate_deletions: [] as string[],
      code_updates_needed: [] as string[],
      manual_review: [] as string[]
    };

    analysisData.forEach(table => {
      // Check for completely empty tables
      if (table.total_rows === 0) {
        recommendations.immediate_deletions.push(
          `DROP TABLE ${table.table_name}; -- Table is completely empty`
        );
      }

      // Check for unused columns
      table.columns?.forEach((column: any) => {
        if (column.non_null_count === 0) {
          const isSystemColumn = ['id', 'created_at', 'updated_at', 'user_id'].includes(column.column_name);
          
          if (!isSystemColumn) {
            recommendations.immediate_deletions.push(
              `ALTER TABLE ${table.table_name} DROP COLUMN ${column.column_name}; -- Never used (0% usage)`
            );
          }
        } else if (column.usage_percentage < 5 && column.usage_percentage > 0) {
          recommendations.manual_review.push(
            `${table.table_name}.${column.column_name} - Only ${column.usage_percentage}% usage (${column.non_null_count}/${column.total_rows} records). Consider if this data is important.`
          );
        }
      });
    });

    // Specific recommendations based on known modal usage
    const modalUsedFields = [
      'first_name', 'last_name', 'phone', 'date_of_birth', 'nationality', 'sex', 'profielfoto_url',
      'marital_status', 'has_children', 'number_of_children', 'children_ages',
      'profession', 'employer', 'employment_status', 'work_contract_type', 'monthly_income', 'housing_allowance_eligible',
      'has_partner', 'partner_name', 'partner_profession', 'partner_monthly_income', 'partner_employment_status',
      'preferred_city', 'preferred_districts', 'max_commute_time', 'transportation_preference',
      'min_budget', 'max_budget', 'preferred_bedrooms', 'preferred_property_type', 'furnished_preference',
      'desired_amenities', 'has_pets', 'pet_details', 'smokes', 'smoking_details',
      'bio', 'motivation', 'user_id', 'profile_completed', 'created_at', 'updated_at',
      'total_household_income', 'family_composition', 'guarantor_available', 'guarantor_name',
      'guarantor_phone', 'guarantor_income', 'guarantor_relationship', 'income_proof_available',
      'move_in_date_preferred', 'move_in_date_earliest', 'availability_flexible',
      'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
      'references_available', 'rental_history_years', 'reason_for_moving', 'parking_required',
      'storage_needs', 'lease_duration_preference'
    ];

    const tenantProfileTable = analysisData.find(t => t.table_name === 'tenant_profiles');
    if (tenantProfileTable) {
      tenantProfileTable.columns?.forEach((column: any) => {
        if (!modalUsedFields.includes(column.column_name) && column.non_null_count === 0) {
          recommendations.code_updates_needed.push(
            `Consider removing ${column.column_name} from tenant_profiles as it's not used in the 8-step modal and has no data.`
          );
        }
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trash2 className="h-8 w-8 text-destructive mx-auto mb-2" />
            <div className="text-2xl font-bold text-destructive">
              {recommendations.immediate_deletions.length}
            </div>
            <p className="text-sm text-muted-foreground">Immediate Deletions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Code className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">
              {recommendations.code_updates_needed.length}
            </div>
            <p className="text-sm text-muted-foreground">Code Updates Needed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">
              {recommendations.manual_review.length}
            </div>
            <p className="text-sm text-muted-foreground">Manual Review</p>
          </CardContent>
        </Card>
      </div>

      {recommendations.immediate_deletions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Immediate Deletions (Safe to Remove)
            </CardTitle>
            <CardDescription>
              These items have no data and can be safely removed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.immediate_deletions.map((sql, index) => (
                <div key={index} className="bg-muted p-3 rounded-lg font-mono text-sm">
                  {sql}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {recommendations.manual_review.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Manual Review Required
            </CardTitle>
            <CardDescription>
              These items have minimal usage - review before removing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.manual_review.map((item, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{item}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {recommendations.code_updates_needed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Code className="h-5 w-5" />
              Code Updates Recommended
            </CardTitle>
            <CardDescription>
              These changes would improve code maintainability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.code_updates_needed.map((recommendation, index) => (
                <Alert key={index}>
                  <Code className="h-4 w-4" />
                  <AlertDescription>{recommendation}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {recommendations.immediate_deletions.length === 0 && 
       recommendations.manual_review.length === 0 && 
       recommendations.code_updates_needed.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Database Looks Clean!</h3>
            <p className="text-muted-foreground">
              No obvious cleanup opportunities found. Your database structure appears to be well-optimized.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DatabaseCleanupRecommendations;
