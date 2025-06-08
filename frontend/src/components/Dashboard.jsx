import React from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  UsersIcon, 
  ShoppingCartIcon, 
  CurrencyDollarIcon, 
  EyeIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../hooks/useApi';
import { useSocket } from '../hooks/useSocket';
import StatCard from './common/StatCard';
import DataTable from './common/DataTable';
import AIChatAssistant from './AIChatAssistant';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const Dashboard = () => {
  const { data: stats, loading, refetch } = useApi('/analytics/dashboard');
  const { data: productAnalytics } = useApi('/analytics/products');
  const { liveStats } = useSocket();

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow h-32"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow h-80"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load dashboard data</p>
          <button
            onClick={refetch}
            className="mt-4 btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening.</p>
        </div>
        <button
          onClick={refetch}
          className="btn-primary"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={formatNumber(stats.totalUsers)}
          icon={UsersIcon}
          change={8.2}
          trend="up"
          color="blue"
        />
        <StatCard
          title="Active Users (24h)"
          value={formatNumber(stats.activeUsers)}
          icon={EyeIcon}
          change={5.4}
          trend="up"
          color="green"
        />
        <StatCard
          title="Total Products"
          value={formatNumber(stats.totalProducts)}
          icon={ShoppingCartIcon}
          change={2.1}
          trend="up"
          color="purple"
        />
        <StatCard
          title="Online Users"
          value={formatNumber(liveStats?.onlineUsers || 0)}
          icon={UsersIcon}
          color="green"
        />
      </div>

      {/* Live Stats */}
      {liveStats && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Live Statistics</h3>
              <p className="text-blue-100">Real-time data from your application</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{liveStats.onlineUsers}</div>
              <div className="text-blue-100">Users Online Now</div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registration Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">User Registration Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats.dailyRegistrations}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="_id" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [value, 'New Users']}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Most Viewed Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productAnalytics?.topProducts?.slice(0, 5) || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [formatNumber(value), 'Views']} />
              <Bar dataKey="viewCount" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Stats and Most Active Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Product Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productAnalytics?.categoryStats || []}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="count"
                label={({ _id, count }) => `${_id}: ${count}`}
              >
                {(productAnalytics?.categoryStats || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Most Active Users */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Most Active Users</h3>
          <div className="space-y-3">
            {stats.activeUserStats?.slice(0, 5).map((user, index) => (
              <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{user.activityCount}</p>
                  <p className="text-sm text-gray-500">activities</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Recent Activities</h3>
        </div>
        <DataTable
          data={stats.recentActivities || []}
          columns={[
            {
              key: 'userId.username',
              label: 'User',
              render: (item) => (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {item.userId?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span>{item.userId?.username || 'Unknown'}</span>
                </div>
              )
            },
            {
              key: 'action',
              label: 'Action',
              render: (item) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.action === 'login' ? 'bg-green-100 text-green-800' :
                  item.action === 'view_product' ? 'bg-blue-100 text-blue-800' :
                  item.action === 'search' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.action.replace('_', ' ')}
                </span>
              )
            },
            { key: 'resource', label: 'Resource' },
            {
              key: 'timestamp',
              label: 'Time',
              render: (item) => new Date(item.timestamp).toLocaleString()
            }
          ]}
          emptyMessage="No recent activities"
        />
      </div>

      <AIChatAssistant />
    </div>
  );
};

export default Dashboard;