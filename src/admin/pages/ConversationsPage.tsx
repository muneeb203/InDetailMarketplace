import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface ConvRow {
  id: string;
  client_id: string;
  dealer_id: string;
  created_at: string | null;
}

export function ConversationsPage() {
  const [rows, setRows] = useState<ConvRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('conversations')
      .select('id, client_id, dealer_id, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error: e }) => {
        if (e) setError(e.message);
        else setRows((data as ConvRow[]) ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-600">Loading conversations...</div>;
  if (error) return <div className="text-red-600 bg-red-50 p-4 rounded">{error}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Conversation ID</th>
              <th className="px-4 py-3 font-medium">Client ID</th>
              <th className="px-4 py-3 font-medium">Detailer ID</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-mono text-xs">{r.id.slice(0, 8)}…</td>
                <td className="px-4 py-3 font-mono text-xs">{r.client_id.slice(0, 8)}…</td>
                <td className="px-4 py-3 font-mono text-xs">{r.dealer_id.slice(0, 8)}…</td>
                <td className="px-4 py-3 text-gray-500">
                  {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="p-8 text-center text-gray-500">No conversations found</div>
        )}
      </div>
    </div>
  );
}
