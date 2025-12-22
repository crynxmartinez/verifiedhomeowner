import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import api from '../lib/api';
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
  Sun,
  MessageCircle,
  Menu,
  X,
  User,
  Mail,
  BookOpen,
  Lightbulb
} from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useTheme();
  const isAdmin = user?.role === 'admin';
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Fetch unread support ticket count for admin
  useEffect(() => {
    if (isAdmin) {
      const fetchUnreadCount = async () => {
        try {
          const response = await api.get('/support/unread-count');
          setUnreadCount(response.data.count);
        } catch (err) {
          console.error('Failed to fetch unread count:', err);
        }
      };
      fetchUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminMenuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/wholesalers', icon: Users, label: 'Wholesalers' },
    { path: '/admin/leads', icon: FileText, label: 'Leads' },
    { path: '/admin/marketplace', icon: ShoppingCart, label: 'Lead Marketplace' },
    { path: '/admin/blog', icon: BookOpen, label: 'Blog' },
    { path: '/admin/email', icon: Mail, label: 'Email' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/support', icon: MessageCircle, label: 'Support', badge: unreadCount },
  ];

  const wholesalerMenuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/leads', icon: FileText, label: 'My Leads' },
    { path: '/marketplace', icon: ShoppingCart, label: 'Lead Marketplace' },
    { path: '/wishlist', icon: Lightbulb, label: 'Wishlist' },
    { path: '/upgrade', icon: TrendingUp, label: 'Upgrade Plan' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/support', icon: MessageCircle, label: 'Contact Support' },
  ];

  const menuItems = isAdmin ? adminMenuItems : wholesalerMenuItems;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 md:hidden bg-white dark:bg-gray-800 shadow-md">
        <div className="flex items-center justify-between p-4">
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-gray-900 dark:text-white">Verified Homeowner</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b dark:border-gray-700">
            <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="font-bold text-gray-900 dark:text-white">Verified Homeowner</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{isAdmin ? 'Admin' : 'Wholesaler'}</div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="mb-3 px-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</div>
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
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
