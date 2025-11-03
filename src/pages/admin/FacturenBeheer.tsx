import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, Download, FileText, Search, 
  Euro, TrendingUp, Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InvoiceService, Invoice, InvoiceFilters } from '@/services/InvoiceService';

const FacturenBeheer: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Statistics
  const [stats, setStats] = useState({
    totalRevenue: 0,
    invoiceCount: 0,
    averageAmount: 0
  });

  // Load invoices
  useEffect(() => {
    loadInvoices();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [searchTerm, startDate, endDate, invoices]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await InvoiceService.getAllInvoices();
      setInvoices(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast({
        title: 'Fout bij laden',
        description: 'Kon facturen niet laden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(inv => 
        inv.factuur_nummer.toLowerCase().includes(term) ||
        inv.klant_naam.toLowerCase().includes(term) ||
        inv.klant_email.toLowerCase().includes(term)
      );
    }

    if (startDate) {
      filtered = filtered.filter(inv => 
        new Date(inv.factuur_datum) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(inv => 
        new Date(inv.factuur_datum) <= new Date(endDate)
      );
    }

    setFilteredInvoices(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (data: Invoice[]) => {
    const totalRevenue = data.reduce((sum, inv) => sum + Number(inv.bedrag_totaal), 0);
    const invoiceCount = data.length;
    const averageAmount = invoiceCount > 0 ? totalRevenue / invoiceCount : 0;

    setStats({
      totalRevenue,
      invoiceCount,
      averageAmount
    });
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    InvoiceService.downloadInvoiceHTML(invoice);
    toast({
      title: 'Download gestart',
      description: `Factuur ${invoice.factuur_nummer} wordt gedownload`
    });
  };

  const handlePreviewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPreview(true);
  };

  const handleExportCSV = async () => {
    try {
      const filters: InvoiceFilters = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        searchTerm: searchTerm || undefined
      };

      const csvContent = await InvoiceService.exportToCSV(filters);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facturen_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export geslaagd',
        description: 'CSV bestand is gedownload'
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: 'Export mislukt',
        description: 'Kon CSV niet genereren',
        variant: 'destructive'
      });
    }
  };

  const handleBulkDownload = async () => {
    const invoiceIds = filteredInvoices.map(inv => inv.id);
    
    if (invoiceIds.length === 0) {
      toast({
        title: 'Geen facturen',
        description: 'Er zijn geen facturen om te downloaden',
        variant: 'destructive'
      });
      return;
    }

    if (invoiceIds.length > 20) {
      toast({
        title: 'Te veel facturen',
        description: 'Download maximaal 20 facturen tegelijk',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Download gestart',
      description: `${invoiceIds.length} facturen worden gedownload...`
    });

    await InvoiceService.downloadInvoicesAsZip(invoiceIds);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Facturen laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/beheerder-dashboard')}
            className="mb-4 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Facturenbeheer</h1>
          <p className="text-gray-600 mt-2">
            Beheer en download alle gegenereerde facturen
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Omzet</CardTitle>
              <Euro className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {filteredInvoices.length === invoices.length ? 'Totaal' : 'Gefilterd'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aantal Facturen</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.invoiceCount}</div>
              <p className="text-xs text-gray-500 mt-1">
                {filteredInvoices.length === invoices.length ? 'Totaal' : 'Gefilterd'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gemiddeld Bedrag</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.averageAmount)}</div>
              <p className="text-xs text-gray-500 mt-1">Per factuur</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Zoeken & Filteren</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  size="sm"
                  disabled={filteredInvoices.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  onClick={handleBulkDownload}
                  variant="outline"
                  size="sm"
                  disabled={filteredInvoices.length === 0 || filteredInvoices.length > 20}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Alle ({filteredInvoices.length})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="search">Zoeken</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Zoek op factuurnummer, naam of email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Van datum</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Tot datum</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Facturen Overzicht</CardTitle>
            <CardDescription>
              {filteredInvoices.length} {filteredInvoices.length === 1 ? 'factuur' : 'facturen'} gevonden
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Nummer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Datum</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Klant</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Bedrag</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Service</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        Geen facturen gevonden
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm">{invoice.factuur_nummer}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(invoice.factuur_datum).toLocaleDateString('nl-NL')}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-sm">{invoice.klant_naam}</p>
                            <p className="text-xs text-gray-500">{invoice.klant_email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(invoice.bedrag_totaal)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {invoice.service_beschrijving}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePreviewInvoice(invoice)}
                              title="Bekijk factuur"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadInvoice(invoice)}
                              title="Download factuur"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Preview Modal */}
        {showPreview && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Factuur {selectedInvoice.factuur_nummer}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  Sluiten
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <iframe
                  srcDoc={selectedInvoice.factuur_html}
                  className="w-full h-full border-0"
                  title="Invoice Preview"
                  style={{ minHeight: '600px' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacturenBeheer;
