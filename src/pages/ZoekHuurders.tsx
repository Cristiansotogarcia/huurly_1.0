import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { withAuth } from '@/hocs/withAuth';
import { User } from '@/types';
import { favoritesService } from '@/services/FavoritesService';
import { logger } from '@/lib/logger';
import { Eye } from 'lucide-react';

interface ZoekHuurdersProps {
  user: User;
}

const ZoekHuurders: React.FC<ZoekHuurdersProps> = ({ user }) => {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [minBudget, setMinBudget] = useState<number | undefined>();
  const [maxBudget, setMaxBudget] = useState<number | undefined>();
  const [pets, setPets] = useState<boolean | undefined>();
  const [smoking, setSmoking] = useState<boolean | undefined>();
  const [results, setResults] = useState<any[]>([]);
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    const loadSaved = async () => {
      const res = await favoritesService.listSavedProfiles(user.id);
      if (res.success && res.data) setSaved(res.data);
    };
    loadSaved();
  }, [user.id]);

  const handleSearch = async () => {
    // Since actieve_huurders view is limited, get full tenant data
    const { data, error } = await supabase
      .from('huurders')
      .select(`
        id,
        beroep,
        beschrijving,
        locatie_voorkeur,
        max_huur,
        huisdieren,
        roken,
        beschikbaarheid_flexibel,
        profielfoto_url,
        abonnementen!inner(status),
        gebruikers!inner(naam, profiel_compleet)
      `)
      .eq('abonnementen.status', 'actief')
      .eq('gebruikers.profiel_compleet', true);

    if (error) {
      logger.error(`Search error: ${error.message}`);
      setResults([]);
      return;
    }

    // Apply client-side filtering for jobboard simplicity
    let filtered = Array.isArray(data) ? data : [];

    // Filter by city in locatie_voorkeur array
    if (city) {
      filtered = filtered.filter(tenant =>
        tenant.locatie_voorkeur?.some((loc: string) => loc.toLowerCase().includes(city.toLowerCase()))
      );
    }

    // Filter by budget range (tenant max_huur within landlord budget expectations)
    if (minBudget !== undefined) {
      filtered = filtered.filter(tenant => tenant.max_huur >= minBudget);
    }
    if (maxBudget !== undefined) {
      filtered = filtered.filter(tenant => tenant.max_huur <= maxBudget);
    }

    // Filter by lifestyle preferences
    if (pets !== undefined) {
      filtered = filtered.filter(tenant => tenant.huisdieren === pets);
    }
    if (smoking !== undefined) {
      filtered = filtered.filter(tenant => tenant.roken === smoking);
    }

    setResults(filtered);
  };

  const handleSave = async (tenantId: string) => {
    const res = await favoritesService.saveProfile(user.id, tenantId);
    if (res.success) setSaved((prev) => [...prev, tenantId]);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Zoek Huurders</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Plaats"
          className="border p-2 rounded"
        />
        <input
          type="number"
          value={minBudget ?? ''}
          onChange={(e) => setMinBudget(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="Min. Budget"
          className="border p-2 rounded"
        />
        <input
          type="number"
          value={maxBudget ?? ''}
          onChange={(e) => setMaxBudget(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="Max. Budget"
          className="border p-2 rounded"
        />
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={pets ?? false} onChange={(e) => setPets(e.target.checked)} />
          <span>Huisdieren</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={smoking ?? false} onChange={(e) => setSmoking(e.target.checked)} />
          <span>Roken</span>
        </label>
      </div>
      <button onClick={handleSearch} className="px-4 py-2 bg-blue-600 text-white rounded">
        Zoeken
      </button>
      <div className="mt-6 overflow-x-auto">
        {results.length === 0 ? (
          <p>Geen resultaten</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-sm">Naam</th>
                <th className="px-3 py-2 text-left text-sm">Beroep</th>
                <th className="px-3 py-2 text-left text-sm">Max Budget</th>
                <th className="px-3 py-2 text-left text-sm">Plaatsen</th>
                <th className="px-3 py-2 text-left text-sm">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2">{r.gebruikers.naam}</td>
                  <td className="px-3 py-2">{r.beroep || 'Niet opgegeven'}</td>
                  <td className="px-3 py-2">€{r.max_huur}</td>
                  <td className="px-3 py-2">{r.locatie_voorkeur?.join(', ') || 'Niet opgegeven'}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/tenant/${r.id}`)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        title="Bekijk volledig profiel"
                      >
                        <Eye className="h-4 w-4" />
                        Bekijk
                      </button>
                      {saved.includes(r.id) ? (
                        <span className="text-green-600 text-sm">✓ Opgeslagen</span>
                      ) : (
                        <button
                          onClick={() => handleSave(r.id)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Opslaan
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default withAuth(ZoekHuurders, 'verhuurder');
