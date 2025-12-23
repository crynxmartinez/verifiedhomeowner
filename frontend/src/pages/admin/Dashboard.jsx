import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../lib/api';
import api from '../../lib/api';
import { Users, FileText, TrendingUp, Activity, DollarSign, Home, Bed, Bath, Ruler, Calendar, Database, Play, RefreshCw, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [poolStats, setPoolStats] = useState(null);
  const [poolLoading, setPoolLoading] = useState(true);
  const [poolAction, setPoolAction] = useState(null);

  useEffect(() => {
    fetchAnalytics();
    fetchPoolStats();
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

  const fetchPoolStats = async () => {
    try {
      const { data } = await api.get('/admin/pool-stats');
      setPoolStats(data);
    } catch (error) {
      console.error('Failed to fetch pool stats:', error);
    } finally {
      setPoolLoading(false);
    }
  };

  const handleGeneratePool = async () => {
    setPoolAction('generating');
    try {
      await api.post('/admin/pool-stats', { action: 'generate-pool' });
      await fetchPoolStats();
    } catch (error) {
      console.error('Failed to generate pool:', error);
      alert(error.response?.data?.error || 'Failed to generate pool');
    } finally {
      setPoolAction(null);
    }
  };

  const handleTriggerDistribution = async () => {
    setPoolAction('distributing');
    try {
      const { data } = await api.post('/admin/pool-stats', { action: 'trigger-distribution' });
      alert(data.message);
      await fetchPoolStats();
    } catch (error) {
      console.error('Failed to trigger distribution:', error);
      alert(error.response?.data?.error || 'Failed to trigger distribution');
    } finally {
      setPoolAction(null);
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

        {/* Lead Pool System */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-600" />
              Lead Pool System
            </h2>
            <button
              onClick={fetchPoolStats}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${poolLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {poolLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            </div>
          ) : poolStats ? (
            <div className="space-y-6">
              {/* Pool Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-600 dark:text-purple-400">Current Pool</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{poolStats.currentMonthFormatted}</p>
                  <p className="text-sm text-purple-500">{poolStats.pool?.size || 0} / {poolStats.pool?.maxSize || 600} leads</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-600 dark:text-blue-400">Queue Depth</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{poolStats.queue?.unassigned || 0}</p>
                  <p className="text-sm text-blue-500">leads available</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-600 dark:text-green-400">Distributed Today</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{poolStats.distribution?.today || 0}</p>
                  <p className="text-sm text-green-500">to {poolStats.distribution?.uniqueUsers || 0} users</p>
                </div>
                <div className={`rounded-xl p-4 border ${
                  poolStats.runway?.status === 'healthy' 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' 
                    : poolStats.runway?.status === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <p className={`text-sm ${
                    poolStats.runway?.status === 'healthy' ? 'text-emerald-600 dark:text-emerald-400' 
                    : poolStats.runway?.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400'
                  }`}>Runway</p>
                  <p className={`text-2xl font-bold ${
                    poolStats.runway?.status === 'healthy' ? 'text-emerald-700 dark:text-emerald-300' 
                    : poolStats.runway?.status === 'warning' ? 'text-yellow-700 dark:text-yellow-300'
                    : 'text-red-700 dark:text-red-300'
                  }`}>{poolStats.runway?.months || 0} months</p>
                  <p className={`text-sm flex items-center gap-1 ${
                    poolStats.runway?.status === 'healthy' ? 'text-emerald-500' 
                    : poolStats.runway?.status === 'warning' ? 'text-yellow-500'
                    : 'text-red-500'
                  }`}>
                    {poolStats.runway?.status === 'healthy' ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    {poolStats.runway?.status}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleGeneratePool}
                  disabled={poolAction || poolStats.pool?.size > 0}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                >
                  {poolAction === 'generating' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                  Generate Pool
                </button>
                <button
                  onClick={handleTriggerDistribution}
                  disabled={poolAction || !poolStats.pool?.size}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                >
                  {poolAction === 'distributing' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Trigger Distribution
                </button>
              </div>

              {/* Distribution by Plan */}
              {poolStats.distribution?.byPlan?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Distribution by Plan (This Month)</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {poolStats.distribution.byPlan.map((item) => (
                      <div key={item.plan_type} className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{Number(item.lead_count)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{item.plan_type} ({Number(item.user_count)} users)</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Batches */}
              {poolStats.recentBatches?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Recent Uploads</h3>
                  <div className="space-y-2">
                    {poolStats.recentBatches.map((batch, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm py-2 border-b dark:border-gray-700 last:border-0">
                        <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">{batch.batch}</span>
                        <span className="text-gray-900 dark:text-white font-medium">{batch.count} leads</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Failed to load pool stats</p>
          )}
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
