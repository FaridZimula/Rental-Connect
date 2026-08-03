import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Building, Settings, FileText, MessageSquare, Shield, BarChart, LogOut } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';

interface BrokerSidebarProps {
  onLinkClick?: () => void;
}

const BrokerSidebar: React.FC<BrokerSidebarProps> = ({ onLinkClick }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const menuItems = [
    { name: 'Overview', to: '/hostel-broker', icon: <Home className="w-5 h-5" /> },
    { name: 'Hostel Owners', to: '/hostel-broker/owners', icon: <Users className="w-5 h-5" /> },
    { name: 'Hostels', to: '/hostel-broker/hostels', icon: <Building className="w-5 h-5" /> },
    { name: 'Bookings', to: '/hostel-broker/bookings', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Moderation', to: '/hostel-broker/moderation', icon: <Shield className="w-5 h-5" /> },
    { name: 'Reports', to: '/hostel-broker/reports', icon: <FileText className="w-5 h-5" /> },
    { name: 'Messages', to: '/hostel-broker/messages', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Analytics', to: '/hostel-broker/analytics', icon: <BarChart className="w-5 h-5" /> },
    { name: 'Settings', to: '/hostel-broker/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 border-r border-zinc-800">
      {/* Logo/Brand Section */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-center">
        <img src="/images/logo2.png" alt="HostelConnect Logo" className="h-12 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 flex flex-col p-4 space-y-2 overflow-y-auto">
        {menuItems.map(({ name, to, icon }) => (
          <NavLink
            key={name}
            to={to}
            onClick={onLinkClick}
            className={({ isActive }) =>
              `flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-orange-500/10 text-orange-500 border border-orange-500/30 font-semibold shadow-md' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`
            }
          >
            <span className="mr-3">{icon}</span>
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default BrokerSidebar;
