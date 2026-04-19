import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Heart } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../lib/api';

export default function CharityDetailPage() {
  const { id } = useParams();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/charities/${id}`)
      .then((r) => setCharity(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!charity) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Charity not found.</p>
          <Link to="/charities" className="btn-secondary">Back to Charities</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Link to="/charities" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft size={16} />
            Back to Charities
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {charity.image_url && (
              <img src={charity.image_url} alt={charity.name} className="w-full h-64 object-cover rounded-2xl mb-8" />
            )}

            <div className="flex items-start justify-between mb-6">
              <h1 className="text-3xl font-display font-bold text-white">{charity.name}</h1>
              {charity.website_url && (
                <a
                  href={charity.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                >
                  Visit <ExternalLink size={14} />
                </a>
              )}
            </div>

            <p className="text-gray-300 leading-relaxed mb-8">{charity.description}</p>

            <div className="card border-brand-800 bg-brand-900/10 flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Heart size={20} className="text-brand-400 fill-brand-400/30" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Support this charity</p>
                <p className="text-gray-400 text-sm">Select it as your charity when you subscribe.</p>
              </div>
              <Link to="/subscribe" className="btn-primary text-sm py-2 px-4">Subscribe</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
