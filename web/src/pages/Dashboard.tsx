import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import { Building, Home, User, Users, Settings, CreditCard, MessageSquare } from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    // Redirect to appropriate login page based on the intended role
    // For now, default to owner login since that's the main dashboard
    return <Navigate to="/hostel-owner/login" />;
  }

  const getDashboardContentByRole = () => {
    switch (user?.role) {
      case 'student':
        return <StudentDashboard />;
      case 'owner':
        return <Navigate to="/hostel-owner" />;
      case 'broker':
        return <Navigate to="/hostel-broker" />;
      default:
        return <p>Unknown user role</p>;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 text-zinc-100">
        <h1 className="text-3xl font-display font-bold mb-8 text-white">Your <span className="text-orange-500">Dashboard</span></h1>
        {getDashboardContentByRole()}
      </div>
    </Layout>
  );
};

const StudentDashboard = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-6 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden mb-4 md:mb-0 md:mr-6 border-2 border-orange-500">
            <img 
              src={user?.avatar || 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'} 
              alt={user?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">{user?.name}</h2>
            <p className="text-zinc-400">{user?.university}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg border border-orange-500/30">
              <Home className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold ml-3 text-white">Your Bookings</h3>
          </div>
          <p className="text-zinc-400">You have no active bookings.</p>
          <button className="mt-4 text-orange-500 font-semibold hover:text-orange-400 hover:underline">Find a hostel</button>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg border border-orange-500/30">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold ml-3 text-white">Reviews</h3>
          </div>
          <p className="text-zinc-400">You haven't written any reviews yet.</p>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg border border-orange-500/30">
              <Settings className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold ml-3 text-white">Preferences</h3>
          </div>
          <p className="text-zinc-400">Update your hostel preferences here.</p>
        </div>
      </div>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-6">
        <h3 className="text-xl font-semibold mb-4 text-white">Recommended Hostels</h3>
        <p className="text-zinc-400">Based on your university and preferences.</p>
        
        <div className="mt-4">
          <p className="text-center py-8 text-zinc-500">Personalized recommendations will appear here.</p>
        </div>
      </div>
    </div>
  );
};

const OwnerDashboard = () => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-primary-900 mb-2">5</div>
          <div className="text-gray-600">Your Hostels</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-secondary-600 mb-2">42</div>
          <div className="text-gray-600">Total Rooms</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-green-500 mb-2">32</div>
          <div className="text-gray-600">Occupied Rooms</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-primary-900 mb-2">76%</div>
          <div className="text-gray-600">Occupancy Rate</div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Your Hostels</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">University</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupancy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Olympia Hostel</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">Makerere University</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">12</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">80%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    4.5
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Sunset Residences</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">Mbarara University</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">30</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">73%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    4.8
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button className="mt-4 text-primary-900 font-medium hover:underline">Manage Hostels</button>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Bookings</h3>
        <p className="text-gray-500">Recent bookings will appear here.</p>
      </div>
    </div>
  );
};

const BrokerDashboard = () => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-primary-900 mb-2">12</div>
          <div className="text-gray-600">Active Clients</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-secondary-600 mb-2">8</div>
          <div className="text-gray-600">Pending Bookings</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-green-500 mb-2">25</div>
          <div className="text-gray-600">Completed Bookings</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-3xl font-bold text-primary-900 mb-2">UGX 320k</div>
          <div className="text-gray-600">Commission (This Month)</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-primary-50 text-primary-900 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold ml-3">Active Clients</h3>
          </div>
          <p className="text-gray-500">Your active clients will appear here.</p>
          <button className="mt-4 text-primary-900 font-medium hover:underline">View All Clients</button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-primary-50 text-primary-900 rounded-lg">
              <Building className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold ml-3">Partner Hostels</h3>
          </div>
          <p className="text-gray-500">Your partner hostels will appear here.</p>
          <button className="mt-4 text-primary-900 font-medium hover:underline">View All Partners</button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">John Doe</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">Olympia Hostel</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Single</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">UGX 450,000</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">UGX 45,000</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Sarah Johnson</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">Livingstone Hostel</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Double</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">UGX 350,000</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">UGX 35,000</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;