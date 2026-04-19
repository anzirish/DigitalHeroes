import { useEffect, useState } from 'react';
import { Check, X, DollarSign, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function AdminWinners() {
  const [winners, setWinners] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchWinners = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/winners${filter ? `?status=${filter}` : ''}`);
      setWinners(data);
    } catch {
      toast.error('Failed to load winners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWinners(); }, [filter]);

  const verify = async (id, action) => {
    try {
      await api.put(`/admin/winners/${id}/verify`, { action });
      toast.success(`Winner ${action === 'approve' ? 'approved' : 'rejected'}`);
      fetchWinners();
    } catch {
      toast.error('Action failed');
    }
  };

  const markPaid = async (id) => {
    try {
      await api.put(`/admin/winners/${id}/mark-paid`);
      toast.success('Marked as paid');
      fetchWinners();
    } catch {
      toast.error('Failed to mark paid');
    }
  };

  const statusColor = (s) => {
    if (s === 'paid') return 'bg-brand-900/50 text-brand-400';
    if (s === 'approved') return 'bg-blue-900/30 text-blue-400';
    if (s === 'rejected') return 'bg-red-900/30 text-red-400';
    if (s === 'pending_verification') return 'bg-gold-500/10 text-gold-400';
    return 'bg-dark-700 text-gray-500';
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Winners</h1>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'pending', 'pending_verification', 'approved', 'rejected', 'paid'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              filter === s ? 'border-brand-500 bg-brand-900/30 text-brand-400' : 'border-dark-600 text-gray-400 hover:border-dark-500'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-700">
              <th className="text-left text-gray-500 font-medium px-4 py-3">Winner</th>
              <th className="text-left text-gray-500 font-medium px-4 py-3">Draw</th>
              <th className="text-left text-gray-500 font-medium px-4 py-3">Match</th>
              <th className="text-left text-gray-500 font-medium px-4 py-3">Prize</th>
              <th className="text-left text-gray-500 font-medium px-4 py-3">Status</th>
              <th className="text-left text-gray-500 font-medium px-4 py-3">Proof</th>
              <th className="text-left text-gray-500 font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : winners.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-500">No winners found</td></tr>
            ) : winners.map((w) => (
              <tr key={w.id} className="border-b border-dark-700/50">
                <td className="px-4 py-3">
                  <div className="text-white font-medium">{w.users?.full_name}</div>
                  <div className="text-gray-500 text-xs">{w.users?.email}</div>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {w.draws?.draw_month && new Date(w.draws.draw_month).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-white capitalize">{w.match_type}</td>
                <td className="px-4 py-3 text-gold-400 font-bold">£{w.prize_amount?.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColor(w.payment_status)}`}>
                    {w.payment_status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {w.proof_url ? (
                    <a href={w.proof_url} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300">
                      <ExternalLink size={14} />
                    </a>
                  ) : <span className="text-gray-600">—</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {w.payment_status === 'pending_verification' && (
                      <>
                        <button onClick={() => verify(w.id, 'approve')} className="text-green-400 hover:text-green-300" title="Approve">
                          <Check size={16} />
                        </button>
                        <button onClick={() => verify(w.id, 'reject')} className="text-red-400 hover:text-red-300" title="Reject">
                          <X size={16} />
                        </button>
                      </>
                    )}
                    {w.payment_status === 'approved' && (
                      <button onClick={() => markPaid(w.id)} className="text-gold-400 hover:text-gold-300" title="Mark Paid">
                        <DollarSign size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
