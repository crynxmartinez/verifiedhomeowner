import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  LogOut,
  TrendingUp,
  Home
} from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminMenuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Wholesalers' },
    { path: '/admin/leads', icon: FileText, label: 'Leads' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const wholesalerMenuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/leads', icon: FileText, label: 'My Leads' },
    { path: '/upgrade', icon: TrendingUp, label: 'Upgrade Plan' },
  ];

  const menuItems = isAdmin ? adminMenuItems : wholesalerMenuItems;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-blue-600" />
            <div>
              <div className="font-bold text-gray-900">Verified Homeowner</div>
              <div className="text-xs text-gray-500">{isAdmin ? 'Admin' : 'Wholesaler'}</div>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
          <div className="mb-3 px-4">
            <div className="text-sm font-medium text-gray-900">{user?.name}</div>
            <div className="text-xs text-gray-500">{user?.email}</div>
            {!isAdmin && (
              <div className="mt-1 text-xs font-semibold text-blue-600 uppercase">
                {user?.plan_type} Plan
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
