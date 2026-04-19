import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Trophy, Menu, X, LayoutDashboard, Heart, Calendar, ShieldCheck, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../store/authStore';

const navLinkClass = ({ isActive }) =>
  `text-sm transition-colors ${
    isActive
      ? 'text-white font-semibold border-b-2 border-brand-400 pb-0.5'
      : 'text-gray-400 hover:text-white'
  }`;

const mobileNavLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
    isActive
      ? 'bg-brand-900/50 text-brand-400 font-semibold border border-brand-800'
      : 'text-gray-300 hover:bg-dark-700 hover:text-white'
  }`;

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  const isSubscribed = user?.subscription_status === 'active';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl flex-shrink-0">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Trophy size={16} className="text-white" />
            </div>
            <span className="text-white">Golf<span className="text-brand-400">Gives</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/charities" className={navLinkClass}>Charities</NavLink>
            <NavLink to="/draws" className={navLinkClass}>Draws</NavLink>

            {user ? (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
                {user.role === 'admin' && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `text-sm font-medium transition-colors ${isActive ? 'text-gold-300' : 'text-gold-400 hover:text-gold-300'}`
                    }
                  >
                    Admin
                  </NavLink>
                )}
                {/* User info + logout */}
                <div className="flex items-center gap-3 pl-3 border-l border-dark-600">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-brand-700 rounded-full flex items-center justify-center">
                      <User size={13} className="text-brand-300" />
                    </div>
                    <span className="text-gray-300 text-sm">{user.full_name?.split(' ')[0]}</span>
                    {isSubscribed && (
                      <span className="text-xs bg-brand-900/60 text-brand-400 border border-brand-800 px-1.5 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                    title="Sign out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>Sign in</NavLink>
                <Link to="/subscribe" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-gray-400 hover:text-white transition-colors" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-dark-800 border-t border-dark-700 px-4 py-4 flex flex-col gap-1">
          {user && (
            <div className="flex items-center gap-3 px-3 py-3 mb-2 border-b border-dark-700">
              <div className="w-8 h-8 bg-brand-700 rounded-full flex items-center justify-center">
                <User size={14} className="text-brand-300" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{user.full_name}</p>
                <p className="text-gray-500 text-xs">{user.email}</p>
              </div>
              {isSubscribed && (
                <span className="ml-auto text-xs bg-brand-900/60 text-brand-400 border border-brand-800 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
          )}

          <NavLink to="/charities" className={mobileNavLinkClass} onClick={() => setOpen(false)}>
            <Heart size={16} /> Charities
          </NavLink>
          <NavLink to="/draws" className={mobileNavLinkClass} onClick={() => setOpen(false)}>
            <Calendar size={16} /> Draws
          </NavLink>

          {user ? (
            <>
              <NavLink to="/dashboard" className={mobileNavLinkClass} onClick={() => setOpen(false)}>
                <LayoutDashboard size={16} /> Dashboard
              </NavLink>
              {user.role === 'admin' && (
                <NavLink to="/admin" className={mobileNavLinkClass} onClick={() => setOpen(false)}>
                  <ShieldCheck size={16} /> Admin
                </NavLink>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-900/10 transition-colors mt-2"
              >
                <LogOut size={16} /> Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={mobileNavLinkClass} onClick={() => setOpen(false)}>
                Sign in
              </NavLink>
              <Link
                to="/subscribe"
                className="btn-primary text-center mt-2"
                onClick={() => setOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
