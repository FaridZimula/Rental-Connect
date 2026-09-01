import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import SplashScreen from './components/common/SplashScreen';
import Home from './pages/Home';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import TenantDashboardPage from './pages/TenantDashboardPage';
import LandlordDashboardPage from './pages/LandlordDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CartPage from './pages/CartPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ContactPage from './pages/ContactPage';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search]);

  return null;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ScrollToTop />
          {/* SplashScreen overlays as fixed layer — Router is ALWAYS mounted */}
          {showSplash && (
            <SplashScreen onComplete={() => setShowSplash(false)} />
          )}
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/:id" element={<PropertyDetailPage />} />
            <Route path="/cart" element={<ErrorBoundary><CartPage /></ErrorBoundary>} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin" element={<AdminLoginPage />} />

            {/* Legacy route aliases */}
            <Route path="/signup" element={<Navigate to="/register" replace />} />
            <Route path="/hostel-owner/login" element={<Navigate to="/login" replace />} />
            <Route path="/hostel-owner/signup" element={<Navigate to="/register" replace />} />

            {/* Dashboard routes */}
            <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
            <Route path="/dashboard/tenant" element={<Navigate to="/cart" replace />} />
            <Route path="/dashboard/landlord" element={<ErrorBoundary><LandlordDashboardPage /></ErrorBoundary>} />
            <Route path="/dashboard/admin" element={<ErrorBoundary><AdminDashboardPage /></ErrorBoundary>} />

            {/* Fallback 404 Not Found Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
