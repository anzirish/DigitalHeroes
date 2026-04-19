import { useEffect, useState } from 'react';
import { Plus, Play, Eye, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function AdminDraws() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simResult, setSimResult] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newDraw, setNewDraw] = useState({ draw_month: '', draw_mode: 'random' });
  const [drawMonthInput, setDrawMonthInput] = useState('');
  const [confirm, setConfirm] = useState(null); // { type: 'run'|'publish', id, mode }

  const fetchDraws = async () => {
    try {
      const { data } = await api.get('/admin/draws');
      setDraws(data);
    } catch {
      toast.error('Failed to load draws');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDraws(); }, []);

  const createDraw = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/draws', newDraw);
      toast.success('Draw created');
      setCreating(false);
      setDrawMonthInput('');
      setNewDraw({ draw_month: '', draw_mode: 'random' });
      fetchDraws();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create draw');
    }
  };

  const simulate = async (id, mode) => {
    try {
      const { data } = await api.post(`/admin/draws/${id}/simulate`, { draw_mode: mode });
      setSimResult(data);
      toast.success('Simulation complete');
    } catch {
      toast.error('Simulation failed');
    }
  };

  const runDraw = async (id, mode) => {
    try {
      await api.post(`/admin/draws/${id}/run`, { draw_mode: mode });
      toast.success('Draw run successfully');
      setConfirm(null);
      fetchDraws();
    } catch {
      toast.error('Draw failed');
    }
  };

  const publishDraw = async (id) => {
    try {
      await api.post(`/admin/draws/${id}/publish`);
      toast.success('Draw published');
      setConfirm(null);
      fetchDraws();
    } catch {
      toast.error('Publish failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Draws</h1>
        <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-2 text-sm py-2">
          <Plus size={16} /> New Draw
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="card mb-6">
          <h2 className="font-bold text-white mb-4">Create Draw</h2>
          <form onSubmit={createDraw} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="label">Draw Month</label>
              <input
                type="month"
                className="input"
                value={drawMonthInput}
                onChange={(e) => {
                  setDrawMonthInput(e.target.value);
                  setNewDraw({ ...newDraw, draw_month: e.target.value ? e.target.value + '-01' : '' });
                }}
                required
              />
            </div>
            <div>
              <label className="label">Mode</label>
              <select
                className="input"
                value={newDraw.draw_mode}
                onChange={(e) => setNewDraw({ ...newDraw, draw_mode: e.target.value })}
              >
                <option value="random">Random</option>
                <option value="algorithmic">Algorithmic</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">Create</button>
            <button type="button" onClick={() => setCreating(false)} className="btn-secondary">Cancel</button>
          </form>
        </div>
      )}

      {/* Simulation result */}
      {simResult && (
        <div className="card mb-6 border-brand-800 bg-brand-900/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white">Simulation Result</h3>
            <button onClick={() => setSimResult(null)} className="text-gray-500 hover:text-white text-xs">Dismiss</button>
          </div>
          <div className="flex gap-2 mb-3">
            {simResult.winningNumbers?.map((n, i) => (
              <div key={i} className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-sm">{n}</div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {Object.entries(simResult.prizeBreakdown || {}).map(([tier, info]) => (
              <div key={tier} className="bg-dark-700 rounded-xl p-3">
                <div className="text-gray-400 text-xs mb-1">{tier}</div>
                <div className="text-white font-bold">{info.userIds?.length || 0} winners</div>
                <div className="text-gold-400 text-xs">£{info.perWinner?.toFixed(2)} each</div>
              </div>
            ))}
          </div>
          <div className="text-gray-500 text-xs mt-2">Total pool: £{simResult.totalPool?.toFixed(2)} | Jackpot rollover: £{simResult.jackpotRollover?.toFixed(2)}</div>
        </div>
      )}

      {/* Draws table */}
      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-700">
              <th className="text-left text-gray-500 font-medium px-4 py-3">Month</th>
              <th className="text-left text-gray-500 font-medium px-4 py-3">Mode</th>
              <th className="text-left text-gray-500 font-medium px-4 py-3">Status</th>
              <th className="text-left text-gray-500 font-medium px-4 py-3">Winning Numbers</th>
              <th className="text-left text-gray-500 font-medium px-4 py-3">Pool</th>
              <th className="text-left text-gray-500 font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : draws.map((d) => (
              <tr key={d.id} className="border-b border-dark-700/50">
                <td className="px-4 py-3 text-white font-medium">
                  {new Date(d.draw_month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 text-gray-400 capitalize">{d.draw_mode}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    d.status === 'published' ? 'bg-brand-900/50 text-brand-400' :
                    d.status === 'completed' ? 'bg-blue-900/30 text-blue-400' :
                    'bg-dark-700 text-gray-500'
                  }`}>{d.status}</span>
                </td>
                <td className="px-4 py-3">
                  {d.winning_numbers ? (
                    <div className="flex gap-1">
                      {d.winning_numbers.map((n, i) => (
                        <span key={i} className="w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{n}</span>
                      ))}
                    </div>
                  ) : <span className="text-gray-600">—</span>}
                </td>
                <td className="px-4 py-3 text-gold-400 font-medium">
                  {d.total_pool ? `£${d.total_pool.toFixed(2)}` : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {d.status === 'pending' && (
                      <>
                        <button
                          onClick={() => simulate(d.id, d.draw_mode)}
                          className="text-gray-400 hover:text-brand-400 transition-colors"
                          title="Simulate"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setConfirm({ type: 'run', id: d.id, mode: d.draw_mode })}
                          className="text-gray-400 hover:text-green-400 transition-colors"
                          title="Run Draw"
                        >
                          <Play size={16} />
                        </button>
                      </>
                    )}
                    {d.status === 'completed' && (
                      <button
                        onClick={() => setConfirm({ type: 'publish', id: d.id })}
                        className="text-gray-400 hover:text-gold-400 transition-colors"
                        title="Publish"
                      >
                        <Send size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirm?.type === 'run'}
        title="Run this draw?"
        message="Results will be saved. You can publish them after reviewing."
        confirmLabel="Run Draw"
        variant="warning"
        onConfirm={() => runDraw(confirm.id, confirm.mode)}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.type === 'publish'}
        title="Publish draw results?"
        message="Results will be visible to all users immediately."
        confirmLabel="Publish"
        variant="warning"
        onConfirm={() => publishDraw(confirm.id)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
