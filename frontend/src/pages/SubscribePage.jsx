import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Trophy, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '₹999',
    period: '/month',
    features: [
      'Full platform access',
      'Monthly draw entry',
      'Score tracking (5 scores)',
      'Charity contribution',
      'Cancel anytime',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '₹8,999',
    period: '/year',
    badge: 'Save 25%',
    features: [
      'Everything in Monthly',
      '2 months free',
      'Priority draw entry',
      'Increased charity impact',
      'Annual summary report',
    ],
  },
];

// Dynamically load Razorpay script
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function SubscribePage() {
  const [selected, setSelected] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const { token, user, fetchMe } = useAuthStore();
  const navigate = useNavigate();

  // Already subscribed — show a message instead
  if (user?.subscription_status === 'active') {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="pt-24 pb-16 px-4 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card max-w-md w-full text-center border-brand-800 bg-brand-900/10"
          >
            <div className="w-14 h-14 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="text-brand-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">You're subscribed!</h2>
            <p className="text-gray-400 mb-2">
              You have an active <span className="text-white capitalize">{user.subscription_plan}</span> plan.
            </p>
            {user.subscription_end_date && (
              <p className="text-gray-500 text-sm mb-6">
                Renews on {new Date(user.subscription_end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
            <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
              Go to Dashboard
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const handleSubscribe = async () => {
    if (!token) {
      navigate('/register');
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Failed to load payment gateway. Check your connection.');
        setLoading(false);
        return;
      }

      // Create order on backend
      const { data: order } = await api.post('/subscriptions/create-order', { plan: selected });

      // Open Razorpay checkout
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'GolfGives',
        description: `${selected === 'yearly' ? 'Yearly' : 'Monthly'} Subscription`,
        order_id: order.order_id,
        handler: async (response) => {
          try {
            // Verify payment on backend
            await api.post('/subscriptions/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: selected,
            });
            await fetchMe(); // refresh user state
            toast.success('Subscription activated!');
            navigate('/dashboard?subscription=success');
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          email: user?.email || '',
          name: user?.full_name || '',
        },
        theme: { color: '#22c55e' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast('Payment cancelled.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-display font-bold text-white mb-4">Choose your plan</h1>
            <p className="text-gray-400 text-lg">Start playing, winning, and giving today.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelected(plan.id)}
                className={`card cursor-pointer transition-all relative ${
                  selected === plan.id
                    ? 'border-brand-500 bg-brand-900/10'
                    : 'hover:border-dark-500'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-dark-900 text-xs font-bold px-3 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}

                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-500 text-sm">{plan.period}</span>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selected === plan.id ? 'border-brand-500 bg-brand-500' : 'border-dark-500'
                  }`}>
                    {selected === plan.id && <Check size={12} className="text-white" />}
                  </div>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check size={14} className="text-brand-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="btn-gold text-lg px-10 py-4 inline-flex items-center gap-2"
            >
              <Zap size={18} />
              {loading ? 'Loading...' : `Subscribe ${selected === 'yearly' ? 'Yearly' : 'Monthly'}`}
            </button>
            <p className="text-gray-500 text-sm mt-4">
              Secure payment via Razorpay. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
