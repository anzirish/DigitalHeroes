import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../lib/api';

export default function CharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      api.get(`/charities?search=${search}`)
        .then((r) => setCharities(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-900/20 border border-red-900/40 text-red-400 text-sm px-4 py-2 rounded-full mb-4">
              <Heart size={14} className="fill-red-400" />
              Making a difference
            </div>
            <h1 className="text-4xl font-display font-bold text-white mb-4">Our Charities</h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Every subscription contributes to the charity you choose. Browse and find your cause.
            </p>
          </motion.div>

          {/* Search */}
          <div className="relative max-w-md mx-auto mb-10">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search charities..."
              className="input pl-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {charities.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/charities/${c.id}`}
                    className="card block hover:border-brand-700 transition-all hover:-translate-y-1 group"
                  >
                    {c.image_url && (
                      <img src={c.image_url} alt={c.name} className="w-full h-44 object-cover rounded-xl mb-4" />
                    )}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-display font-bold text-white">{c.name}</h3>
                      {c.is_featured && <Star size={16} className="text-gold-400 fill-gold-400 flex-shrink-0 mt-0.5" />}
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-3">{c.description}</p>
                    <div className="mt-4 text-brand-400 text-sm font-medium group-hover:text-brand-300 transition-colors">
                      Learn more →
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && charities.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              No charities found matching "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
