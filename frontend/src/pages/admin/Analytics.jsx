import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../lib/api';
import { TrendingUp, Users, FileText, Activity, PieChart } from 'lucide-react';

export default function AdminAnalytics() {
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
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Detailed system insights and metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <Users className="h-8 w-8 mb-3 opacity-80" />
            <p className="text-blue-100 text-sm">Total Wholesalers</p>
            <p className="text-4xl font-bold mt-2">{analytics?.overview?.totalWholesalers || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <FileText className="h-8 w-8 mb-3 opacity-80" />
            <p className="text-green-100 text-sm">Total Leads</p>
            <p className="text-4xl font-bold mt-2">{analytics?.overview?.totalLeads || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <TrendingUp className="h-8 w-8 mb-3 opacity-80" />
            <p className="text-purple-100 text-sm">Total Assignments</p>
            <p className="text-4xl font-bold mt-2">{analytics?.overview?.totalAssignments || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
            <Activity className="h-8 w-8 mb-3 opacity-80" />
            <p className="text-orange-100 text-sm">Avg per Wholesaler</p>
            <p className="text-4xl font-bold mt-2">{analytics?.overview?.averageLeadsPerWholesaler || 0}</p>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-6">
            <PieChart className="h-6 w-6 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">Plan Distribution</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {Object.entries(analytics?.planDistribution || {}).map(([plan, count]) => {
                const total = analytics?.overview?.totalWholesalers || 1;
                const percentage = ((count / total) * 100).toFixed(1);
                return (
                  <div key={plan}>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 capitalize font-medium">{plan}</span>
                      <span className="text-gray-900 font-semibold">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          plan === 'free'
                            ? 'bg-gray-500'
                            : plan === 'basic'
                            ? 'bg-blue-500'
                            : plan === 'elite'
                            ? 'bg-purple-500'
                            : 'bg-orange-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-gray-900 mb-2">
                  {analytics?.overview?.totalWholesalers || 0}
                </div>
                <div className="text-gray-600">Total Wholesalers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Lead Status Distribution</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {Object.entries(analytics?.statusDistribution || {}).map(([status, count]) => {
                const total = analytics?.overview?.totalAssignments || 1;
                const percentage = ((count / total) * 100).toFixed(1);
                return (
                  <div key={status}>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 capitalize font-medium">
                        {status.replace('_', ' ')}
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          status === 'new'
                            ? 'bg-blue-500'
                            : status === 'called'
                            ? 'bg-green-500'
                            : status === 'follow_up'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {analytics?.statusDistribution?.new || 0}
                </div>
                <div className="text-blue-900 font-medium">New Leads</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {analytics?.statusDistribution?.called || 0}
                </div>
                <div className="text-green-900 font-medium">Called</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-600 mb-1">
                  {analytics?.statusDistribution?.follow_up || 0}
                </div>
                <div className="text-yellow-900 font-medium">Follow-ups</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Action Distribution</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {analytics?.actionDistribution?.call_now || 0}
                  </div>
                  <div className="text-green-900 font-medium">Call Now</div>
                  <div className="text-sm text-green-700 mt-1">
                    {(
                      ((analytics?.actionDistribution?.call_now || 0) /
                        (analytics?.overview?.totalAssignments || 1)) *
                      100
                    ).toFixed(1)}
                    % of total
                  </div>
                </div>
                <Activity className="h-16 w-16 text-green-300" />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-gray-600 mb-2">
                    {analytics?.actionDistribution?.pending || 0}
                  </div>
                  <div className="text-gray-900 font-medium">Pending</div>
                  <div className="text-sm text-gray-700 mt-1">
                    {(
                      ((analytics?.actionDistribution?.pending || 0) /
                        (analytics?.overview?.totalAssignments || 1)) *
                      100
                    ).toFixed(1)}
                    % of total
                  </div>
                </div>
                <Activity className="h-16 w-16 text-gray-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity (Last 30 Days)</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4 bg-blue-50 rounded-lg p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {analytics?.recentActivity?.newWholesalersLast30Days || 0}
                </div>
                <div className="text-blue-900 font-medium">New Wholesalers</div>
              </div>
            </div>
            <div className="flex items-center space-x-4 bg-green-50 rounded-lg p-6">
              <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {analytics?.recentActivity?.newLeadsLast30Days || 0}
                </div>
                <div className="text-green-900 font-medium">New Leads Uploaded</div>
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">System Health</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-blue-100 text-sm mb-1">Lead Utilization</div>
              <div className="text-3xl font-bold">
                {analytics?.overview?.totalLeads > 0
                  ? (
                      (analytics?.overview?.totalAssignments /
                        (analytics?.overview?.totalLeads * analytics?.overview?.totalWholesalers || 1)) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
            </div>
            <div>
              <div className="text-blue-100 text-sm mb-1">Active Wholesalers</div>
              <div className="text-3xl font-bold">{analytics?.overview?.totalWholesalers || 0}</div>
            </div>
            <div>
              <div className="text-blue-100 text-sm mb-1">Total Revenue Potential</div>
              <div className="text-3xl font-bold">
                $
                {(
                  (analytics?.planDistribution?.basic || 0) * 29 +
                  (analytics?.planDistribution?.elite || 0) * 99 +
                  (analytics?.planDistribution?.pro || 0) * 149
                ).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
