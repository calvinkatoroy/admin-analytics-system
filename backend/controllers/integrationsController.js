// backend/controllers/integrationsController.js
// External Integrations API Controller

const integrationsService = require('../services/externalIntegrationsService');

class IntegrationsController {
  // Get integration status
  async getStatus(req, res) {
    try {
      const status = integrationsService.getStatus();
      
      res.json({
        success: true,
        data: {
          ...status,
          lastUpdated: new Date(),
          systemHealth: 'operational'
        }
      });
    } catch (error) {
      console.error('❌ Error fetching integration status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch integration status',
        error: error.message
      });
    }
  }

  // Send test notification
  async sendTestNotification(req, res) {
    try {
      const { type, channels } = req.body;
      
      const testData = {
        email: {
          type: 'test_email',
          data: {
            subject: '📧 Test Email from Admin Analytics',
            message: 'This is a test email to verify your integration setup.',
            timestamp: new Date()
          }
        },
        slack: {
          type: 'test_slack',
          data: {
            message: '💬 Test message from Admin Analytics System',
            timestamp: new Date()
          }
        },
        webhook: {
          type: 'test_webhook',
          data: {
            event: 'integration_test',
            message: 'Test webhook payload',
            timestamp: new Date()
          }
        }
      };

      const selectedTest = testData[type] || testData.email;
      
      integrationsService.queueNotification(
        selectedTest.type,
        selectedTest.data,
        channels || [type]
      );

      res.json({
        success: true,
        message: `Test ${type} notification queued successfully`,
        data: {
          type: selectedTest.type,
          channels: channels || [type],
          queuedAt: new Date()
        }
      });
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test notification',
        error: error.message
      });
    }
  }

  // Update email configuration
  async updateEmailConfig(req, res) {
    try {
      const { user, pass, from } = req.body;
      
      if (!user || !pass) {
        return res.status(400).json({
          success: false,
          message: 'Email user and password are required'
        });
      }

      integrationsService.updateEmailConfig({ user, pass, from });
      
      res.json({
        success: true,
        message: 'Email configuration updated successfully',
        data: { updatedAt: new Date() }
      });
    } catch (error) {
      console.error('❌ Error updating email config:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update email configuration',
        error: error.message
      });
    }
  }

  // Update Slack webhook
  async updateSlackWebhook(req, res) {
    try {
      const { channel, webhookUrl } = req.body;
      
      if (!channel || !webhookUrl) {
        return res.status(400).json({
          success: false,
          message: 'Channel and webhook URL are required'
        });
      }

      integrationsService.updateSlackWebhook(channel, webhookUrl);
      
      res.json({
        success: true,
        message: `Slack webhook updated for channel: ${channel}`,
        data: { channel, updatedAt: new Date() }
      });
    } catch (error) {
      console.error('❌ Error updating Slack webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update Slack webhook',
        error: error.message
      });
    }
  }

  // Update webhook endpoint
  async updateWebhookEndpoint(req, res) {
    try {
      const { name, url } = req.body;
      
      if (!name || !url) {
        return res.status(400).json({
          success: false,
          message: 'Endpoint name and URL are required'
        });
      }

      integrationsService.updateWebhookEndpoint(name, url);
      
      res.json({
        success: true,
        message: `Webhook endpoint updated: ${name}`,
        data: { name, updatedAt: new Date() }
      });
    } catch (error) {
      console.error('❌ Error updating webhook endpoint:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update webhook endpoint',
        error: error.message
      });
    }
  }

  // Get notification history
  async getNotificationHistory(req, res) {
    try {
      const history = integrationsService.getNotificationHistory();
      
      res.json({
        success: true,
        data: {
          ...history,
          currentQueue: integrationsService.notificationQueue?.length || 0,
          lastUpdated: new Date()
        }
      });
    } catch (error) {
      console.error('❌ Error fetching notification history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notification history',
        error: error.message
      });
    }
  }

  // Send manual notification
  async sendManualNotification(req, res) {
    try {
      const { type, data, channels } = req.body;
      
      if (!type || !data) {
        return res.status(400).json({
          success: false,
          message: 'Notification type and data are required'
        });
      }

      integrationsService.queueNotification(type, data, channels || ['email']);
      
      res.json({
        success: true,
        message: 'Manual notification queued successfully',
        data: {
          type,
          channels: channels || ['email'],
          queuedAt: new Date()
        }
      });
    } catch (error) {
      console.error('❌ Error sending manual notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send manual notification',
        error: error.message
      });
    }
  }

  // Get integration settings
  async getSettings(req, res) {
    try {
      const status = integrationsService.getStatus();
      
      const settings = {
        email: {
          enabled: status.email.configured,
          provider: 'Gmail SMTP',
          from: process.env.EMAIL_USER || 'not_configured',
          status: status.email.status
        },
        slack: {
          enabled: status.slack.configured,
          channels: status.slack.channels,
          webhooksConfigured: status.slack.channels.length
        },
        webhooks: {
          enabled: status.webhooks.configured,
          endpoints: status.webhooks.endpoints,
          endpointsConfigured: status.webhooks.endpoints.length
        },
        notifications: {
          queueSize: status.queue.pending,
          processing: status.queue.processing,
          types: [
            'anomaly_alert',
            'ml_prediction',
            'system_report',
            'user_action',
            'performance_alert'
          ]
        }
      };

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('❌ Error fetching integration settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch integration settings',
        error: error.message
      });
    }
  }
}


// ===== INTEGRATION WITH ANOMALY DETECTION =====
// backend/services/anomalyDetectionService.js - ADD THIS TO YOUR EXISTING FILE

/*
Add this to your existing anomalyDetectionService.js processAnomaly method:

const integrationsService = require('./externalIntegrationsService');

// In the processAnomaly method, add this line after storing the anomaly:
processAnomaly(anomaly) {
  // ... existing code ...
  
  // Store in memory
  this.alerts.push(anomaly);
  
  // ===== ADD THIS: Send external notifications =====
  integrationsService.notifyAnomalyDetected(anomaly);
  
  // ... rest of existing code ...
}
*/

// ===== ADD TO server.js =====
/*
Add this line to your server.js:

app.use('/api/integrations', require('./routes/integrations'));

So your server.js should have:
app.use('/api/ai', require('./routes/aiChat'));
app.use('/api/anomaly', require('./routes/anomaly'));
app.use('/api/ml', require('./routes/ml'));
app.use('/api/integrations', require('./routes/integrations')); // <-- ADD THIS
*/