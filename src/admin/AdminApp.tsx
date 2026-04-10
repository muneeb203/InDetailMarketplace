import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { getAdminUser } from './adminAuth';
import { AdminLogin } from './AdminLogin';
import { AdminLayout } from './AdminLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { UsersPage } from './pages/UsersPage';
import { DealersPage } from './pages/DealersPage';
import { OrdersPage } from './pages/OrdersPage';
import { ConversationsPage } from './pages/ConversationsPage';
import { ReviewsPage } from './pages/ReviewsPage';

function AdminProtected({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    getAdminUser().then(({ isAdmin }) => {
      setAllowed(isAdmin);
      setLoading(false);
      if (isAdmin && location.pathname === '/admin/login') {
        navigate('/admin/dashboard', { replace: true });
        return;
      }
      if (!isAdmin && location.pathname !== '/admin/login') {
        navigate('/admin/login', { replace: true });
      }
    });
  }, [location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!allowed && location.pathname !== '/admin/login') return null;
  return <>{children}</>;
}

export function AdminApp() {
  return (
    <AdminProtected>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="dealers" element={<DealersPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="conversations" element={<ConversationsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
        </Route>
      </Routes>
    </AdminProtected>
  );
}
