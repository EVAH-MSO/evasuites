import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Tenants from './pages/Tenants';
import Leases from './pages/Leases';
import Payments from './pages/Payments';
import Maintenance from './pages/Maintenance';
import Profile from './pages/Profile';
import Portal from './pages/Portal';
import JoinLandlord from './pages/JoinLandlord';

function Protected({ children, staffOnly }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const isTenant = user.role === 'tenant' && !user.is_superuser;
  if (staffOnly && isTenant) return <Navigate to="/portal" replace />;
  if (!staffOnly && !isTenant && window.location.pathname === '/portal') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join/:landlordUsername" element={<JoinLandlord />} />
          <Route path="/dashboard" element={<Protected staffOnly><Dashboard /></Protected>} />
          <Route path="/properties" element={<Protected staffOnly><Properties /></Protected>} />
          <Route path="/tenants" element={<Protected staffOnly><Tenants /></Protected>} />
          <Route path="/leases" element={<Protected staffOnly><Leases /></Protected>} />
          <Route path="/payments" element={<Protected staffOnly><Payments /></Protected>} />
          <Route path="/maintenance" element={<Protected staffOnly><Maintenance /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/portal" element={<Protected><Portal /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
