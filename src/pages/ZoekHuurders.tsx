import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { withAuth } from '@/hocs/withAuth';
import { User } from '@/types';
import { computeCompatibility, SearchCriteria } from '@/lib/matching';
import { favoritesService } from '@/services/FavoritesService';
import { logger } from '@/lib/logger';

interface ZoekHuurdersProps {
  user: User;
}

const ZoekHuurders: React.FC<ZoekHuurdersProps> = ({ user }) => {
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
    const { data, error } = await supabase.rpc('zoek_huurders', {
      in_city: city || null,
      min_budget: minBudget ?? null,
      max_budget: maxBudget ?? null,
      huisdieren: typeof pets === 'boolean' ? pets : null,
      roken: typeof smoking === 'boolean' ? smoking : null,
    });

    if (error) {
      logger.error('Search error', error);
      setResults([]);
      return;
    }

    const criteria: SearchCriteria = {
      city: city || undefined,
      minBudget,
      maxBudget,
      lifestyle: { huisdieren: pets, roken: smoking },
    };

    const enriched = (data || []).map((t: any) => ({
      ...t,
      compatibility: computeCompatibility(t, criteria),
    }));
    setResults(enriched);
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
                <th className="px-3 py-2 text-left text-sm">Max Budget</th>
                <th className="px-3 py-2 text-left text-sm">Compatibiliteit</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2">{r.naam}</td>
                  <td className="px-3 py-2">€{r.max_huur}</td>
                  <td className="px-3 py-2">{r.compatibility.total}%</td>
                  <td className="px-3 py-2">
                    {saved.includes(r.id) ? (
                      <span className="text-green-600">Opgeslagen</span>
                    ) : (
                      <button
                        onClick={() => handleSave(r.id)}
                        className="text-blue-600 hover:underline"
                      >
                        Opslaan
                      </button>
                    )}
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
