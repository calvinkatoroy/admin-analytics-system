import React, { useState, useEffect } from 'react';
import {
  // ===== FIXED: Correct Heroicon names =====
  CpuChipIcon,
  ArrowTrendingUpIcon,        // FIXED: TrendingUpIcon -> ArrowTrendingUpIcon
  ExclamationTriangleIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,             // FIXED: CogIcon -> Cog6ToothIcon
  PlayIcon,
  ArrowPathIcon,
  LightBulbIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { api } from '../services/api';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

const MLPredictionsDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [churnData, setChurnData] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const [anomalyData, setAnomalyData] = useState(null);
  const [behaviorData, setBehaviorData] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch all ML data
  const fetchData = async () => {
    try {
      const [overviewRes, churnRes, trafficRes, anomalyRes, behaviorRes, metricsRes] = await Promise.all([
        api.get('/ml/dashboard'),
        api.get('/ml/predictions/churn'),
        api.get('/ml/predictions/traffic'),
        api.get('/ml/predictions/anomaly'),
        api.get('/ml/predictions/behavior'),
        api.get('/ml/models/metrics')
      ]);

      setOverview(overviewRes.data.data);
      setChurnData(churnRes.data.data);
      setTrafficData(trafficRes.data.data);
      setAnomalyData(anomalyRes.data.data);
      setBehaviorData(behaviorRes.data.data);
      setModelMetrics(metricsRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch ML data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchData, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Trigger prediction updates
  const updatePredictions = async () => {
    try {
      await api.post('/ml/predictions/update');
      setTimeout(fetchData, 5000); // Refresh after 5 seconds
    } catch (error) {
      console.error('Failed to update predictions:', error);
    }
  };

  // Train models
  const trainModels = async () => {
    try {
      await api.post('/ml/models/train');
      await fetchData();
    } catch (error) {
      console.error('Failed to train models:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getRiskColor = (risk) => {
    if (risk === 'critical') return 'text-red-600 bg-red-100';
    if (risk === 'high') return 'text-orange-600 bg-orange-100';
    if (risk === 'medium') return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            {/* ===== FIXED: Use CpuChipIcon instead of BrainIcon ===== */}
            <CpuChipIcon className="w-8 h-8 text-purple-600" />
            ML Predictions Engine
          </h1>
          <p className="text-gray-600 mt-1">Intelligent forecasting and behavioral analysis</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              autoRefresh 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-white animate-pulse' : 'bg-gray-500'}`}></div>
              {autoRefresh ? 'Live' : 'Paused'}
            </div>
          </button>
          <button
            onClick={updatePredictions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Update
          </button>
          <button
            onClick={trainModels}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Cog6ToothIcon className="w-4 h-4" />
            Train Models
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Model Accuracy</p>
                <p className="text-3xl font-bold text-gray-900">{overview.overview.avgModelAccuracy}%</p>
              </div>
              <CpuChipIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Predictions</p>
                <p className="text-3xl font-bold text-gray-900">{overview.overview.totalPredictions}</p>
              </div>
              <ArrowTrendingUpIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <p className="text-lg font-bold text-gray-900 capitalize">{overview.overview.systemStatus}</p>
              </div>
              <ShieldCheckIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-3xl font-bold text-gray-900">{overview.alerts?.length || 0}</p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {overview?.alerts && overview.alerts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Active ML Alerts</h3>
              <div className="mt-2 space-y-1">
                {overview.alerts.map((alert, index) => (
                  <p key={index} className="text-sm text-yellow-700">{alert.message}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'churn', name: 'Churn Prediction', icon: UsersIcon },
            { id: 'traffic', name: 'Traffic Forecast', icon: ArrowTrendingUpIcon },
            { id: 'anomaly', name: 'Anomaly Prediction', icon: ExclamationTriangleIcon },
            // ===== FIXED: Use CpuChipIcon instead of BrainIcon =====
            { id: 'behavior', name: 'Behavior Analysis', icon: CpuChipIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          {/* Model Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Model Accuracy</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={modelMetrics ? Object.entries(modelMetrics.accuracy).map(([model, accuracy]) => ({
                  model: model.charAt(0).toUpperCase() + model.slice(1),
                  accuracy: Math.round(accuracy)
                })) : []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="model" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Accuracy']} />
                  <Bar dataKey="accuracy" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
              <div className="space-y-3">
                {overview.insights?.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <LightBulbIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {overview.quickActions?.map((action, index) => (
                <button
                  key={index}
                  className={`p-4 rounded-lg border-2 border-dashed transition-colors ${
                    action.urgent 
                      ? 'border-red-300 bg-red-50 hover:bg-red-100' 
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-center">
                    <p className={`font-medium ${action.urgent ? 'text-red-700' : 'text-gray-700'}`}>
                      {action.label}
                    </p>
                    {action.urgent && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-red-200 text-red-800 rounded-full">
                        Urgent
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'churn' && churnData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Churn Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Critical Risk', value: churnData.summary?.criticalRisk || 0, color: '#EF4444' },
                      { name: 'High Risk', value: churnData.summary?.highRisk || 0, color: '#F59E0B' },
                      { name: 'Medium Risk', value: churnData.summary?.mediumRisk || 0, color: '#10B981' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {[{ color: '#EF4444' }, { color: '#F59E0B' }, { color: '#10B981' }].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">At-Risk Users</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {churnData.predictions?.slice(0, 10).map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getRiskColor(user.risk)}`}>
                        {user.churnScore}% Risk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Churn Prevention Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {churnData.recommendations?.map((rec, index) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'traffic' && trafficData && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Traffic Forecast</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trafficData.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="predicted" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                <Area type="monotone" dataKey="confidence" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Current Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Traffic:</span>
                  <span className="font-medium">{trafficData.currentTraffic?.currentHour || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Users:</span>
                  <span className="font-medium">{trafficData.currentTraffic?.activeUsers || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
              <div className="space-y-2">
                {trafficData.recommendations?.map((rec, index) => (
                  <div key={index} className="p-3 bg-yellow-50 rounded text-sm text-gray-700">
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'behavior' && behaviorData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">User Segments</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={behaviorData.segmentChart || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {(behaviorData.segmentChart || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
              <div className="space-y-3">
                {behaviorData.keyInsights?.map((insight, index) => (
                  <div key={index} className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Optimization Opportunities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {behaviorData.optimizationOpportunities?.map((opportunity, index) => (
                <div key={index} className="p-4 border-l-4 border-blue-500 bg-blue-50">
                  <p className="text-sm text-gray-700">{opportunity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MLPredictionsDashboard;