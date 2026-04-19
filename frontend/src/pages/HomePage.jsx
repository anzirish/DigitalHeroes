import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Trophy, Target, ArrowRight, Star, Users, DollarSign } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useEffect, useState } from 'react';
import api from '../lib/api';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
  }),
};

export default function HomePage() {
  const [charities, setCharities] = useState([]);
  const [draws, setDraws] = useState([]);

  useEffect(() => {
    api.get('/charities?featured=true').then((r) => setCharities(r.data)).catch(() => {});
    api.get('/draws').then((r) => setDraws(r.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 bg-brand-900/50 border border-brand-800 text-brand-400 text-sm font-medium px-4 py-2 rounded-full mb-8"
          >
            <Heart size={14} className="fill-brand-400" />
            Play golf. Change lives.
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="text-5xl sm:text-7xl font-display font-bold text-white leading-tight mb-6"
          >
            Every score you enter<br />
            <span className="text-brand-400">funds a cause</span> you love.
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-10"
          >
            Subscribe, track your Stableford scores, enter monthly prize draws, and automatically
            support the charity of your choice — all in one place.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/subscribe" className="btn-gold text-lg px-8 py-4 flex items-center justify-center gap-2">
              Start Playing <ArrowRight size={18} />
            </Link>
            <Link to="/charities" className="btn-secondary text-lg px-8 py-4">
              Explore Charities
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
            className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { label: 'Monthly Draw', value: '£10K+' },
              { label: 'Charities', value: '50+' },
              { label: 'Players', value: '2,400+' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-display font-bold text-white">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold text-white mb-4">How it works</h2>
            <p className="text-gray-400 text-lg">Three simple steps to play, win, and give.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users size={28} className="text-brand-400" />,
                step: '01',
                title: 'Subscribe',
                desc: 'Choose a monthly or yearly plan. A portion of your subscription automatically goes to your chosen charity.',
              },
              {
                icon: <Target size={28} className="text-brand-400" />,
                step: '02',
                title: 'Enter Your Scores',
                desc: 'Log your last 5 Stableford scores. Your scores are your draw entries — the better you play, the better your chances.',
              },
              {
                icon: <Trophy size={28} className="text-brand-400" />,
                step: '03',
                title: 'Win Monthly Prizes',
                desc: 'Every month we draw 5 numbers. Match 3, 4, or all 5 to win your share of the prize pool.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="card relative overflow-hidden group hover:border-brand-700 transition-colors"
              >
                <div className="absolute top-4 right-4 text-6xl font-display font-bold text-dark-700 group-hover:text-dark-600 transition-colors">
                  {item.step}
                </div>
                <div className="w-12 h-12 bg-brand-900/50 rounded-xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize Pool */}
      <section className="py-24 px-4 bg-dark-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-4xl font-display font-bold text-white mb-4">Monthly Prize Pool</h2>
            <p className="text-gray-400 mb-12">Three tiers of prizes. Every month. Jackpot rolls over if unclaimed.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { match: '5 Numbers', share: '40%', label: 'Jackpot', rollover: true, color: 'gold' },
              { match: '4 Numbers', share: '35%', label: 'Major Prize', rollover: false, color: 'brand' },
              { match: '3 Numbers', share: '25%', label: 'Prize', rollover: false, color: 'brand' },
            ].map((tier, i) => (
              <motion.div
                key={tier.match}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className={`card text-center ${tier.color === 'gold' ? 'border-gold-600/40 bg-gold-500/5' : ''}`}
              >
                <div className={`text-4xl font-display font-bold mb-1 ${tier.color === 'gold' ? 'text-gold-400' : 'text-brand-400'}`}>
                  {tier.share}
                </div>
                <div className="text-white font-semibold mb-1">{tier.match}</div>
                <div className="text-gray-500 text-sm">{tier.label}</div>
                {tier.rollover && (
                  <div className="mt-3 text-xs text-gold-400 bg-gold-500/10 rounded-full px-3 py-1 inline-block">
                    Jackpot rolls over
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Charities */}
      {charities.length > 0 && (
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
              <h2 className="text-4xl font-display font-bold text-white mb-4">Charities we support</h2>
              <p className="text-gray-400">Choose the cause that matters most to you.</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {charities.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i}
                >
                  <Link to={`/charities/${c.id}`} className="card block hover:border-brand-700 transition-all hover:-translate-y-1 group">
                    {c.image_url && (
                      <img src={c.image_url} alt={c.name} className="w-full h-36 object-cover rounded-xl mb-4" />
                    )}
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-white text-sm">{c.name}</h3>
                      {c.is_featured && <Star size={14} className="text-gold-400 fill-gold-400 flex-shrink-0 mt-0.5" />}
                    </div>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{c.description}</p>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link to="/charities" className="btn-secondary inline-flex items-center gap-2">
                View all charities <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="card text-center border-brand-800 bg-gradient-to-br from-brand-900/30 to-dark-800"
          >
            <div className="w-16 h-16 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Heart size={28} className="text-brand-400 fill-brand-400/30" />
            </div>
            <h2 className="text-3xl font-display font-bold text-white mb-4">
              Ready to play with purpose?
            </h2>
            <p className="text-gray-400 mb-8">
              Join thousands of golfers who are winning prizes and funding charities every month.
            </p>
            <Link to="/subscribe" className="btn-gold inline-flex items-center gap-2 text-lg px-8 py-4">
              Subscribe Now <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-700 py-8 px-4 text-center text-gray-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy size={14} className="text-brand-500" />
          <span className="font-display font-bold text-gray-400">GolfGives</span>
        </div>
        <p>© {new Date().getFullYear()} GolfGives. All rights reserved.</p>
      </footer>
    </div>
  );
}
