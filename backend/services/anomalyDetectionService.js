// backend/services/anomalyDetectionService.js
// Real-time Smart Anomaly Detection Engine

const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Product = require('../models/Product');

class AnomalyDetectionService {
  constructor() {
    this.alerts = [];
    this.thresholds = {
      // User behavior anomalies
      loginFrequency: {
        unusualHours: { min: 22, max: 6 }, // 10PM - 6AM
        maxLoginsPerMinute: 10,
        suspiciousLocationJumps: 1000 // km
      },
      
      // Traffic anomalies  
      traffic: {
        dailyActiveUsersDropPercent: 30,
        pageViewSpikeMultiplier: 5,
        errorRateThreshold: 15 // percent
      },
      
      // Security anomalies
      security: {
        maxFailedLoginsPerUser: 5,
        maxFailedLoginsGlobal: 50,
        suspiciousUserAgentPatterns: ['bot', 'crawler', 'spider']
      },
      
      // Performance anomalies
      performance: {
        slowQueryThreshold: 2000, // ms
        highMemoryUsage: 85, // percent
        responseTimeThreshold: 1000 // ms
      }
    };
    
    this.patterns = {
      userBehavior: new Map(),
      trafficBaselines: new Map(),
      securityEvents: new Map()
    };
    
    this.startMonitoring();
  }

  // Main monitoring loop
  startMonitoring() {
    console.log('🚨 Anomaly Detection System: ONLINE');
    
    // Check for anomalies every 30 seconds
    setInterval(() => {
      this.detectAnomalies();
    }, 30000);
    
    // Update baselines every 10 minutes
    setInterval(() => {
      this.updateBaselines();
    }, 600000);
    
    // Cleanup old alerts every hour
    setInterval(() => {
      this.cleanupOldAlerts();
    }, 3600000);
  }

  // Main anomaly detection orchestrator
  async detectAnomalies() {
    try {
      console.log('🔍 Running anomaly detection scan...');
      
      const results = await Promise.allSettled([
        this.detectUserBehaviorAnomalies(),
        this.detectTrafficAnomalies(), 
        this.detectSecurityAnomalies(),
        this.detectPerformanceAnomalies()
      ]);
      
      const anomalies = results
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => result.value)
        .filter(anomaly => anomaly != null);
      
      if (anomalies.length > 0) {
        console.log(`🚨 Detected ${anomalies.length} anomalies`);
        anomalies.forEach(anomaly => this.processAnomaly(anomaly));
      }
      
    } catch (error) {
      console.error('❌ Anomaly detection error:', error);
    }
  }

  // 1. USER BEHAVIOR ANOMALY DETECTION
  async detectUserBehaviorAnomalies() {
    const anomalies = [];
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    try {
      // Detect unusual login times
      const nightTimeLogins = await ActivityLog.find({
        action: 'login',
        timestamp: { $gte: last24Hours },
        $expr: {
          $or: [
            { $gte: [{ $hour: '$timestamp' }, this.thresholds.loginFrequency.unusualHours.min] },
            { $lt: [{ $hour: '$timestamp' }, this.thresholds.loginFrequency.unusualHours.max] }
          ]
        }
      }).populate('userId', 'username email');

      if (nightTimeLogins.length > 5) {
        anomalies.push({
          type: 'unusual_login_times',
          severity: 'medium',
          description: `${nightTimeLogins.length} logins detected during unusual hours (10PM-6AM)`,
          data: { count: nightTimeLogins.length, events: nightTimeLogins.slice(0, 5) },
          timestamp: now,
          category: 'user_behavior'
        });
      }

      // Detect rapid successive logins (potential brute force)
      const recentLogins = await ActivityLog.aggregate([
        { 
          $match: { 
            action: 'login',
            timestamp: { $gte: new Date(now.getTime() - 5 * 60 * 1000) } // Last 5 minutes
          }
        },
        {
          $group: {
            _id: '$userId',
            count: { $sum: 1 },
            times: { $push: '$timestamp' }
          }
        },
        {
          $match: { count: { $gte: this.thresholds.loginFrequency.maxLoginsPerMinute } }
        }
      ]);

      recentLogins.forEach(user => {
        anomalies.push({
          type: 'rapid_login_attempts',
          severity: 'high',
          description: `User ${user._id} attempted ${user.count} logins in 5 minutes`,
          data: { userId: user._id, attempts: user.count, times: user.times },
          timestamp: now,
          category: 'security'
        });
      });

      // Detect inactive users suddenly becoming active
      const inactiveUsers = await User.find({
        lastLogin: { $lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } // 30 days ago
      });

      const suddenlyActiveUsers = await ActivityLog.find({
        userId: { $in: inactiveUsers.map(u => u._id) },
        timestamp: { $gte: last24Hours },
        action: 'login'
      }).populate('userId', 'username email lastLogin');

      if (suddenlyActiveUsers.length > 0) {
        anomalies.push({
          type: 'dormant_user_activation',
          severity: 'medium',
          description: `${suddenlyActiveUsers.length} previously dormant users became active`,
          data: { users: suddenlyActiveUsers.slice(0, 5) },
          timestamp: now,
          category: 'user_behavior'
        });
      }

      return anomalies;
    } catch (error) {
      console.error('User behavior anomaly detection failed:', error);
      return [];
    }
  }

  // 2. TRAFFIC ANOMALY DETECTION
  async detectTrafficAnomalies() {
    const anomalies = [];
    const now = new Date();
    
    try {
      // Compare today's activity to historical average
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      
      const [todayActivity, historicalAverage] = await Promise.all([
        ActivityLog.countDocuments({ timestamp: { $gte: todayStart } }),
        this.getHistoricalDailyAverage()
      ]);

      const activityDrop = ((historicalAverage - todayActivity) / historicalAverage) * 100;
      
      if (activityDrop > this.thresholds.traffic.dailyActiveUsersDropPercent) {
        anomalies.push({
          type: 'traffic_drop',
          severity: 'high',
          description: `Daily activity dropped by ${Math.round(activityDrop)}% compared to average`,
          data: { 
            todayActivity, 
            historicalAverage, 
            dropPercent: Math.round(activityDrop) 
          },
          timestamp: now,
          category: 'traffic'
        });
      }

      // Detect traffic spikes
      const lastHourActivity = await ActivityLog.countDocuments({
        timestamp: { $gte: new Date(now.getTime() - 60 * 60 * 1000) }
      });

      const hourlyAverage = await this.getHistoricalHourlyAverage();
      const spikeMultiplier = lastHourActivity / hourlyAverage;

      if (spikeMultiplier > this.thresholds.traffic.pageViewSpikeMultiplier) {
        anomalies.push({
          type: 'traffic_spike',
          severity: 'medium',
          description: `Traffic spike detected: ${Math.round(spikeMultiplier)}x normal activity`,
          data: { 
            currentActivity: lastHourActivity, 
            normalActivity: hourlyAverage,
            multiplier: Math.round(spikeMultiplier * 10) / 10
          },
          timestamp: now,
          category: 'traffic'
        });
      }

      return anomalies;
    } catch (error) {
      console.error('Traffic anomaly detection failed:', error);
      return [];
    }
  }

  // 3. SECURITY ANOMALY DETECTION
  async detectSecurityAnomalies() {
    const anomalies = [];
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    
    try {
      // Detect multiple failed login attempts
      const failedLogins = await ActivityLog.aggregate([
        {
          $match: {
            action: 'login_failed',
            timestamp: { $gte: lastHour }
          }
        },
        {
          $group: {
            _id: '$userId',
            count: { $sum: 1 },
            ips: { $addToSet: '$metadata.ip' },
            userAgents: { $addToSet: '$metadata.userAgent' }
          }
        },
        {
          $match: {
            count: { $gte: this.thresholds.security.maxFailedLoginsPerUser }
          }
        }
      ]);

      failedLogins.forEach(user => {
        anomalies.push({
          type: 'brute_force_attempt',
          severity: 'critical',
          description: `${user.count} failed login attempts for user ${user._id}`,
          data: { 
            userId: user._id, 
            attempts: user.count, 
            ips: user.ips,
            userAgents: user.userAgents
          },
          timestamp: now,
          category: 'security'
        });
      });

      // Detect suspicious user agents
      const suspiciousActivity = await ActivityLog.find({
        timestamp: { $gte: lastHour },
        'metadata.userAgent': {
          $regex: this.thresholds.security.suspiciousUserAgentPatterns.join('|'),
          $options: 'i'
        }
      }).limit(10);

      if (suspiciousActivity.length > 0) {
        anomalies.push({
          type: 'suspicious_user_agents',
          severity: 'medium',
          description: `${suspiciousActivity.length} requests from suspicious user agents`,
          data: { activities: suspiciousActivity },
          timestamp: now,
          category: 'security'
        });
      }

      return anomalies;
    } catch (error) {
      console.error('Security anomaly detection failed:', error);
      return [];
    }
  }

  // 4. PERFORMANCE ANOMALY DETECTION
  async detectPerformanceAnomalies() {
    const anomalies = [];
    const now = new Date();
    
    try {
      // Memory usage check
      const memoryUsage = process.memoryUsage();
      const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      
      if (memoryPercent > this.thresholds.performance.highMemoryUsage) {
        anomalies.push({
          type: 'high_memory_usage',
          severity: 'medium',
          description: `Memory usage at ${Math.round(memoryPercent)}%`,
          data: { memoryUsage, memoryPercent: Math.round(memoryPercent) },
          timestamp: now,
          category: 'performance'
        });
      }

      // Check for slow database operations (simulated)
      const dbResponseTime = await this.measureDatabaseResponseTime();
      
      if (dbResponseTime > this.thresholds.performance.slowQueryThreshold) {
        anomalies.push({
          type: 'slow_database_response',
          severity: 'medium',
          description: `Database response time: ${dbResponseTime}ms`,
          data: { responseTime: dbResponseTime },
          timestamp: now,
          category: 'performance'
        });
      }

      return anomalies;
    } catch (error) {
      console.error('Performance anomaly detection failed:', error);
      return [];
    }
  }

  // Process and store detected anomaly
  processAnomaly(anomaly) {
    // Add unique ID and additional metadata
    anomaly.id = `${anomaly.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    anomaly.status = 'active';
    anomaly.acknowledgedBy = null;
    anomaly.resolvedAt = null;
    
    // Store in memory (in production, store in database)
    this.alerts.push(anomaly);
    
    // Log the anomaly
    console.log(`🚨 ANOMALY DETECTED: ${anomaly.type} - ${anomaly.description}`);
    
    // Trigger real-time notifications (implement socket.io)
    this.notifyClients(anomaly);
    
    // Auto-resolve low severity anomalies after 1 hour
    if (anomaly.severity === 'low') {
      setTimeout(() => {
        this.resolveAnomaly(anomaly.id, 'auto-resolved');
      }, 60 * 60 * 1000);
    }
  }

  // Notify connected clients via Socket.io
  notifyClients(anomaly) {
    // This will be implemented when we add Socket.io integration
    console.log(`📡 Broadcasting anomaly: ${anomaly.type}`);
  }

  // Helper methods
  async getHistoricalDailyAverage() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          averageDaily: { $avg: "$count" }
        }
      }
    ]);
    
    return result[0]?.averageDaily || 100; // Fallback to 100
  }

  async getHistoricalHourlyAverage() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const result = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: oneWeekAgo } } },
      {
        $group: {
          _id: { 
            $dateToString: { format: "%Y-%m-%d-%H", date: "$timestamp" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          averageHourly: { $avg: "$count" }
        }
      }
    ]);
    
    return result[0]?.averageHourly || 10; // Fallback to 10
  }

  async measureDatabaseResponseTime() {
    const start = Date.now();
    await User.findOne().limit(1);
    return Date.now() - start;
  }

  updateBaselines() {
    console.log('📊 Updating anomaly detection baselines...');
    // Update historical patterns and thresholds
  }

  cleanupOldAlerts() {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    this.alerts = this.alerts.filter(alert => 
      alert.timestamp.getTime() > oneWeekAgo
    );
    console.log(`🧹 Cleaned up old alerts. Current alerts: ${this.alerts.length}`);
  }

  // Public API methods
  getActiveAnomalies() {
    return this.alerts.filter(alert => alert.status === 'active');
  }

  acknowledgeAnomaly(anomalyId, userId) {
    const anomaly = this.alerts.find(a => a.id === anomalyId);
    if (anomaly) {
      anomaly.status = 'acknowledged';
      anomaly.acknowledgedBy = userId;
      anomaly.acknowledgedAt = new Date();
      return true;
    }
    return false;
  }

  resolveAnomaly(anomalyId, resolution) {
    const anomaly = this.alerts.find(a => a.id === anomalyId);
    if (anomaly) {
      anomaly.status = 'resolved';
      anomaly.resolvedAt = new Date();
      anomaly.resolution = resolution;
      return true;
    }
    return false;
  }

  getAnomalyStats() {
    const total = this.alerts.length;
    const active = this.alerts.filter(a => a.status === 'active').length;
    const acknowledged = this.alerts.filter(a => a.status === 'acknowledged').length;
    const resolved = this.alerts.filter(a => a.status === 'resolved').length;
    
    const byCategory = this.alerts.reduce((acc, alert) => {
      acc[alert.category] = (acc[alert.category] || 0) + 1;
      return acc;
    }, {});

    const bySeverity = this.alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      active,
      acknowledged, 
      resolved,
      byCategory,
      bySeverity,
      uptime: process.uptime(),
      lastScan: new Date()
    };
  }

  // Update thresholds dynamically
  updateThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    console.log('⚙️ Anomaly detection thresholds updated');
  }
}

module.exports = new AnomalyDetectionService();