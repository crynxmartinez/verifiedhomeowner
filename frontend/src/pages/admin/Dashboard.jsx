import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../lib/api';
import { Users, FileText, TrendingUp, Activity, DollarSign, Home, Bed, Bath, Ruler, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await adminAPI.getAnalytics();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </Layout>
    );
  }

  const statCards = [
    {
      label: 'Total Wholesalers',
      value: analytics?.overview?.totalWholesalers || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Leads',
      value: analytics?.overview?.totalLeads || 0,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      label: 'Total Assignments',
      value: analytics?.overview?.totalAssignments || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      label: 'Avg Leads/Wholesaler',
      value: analytics?.overview?.averageLeadsPerWholesaler || 0,
      icon: Activity,
      color: 'bg-orange-500',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Overview of your CRM system</p>
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

        {/* Plan Distribution */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Plan Distribution</h2>
            <div className="space-y-4">
              {Object.entries(analytics?.planDistribution || {}).map(([plan, count]) => (
                <div key={plan}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300 capitalize">{plan}</span>
                    <span className="font-semibold dark:text-white">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (count / (analytics?.overview?.totalWholesalers || 1)) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Status Distribution</h2>
            <div className="space-y-4">
              {Object.entries(analytics?.statusDistribution || {}).map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 dark:text-gray-300 capitalize">{status.replace('_', ' ')}</span>
                    <span className="font-semibold dark:text-white">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status === 'new'
                          ? 'bg-blue-500'
                          : status === 'follow_up'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{
                        width: `${
                          (count / (analytics?.overview?.totalAssignments || 1)) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Property Analytics */}
        {analytics?.propertyAnalytics && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Home className="h-5 w-5 text-green-600" />
              Property Portfolio Analytics
            </h2>
            
            {/* Portfolio Value */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                      ${(analytics.propertyAnalytics.totalPortfolioValue || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-500">Total Portfolio Value</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${(analytics.propertyAnalytics.averagePropertyValue || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Avg Property Value</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {analytics.propertyAnalytics.leadsWithZestimate || 0}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Leads with Zestimate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Bed className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">{analytics.propertyAnalytics.averageBedrooms || 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg Beds</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Bath className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">{analytics.propertyAnalytics.averageBathrooms || 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg Baths</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Ruler className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">{(analytics.propertyAnalytics.averageSqft || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg Sqft</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Calendar className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">{analytics.propertyAnalytics.averageYearBuilt || 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg Year Built</p>
              </div>
            </div>

            {/* Equity Distribution */}
            {analytics.propertyAnalytics.equityDistribution && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Lead Score Distribution</h3>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">🔥 {analytics.propertyAnalytics.equityDistribution.hot || 0}</p>
                    <p className="text-xs text-red-500">Hot (&gt;30%)</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">⭐ {analytics.propertyAnalytics.equityDistribution.good || 0}</p>
                    <p className="text-xs text-yellow-500">Good (15-30%)</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="text-lg font-bold text-gray-600 dark:text-gray-400">📊 {analytics.propertyAnalytics.equityDistribution.normal || 0}</p>
                    <p className="text-xs text-gray-500">Normal (0-15%)</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">📉 {analytics.propertyAnalytics.equityDistribution.low || 0}</p>
                    <p className="text-xs text-blue-500">Low (&lt;0%)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity (Last 30 Days)</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics?.recentActivity?.newWholesalersLast30Days || 0}
                </p>
                <p className="text-gray-600 dark:text-gray-400">New Wholesalers</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 dark:bg-green-900 w-12 h-12 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics?.recentActivity?.newLeadsLast30Days || 0}
                </p>
                <p className="text-gray-600 dark:text-gray-400">New Leads Uploaded</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <a
            href="/admin/users"
            className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow p-6 text-white hover:shadow-lg transition"
          >
            <Users className="h-8 w-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">Manage Wholesalers</h3>
            <p className="text-blue-100">View and manage all wholesalers</p>
          </a>
          <a
            href="/admin/leads"
            className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg shadow p-6 text-white hover:shadow-lg transition"
          >
            <FileText className="h-8 w-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">Upload Leads</h3>
            <p className="text-green-100">Add new leads to the system</p>
          </a>
          <a
            href="/admin/analytics"
            className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg shadow p-6 text-white hover:shadow-lg transition"
          >
            <Activity className="h-8 w-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">View Analytics</h3>
            <p className="text-purple-100">Detailed system analytics</p>
          </a>
        </div>
      </div>
    </Layout>
  );
}
