import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import { ThemeProvider } from './context/ThemeContext';

// Marketing pages
import Home from './pages/Home';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Pricing from './pages/Pricing';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Refund from './pages/Refund';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Wholesaler pages
import WholesalerDashboard from './pages/wholesaler/Dashboard';
import WholesalerLeads from './pages/wholesaler/Leads';
import WholesalerMarketplace from './pages/wholesaler/Marketplace';
import UpgradePlan from './pages/wholesaler/UpgradePlan';
import WholesalerSupport from './pages/wholesaler/Support';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminLeads from './pages/admin/Leads';
import AdminMarketplace from './pages/admin/Marketplace';
import AdminAnalytics from './pages/admin/Analytics';
import AdminSupport from './pages/admin/Support';

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" />;
  
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Wholesaler routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <WholesalerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/leads"
          element={
            <PrivateRoute>
              <WholesalerLeads />
            </PrivateRoute>
          }
        />
        <Route
          path="/marketplace"
          element={
            <PrivateRoute>
              <WholesalerMarketplace />
            </PrivateRoute>
          }
        />
        <Route
          path="/upgrade"
          element={
            <PrivateRoute>
              <UpgradePlan />
            </PrivateRoute>
          }
        />
        <Route
          path="/support"
          element={
            <PrivateRoute>
              <WholesalerSupport />
            </PrivateRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/leads"
          element={
            <AdminRoute>
              <AdminLeads />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/marketplace"
          element={
            <AdminRoute>
              <AdminMarketplace />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <AdminRoute>
              <AdminAnalytics />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/support"
          element={
            <AdminRoute>
              <AdminSupport />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
