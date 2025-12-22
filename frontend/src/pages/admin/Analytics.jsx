import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../lib/api';
import { TrendingUp, Users, FileText, Activity, PieChart, MapPin, AlertTriangle, Target, Clock, ShoppingCart, Lightbulb, MessageCircle } from 'lucide-react';

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
          <div className="text-gray-500 dark:text-gray-400">Loading analytics...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Detailed system insights and metrics</p>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <PieChart className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Plan Distribution</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {Object.entries(analytics?.planDistribution || {}).map(([plan, count]) => {
                const total = analytics?.overview?.totalWholesalers || 1;
                const percentage = ((count / total) * 100).toFixed(1);
                return (
                  <div key={plan}>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">{plan}</span>
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
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
                <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
                  {analytics?.overview?.totalWholesalers || 0}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Total Wholesalers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Lead Status Distribution</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {Object.entries(analytics?.statusDistribution || {}).map(([status, count]) => {
                const total = analytics?.overview?.totalAssignments || 1;
                const percentage = ((count / total) * 100).toFixed(1);
                return (
                  <div key={status}>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">
                        {status.replace('_', ' ')}
                      </span>
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          status === 'new'
                            ? 'bg-blue-500'
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
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {analytics?.statusDistribution?.new || 0}
                </div>
                <div className="text-blue-900 dark:text-blue-300 font-medium">New Leads</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                  {analytics?.statusDistribution?.follow_up || 0}
                </div>
                <div className="text-yellow-900 dark:text-yellow-300 font-medium">Follow-ups</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Action Distribution</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {analytics?.actionDistribution?.call_now || 0}
                  </div>
                  <div className="text-green-900 dark:text-green-300 font-medium">Call Now</div>
                  <div className="text-sm text-green-700 dark:text-green-400 mt-1">
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
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-gray-600 dark:text-gray-300 mb-2">
                    {analytics?.actionDistribution?.pending || 0}
                  </div>
                  <div className="text-gray-900 dark:text-white font-medium">Pending</div>
                  <div className="text-sm text-gray-700 dark:text-gray-400 mt-1">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity (Last 30 Days)</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-lg flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {analytics?.recentActivity?.newWholesalersLast30Days || 0}
                </div>
                <div className="text-blue-900 dark:text-blue-300 font-medium">New Wholesalers</div>
              </div>
            </div>
            <div className="flex items-center space-x-4 bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-lg flex items-center justify-center">
                <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {analytics?.recentActivity?.newLeadsLast30Days || 0}
                </div>
                <div className="text-green-900 dark:text-green-300 font-medium">New Leads Uploaded</div>
              </div>
            </div>
          </div>
        </div>

        {/* User Engagement */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Engagement</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {analytics?.engagement?.dau || 0}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Daily Active</div>
              <div className="text-xs text-blue-500 mt-1">{analytics?.engagement?.dauPercentage || 0}% of total</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {analytics?.engagement?.wau || 0}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300 font-medium">Weekly Active</div>
              <div className="text-xs text-green-500 mt-1">{analytics?.engagement?.wauPercentage || 0}% of total</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {analytics?.engagement?.mau || 0}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Monthly Active</div>
              <div className="text-xs text-purple-500 mt-1">{analytics?.engagement?.mauPercentage || 0}% of total</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {analytics?.churnRisk?.atRiskCount || 0}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300 font-medium">At Risk</div>
              <div className="text-xs text-orange-500 mt-1">Inactive 7+ days</div>
            </div>
          </div>
        </div>

        {/* State Demand Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <MapPin className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Geographic Demand</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              ({analytics?.stateDemand?.totalUsersWithPreferences || 0} users with preferences)
            </span>
          </div>
          {analytics?.stateDemand?.topStates?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 font-medium">State</th>
                    <th className="pb-3 font-medium">Users Interested</th>
                    <th className="pb-3 font-medium">Leads Available</th>
                    <th className="pb-3 font-medium">Gap</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {analytics.stateDemand.topStates.map((state, idx) => (
                    <tr key={state.state} className="text-gray-700 dark:text-gray-300">
                      <td className="py-3 font-semibold">{state.state}</td>
                      <td className="py-3">{state.userCount}</td>
                      <td className="py-3">{state.leadsAvailable}</td>
                      <td className="py-3">
                        <span className={state.gap > 0 ? 'text-red-500' : 'text-green-500'}>
                          {state.gap > 0 ? `+${state.gap}` : state.gap}
                        </span>
                      </td>
                      <td className="py-3">
                        {state.leadsAvailable >= state.userCount ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                            ✓ Covered
                          </span>
                        ) : state.leadsAvailable > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                            ⚠ Low Supply
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                            ✗ No Leads
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No state preferences set by users yet.
            </p>
          )}
        </div>

        {/* Feature Adoption */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Target className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Feature Adoption</h2>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Lead Management', value: analytics?.featureAdoption?.leadManagement || 0, color: 'bg-blue-500' },
              { name: 'Marketplace', value: analytics?.featureAdoption?.marketplace || 0, color: 'bg-green-500' },
              { name: 'State Preferences', value: analytics?.featureAdoption?.statePreferences || 0, color: 'bg-purple-500' },
              { name: 'Feedback', value: analytics?.featureAdoption?.feedback || 0, color: 'bg-orange-500' },
              { name: 'Support', value: analytics?.featureAdoption?.support || 0, color: 'bg-red-500' },
            ].map((feature) => (
              <div key={feature.name}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{feature.name}</span>
                  <span className="text-gray-900 dark:text-white font-semibold">{feature.value}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${feature.color}`}
                    style={{ width: `${feature.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Churn Risk Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">At-Risk Users</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              (Inactive 7+ days)
            </span>
          </div>
          {analytics?.churnRisk?.users?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Plan</th>
                    <th className="pb-3 font-medium">Days Inactive</th>
                    <th className="pb-3 font-medium">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {analytics.churnRisk.users.map((user) => (
                    <tr key={user.id} className="text-gray-700 dark:text-gray-300">
                      <td className="py-3">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="py-3 capitalize">{user.planType}</td>
                      <td className="py-3">{user.daysSinceLogin} days</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.riskLevel === 'high'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                            : user.riskLevel === 'medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                        }`}>
                          {user.riskLevel === 'high' ? '🔴 High' : user.riskLevel === 'medium' ? '🟡 Medium' : '🟢 Low'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              🎉 No at-risk users! All users are active.
            </p>
          )}
        </div>

        {/* Platform Totals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics?.totals?.marketplacePurchases || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Marketplace Purchases</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                <Lightbulb className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics?.totals?.wishlistRequests || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Feature Requests</div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <MessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics?.totals?.supportTickets || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Support Tickets</div>
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
              <div className="text-3xl font-bold">{analytics?.engagement?.mau || 0}</div>
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
