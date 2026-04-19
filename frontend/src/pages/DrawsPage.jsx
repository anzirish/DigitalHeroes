import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../lib/api';

export default function DrawsPage() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/draws')
      .then((r) => setDraws(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold text-white mb-4">Monthly Draws</h1>
            <p className="text-gray-400">Match 3, 4, or 5 numbers to win your share of the prize pool.</p>
          </motion.div>

          {/* Prize tiers */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            {[
              { match: '5 Numbers', share: '40%', label: 'Jackpot', rollover: true },
              { match: '4 Numbers', share: '35%', label: 'Major Prize' },
              { match: '3 Numbers', share: '25%', label: 'Prize' },
            ].map((t, i) => (
              <motion.div
                key={t.match}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`card text-center ${i === 0 ? 'border-gold-600/30 bg-gold-500/5' : ''}`}
              >
                <div className={`text-3xl font-display font-bold ${i === 0 ? 'text-gold-400' : 'text-brand-400'}`}>{t.share}</div>
                <div className="text-white text-sm font-medium mt-1">{t.match}</div>
                <div className="text-gray-500 text-xs">{t.label}</div>
                {t.rollover && <div className="text-xs text-gold-400 mt-2">Rolls over if unclaimed</div>}
              </motion.div>
            ))}
          </div>

          {/* Draw history */}
          <h2 className="font-display font-bold text-white text-xl mb-4">Draw Results</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : draws.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">
              No draws published yet. Check back soon!
            </div>
          ) : (
            <div className="space-y-4">
              {draws.map((draw, i) => (
                <motion.div
                  key={draw.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-900/50 rounded-xl flex items-center justify-center">
                        <Trophy size={18} className="text-brand-400" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          {new Date(draw.draw_month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                        </div>
                        <div className="text-gray-500 text-xs flex items-center gap-1">
                          <Calendar size={10} />
                          Published {new Date(draw.published_at).toLocaleDateString('en-GB')}
                        </div>
                      </div>
                    </div>
                    {draw.jackpot_amount > 0 && (
                      <div className="text-gold-400 font-bold">£{draw.jackpot_amount?.toFixed(2)}</div>
                    )}
                  </div>

                  {draw.winning_numbers && (
                    <div>
                      <p className="text-gray-500 text-xs mb-2">Winning numbers</p>
                      <div className="flex gap-2">
                        {draw.winning_numbers.map((n, idx) => (
                          <div
                            key={idx}
                            className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          >
                            {n}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
