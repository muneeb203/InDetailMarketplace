import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface ProfileRow {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  created_at: string | null;
}

export function UsersPage() {
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error: e }) => {
        if (e) setError(e.message);
        else setRows((data as ProfileRow[]) ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-600">Loading users...</div>;
  if (error) return <div className="text-red-600 bg-red-50 p-4 rounded">{error}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{r.name ?? '—'}</td>
                <td className="px-4 py-3">{r.email ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800">{r.role ?? '—'}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="p-8 text-center text-gray-500">No users found</div>
        )}
      </div>
    </div>
  );
}
