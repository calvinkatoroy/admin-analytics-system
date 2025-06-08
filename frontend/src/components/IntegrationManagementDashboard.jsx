import React, { useState, useEffect } from 'react';
import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  LinkIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  BellIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { api } from '../services/api';

const IntegrationManagementDashboard = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testLoading, setTestLoading] = useState({});
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configType, setConfigType] = useState('');
  const [formData, setFormData] = useState({});

  // Fetch integration settings
  const fetchSettings = async () => {
    try {
      const response = await api.get('/integrations/settings');
      setSettings(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch integration settings:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Test notification
  const testNotification = async (type) => {
    setTestLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      await api.post('/integrations/test', {
        type,
        channels: [type]
      });
      
      alert(`✅ Test ${type} notification sent successfully!`);
    } catch (error) {
      alert(`❌ Failed to send test ${type} notification`);
      console.error('Test notification failed:', error);
    } finally {
      setTestLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  // Save configuration
  const saveConfiguration = async () => {
    try {
      let endpoint = '';
      let payload = formData;

      switch (configType) {
        case 'email':
          endpoint = '/integrations/email/config';
          break;
        case 'slack':
          endpoint = '/integrations/slack/webhook';
          break;
        case 'webhook':
          endpoint = '/integrations/webhook/endpoint';
          break;
        default:
          throw new Error('Invalid configuration type');
      }

      await api.put(endpoint, payload);
      
      alert('✅ Configuration saved successfully!');
      setShowConfigModal(false);
      setFormData({});
      await fetchSettings();
    } catch (error) {
      alert('❌ Failed to save configuration');
      console.error('Configuration save failed:', error);
    }
  };

  const openConfigModal = (type) => {
    setConfigType(type);
    setFormData({});
    setShowConfigModal(true);
  };

  const BigButton = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-2xl px-6 py-3 font-bold font-mono text-sm transition-all duration-300 hover:scale-105 hover:-translate-y-1
        ${variant === 'primary' 
          ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl' 
          : variant === 'success'
          ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
          : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:translate-y-0' : 'cursor-pointer'}
        ${className}
      `}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );

  const IntegrationCard = ({ integration, icon: Icon, title, description, color }) => (
    <div className={`bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 font-mono">{title}</h3>
            <p className="text-gray-600 font-mono text-sm">{description}</p>
          </div>
        </div>
        
        {/* Status Indicator */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
          integration.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {integration.enabled ? (
            <CheckCircleIcon className="w-4 h-4" />
          ) : (
            <XCircleIcon className="w-4 h-4" />
          )}
          <span className="font-mono text-xs font-semibold">
            {integration.enabled ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
      </div>

      {/* Integration Details */}
      <div className="space-y-4 mb-6">
        {title === 'Email Notifications' && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-mono text-sm text-gray-600">Provider:</span>
              <span className="font-mono text-sm font-semibold">{integration.provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-sm text-gray-600">From:</span>
              <span className="font-mono text-sm font-semibold">{integration.from}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-sm text-gray-600">Status:</span>
              <span className="font-mono text-sm font-semibold capitalize">{integration.status}</span>
            </div>
          </div>
        )}

        {title === 'Slack Integration' && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-mono text-sm text-gray-600">Channels:</span>
              <span className="font-mono text-sm font-semibold">{integration.channels?.join(', ') || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-sm text-gray-600">Webhooks:</span>
              <span className="font-mono text-sm font-semibold">{integration.webhooksConfigured}</span>
            </div>
          </div>
        )}

        {title === 'Webhook Endpoints' && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-mono text-sm text-gray-600">Endpoints:</span>
              <span className="font-mono text-sm font-semibold">{integration.endpoints?.join(', ') || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-sm text-gray-600">Configured:</span>
              <span className="font-mono text-sm font-semibold">{integration.endpointsConfigured}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <BigButton
          onClick={() => testNotification(title.toLowerCase().split(' ')[0])}
          variant="secondary"
          disabled={testLoading[title.toLowerCase().split(' ')[0]]}
          className="flex-1"
        >
          <div className="flex items-center justify-center gap-2">
            <PlayIcon className="w-4 h-4" />
            {testLoading[title.toLowerCase().split(' ')[0]] ? 'TESTING...' : 'TEST'}
          </div>
        </BigButton>
        
        <BigButton
          onClick={() => openConfigModal(title.toLowerCase().split(' ')[0])}
          variant="secondary"
          className="flex-1"
        >
          <div className="flex items-center justify-center gap-2">
            <Cog6ToothIcon className="w-4 h-4" />
            CONFIGURE
          </div>
        </BigButton>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-3xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 font-mono mb-3">
            INTEGRATIONS
          </h1>
          <p className="text-xl text-gray-600 font-mono">
            Email alerts • Slack notifications • Webhook endpoints
          </p>
        </div>
        
        <div className="flex gap-4">
          <BigButton 
            onClick={fetchSettings}
            variant="secondary"
          >
            <div className="flex items-center gap-2">
              <BellIcon className="w-5 h-5" />
              REFRESH STATUS
            </div>
          </BigButton>
        </div>
      </div>

      {/* Notification Queue Status */}
      {settings?.notifications && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-2xl">
          <div className="flex items-center gap-3">
            <InformationCircleIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-mono font-bold text-blue-900">Notification System Status</h3>
              <div className="font-mono text-sm text-blue-800 mt-2">
                Queue: {settings.notifications.queueSize} pending • 
                Status: {settings.notifications.processing ? 'Processing' : 'Idle'} • 
                Types: {settings.notifications.types.length} configured
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <IntegrationCard
          integration={settings?.email}
          icon={EnvelopeIcon}
          title="Email Notifications"
          description="SMTP alerts & reports"
          color="from-blue-500 to-blue-600"
        />
        
        <IntegrationCard
          integration={settings?.slack}
          icon={ChatBubbleLeftRightIcon}
          title="Slack Integration"
          description="Real-time team alerts"
          color="from-green-500 to-green-600"
        />
        
        <IntegrationCard
          integration={settings?.webhooks}
          icon={LinkIcon}
          title="Webhook Endpoints"
          description="External system integration"
          color="from-purple-500 to-purple-600"
        />
      </div>

      {/* Notification Types */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 font-mono mb-6">NOTIFICATION TYPES</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {settings?.notifications?.types.map((type, index) => (
            <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <BellIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-mono font-semibold text-gray-900">
                  {type.replace('_', ' ').toUpperCase()}
                </div>
                <div className="font-mono text-xs text-gray-600">
                  Auto-triggered
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-900 font-mono mb-6">
              CONFIGURE {configType.toUpperCase()}
            </h3>
            
            {configType === 'email' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-sm font-semibold text-gray-700 mb-2">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={formData.user || ''}
                    onChange={(e) => setFormData({...formData, user: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl font-mono focus:border-blue-500 focus:outline-none"
                    placeholder="admin@company.com"
                  />
                </div>
                <div>
                  <label className="block font-mono text-sm font-semibold text-gray-700 mb-2">
                    APP PASSWORD
                  </label>
                  <input
                    type="password"
                    value={formData.pass || ''}
                    onChange={(e) => setFormData({...formData, pass: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl font-mono focus:border-blue-500 focus:outline-none"
                    placeholder="••••••••••••••••"
                  />
                </div>
              </div>
            )}

            {configType === 'slack' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-sm font-semibold text-gray-700 mb-2">
                    CHANNEL NAME
                  </label>
                  <input
                    type="text"
                    value={formData.channel || ''}
                    onChange={(e) => setFormData({...formData, channel: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl font-mono focus:border-blue-500 focus:outline-none"
                    placeholder="alerts"
                  />
                </div>
                <div>
                  <label className="block font-mono text-sm font-semibold text-gray-700 mb-2">
                    WEBHOOK URL
                  </label>
                  <input
                    type="url"
                    value={formData.webhookUrl || ''}
                    onChange={(e) => setFormData({...formData, webhookUrl: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl font-mono focus:border-blue-500 focus:outline-none"
                    placeholder="https://hooks.slack.com/..."
                  />
                </div>
              </div>
            )}

            {configType === 'webhook' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-sm font-semibold text-gray-700 mb-2">
                    ENDPOINT NAME
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl font-mono focus:border-blue-500 focus:outline-none"
                    placeholder="siem"
                  />
                </div>
                <div>
                  <label className="block font-mono text-sm font-semibold text-gray-700 mb-2">
                    WEBHOOK URL
                  </label>
                  <input
                    type="url"
                    value={formData.url || ''}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl font-mono focus:border-blue-500 focus:outline-none"
                    placeholder="https://your-siem.com/webhook"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <BigButton
                onClick={saveConfiguration}
                variant="success"
                className="flex-1"
              >
                SAVE CONFIG
              </BigButton>
              <BigButton
                onClick={() => setShowConfigModal(false)}
                variant="secondary"
                className="flex-1"
              >
                CANCEL
              </BigButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationManagementDashboard;