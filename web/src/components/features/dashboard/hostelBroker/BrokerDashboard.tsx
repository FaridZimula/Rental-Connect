import DashboardLayout from '../../../layout/DashboardLayout';
import BrokerSidebar from './BrokerSidebar';
import { Users, Building, TrendingUp, DollarSign, Bell, Search, Shield, FileText, MessageSquare } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface BrokerDashboardProps {
  children?: React.ReactNode;
}

const BrokerDashboard: React.FC<BrokerDashboardProps> = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout sidebar={<BrokerSidebar />}>
      {children || (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
          {/* Header with Search and Notifications */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Welcome back, {user?.name || 'Broker'}! 👋
                </h1>
                <p className="text-gray-600 mt-1">Here's your brokerage overview for today</p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search clients, hostels..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    5
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Clients</p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary-900">12</p>
                </div>
                <div className="p-3 bg-primary-50 rounded-lg">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+18% from last month</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600">8</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+5 from yesterday</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Bookings</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">25</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12% from last month</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Commission</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">UGX 320k</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+28% from last month</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Clients */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-50 text-primary-900 rounded-lg mr-3">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Active Clients</h3>
                </div>
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-blue-600">JD</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">John Doe</p>
                      <p className="text-xs text-gray-500">Makerere University</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">3 bookings</p>
                    <p className="text-xs text-green-600">Active</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-green-600">AS</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Alice Smith</p>
                      <p className="text-xs text-gray-500">Mbarara University</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">1 booking</p>
                    <p className="text-xs text-green-600">Active</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-purple-600">MJ</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Mike Johnson</p>
                      <p className="text-xs text-gray-500">Kyambogo University</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">2 bookings</p>
                    <p className="text-xs text-green-600">Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Partner Hostels */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-2 bg-secondary-50 text-secondary-900 rounded-lg mr-3">
                    <Building className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Partner Hostels</h3>
                </div>
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                      <Building className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Olympia Hostel</p>
                      <p className="text-xs text-gray-500">Makerere University</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">12 rooms</p>
                    <p className="text-xs text-green-600">80% occupied</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-secondary-100 rounded-lg flex items-center justify-center mr-3">
                      <Building className="h-5 w-5 text-secondary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Sunset Residences</p>
                      <p className="text-xs text-gray-500">Mbarara University</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">30 rooms</p>
                    <p className="text-xs text-green-600">73% occupied</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <Building className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Campus View</p>
                      <p className="text-xs text-gray-500">Kyambogo University</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">20 rooms</p>
                    <p className="text-xs text-green-600">65% occupied</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Add New Client</span>
              </button>
              
              <button className="flex items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-2 bg-green-50 rounded-lg mr-3">
                  <Building className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Partner Hostel</span>
              </button>
              
              <button className="flex items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-2 bg-orange-50 rounded-lg mr-3">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Moderate Content</span>
              </button>
              
              <button className="flex items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-2 bg-purple-50 rounded-lg mr-3">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Generate Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default BrokerDashboard;
