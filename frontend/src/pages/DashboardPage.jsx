import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Heart, Calendar, Plus, Edit2, Trash2, Check, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import ConfirmDialog from '../components/ConfirmDialog';
import api from '../lib/api';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scoreForm, setScoreForm] = useState({ score: '', score_date: '' });
  const [editingScore, setEditingScore] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // score id to delete

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/users/dashboard');
      setData(res.data);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const addScore = async (e) => {
    e.preventDefault();
    try {
      await api.post('/scores', scoreForm);
      toast.success('Score added!');
      setScoreForm({ score: '', score_date: '' });
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add score');
    }
  };

  const updateScore = async (id) => {
    try {
      await api.put(`/scores/${id}`, { score: Number(editValue) });
      toast.success('Score updated');
      setEditingScore(null);
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update score');
    }
  };

  const deleteScore = async (id) => {
    try {
      await api.delete(`/scores/${id}`);
      toast.success('Score deleted');
      setDeleteConfirm(null);
      fetchDashboard();
    } catch {
      toast.error('Failed to delete score');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { user, scores, winnings, totalWon, upcomingDraw } = data || {};
  const isActive = user?.subscription_status === 'active';

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
            <h1 className="text-3xl font-display font-bold text-white">
              Hey, {user?.full_name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-400 mt-1">Here's your GolfGives overview.</p>
          </motion.div>

          {/* Subscription banner if inactive */}
          {!isActive && (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-6 card border-gold-600/40 bg-gold-500/5 flex items-center gap-4">
              <AlertCircle size={20} className="text-gold-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-white font-medium">No active subscription</p>
                <p className="text-gray-400 text-sm">Subscribe to enter draws and track scores.</p>
              </div>
              <Link to="/subscribe" className="btn-gold text-sm py-2 px-4">Subscribe</Link>
            </motion.div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                icon: <Trophy size={20} className="text-gold-400" />,
                label: 'Total Won',
                value: `£${totalWon?.toFixed(2) || '0.00'}`,
                bg: 'bg-gold-500/10',
              },
              {
                icon: <Target size={20} className="text-brand-400" />,
                label: 'Scores Entered',
                value: scores?.length || 0,
                bg: 'bg-brand-900/30',
              },
              {
                icon: <Heart size={20} className="text-red-400" />,
                label: 'Charity %',
                value: `${user?.charity_percentage || 10}%`,
                bg: 'bg-red-900/20',
              },
              {
                icon: <Calendar size={20} className="text-purple-400" />,
                label: 'Draws Won',
                value: winnings?.filter((w) => w.payment_status === 'paid').length || 0,
                bg: 'bg-purple-900/20',
              },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial="hidden" animate="visible" variants={fadeUp} custom={i} className="card">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-display font-bold text-white">{stat.value}</div>
                <div className="text-gray-500 text-sm mt-0.5">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Score Entry */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="card">
              <h2 className="font-display font-bold text-white text-lg mb-4 flex items-center gap-2">
                <Target size={18} className="text-brand-400" />
                My Scores
              </h2>

              {isActive && (
                <form onSubmit={addScore} className="flex gap-2 mb-5">
                  <input
                    type="number"
                    min={1}
                    max={45}
                    placeholder="Score (1-45)"
                    className="input flex-1"
                    value={scoreForm.score}
                    onChange={(e) => setScoreForm({ ...scoreForm, score: e.target.value })}
                    required
                  />
                  <input
                    type="date"
                    className="input flex-1"
                    value={scoreForm.score_date}
                    onChange={(e) => setScoreForm({ ...scoreForm, score_date: e.target.value })}
                    required
                  />
                  <button type="submit" className="btn-primary px-3 py-2">
                    <Plus size={18} />
                  </button>
                </form>
              )}

              {scores?.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">No scores yet. Add your first score above.</p>
              ) : (
                <div className="space-y-2">
                  {scores?.map((s) => (
                    <div key={s.id} className="flex items-center justify-between bg-dark-700 rounded-xl px-4 py-3">
                      {editingScore === s.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="number"
                            min={1}
                            max={45}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="input w-20 py-1 text-sm"
                          />
                          <button onClick={() => updateScore(s.id)} className="text-brand-400 hover:text-brand-300">
                            <Check size={16} />
                          </button>
                          <button onClick={() => setEditingScore(null)} className="text-gray-500 hover:text-gray-300">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <span className="text-white font-bold text-lg">{s.score}</span>
                            <span className="text-gray-500 text-xs ml-2">pts</span>
                          </div>
                          <div className="text-gray-500 text-sm">
                            {new Date(s.score_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          {isActive && (
                            <div className="flex gap-2">
                              <button onClick={() => { setEditingScore(s.id); setEditValue(s.score); }} className="text-gray-500 hover:text-brand-400">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => setDeleteConfirm(s.id)} className="text-gray-500 hover:text-red-400">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-gray-600 text-xs mt-3">
                Only your latest 5 scores are kept. Adding a new one removes the oldest.
              </p>
            </motion.div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Subscription */}
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5} className="card">
                <h2 className="font-display font-bold text-white text-lg mb-4">Subscription</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={isActive ? 'badge-active' : 'badge-inactive'}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-brand-400' : 'bg-red-400'}`} />
                      {isActive ? 'Active' : 'Inactive'}
                    </div>
                    {user?.subscription_plan && (
                      <p className="text-gray-400 text-sm mt-2 capitalize">{user.subscription_plan} plan</p>
                    )}
                    {user?.subscription_end_date && (
                      <p className="text-gray-500 text-xs mt-1">
                        Renews {new Date(user.subscription_end_date).toLocaleDateString('en-GB')}
                      </p>
                    )}
                  </div>
                  {!isActive && (
                    <Link to="/subscribe" className="btn-primary text-sm py-2 px-4">Subscribe</Link>
                  )}
                </div>
              </motion.div>

              {/* Charity */}
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6} className="card">
                <h2 className="font-display font-bold text-white text-lg mb-4 flex items-center gap-2">
                  <Heart size={18} className="text-red-400" />
                  My Charity
                </h2>
                {user?.charities ? (
                  <div className="flex items-center gap-3">
                    {user.charities.image_url && (
                      <img src={user.charities.image_url} alt={user.charities.name} className="w-12 h-12 rounded-xl object-cover" />
                    )}
                    <div>
                      <p className="text-white font-medium">{user.charities.name}</p>
                      <p className="text-brand-400 text-sm">{user.charity_percentage}% of subscription</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No charity selected yet.</p>
                )}
              </motion.div>

              {/* Upcoming draw */}
              {upcomingDraw && (
                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={7} className="card border-brand-800 bg-brand-900/10">
                  <h2 className="font-display font-bold text-white text-lg mb-2 flex items-center gap-2">
                    <Trophy size={18} className="text-gold-400" />
                    Next Draw
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {new Date(upcomingDraw.draw_month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">Your scores are your entries.</p>
                </motion.div>
              )}

              {/* Winnings */}
              {winnings?.length > 0 && (
                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={8} className="card">
                  <h2 className="font-display font-bold text-white text-lg mb-4">Winnings</h2>
                  <div className="space-y-2">
                    {winnings.slice(0, 5).map((w) => (
                      <div key={w.id} className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-white font-medium capitalize">{w.match_type}</span>
                          <span className="text-gray-500 ml-2 text-xs">
                            {w.draws?.draw_month && new Date(w.draws.draw_month).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gold-400 font-bold">£{w.prize_amount?.toFixed(2)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            w.payment_status === 'paid' ? 'bg-brand-900/50 text-brand-400' :
                            w.payment_status === 'pending' ? 'bg-gold-500/10 text-gold-400' :
                            'bg-dark-700 text-gray-500'
                          }`}>
                            {w.payment_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete this score?"
        message="This score will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteScore(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
