import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const { toast } = useToast();

  // Mock data - in real implementation, fetch from API
  const [analytics, setAnalytics] = useState({
    totalUsers: 1245,
    newUsersThisMonth: 127,
    totalRevenue: 80925,
    revenueThisMonth: 8385,
    activeSubscriptions: 986,
    conversionRate: 12.3,
    churnRate: 2.1,
    avgRevenuePerUser: 65
  });

  const [chartData, setChartData] = useState({
    userGrowth: [
      { month: 'Jan', users: 856 },
      { month: 'Feb', users: 923 },
      { month: 'Mar', users: 1034 },
      { month: 'Apr', users: 1145 },
      { month: 'Mei', users: 1245 }
    ],
    revenueGrowth: [
      { month: 'Jan', revenue: 55640 },
      { month: 'Feb', revenue: 59995 },
      { month: 'Mar', revenue: 67210 },
      { month: 'Apr', revenue: 74455 },
      { month: 'Mei', revenue: 80925 }
    ]
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // TODO: Implement analytics API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // In real implementation, fetch actual analytics data
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Fout bij laden analytics',
        description: 'Er is een fout opgetreden bij het laden van de analytics.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    toast({
      title: 'Export gestart',
      description: 'De analytics data wordt geëxporteerd naar CSV.',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Inzicht in gebruikers, inkomsten en prestaties</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-10 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white"
            >
              <option value="7d">Laatste 7 dagen</option>
              <option value="30d">Laatste 30 dagen</option>
              <option value="90d">Laatste 90 dagen</option>
              <option value="1y">Laatste jaar</option>
            </select>
            <Button onClick={loadAnalytics} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Vernieuwen
            </Button>
            <Button onClick={exportAnalytics} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporteren
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal gebruikers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{analytics.newUsersThisMonth} deze maand
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale omzet</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                +{formatCurrency(analytics.revenueThisMonth)} deze maand
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actieve abonnementen</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(analytics.conversionRate)} conversie ratio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gemiddelde omzet per gebruiker</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.avgRevenuePerUser)}</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(analytics.churnRate)} churn rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Gebruikersgroei</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData.userGrowth.map((data, index) => (
                  <div key={data.month} className="flex items-center justify-between">
                    <div className="text-sm font-medium">{data.month}</div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(data.users / 1245) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 w-12 text-right">
                        {data.users.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Omzetgroei</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData.revenueGrowth.map((data, index) => (
                  <div key={data.month} className="flex items-center justify-between">
                    <div className="text-sm font-medium">{data.month}</div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(data.revenue / 80925) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 w-16 text-right">
                        {formatCurrency(data.revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Segments and Platform Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Segments */}
          <Card>
            <CardHeader>
              <CardTitle>Gebruikerssegmenten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Huurders</span>
                  <Badge className="bg-blue-100 text-blue-800">986 (79%)</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Verhuurders</span>
                  <Badge className="bg-green-100 text-green-800">234 (19%)</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Beoordelaars</span>
                  <Badge className="bg-purple-100 text-purple-800">18 (1%)</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Beheerders</span>
                  <Badge className="bg-red-100 text-red-800">7 (1%)</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Top Prestatie Indicatoren</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Profielcompletie rate</span>
                  <Badge variant="default">87%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Document goedkeuring rate</span>
                  <Badge variant="default">94%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Gemiddelde match score</span>
                  <Badge variant="default">8.2/10</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Gebruiker tevredenheid</span>
                  <Badge variant="default">4.6/5</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Health */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">API Uptime</span>
                  <Badge className="bg-green-100 text-green-800">99.9%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Gemiddelde responstijd</span>
                  <Badge variant="outline">142ms</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Foutpercentage</span>
                  <Badge className="bg-green-100 text-green-800">0.1%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Actieve sessies</span>
                  <Badge variant="outline">234</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;