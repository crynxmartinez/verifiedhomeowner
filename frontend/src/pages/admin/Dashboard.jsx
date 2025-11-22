import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../lib/api';
import { Users, FileText, TrendingUp, Activity } from 'lucide-react';

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
          <div className="text-gray-500">Loading...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your CRM system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Plan Distribution</h2>
            <div className="space-y-4">
              {Object.entries(analytics?.planDistribution || {}).map(([plan, count]) => (
                <div key={plan}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 capitalize">{plan}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
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

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Status Distribution</h2>
            <div className="space-y-4">
              {Object.entries(analytics?.statusDistribution || {}).map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 capitalize">{status.replace('_', ' ')}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status === 'new'
                          ? 'bg-blue-500'
                          : status === 'called'
                          ? 'bg-green-500'
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

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity (Last 30 Days)</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.recentActivity?.newWholesalersLast30Days || 0}
                </p>
                <p className="text-gray-600">New Wholesalers</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.recentActivity?.newLeadsLast30Days || 0}
                </p>
                <p className="text-gray-600">New Leads Uploaded</p>
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
