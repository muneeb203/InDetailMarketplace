import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AppRoleAware from './AppRoleAware';
import { getAdminUser } from './admin/adminAuth';
import { AdminLogin } from './admin/AdminLogin';
import { AdminLayout } from './admin/AdminLayout';
import { DashboardOverview } from './admin/pages/DashboardOverview';
import { UsersPage } from './admin/pages/UsersPage';
import { DealersPage } from './admin/pages/DealersPage';
import { OrdersPage } from './admin/pages/OrdersPage';
import { ConversationsPage } from './admin/pages/ConversationsPage';
import { ReviewsPage } from './admin/pages/ReviewsPage';
import { PaymentNotificationManager } from './components/PaymentNotificationManager';
import { StripeConnectSimulation } from './pages/StripeConnectSimulation';

function AdminProtected() {
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
  if (!allowed && location.pathname !== '/admin/login') {
    return null;
  }
  return <Outlet />;
}

export default function App() {
  return (
    <PaymentNotificationManager>
      <BrowserRouter>
        <Routes>
          <Route path="stripe-connect-simulation" element={<StripeConnectSimulation />} />
          <Route path="admin" element={<AdminProtected />}>
            <Route index element={<Navigate to="/admin/login" replace />} />
            <Route path="login" element={<AdminLogin />} />
            <Route path="*" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardOverview />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="dealers" element={<DealersPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="conversations" element={<ConversationsPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<AppRoleAware />} />
        </Routes>
      </BrowserRouter>
    </PaymentNotificationManager>
  );
}
