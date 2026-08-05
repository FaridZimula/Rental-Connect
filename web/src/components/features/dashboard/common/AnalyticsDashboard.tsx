import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Calendar, TrendingUp, Users, Building, DollarSign, Star, Filter } from 'lucide-react';

interface AnalyticsData {
  bookings: {
    total: number;
    byMonth: { month: string; count: number }[];
    byStatus: { status: string; count: number }[];
  };
  revenue: {
    total: number;
    byMonth: { month: string; amount: number }[];
    byRoomType: { type: string; amount: number }[];
  };
  occupancy: {
    rate: number;
    byMonth: { month: string; rate: number }[];
    byRoomType: { type: string; rate: number }[];
  };
  reviews: {
    average: number;
    total: number;
    distribution: { rating: number; count: number }[];
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsDashboard: React.FC<{ userRole: 'broker' | 'owner' }> = ({ userRole }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Replace with actual data from API
  const mockData: AnalyticsData = {
    bookings: {
      total: 156,
      byMonth: [
        { month: 'Jan', count: 12 },
        { month: 'Feb', count: 15 },
        { month: 'Mar', count: 18 },
        { month: 'Apr', count: 14 },
        { month: 'May', count: 20 },
        { month: 'Jun', count: 25 },
      ],
      byStatus: [
        { status: 'Pending', count: 15 },
        { status: 'Confirmed', count: 45 },
        { status: 'Completed', count: 85 },
        { status: 'Cancelled', count: 11 },
      ],
    },
    revenue: {
      total: 4500000,
      byMonth: [
        { month: 'Jan', amount: 350000 },
        { month: 'Feb', amount: 420000 },
        { month: 'Mar', amount: 380000 },
        { month: 'Apr', amount: 450000 },
        { month: 'May', amount: 520000 },
        { month: 'Jun', amount: 580000 },
      ],
      byRoomType: [
        { type: 'Single', amount: 1800000 },
        { type: 'Double', amount: 2200000 },
        { type: 'Triple', amount: 500000 },
      ],
    },
    occupancy: {
      rate: 78,
      byMonth: [
        { month: 'Jan', rate: 65 },
        { month: 'Feb', rate: 70 },
        { month: 'Mar', rate: 75 },
        { month: 'Apr', rate: 72 },
        { month: 'May', rate: 80 },
        { month: 'Jun', rate: 85 },
      ],
      byRoomType: [
        { type: 'Single', rate: 85 },
        { type: 'Double', rate: 75 },
        { type: 'Triple', rate: 65 },
      ],
    },
    reviews: {
      average: 4.5,
      total: 89,
      distribution: [
        { rating: 5, count: 45 },
        { rating: 4, count: 25 },
        { rating: 3, count: 12 },
        { rating: 2, count: 5 },
        { rating: 1, count: 2 },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600 mt-1">Track your performance and insights</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{mockData.bookings.total}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+12% from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                UGX {(mockData.revenue.total / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+8% from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{mockData.occupancy.rate}%</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+5% from last month</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{mockData.reviews.average}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <span>Based on {mockData.reviews.total} reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bookings Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Bookings Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData.bookings.byMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData.revenue.byMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`UGX ${(Number(value) / 1000).toFixed(0)}k`, 'Revenue']} />
                <Bar dataKey="amount" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockData.bookings.byStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {mockData.bookings.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Type Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue by Room Type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData.revenue.byRoomType} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="type" type="category" />
                <Tooltip formatter={(value) => [`UGX ${(Number(value) / 1000).toFixed(0)}k`, 'Revenue']} />
                <Bar dataKey="amount" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 