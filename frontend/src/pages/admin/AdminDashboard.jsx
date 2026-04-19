import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Heart, TrendingUp } from 'lucide-react';
import api from '../../lib/api';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then((r) => setAnalytics(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const stats = [
    { label: 'Total Users', value: analytics?.totalUsers || 0, icon: <Users size={20} className="text-brand-400" />, bg: 'bg-brand-900/30' },
    { label: 'Active Subscribers', value: analytics?.activeSubscribers || 0, icon: <TrendingUp size={20} className="text-green-400" />, bg: 'bg-green-900/20' },
    { label: 'Draws Run', value: analytics?.drawStats?.length || 0, icon: <Trophy size={20} className="text-gold-400" />, bg: 'bg-gold-500/10' },
    { label: 'Charities', value: analytics?.charityTotals?.length || 0, icon: <Heart size={20} className="text-red-400" />, bg: 'bg-red-900/20' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card"
          >
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <div className="text-2xl font-display font-bold text-white">{s.value}</div>
            <div className="text-gray-500 text-sm mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent draws */}
      {analytics?.drawStats?.length > 0 && (
        <div className="card">
          <h2 className="font-display font-bold text-white text-lg mb-4">Recent Draws</h2>
          <div className="space-y-3">
            {analytics.drawStats.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0">
                <div>
                  <span className="text-white text-sm font-medium">
                    {new Date(d.draw_month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </span>
                  <span className={`ml-3 text-xs px-2 py-0.5 rounded-full ${
                    d.status === 'published' ? 'bg-brand-900/50 text-brand-400' :
                    d.status === 'completed' ? 'bg-blue-900/30 text-blue-400' :
                    'bg-dark-700 text-gray-500'
                  }`}>{d.status}</span>
                </div>
                <span className="text-gold-400 font-bold text-sm">£{d.total_pool?.toFixed(2) || '0.00'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
