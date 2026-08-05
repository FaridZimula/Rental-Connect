import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './components/common/SplashScreen';
import Home from './pages/Home';
import HostelsPage from './pages/HostelsPage';
import HostelDetailPage from './pages/HostelDetailPage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import MyLeadsPage from './pages/MyLeadsPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import BrokerLoginPage from './pages/BrokerLoginPage';
import OwnerLoginPage from './pages/OwnerLoginPage';
import OwnerSignupPage from './pages/OwnerSignupPage';
import HostelOwnerDashboardPage from './pages/HostelOwnerDashboardPage';
import HostelBrokerDashboardPage from './pages/HostelBrokerDashboardPage';
import Universities from './pages/Universities';
import { AuthProvider } from './contexts/AuthContext';
import { HostelProvider } from './contexts/HostelContext';

// Import dashboard components
import OwnerManagement from './components/features/dashboard/hostelBroker/OwnerManagement';
import ReportGeneration from './components/features/dashboard/hostelBroker/ReportGeneration';
import RoomManagement from './components/features/dashboard/hostelOwner/RoomManagement';
import ReviewManagement from './components/features/dashboard/hostelOwner/ReviewManagement';
import BookingManagement from './components/features/dashboard/hostelOwner/BookingManagement';
import AnalyticsDashboard from './components/features/dashboard/common/AnalyticsDashboard';
import HostelManagement from './components/features/dashboard/hostelOwner/HostelManagement';
import OwnerSettings from './components/features/dashboard/hostelOwner/OwnerSettings';

// Placeholder components for Broker Dashboard
import BrokerHostels from './components/features/dashboard/hostelBroker/BrokerHostels';
import BrokerModeration from './components/features/dashboard/hostelBroker/BrokerModeration';
import BrokerSettings from './components/features/dashboard/hostelBroker/BrokerSettings';
import BrokerBookings from './components/features/dashboard/hostelBroker/BrokerBookings';
import BrokerMessagingSystem from './components/features/dashboard/hostelBroker/MessagingSystem';

import OwnerMessagingSystem from './components/features/dashboard/hostelOwner/MessagingSystem';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <AuthProvider>
      <HostelProvider>
        {showSplash ? (
          <SplashScreen onComplete={handleSplashComplete} />
        ) : (
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/hostels" element={<HostelsPage />} />
              <Route path="/hostels/:id" element={<HostelDetailPage />} />
              {/* Rental Connect marketplace routes */}
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/properties/:id" element={<PropertyDetailPage />} />
              <Route path="/leads" element={<MyLeadsPage />} />
              <Route path="/universities" element={<Universities />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Auth routes */}
              <Route path="/hostel-owner/login" element={<OwnerLoginPage />} />
              <Route path="/hostel-owner/signup" element={<OwnerSignupPage />} />
              <Route path="/hostel-broker/login" element={<BrokerLoginPage />} />
              
              {/* Dashboard routes - Parent routes for nested dashboards */}
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Hostel Owner Dashboard Routes (Nested) */}
              <Route path="/hostel-owner" element={<HostelOwnerDashboardPage />}>
                {/* The default content for /hostel-owner will be handled by OwnerDashboard's children prop fallback */}
                <Route path="hostels" element={<HostelManagement />} />
                <Route path="rooms" element={<RoomManagement />} />
                <Route path="bookings" element={<BookingManagement />} />
                <Route path="reviews" element={<ReviewManagement />} />
                <Route path="messages" element={<OwnerMessagingSystem />} />
                <Route path="analytics" element={<AnalyticsDashboard userRole="owner" />} />
                <Route path="settings" element={<OwnerSettings />} />
                {/* Add other owner-specific routes here as needed */}
              </Route>
              
              {/* Hostel Broker Dashboard Routes (Nested) */}
              <Route path="/hostel-broker" element={<HostelBrokerDashboardPage />}>
                {/* The default content for /hostel-broker will be handled by BrokerDashboard's children prop fallback */}
                <Route path="owners" element={<OwnerManagement />} />
                <Route path="hostels" element={<BrokerHostels />} />
                <Route path="bookings" element={<BrokerBookings />} />
                <Route path="moderation" element={<BrokerModeration />} />
                <Route path="reports" element={<ReportGeneration />} />
                <Route path="messages" element={<BrokerMessagingSystem />} />
                <Route path="analytics" element={<AnalyticsDashboard userRole="broker" />} />
                <Route path="settings" element={<BrokerSettings />} />
                {/* Add other broker-specific routes here as needed */}
              </Route>
            </Routes>
          </Router>
        )}
      </HostelProvider>
    </AuthProvider>
  );
}

export default App;
