import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../lib/api';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [charities, setCharities] = useState([]);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    charity_id: '',
    charity_percentage: 10,
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/charities').then((r) => setCharities(r.data)).catch(() => {});
  }, []);

  // Client-side validation before moving to step 2
  const validateStep1 = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Enter a valid email';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await register(form);
      navigate('/subscribe');
    } catch (err) {
      // Backend validation errors come as array
      const data = err.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        const mapped = {};
        data.errors.forEach((e) => {
          mapped[e.path] = e.msg;
        });
        setErrors(mapped);
        // If field errors are on step 1 fields, go back
        if (mapped.email || mapped.password || mapped.full_name) setStep(1);
      } else {
        setErrors({ general: data?.error || 'Registration failed. Please try again.' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl mb-6">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <Trophy size={20} className="text-white" />
            </div>
            <span>Golf<span className="text-brand-400">Gives</span></span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white">Create your account</h1>
          <p className="text-gray-400 mt-2">Join thousands of golfers making a difference</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step >= s ? 'bg-brand-500 text-white' : 'bg-dark-700 text-gray-500'
              }`}>
                {step > s ? <Check size={14} /> : s}
              </div>
              {s < 2 && <div className={`w-12 h-0.5 ${step > s ? 'bg-brand-500' : 'bg-dark-700'}`} />}
            </div>
          ))}
        </div>

        <div className="card">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-white text-lg mb-4">Your details</h2>

                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-red-900/20 border border-red-800/50 text-red-400 text-sm px-4 py-3 rounded-xl"
                  >
                    <AlertCircle size={16} className="flex-shrink-0" />
                    {errors.general}
                  </motion.div>
                )}

                <div>
                  <label className="label">Full name</label>
                  <input
                    type="text"
                    className={`input ${errors.full_name ? 'border-red-800' : ''}`}
                    placeholder="Your full name"
                    value={form.full_name}
                    onChange={(e) => { setForm({ ...form, full_name: e.target.value }); setErrors((p) => ({ ...p, full_name: '' })); }}
                  />
                  {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>}
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className={`input ${errors.email ? 'border-red-800' : ''}`}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors((p) => ({ ...p, email: '' })); }}
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      className={`input pr-12 ${errors.password ? 'border-red-800' : ''}`}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors((p) => ({ ...p, password: '' })); }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password
                    ? <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                    : <p className="text-gray-600 text-xs mt-1">Must be at least 8 characters</p>
                  }
                </div>

                <button type="button" onClick={handleContinue} className="btn-primary w-full">
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display font-bold text-white text-lg mb-4">Choose your charity</h2>
                <p className="text-gray-400 text-sm">At least 10% of your subscription goes to your chosen charity.</p>

                <div className="grid gap-3 max-h-64 overflow-y-auto pr-1">
                  {charities.map((c) => (
                    <label
                      key={c.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        form.charity_id === c.id
                          ? 'border-brand-500 bg-brand-900/20'
                          : 'border-dark-600 hover:border-dark-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="charity"
                        value={c.id}
                        checked={form.charity_id === c.id}
                        onChange={() => setForm({ ...form, charity_id: c.id })}
                        className="sr-only"
                      />
                      {c.image_url && <img src={c.image_url} alt={c.name} className="w-10 h-10 rounded-lg object-cover" />}
                      <div>
                        <div className="text-white text-sm font-medium">{c.name}</div>
                        <div className="text-gray-500 text-xs line-clamp-1">{c.description}</div>
                      </div>
                      {form.charity_id === c.id && <Check size={16} className="text-brand-400 ml-auto flex-shrink-0" />}
                    </label>
                  ))}
                </div>

                <div>
                  <label className="label">Charity contribution: {form.charity_percentage}%</label>
                  <input
                    type="range"
                    min={10}
                    max={50}
                    value={form.charity_percentage}
                    onChange={(e) => setForm({ ...form, charity_percentage: Number(e.target.value) })}
                    className="w-full accent-brand-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10% (min)</span>
                    <span>50%</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
