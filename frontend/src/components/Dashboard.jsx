import React, { useEffect, useState } from 'react';
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
  EyeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../hooks/useApi';
import { useSocket } from '../hooks/useSocket';
import StatCard from './common/StatCard';
import DataTable from './common/DataTable';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const Dashboard = () => {
  const { data: stats, loading, refetch } = useApi('/analytics/dashboard');
  const { data: productAnalytics } = useApi('/analytics/products');
  const { liveStats, isConnected } = useSocket();
  const [refreshing, setRefreshing] = useState(false);

  const formatNumber = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('en-US').format(value);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 animate-fade-in">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="h-80 bg-gray-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-20 animate-fade-in">
          <div className="text-6xl text-gray-300 mb-6">📊</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Failed to load dashboard data</h3>
          <p className="text-lg text-gray-600 mb-8">We couldn't retrieve your analytics data. Please try again.</p>
          <button
            onClick={refetch}
            className="btn-primary hover-lift transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Enhanced Header */}
      <div className="relative">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
              Analytics Dashboard
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              Welcome back! Here's your platform overview for today.
            </p>
            {isConnected && (
              <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                <div className="status-online"></div>
                Real-time data connected
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-primary hover-lift transition-all disabled:opacity-50"
            >
              <svg 
                className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={formatNumber(stats.totalUsers)}
          icon={UsersIcon}
          change={12.5}
          trend="up"
          color="blue"
          subtitle="All registered users"
          animate={true}
        />
        <StatCard
          title="Active Users"
          value={formatNumber(stats.activeUsers)}
          icon={UserGroupIcon}
          change={8.2}
          trend="up"
          color="green"
          subtitle="Active in last 24h"
          animate={true}
        />
        <StatCard
          title="Total Products"
          value={formatNumber(stats.totalProducts)}
          icon={ShoppingCartIcon}
          change={15.3}
          trend="up"
          color="purple"
          subtitle="In your catalog"
          animate={true}
        />
        <StatCard
          title="Online Now"
          value={formatNumber(liveStats?.onlineUsers || stats.onlineUsers || 0)}
          icon={GlobeAltIcon}
          color="orange"
          subtitle="Live users"
          animate={true}
          live={true}
        />
      </div>

      {/* Live Stats Banner */}
      {liveStats && (
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-8 animate-slide-up">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Live Statistics</h3>
              <p className="text-blue-100 text-lg">Real-time data from your application</p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-4xl font-black">{liveStats.onlineUsers}</div>
                <div className="text-blue-100 font-medium">Users Online</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black">{stats.totalUsers}</div>
                <div className="text-blue-100 font-medium">Total Users</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* User Registration Trend */}
        <div className="card card-interactive group">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">User Registration Trend</h3>
              <p className="text-gray-600">Daily new user signups over time</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
              <ArrowTrendingUpIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={stats.dailyRegistrations || []}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="_id" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [value, 'New Users']}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#3B82F6" 
                strokeWidth={3}
                fill="url(#colorGradient)"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#1D4ED8' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Most Viewed Products */}
        <div className="card card-interactive group">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Top Products</h3>
              <p className="text-gray-600">Most viewed products this week</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
              <ChartBarIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={productAnalytics?.topProducts?.slice(0, 5) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: '#6B7280' }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
                tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
              />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [formatNumber(value), 'Views']} 
              />
              <Bar 
                dataKey="viewCount" 
                fill="#10B981" 
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Stats and Active Users */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="card card-interactive">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Product Categories</h3>
            <p className="text-gray-600">Distribution across product categories</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={productAnalytics?.categoryStats || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="count"
              >
                {(productAnalytics?.categoryStats || []).map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [value, 'Products']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {(productAnalytics?.categoryStats || []).map((category, index) => (
              <div key={category._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <div>
                  <p className="font-semibold text-gray-900">{category._id}</p>
                  <p className="text-sm text-gray-500">{category.count} products</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active Users */}
        <div className="card">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Most Active Users</h3>
            <p className="text-gray-600">Top users by activity this week</p>
          </div>
          <div className="space-y-4">
            {stats.activeUserStats?.slice(0, 6).map((user, index) => (
              <div 
                key={user._id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all hover-lift group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`}>
                      {index < 3 ? (
                        <span>{index + 1}</span>
                      ) : (
                        <span>{user.username?.[0]?.toUpperCase() || '?'}</span>
                      )}
                    </div>
                    {index < 3 && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                        <span className="text-xs">🏆</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{user.username}</p>
                    <p className="text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-xl">{user.activityCount}</p>
                  <p className="text-gray-500 text-sm">activities</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Recent Activities */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Recent Activities</h3>
            <p className="text-gray-600">Latest user actions and system events</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="status-online"></div>
            Live updates
          </div>
        </div>
        <DataTable
          data={stats.recentActivities || []}
          columns={[
            {
              key: 'userId.username',
              label: 'User',
              render: (item) => (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {item.userId?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">{item.userId?.username || 'Unknown'}</span>
                    <p className="text-sm text-gray-500">{item.userId?.email || ''}</p>
                  </div>
                </div>
              )
            },
            {
              key: 'action',
              label: 'Action',
              render: (item) => {
                const actionColors = {
                  login: 'bg-green-100 text-green-800',
                  logout: 'bg-gray-100 text-gray-800',
                  view_product: 'bg-blue-100 text-blue-800',
                  search: 'bg-yellow-100 text-yellow-800',
                  add_to_cart: 'bg-orange-100 text-orange-800',
                  purchase: 'bg-purple-100 text-purple-800'
                };
                return (
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${actionColors[item.action] || 'bg-gray-100 text-gray-800'}`}>
                    {item.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                );
              }
            },
            { 
              key: 'resource', 
              label: 'Resource',
              render: (item) => (
                <span className="text-gray-700 font-medium">
                  {item.resource || '-'}
                </span>
              )
            },
            {
              key: 'timestamp',
              label: 'Time',
              render: (item) => {
                const date = new Date(item.timestamp);
                const now = new Date();
                const diffMs = now - date;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                
                let timeAgo;
                if (diffMins < 1) timeAgo = 'Just now';
                else if (diffMins < 60) timeAgo = `${diffMins}m ago`;
                else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
                else timeAgo = date.toLocaleDateString();

                return (
                  <div>
                    <span className="text-gray-900 font-medium">{timeAgo}</span>
                    <p className="text-sm text-gray-500">{date.toLocaleTimeString()}</p>
                  </div>
                );
              }
            }
          ]}
          emptyMessage="No recent activities to display"
        />
      </div>
    </div>
  );
};

export default Dashboard;