// backend/services/externalIntegrationsService.js
// External Integrations - Email, Slack, Webhooks

const nodemailer = require('nodemailer');

class ExternalIntegrationsService {
  constructor() {
    this.emailTransporter = null;
    this.slackWebhooks = new Map();
    this.webhookEndpoints = new Map();
    this.notificationQueue = [];
    this.isProcessing = false;
    
    this.initializeIntegrations();
    this.startNotificationProcessor();
  }

  async initializeIntegrations() {
    console.log('🔌 Initializing External Integrations...');
    
    // Initialize Email (Gmail/SMTP)
    await this.initializeEmail();
    
    // Initialize Slack
    this.initializeSlack();
    
    // Initialize Webhooks
    this.initializeWebhooks();
    
    console.log('✅ External Integrations initialized');
  }

  // EMAIL INTEGRATION
  async initializeEmail() {
    try {
      // Using Gmail (you can change to any SMTP)
      this.emailTransporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'your-admin-email@gmail.com',
          pass: process.env.EMAIL_PASS || 'your-app-password'
        }
      });

      // Test connection
      await this.emailTransporter.verify();
      console.log('📧 Email service initialized');
      
    } catch (error) {
      console.log('⚠️ Email service not configured:', error.message);
      // Fallback to console logging
      this.emailTransporter = null;
    }
  }

  async sendEmail(to, subject, html, attachments = []) {
    if (!this.emailTransporter) {
      console.log(`📧 [EMAIL SIMULATION] To: ${to}, Subject: ${subject}`);
      return { success: true, simulated: true };
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'Admin Analytics System <noreply@admin.com>',
        to,
        subject,
        html,
        attachments
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log(`📧 Email sent to ${to}: ${subject}`);
      
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Email send failed:', error);
      return { success: false, error: error.message };
    }
  }

  // SLACK INTEGRATION
  initializeSlack() {
    // Add default Slack webhooks
    this.slackWebhooks.set('alerts', process.env.SLACK_ALERTS_WEBHOOK);
    this.slackWebhooks.set('reports', process.env.SLACK_REPORTS_WEBHOOK);
    this.slackWebhooks.set('general', process.env.SLACK_GENERAL_WEBHOOK);
    
    console.log('💬 Slack integration initialized');
  }

  async sendSlackMessage(channel, message, blocks = null) {
    const webhookUrl = this.slackWebhooks.get(channel);
    
    if (!webhookUrl) {
      console.log(`💬 [SLACK SIMULATION] Channel: ${channel}, Message: ${message}`);
      return { success: true, simulated: true };
    }

    try {
      const payload = {
        text: message,
        blocks: blocks || [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message
            }
          }
        ]
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log(`💬 Slack message sent to ${channel}`);
        return { success: true };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Slack send failed:', error);
      return { success: false, error: error.message };
    }
  }

  // WEBHOOK INTEGRATION
  initializeWebhooks() {
    // Add webhook endpoints for external systems
    this.webhookEndpoints.set('siem', process.env.SIEM_WEBHOOK);
    this.webhookEndpoints.set('monitoring', process.env.MONITORING_WEBHOOK);
    this.webhookEndpoints.set('custom', process.env.CUSTOM_WEBHOOK);
    
    console.log('🪝 Webhook integration initialized');
  }

  async sendWebhook(endpoint, data) {
    const webhookUrl = this.webhookEndpoints.get(endpoint);
    
    if (!webhookUrl) {
      console.log(`🪝 [WEBHOOK SIMULATION] Endpoint: ${endpoint}, Data:`, data);
      return { success: true, simulated: true };
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          source: 'admin-analytics-system',
          ...data
        })
      });

      if (response.ok) {
        console.log(`🪝 Webhook sent to ${endpoint}`);
        return { success: true };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Webhook send failed:', error);
      return { success: false, error: error.message };
    }
  }

  // NOTIFICATION PROCESSOR
  startNotificationProcessor() {
    setInterval(() => {
      this.processNotificationQueue();
    }, 5000); // Process every 5 seconds
  }

  async processNotificationQueue() {
    if (this.isProcessing || this.notificationQueue.length === 0) return;
    
    this.isProcessing = true;
    
    try {
      while (this.notificationQueue.length > 0) {
        const notification = this.notificationQueue.shift();
        await this.processNotification(notification);
        
        // Rate limiting - small delay between notifications
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('❌ Notification processing error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async processNotification(notification) {
    const { type, data, channels } = notification;
    
    switch (type) {
      case 'anomaly_alert':
        await this.sendAnomalyAlert(data, channels);
        break;
      case 'ml_prediction':
        await this.sendMLPredictionAlert(data, channels);
        break;
      case 'system_report':
        await this.sendSystemReport(data, channels);
        break;
      case 'user_action':
        await this.sendUserActionNotification(data, channels);
        break;
      case 'performance_alert':
        await this.sendPerformanceAlert(data, channels);
        break;
      default:
        console.log(`⚠️ Unknown notification type: ${type}`);
    }
  }

  // SPECIALIZED NOTIFICATION METHODS
  async sendAnomalyAlert(anomaly, channels = ['email', 'slack']) {
    const severity = anomaly.severity;
    const isUrgent = severity === 'critical' || severity === 'high';
    
    // Email notification
    if (channels.includes('email')) {
      const subject = `🚨 ${severity.toUpperCase()} Anomaly Detected - ${anomaly.type}`;
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: ${isUrgent ? '#dc2626' : '#f59e0b'}; margin-bottom: 20px;">
              🚨 Anomaly Detection Alert
            </h1>
            
            <div style="background-color: ${isUrgent ? '#fef2f2' : '#fefbf2'}; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #374151; margin-bottom: 10px;">${anomaly.description}</h2>
              <p><strong>Type:</strong> ${anomaly.type.replace('_', ' ')}</p>
              <p><strong>Severity:</strong> ${severity.toUpperCase()}</p>
              <p><strong>Time:</strong> ${new Date(anomaly.timestamp).toLocaleString()}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #374151;">Recommended Actions:</h3>
              <ul style="color: #6b7280;">
                <li>Review the anomaly details in the admin dashboard</li>
                <li>Check system logs for related events</li>
                <li>Consider implementing preventive measures</li>
                ${isUrgent ? '<li><strong>URGENT: Immediate attention required</strong></li>' : ''}
              </ul>
            </div>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/monitoring" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View in Dashboard
            </a>
          </div>
        </div>
      `;
      
      await this.sendEmail(
        process.env.ADMIN_EMAIL || 'admin@company.com',
        subject,
        html
      );
    }

    // Slack notification
    if (channels.includes('slack')) {
      const emoji = isUrgent ? '🚨' : '⚠️';
      const color = isUrgent ? '#dc2626' : '#f59e0b';
      
      const blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} Anomaly Detection Alert`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Type:*\n${anomaly.type.replace('_', ' ')}`
            },
            {
              type: 'mrkdwn',
              text: `*Severity:*\n${severity.toUpperCase()}`
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Description:*\n${anomaly.description}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Dashboard'
              },
              url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/monitoring`,
              style: isUrgent ? 'danger' : 'primary'
            }
          ]
        }
      ];

      await this.sendSlackMessage('alerts', '', blocks);
    }

    // Webhook notification for SIEM systems
    if (channels.includes('webhook')) {
      await this.sendWebhook('siem', {
        event_type: 'anomaly_detected',
        severity: severity,
        anomaly_type: anomaly.type,
        description: anomaly.description,
        timestamp: anomaly.timestamp,
        urgent: isUrgent
      });
    }
  }

  async sendMLPredictionAlert(prediction, channels = ['email']) {
    if (channels.includes('email')) {
      const subject = `🤖 ML Prediction Alert - ${prediction.type}`;
      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #6366f1;">🤖 ML Prediction Alert</h1>
            <h2>${prediction.title}</h2>
            <p>${prediction.description}</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px;">
              <strong>Key Insights:</strong>
              <ul>
                ${prediction.insights?.map(insight => `<li>${insight}</li>`).join('') || '<li>No specific insights available</li>'}
              </ul>
            </div>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/ml-predictions" 
               style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
              View ML Dashboard
            </a>
          </div>
        </div>
      `;
      
      await this.sendEmail(
        process.env.ADMIN_EMAIL || 'admin@company.com',
        subject,
        html
      );
    }
  }

  async sendSystemReport(report, channels = ['email', 'slack']) {
    // Implementation for system reports
    console.log('📊 Sending system report:', report.title);
  }

  async sendUserActionNotification(action, channels = ['slack']) {
    // Implementation for user action notifications
    console.log('👤 User action notification:', action.type);
  }

  async sendPerformanceAlert(alert, channels = ['email', 'slack']) {
    // Implementation for performance alerts
    console.log('⚡ Performance alert:', alert.metric);
  }

  // PUBLIC API METHODS
  queueNotification(type, data, channels = ['email']) {
    this.notificationQueue.push({
      id: Date.now() + Math.random(),
      type,
      data,
      channels,
      timestamp: new Date()
    });
    
    console.log(`📬 Notification queued: ${type}`);
  }

  // Quick notification methods
  notifyAnomalyDetected(anomaly) {
    this.queueNotification('anomaly_alert', anomaly, ['email', 'slack', 'webhook']);
  }

  notifyMLPrediction(prediction) {
    this.queueNotification('ml_prediction', prediction, ['email']);
  }

  notifySystemReport(report) {
    this.queueNotification('system_report', report, ['email', 'slack']);
  }

  notifyUserAction(action) {
    this.queueNotification('user_action', action, ['slack']);
  }

  notifyPerformanceIssue(alert) {
    this.queueNotification('performance_alert', alert, ['email', 'slack']);
  }

  // Configuration methods
  updateEmailConfig(config) {
    process.env.EMAIL_USER = config.user;
    process.env.EMAIL_PASS = config.pass;
    this.initializeEmail();
  }

  updateSlackWebhook(channel, webhookUrl) {
    this.slackWebhooks.set(channel, webhookUrl);
    console.log(`💬 Slack webhook updated for ${channel}`);
  }

  updateWebhookEndpoint(name, url) {
    this.webhookEndpoints.set(name, url);
    console.log(`🪝 Webhook endpoint updated: ${name}`);
  }

  // Status and monitoring
  getStatus() {
    return {
      email: {
        configured: !!this.emailTransporter,
        status: this.emailTransporter ? 'active' : 'not_configured'
      },
      slack: {
        channels: Array.from(this.slackWebhooks.keys()),
        configured: this.slackWebhooks.size > 0
      },
      webhooks: {
        endpoints: Array.from(this.webhookEndpoints.keys()),
        configured: this.webhookEndpoints.size > 0
      },
      queue: {
        pending: this.notificationQueue.length,
        processing: this.isProcessing
      }
    };
  }

  getNotificationHistory() {
    // In production, this would query a database
    return {
      total_sent: 0,
      recent_notifications: [],
      success_rate: 100
    };
  }
}

module.exports = new ExternalIntegrationsService();