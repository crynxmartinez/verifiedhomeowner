import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { leadsAPI } from '../../lib/api';
import { FileText, Phone, Clock, XCircle, TrendingUp, BarChart3, Lock, Download, Calendar } from 'lucide-react';
import NewLeadsPopup from '../../components/NewLeadsPopup';
import { SkeletonStats } from '../../components/Skeleton';
import useAuthStore from '../../store/authStore';

// Plan analytics config
const ANALYTICS_CONFIG = {
  free: { enabled: false, days: 0, export: false },
  basic: { enabled: true, days: 7, export: false },
  elite: { enabled: true, days: 30, export: false },
  pro: { enabled: true, days: 90, export: true },
};

export default function WholesalerDashboard() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewLeadsPopup, setShowNewLeadsPopup] = useState(true);
  
  const planType = user?.plan_type || 'free';
  const analyticsConfig = ANALYTICS_CONFIG[planType] || ANALYTICS_CONFIG.free;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await leadsAPI.getStats();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Leads',
      value: stats?.total || 0,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      label: 'Need to Call',
      value: stats?.callNow || 0,
      icon: Phone,
      color: 'bg-green-500',
    },
    {
      label: 'Follow-ups',
      value: stats?.followUp || 0,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      label: 'Not Interested',
      value: stats?.notInterested || 0,
      icon: XCircle,
      color: 'bg-red-500',
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-64 mt-2 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonStats key={i} />
            ))}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back! Here's your lead overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Lead Status Breakdown</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 dark:text-gray-300">New</span>
                <span className="font-semibold dark:text-white">{stats?.new || 0}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${((stats?.new || 0) / (stats?.total || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 dark:text-gray-300">Follow-up</span>
                <span className="font-semibold dark:text-white">{stats?.followUp || 0}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${((stats?.followUp || 0) / (stats?.total || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 dark:text-gray-300">Not Interested</span>
                <span className="font-semibold dark:text-white">{stats?.notInterested || 0}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${((stats?.notInterested || 0) / (stats?.total || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        {analyticsConfig.enabled ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analytics</h2>
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                  Last {analyticsConfig.days} days
                </span>
              </div>
              {analyticsConfig.export && (
                <button className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:underline">
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Conversion Rate
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.total > 0 ? Math.round(((stats?.contacted || 0) / stats.total) * 100) : 0}%
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                  <Phone className="h-4 w-4" />
                  Contacted
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.contacted || 0}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                  <Calendar className="h-4 w-4" />
                  Avg Response
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.avgResponseDays || '—'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
                  <FileText className="h-4 w-4" />
                  This Period
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.periodLeads || stats?.total || 0}</p>
              </div>
            </div>

            {planType !== 'pro' && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {planType === 'basic' && '📊 Upgrade to Elite for 30-day analytics'}
                  {planType === 'elite' && '📊 Upgrade to Pro for 90-day analytics + CSV export'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Analytics Locked</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  Upgrade to a paid plan to unlock lead analytics and performance tracking.
                </p>
                <Link
                  to="/upgrade"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Upgrade Now
                </Link>
              </div>
            </div>
            
            {/* Blurred preview */}
            <div className="opacity-30">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analytics</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Ready to make calls?</h2>
              <p className="text-blue-100">You have {stats?.callNow || 0} leads waiting</p>
            </div>
            <a
              href="/leads"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition w-full sm:w-auto text-center"
            >
              View Leads
            </a>
          </div>
        </div>
      </div>

      {/* New Leads Popup */}
      {showNewLeadsPopup && stats?.newToday > 0 && (
        <NewLeadsPopup 
          newLeadsCount={stats.newToday} 
          onClose={() => setShowNewLeadsPopup(false)} 
        />
      )}
    </Layout>
  );
}
