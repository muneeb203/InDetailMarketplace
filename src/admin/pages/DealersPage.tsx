import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '../../components/ui/button';

type DealerRow = {
  id: string;
  business_name: string | null;
  rating: number | null;
  is_verified: boolean | null;
  is_pro: boolean | null;
  base_location: string | null;
};

export function DealersPage() {
  const [rows, setRows] = useState<DealerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = () => {
    supabase
      .from('dealer_profiles')
      .select('id, business_name, rating, is_verified, is_pro, base_location')
      .order('business_name')
      .then(({ data, error: e }) => {
        if (e) setError(e.message);
        else setRows((data as DealerRow[]) ?? []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleVerified = async (dealerId: string, current: boolean | null) => {
    setUpdating(dealerId);
    const next = !current;
    const { error: e } = await supabase
      .from('dealer_profiles')
      .update({ is_verified: next })
      .eq('id', dealerId);
    if (e) setError(e.message);
    else load();
    setUpdating(null);
  };

  const togglePro = async (dealerId: string, current: boolean | null) => {
    setUpdating(dealerId);
    const next = !current;
    const { error: e } = await supabase
      .from('dealer_profiles')
      .update({ is_pro: next })
      .eq('id', dealerId);
    if (e) setError(e.message);
    else load();
    setUpdating(null);
  };

  if (loading && rows.length === 0) {
    return <div className="text-gray-600">Loading dealers...</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Dealers</h1>
      {error && <div className="text-red-600 bg-red-50 p-3 rounded text-sm">{error}</div>}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Business</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Verified</th>
              <th className="px-4 py-3 font-medium">Pro</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{r.business_name ?? '-'}</td>
                <td className="px-4 py-3 text-gray-600">{r.base_location ?? '-'}</td>
                <td className="px-4 py-3">{r.rating != null ? Number(r.rating).toFixed(1) : '-'}</td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updating === r.id}
                    onClick={() => toggleVerified(r.id, r.is_verified ?? false)}
                  >
                    {r.is_verified ? 'Yes' : 'No'}
                  </Button>
                </td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updating === r.id}
                    onClick={() => togglePro(r.id, r.is_pro ?? false)}
                  >
                    {r.is_pro ? 'Yes' : 'No'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="p-8 text-center text-gray-500">No dealers found</div>}
      </div>
    </div>
  );
}
