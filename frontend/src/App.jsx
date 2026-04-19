import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SubscribePage from './pages/SubscribePage';
import DashboardPage from './pages/DashboardPage';
import CharitiesPage from './pages/CharitiesPage';
import CharityDetailPage from './pages/CharityDetailPage';
import DrawsPage from './pages/DrawsPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDraws from './pages/admin/AdminDraws';
import AdminCharities from './pages/admin/AdminCharities';
import AdminWinners from './pages/admin/AdminWinners';

// Guards
const PrivateRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) fetchMe();
  }, [token]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/subscribe" element={<SubscribePage />} />
      <Route path="/charities" element={<CharitiesPage />} />
      <Route path="/charities/:id" element={<CharityDetailPage />} />
      <Route path="/draws" element={<DrawsPage />} />

      {/* Subscriber */}
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="draws" element={<AdminDraws />} />
        <Route path="charities" element={<AdminCharities />} />
        <Route path="winners" element={<AdminWinners />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
