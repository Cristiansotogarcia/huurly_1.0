import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Invoice {
  id: string;
  factuur_nummer: string;
  factuur_datum: string;
  gebruiker_id: string;
  klant_naam: string;
  klant_email: string;
  bedrag_totaal: number;
  bedrag_excl_btw: number;
  btw_bedrag: number;
  btw_percentage: number;
  valuta: string;
  service_beschrijving: string;
  abonnement_type: string | null;
  transactie_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_sessie_id: string | null;
  factuur_html: string;
  verzonden: boolean;
  verzonden_op: string | null;
  bekeken: boolean;
  bekeken_op: string | null;
  aangemaakt_op: string;
  bijgewerkt_op: string;
}

export interface InvoiceFilters {
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  gebruikerId?: string;
}

export class InvoiceService {
  /**
   * Get all invoices with optional filters (admin only)
   */
  static async getAllInvoices(filters?: InvoiceFilters): Promise<Invoice[]> {
    let query = supabase
      .from('facturen')
      .select('*')
      .order('factuur_datum', { ascending: false });

    // Apply filters
    if (filters?.startDate) {
      query = query.gte('factuur_datum', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('factuur_datum', filters.endDate);
    }

    if (filters?.searchTerm) {
      query = query.or(`factuur_nummer.ilike.%${filters.searchTerm}%,klant_naam.ilike.%${filters.searchTerm}%,klant_email.ilike.%${filters.searchTerm}%`);
    }

    if (filters?.gebruikerId) {
      query = query.eq('gebruiker_id', filters.gebruikerId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching invoices:', error);
      throw new Error(`Failed to fetch invoices: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a single invoice by ID
   */
  static async getInvoiceById(id: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('facturen')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching invoice:', error);
      throw new Error(`Failed to fetch invoice: ${error.message}`);
    }

    return data;
  }

  /**
   * Get invoice by invoice number
   */
  static async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('facturen')
      .select('*')
      .eq('factuur_nummer', invoiceNumber)
      .single();

    if (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }

    return data;
  }

  /**
   * Get invoices for current user
   */
  static async getUserInvoices(): Promise<Invoice[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('facturen')
      .select('*')
      .eq('gebruiker_id', user.id)
      .order('factuur_datum', { ascending: false });

    if (error) {
      console.error('Error fetching user invoices:', error);
      throw new Error(`Failed to fetch invoices: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Mark invoice as viewed
   */
  static async markInvoiceAsViewed(id: string): Promise<void> {
    const { error } = await supabase
      .from('facturen')
      .update({
        bekeken: true,
        bekeken_op: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error marking invoice as viewed:', error);
      throw new Error(`Failed to mark invoice as viewed: ${error.message}`);
    }
  }

  /**
   * Get invoice statistics for a date range
   */
  static async getInvoiceStatistics(startDate?: string, endDate?: string) {
    let query = supabase
      .from('facturen')
      .select('bedrag_totaal, factuur_datum, valuta');

    if (startDate) {
      query = query.gte('factuur_datum', startDate);
    }

    if (endDate) {
      query = query.lte('factuur_datum', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching invoice statistics:', error);
      throw new Error(`Failed to fetch statistics: ${error.message}`);
    }

    const invoices = data || [];
    const totalRevenue = invoices.reduce((sum: number, inv: any) => sum + Number(inv.bedrag_totaal), 0);
    const invoiceCount = invoices.length;
    const averageInvoiceAmount = invoiceCount > 0 ? totalRevenue / invoiceCount : 0;

    // Group by month
    const monthlyRevenue: { [key: string]: number } = {};
    invoices.forEach((inv: any) => {
      const month = new Date(inv.factuur_datum).toISOString().substring(0, 7); // YYYY-MM
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(inv.bedrag_totaal);
    });

    return {
      totalRevenue,
      invoiceCount,
      averageInvoiceAmount,
      monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({
        month,
        revenue
      })).sort((a, b) => a.month.localeCompare(b.month))
    };
  }

  /**
   * Export invoices as CSV
   */
  static async exportToCSV(filters?: InvoiceFilters): Promise<string> {
    const invoices = await this.getAllInvoices(filters);

    const headers = [
      'Factuurnummer',
      'Datum',
      'Klant Naam',
      'Klant Email',
      'Bedrag Totaal',
      'Bedrag Excl BTW',
      'BTW Bedrag',
      'Valuta',
      'Service',
      'Transactie ID',
      'Verzonden',
      'Bekeken'
    ];

    const rows = invoices.map(inv => [
      inv.factuur_nummer,
      new Date(inv.factuur_datum).toLocaleDateString('nl-NL'),
      inv.klant_naam,
      inv.klant_email,
      inv.bedrag_totaal.toFixed(2),
      inv.bedrag_excl_btw.toFixed(2),
      inv.btw_bedrag.toFixed(2),
      inv.valuta,
      inv.service_beschrijving,
      inv.transactie_id,
      inv.verzonden ? 'Ja' : 'Nee',
      inv.bekeken ? 'Ja' : 'Nee'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Download invoice HTML
   */
  static downloadInvoiceHTML(invoice: Invoice): void {
    const blob = new Blob([invoice.factuur_html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.factuur_nummer}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Download multiple invoices as ZIP (bulk download)
   */
  static async downloadInvoicesAsZip(invoiceIds: string[]): Promise<void> {
    // This would require a ZIP library like JSZip
    // For now, we'll download them individually
    for (const id of invoiceIds) {
      const invoice = await this.getInvoiceById(id);
      if (invoice) {
        this.downloadInvoiceHTML(invoice);
        // Add small delay to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
}
