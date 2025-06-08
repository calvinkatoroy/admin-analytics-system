import React, { useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  EyeIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  CogIcon,
  BellAlertIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../services/api';

const SEVERITY_COLORS = {
  low: '#10B981',
  medium: '#F59E0B', 
  high: '#EF4444',
  critical: '#DC2626'
};

const CATEGORY_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const AnomalyMonitoringDashboard = () => {
  const [activeAnomalies, setActiveAnomalies] = useState([]);
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch data
  const fetchData = async () => {
    try {
      const [anomaliesRes, statsRes, trendsRes, configRes] = await Promise.all([
        api.get('/anomaly/active'),
        api.get('/anomaly/stats'),
        api.get('/anomaly/trends?period=7d'),
        api.get('/anomaly/config')
      ]);

      setActiveAnomalies(anomaliesRes.data.data.anomalies);
      setStats(statsRes.data.data);
      setTrends(trendsRes.data.data.trends);
      setConfig(configRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch anomaly data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Handle anomaly actions
  const acknowledgeAnomaly = async (anomalyId) => {
    try {
      await api.post(`/anomaly/acknowledge/${anomalyId}`);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to acknowledge anomaly:', error);
    }
  };

  const resolveAnomaly = async (anomalyId, resolution) => {
    try {
      await api.post(`/anomaly/resolve/${anomalyId}`, { resolution });
      await fetchData(); // Refresh data
      setSelectedAnomaly(null);
    } catch (error) {
      console.error('Failed to resolve anomaly:', error);
    }
  };

  const forceScan = async () => {
    try {
      await api.post('/anomaly/scan');
      setTimeout(fetchData, 5000); // Refresh after 5 seconds
    } catch (error) {
      console.error('Failed to trigger scan:', error);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <XCircleIcon className="w-5 h-5" />;
      case 'high': return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'medium': return <BellAlertIcon className="w-5 h-5" />;
      case 'low': return <EyeIcon className="w-5 h-5" />;
      default: return <EyeIcon className="w-5 h-5" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
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
            <ShieldExclamationIcon className="w-8 h-8 text-blue-600" />
            Anomaly Detection System
          </h1>
          <p className="text-gray-600 mt-1">Real-time monitoring and intelligent threat detection</p>
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
            onClick={forceScan}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlayIcon className="w-4 h-4" />
            Scan Now
          </button>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <CogIcon className="w-4 h-4" />
            Config
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.active || 0}</p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Acknowledged</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.acknowledged || 0}</p>
            </div>
            <ClockIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved Today</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.resolved || 0}</p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className="text-lg font-bold text-gray-900">
                {Math.floor((stats?.uptime || 0) / 3600)}h {Math.floor(((stats?.uptime || 0) % 3600) / 60)}m
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomaly Trends */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Anomaly Trends (7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip labelFormatter={(value) => `Date: ${value}`} />
              <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Anomaly Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Anomalies by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(stats?.byCategory || {}).map(([category, count]) => ({
                  name: category.replace('_', ' '),
                  value: count
                }))}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {Object.entries(stats?.byCategory || {}).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Anomalies */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Active Anomalies</h3>
          <p className="text-sm text-gray-600">Real-time threat and anomaly detection feed</p>
        </div>
        <div className="p-6">
          {activeAnomalies.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h4>
              <p className="text-gray-600">No active anomalies detected. System is operating normally.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAnomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  className={`border-l-4 p-4 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                    anomaly.severity === 'critical' ? 'border-red-600 bg-red-50' :
                    anomaly.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                    anomaly.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                  onClick={() => setSelectedAnomaly(anomaly)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`text-${
                        anomaly.severity === 'critical' ? 'red' :
                        anomaly.severity === 'high' ? 'orange' :
                        anomaly.severity === 'medium' ? 'yellow' :
                        'blue'
                      }-600 mt-1`}>
                        {getSeverityIcon(anomaly.severity)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{anomaly.description}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>Type: {anomaly.type.replace('_', ' ')}</span>
                          <span>Category: {anomaly.category}</span>
                          <span>Severity: {anomaly.severity}</span>
                          <span>{formatTimestamp(anomaly.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          acknowledgeAnomaly(anomaly.id);
                        }}
                        className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Anomaly Detail Modal */}
      {selectedAnomaly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Anomaly Details</h3>
                <button
                  onClick={() => setSelectedAnomaly(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{selectedAnomaly.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Type</h4>
                  <p className="text-gray-700">{selectedAnomaly.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Severity</h4>
                  <span className={`px-2 py-1 rounded text-sm font-medium text-white bg-${
                    selectedAnomaly.severity === 'critical' ? 'red' :
                    selectedAnomaly.severity === 'high' ? 'orange' :
                    selectedAnomaly.severity === 'medium' ? 'yellow' :
                    'blue'
                  }-600`}>
                    {selectedAnomaly.severity}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Raw Data</h4>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify(selectedAnomaly.data, null, 2)}
                </pre>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => resolveAnomaly(selectedAnomaly.id, 'Manually resolved by admin')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Mark as Resolved
                </button>
                <button
                  onClick={() => acknowledgeAnomaly(selectedAnomaly.id)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Panel */}
      {showConfig && config && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">System Configuration</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Detection Features</h4>
                <div className="space-y-2">
                  {Object.entries(config.features).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{feature.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">System Info</h4>
                <div className="space-y-2 text-sm">
                  <div>Version: {config.version}</div>
                  <div>Scan Interval: {config.scanInterval}</div>
                  <div>Baseline Updates: {config.baselineUpdateInterval}</div>
                  <div>Alert Retention: {config.alertRetentionPeriod}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnomalyMonitoringDashboard;