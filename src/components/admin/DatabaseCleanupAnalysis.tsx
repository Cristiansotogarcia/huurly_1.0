
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Trash2, AlertTriangle, Database, FileText, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ColumnAnalysis {
  column_name: string;
  total_rows: number;
  non_null_count: number;
  null_count: number;
  usage_status: string;
  usage_percentage: number;
}

interface TableAnalysis {
  table_name: string;
  total_columns: number;
  empty_columns: number;
  mostly_empty_columns: number;
  well_used_columns: number;
  total_rows: number;
  columns: ColumnAnalysis[];
}

const DatabaseCleanupAnalysis: React.FC = () => {
  const [tableAnalyses, setTableAnalyses] = useState<TableAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const { toast } = useToast();

  // Tables to analyze (focusing on core business tables)
  const tablesToAnalyze = [
    'tenant_profiles',
    'properties', 
    'property_applications',
    'viewing_invitations',
    'messages',
    'user_documents',
    'notifications',
    'profile_views',
    'household_info',
    'children_details',
    'household_members'
  ];

  const analyzeTableColumns = async (tableName: string): Promise<TableAnalysis | null> => {
    try {
      // Get table structure first
      const { data: tableInfo } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', tableName)
        .eq('table_schema', 'public');

      if (!tableInfo || tableInfo.length === 0) {
        return null;
      }

      // Get row count
      const { count: totalRows } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (totalRows === 0) {
        // Empty table
        return {
          table_name: tableName,
          total_columns: tableInfo.length,
          empty_columns: tableInfo.length,
          mostly_empty_columns: 0,
          well_used_columns: 0,
          total_rows: 0,
          columns: tableInfo.map(col => ({
            column_name: col.column_name,
            total_rows: 0,
            non_null_count: 0,
            null_count: 0,
            usage_status: '🗑️ COMPLETELY EMPTY - CAN BE DELETED',
            usage_percentage: 0
          }))
        };
      }

      // Analyze each column's usage
      const columnAnalyses: ColumnAnalysis[] = [];
      
      for (const column of tableInfo) {
        try {
          // Count non-null values for this column
          const { data } = await supabase
            .from(tableName)
            .select(column.column_name)
            .not(column.column_name, 'is', null);

          const nonNullCount = data?.length || 0;
          const nullCount = totalRows - nonNullCount;
          const usagePercentage = totalRows > 0 ? (nonNullCount / totalRows) * 100 : 0;

          let usageStatus: string;
          if (nonNullCount === 0) {
            usageStatus = '🗑️ COMPLETELY EMPTY - CAN BE DELETED';
          } else if (usagePercentage < 10) {
            usageStatus = '⚠️ MOSTLY EMPTY (< 10% usage)';
          } else if (usagePercentage < 50) {
            usageStatus = '📊 PARTIALLY USED (< 50% usage)';
          } else {
            usageStatus = '✅ WELL USED (>= 50% usage)';
          }

          columnAnalyses.push({
            column_name: column.column_name,
            total_rows: totalRows,
            non_null_count: nonNullCount,
            null_count: nullCount,
            usage_status: usageStatus,
            usage_percentage: Math.round(usagePercentage * 100) / 100
          });
        } catch (error) {
          console.error(`Error analyzing column ${column.column_name}:`, error);
        }
      }

      // Categorize columns
      const emptyColumns = columnAnalyses.filter(col => col.non_null_count === 0).length;
      const mostlyEmptyColumns = columnAnalyses.filter(col => 
        col.non_null_count > 0 && col.usage_percentage < 10
      ).length;
      const wellUsedColumns = columnAnalyses.filter(col => col.usage_percentage >= 50).length;

      return {
        table_name: tableName,
        total_columns: columnAnalyses.length,
        empty_columns: emptyColumns,
        mostly_empty_columns: mostlyEmptyColumns,
        well_used_columns: wellUsedColumns,
        total_rows: totalRows,
        columns: columnAnalyses.sort((a, b) => a.non_null_count - b.non_null_count)
      };

    } catch (error) {
      console.error(`Error analyzing table ${tableName}:`, error);
      return null;
    }
  };

  const runFullAnalysis = async () => {
    setLoading(true);
    const analyses: TableAnalysis[] = [];

    for (const tableName of tablesToAnalyze) {
      const analysis = await analyzeTableColumns(tableName);
      if (analysis) {
        analyses.push(analysis);
      }
    }

    setTableAnalyses(analyses);
    setLoading(false);

    toast({
      title: "Analysis Complete",
      description: `Analyzed ${analyses.length} tables for cleanup opportunities.`
    });
  };

  const generateCleanupReport = () => {
    const report = {
      analysis_date: new Date().toISOString(),
      summary: {
        total_tables_analyzed: tableAnalyses.length,
        empty_tables: tableAnalyses.filter(t => t.total_rows === 0).length,
        tables_with_empty_columns: tableAnalyses.filter(t => t.empty_columns > 0).length,
        total_empty_columns: tableAnalyses.reduce((sum, t) => sum + t.empty_columns, 0),
        total_mostly_empty_columns: tableAnalyses.reduce((sum, t) => sum + t.mostly_empty_columns, 0)
      },
      recommendations: {
        immediate_deletions: [] as string[],
        cleanup_candidates: [] as string[],
        review_needed: [] as string[]
      },
      detailed_analysis: tableAnalyses
    };

    // Generate recommendations
    tableAnalyses.forEach(table => {
      if (table.total_rows === 0) {
        report.recommendations.immediate_deletions.push(`DROP TABLE ${table.table_name} (completely empty)`);
      }
      
      table.columns.forEach(col => {
        if (col.non_null_count === 0 && !['id', 'created_at', 'updated_at', 'user_id'].includes(col.column_name)) {
          report.recommendations.immediate_deletions.push(
            `ALTER TABLE ${table.table_name} DROP COLUMN ${col.column_name} (never used)`
          );
        } else if (col.usage_percentage < 10 && col.usage_percentage > 0) {
          report.recommendations.cleanup_candidates.push(
            `${table.table_name}.${col.column_name} (${col.usage_percentage}% usage - ${col.non_null_count}/${col.total_rows} records)`
          );
        }
      });
    });

    return report;
  };

  const downloadReport = () => {
    const report = generateCleanupReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `database_cleanup_analysis_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTableStatusColor = (table: TableAnalysis) => {
    if (table.total_rows === 0) return 'destructive';
    if (table.empty_columns > table.total_columns * 0.5) return 'destructive';
    if (table.empty_columns > 0) return 'secondary';
    return 'default';
  };

  const getColumnStatusColor = (column: ColumnAnalysis) => {
    if (column.usage_status.includes('COMPLETELY EMPTY')) return 'destructive';
    if (column.usage_status.includes('MOSTLY EMPTY')) return 'secondary';
    if (column.usage_status.includes('PARTIALLY USED')) return 'outline';
    return 'default';
  };

  useEffect(() => {
    if (tableAnalyses.length > 0 && !selectedTable) {
      setSelectedTable(tableAnalyses[0].table_name);
    }
  }, [tableAnalyses]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Database Cleanup Analysis
          </h1>
          <p className="text-muted-foreground mt-2">
            Identify unused tables and columns for database optimization
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runFullAnalysis} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </Button>
          {tableAnalyses.length > 0 && (
            <Button 
              onClick={downloadReport}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          )}
        </div>
      </div>

      {tableAnalyses.length === 0 && !loading && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Analysis Data</AlertTitle>
          <AlertDescription>
            Click "Run Analysis" to analyze your database tables for cleanup opportunities.
          </AlertDescription>
        </Alert>
      )}

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Analyzing database tables...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {tableAnalyses.length > 0 && (
        <Tabs value={selectedTable} onValueChange={setSelectedTable}>
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-destructive">
                    {tableAnalyses.reduce((sum, t) => sum + t.empty_columns, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Empty Columns</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {tableAnalyses.reduce((sum, t) => sum + t.mostly_empty_columns, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Mostly Empty Columns</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">
                    {tableAnalyses.filter(t => t.total_rows === 0).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Empty Tables</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {tableAnalyses.reduce((sum, t) => sum + t.well_used_columns, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Well-Used Columns</p>
                </CardContent>
              </Card>
            </div>

            {/* Table Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Table Overview</CardTitle>
                <CardDescription>Click on a table to see detailed column analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tableAnalyses.map(table => (
                    <Card 
                      key={table.table_name}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTable === table.table_name ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedTable(table.table_name)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{table.table_name}</h3>
                          <Badge variant={getTableStatusColor(table)}>
                            {table.total_rows === 0 ? 'Empty' : 
                             table.empty_columns > 0 ? 'Has Issues' : 'Healthy'}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>Rows: {table.total_rows.toLocaleString()}</div>
                          <div>Columns: {table.total_columns}</div>
                          {table.empty_columns > 0 && (
                            <div className="text-destructive">
                              Empty: {table.empty_columns}
                            </div>
                          )}
                          {table.mostly_empty_columns > 0 && (
                            <div className="text-orange-600">
                              Mostly Empty: {table.mostly_empty_columns}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Column Analysis */}
            {selectedTable && (
              <TabsContent value={selectedTable}>
                {(() => {
                  const table = tableAnalyses.find(t => t.table_name === selectedTable);
                  if (!table) return null;

                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="h-5 w-5" />
                          {table.table_name} - Column Analysis
                        </CardTitle>
                        <CardDescription>
                          {table.total_rows.toLocaleString()} rows, {table.total_columns} columns
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {table.columns.map(column => (
                            <div 
                              key={column.column_name}
                              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="font-medium">{column.column_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {column.non_null_count.toLocaleString()} / {column.total_rows.toLocaleString()} used
                                  ({column.usage_percentage}%)
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={getColumnStatusColor(column)}>
                                  {column.usage_status.split(' - ')[0]}
                                </Badge>
                                {column.non_null_count === 0 && 
                                 !['id', 'created_at', 'updated_at', 'user_id'].includes(column.column_name) && (
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </TabsContent>
            )}
          </div>

          <TabsList className="hidden">
            {tableAnalyses.map(table => (
              <TabsTrigger key={table.table_name} value={table.table_name}>
                {table.table_name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
    </div>
  );
};

export default DatabaseCleanupAnalysis;
