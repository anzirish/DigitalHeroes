import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/users?page=${page}&search=${search}`);
      setUsers(data.data);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const updateUser = async (id, updates) => {
    try {
      await api.put(`/admin/users/${id}`, updates);
      toast.success('User updated');
      fetchUsers();
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Users</h1>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search by email..."
          className="input pl-9"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left text-gray-500 font-medium px-4 py-3">Name</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Email</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Status</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Plan</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Role</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{u.full_name}</td>
                  <td className="px-4 py-3 text-gray-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.subscription_status}
                      onChange={(e) => updateUser(u.id, { subscription_status: e.target.value })}
                      className="bg-dark-700 border border-dark-600 rounded-lg px-2 py-1 text-xs text-white"
                    >
                      {['active', 'inactive', 'cancelling', 'lapsed'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-400 capitalize">{u.subscription_plan || '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => updateUser(u.id, { role: e.target.value })}
                      className="bg-dark-700 border border-dark-600 rounded-lg px-2 py-1 text-xs text-white"
                    >
                      <option value="subscriber">subscriber</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(u.created_at).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-dark-700">
          <span className="text-gray-500 text-sm">{total} total users</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary py-1.5 px-3 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-gray-400 text-sm flex items-center px-2">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={users.length < 20}
              className="btn-secondary py-1.5 px-3 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
