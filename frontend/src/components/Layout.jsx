import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  LogOut,
  TrendingUp,
  Home,
  ShoppingCart,
  Moon,
  Sun
} from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useTheme();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminMenuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Wholesalers' },
    { path: '/admin/leads', icon: FileText, label: 'Leads' },
    { path: '/admin/marketplace', icon: ShoppingCart, label: 'Lead Marketplace' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const wholesalerMenuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/leads', icon: FileText, label: 'My Leads' },
    { path: '/marketplace', icon: ShoppingCart, label: 'Lead Marketplace' },
    { path: '/upgrade', icon: TrendingUp, label: 'Upgrade Plan' },
  ];

  const menuItems = isAdmin ? adminMenuItems : wholesalerMenuItems;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="p-4 border-b dark:border-gray-700">
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="font-bold text-gray-900 dark:text-white">Verified Homeowner</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{isAdmin ? 'Admin' : 'Wholesaler'}</div>
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
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="mb-3 px-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
            {!isAdmin && (
              <div className="mt-1 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">
                {user?.plan_type} Plan
              </div>
            )}
          </div>
          <button
            onClick={toggleDarkMode}
            className="flex items-center space-x-2 w-full px-4 py-2 mb-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
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
