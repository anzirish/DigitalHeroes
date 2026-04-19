import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Trophy, Users, Shuffle, Heart, Award, BarChart2, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: <BarChart2 size={18} />, end: true },
  { to: '/admin/users', label: 'Users', icon: <Users size={18} /> },
  { to: '/admin/draws', label: 'Draws', icon: <Shuffle size={18} /> },
  { to: '/admin/charities', label: 'Charities', icon: <Heart size={18} /> },
  { to: '/admin/winners', label: 'Winners', icon: <Award size={18} /> },
];

export default function AdminLayout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-dark-800 border-r border-dark-700 flex flex-col fixed h-full">
        <div className="p-6 border-b border-dark-700">
          <div className="flex items-center gap-2 font-display font-bold text-lg">
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
              <Trophy size={16} className="text-dark-900" />
            </div>
            <span className="text-white">Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-900/50 text-brand-400 border border-brand-800'
                    : 'text-gray-400 hover:text-white hover:bg-dark-700'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-dark-700 w-full transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-60 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
