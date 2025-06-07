import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { databaseSeeder } from '@/scripts/seedDatabase';
import logger from '@/lib/logger';
import { Database, Trash2, RefreshCw } from 'lucide-react';

export const DatabaseAdmin = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      await databaseSeeder.seedAll();
      toast({
        title: "Database Seeded Successfully!",
        description: "All demo accounts and data have been created in the database.",
      });
    } catch (error) {
      logger.error({ error }, 'Seeding error');
      toast({
        title: "Seeding Failed",
        description: "There was an error seeding the database. Check the console for details.",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearDatabase = async () => {
    setIsClearing(true);
    try {
      await databaseSeeder.clearAll();
      toast({
        title: "Database Cleared Successfully!",
        description: "All demo data has been removed from the database.",
      });
    } catch (error) {
      logger.error({ error }, 'Clearing error');
      toast({
        title: "Clearing Failed",
        description: "There was an error clearing the database. Check the console for details.",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Database Administration
        </CardTitle>
        <p className="text-sm text-gray-600">
          Manage demo data in the Supabase database. This will create real database records for all demo accounts.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={handleSeedDatabase}
            disabled={isSeeding || isClearing}
            className="flex items-center"
          >
            {isSeeding ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Database className="w-4 h-4 mr-2" />
            )}
            {isSeeding ? 'Seeding...' : 'Seed Database'}
          </Button>
          
          <Button 
            onClick={handleClearDatabase}
            disabled={isSeeding || isClearing}
            variant="destructive"
            className="flex items-center"
          >
            {isClearing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            {isClearing ? 'Clearing...' : 'Clear Demo Data'}
          </Button>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">What this does:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Creates real database records for all 4 demo accounts</li>
            <li>• Adds Emma's tenant profile with documents and applications</li>
            <li>• Creates Bas's properties and viewing invitations</li>
            <li>• Sets up payment records and user roles</li>
            <li>• Enables real-time data queries for all dashboards</li>
          </ul>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <h4 className="font-semibold text-orange-900 mb-2">After seeding:</h4>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>• All 4 demo accounts will work with real authentication</li>
            <li>• Dashboards will show real data from the database</li>
            <li>• Statistics and metrics will be calculated from actual records</li>
            <li>• All buttons and forms will interact with real data</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
