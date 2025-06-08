// backend/controllers/anomalyController.js
// Fixed - Clean Anomaly Detection API Controller

const anomalyService = require('../services/anomalyDetectionService');

class AnomalyController {
  // Get all active anomalies
  async getActiveAnomalies(req, res) {
    try {
      const anomalies = anomalyService.getActiveAnomalies();
      
      res.json({
        success: true,
        data: {
          anomalies,
          count: anomalies.length,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('❌ Error fetching active anomalies:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active anomalies',
        error: error.message
      });
    }
  }

  // Get anomaly statistics and dashboard overview
  async getAnomalyStats(req, res) {
    try {
      const stats = anomalyService.getAnomalyStats();
      
      // Add some real-time system metrics
      const systemMetrics = {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        cpuUsage: process.cpuUsage(),
        nodeVersion: process.version,
        platform: process.platform
      };

      res.json({
        success: true,
        data: {
          ...stats,
          systemMetrics,
          detectionStatus: 'active',
          lastUpdated: new Date()
        }
      });
    } catch (error) {
      console.error('❌ Error fetching anomaly stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch anomaly statistics',
        error: error.message
      });
    }
  }

  // Acknowledge an anomaly
  async acknowledgeAnomaly(req, res) {
    try {
      const { anomalyId } = req.params;
      const userId = req.user?.id || 'system'; // From auth middleware
      
      const success = anomalyService.acknowledgeAnomaly(anomalyId, userId);
      
      if (success) {
        res.json({
          success: true,
          message: 'Anomaly acknowledged successfully',
          data: { anomalyId, acknowledgedBy: userId }
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Anomaly not found'
        });
      }
    } catch (error) {
      console.error('❌ Error acknowledging anomaly:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to acknowledge anomaly',
        error: error.message
      });
    }
  }

  // Resolve an anomaly
  async resolveAnomaly(req, res) {
    try {
      const { anomalyId } = req.params;
      const { resolution } = req.body;
      
      if (!resolution) {
        return res.status(400).json({
          success: false,
          message: 'Resolution description is required'
        });
      }

      const success = anomalyService.resolveAnomaly(anomalyId, resolution);
      
      if (success) {
        res.json({
          success: true,
          message: 'Anomaly resolved successfully',
          data: { anomalyId, resolution }
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Anomaly not found'
        });
      }
    } catch (error) {
      console.error('❌ Error resolving anomaly:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resolve anomaly',
        error: error.message
      });
    }
  }

  // Update detection thresholds
  async updateThresholds(req, res) {
    try {
      const { thresholds } = req.body;
      
      if (!thresholds || typeof thresholds !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid thresholds provided'
        });
      }

      anomalyService.updateThresholds(thresholds);
      
      res.json({
        success: true,
        message: 'Detection thresholds updated successfully',
        data: { updatedAt: new Date() }
      });
    } catch (error) {
      console.error('❌ Error updating thresholds:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update thresholds',
        error: error.message
      });
    }
  }

  // Force anomaly detection scan
  async forceScan(req, res) {
    try {
      console.log('🔍 Manual anomaly detection scan triggered by admin');
      
      // Trigger an immediate scan
      setTimeout(() => {
        anomalyService.detectAnomalies();
      }, 100);
      
      res.json({
        success: true,
        message: 'Anomaly detection scan initiated',
        data: { 
          triggeredAt: new Date(),
          estimatedCompletion: new Date(Date.now() + 10000) // 10 seconds
        }
      });
    } catch (error) {
      console.error('❌ Error triggering scan:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to trigger anomaly scan',
        error: error.message
      });
    }
  }

  // Get anomaly detection configuration
  async getConfiguration(req, res) {
    try {
      const config = {
        thresholds: anomalyService.thresholds,
        features: {
          userBehaviorDetection: true,
          trafficAnomalyDetection: true,
          securityAnomalyDetection: true,
          performanceMonitoring: true,
          realTimeAlerts: true,
          autoResolution: true
        },
        scanInterval: '30 seconds',
        baselineUpdateInterval: '10 minutes',
        alertRetentionPeriod: '7 days',
        supportedNotifications: ['real-time', 'email', 'slack'],
        version: '2.0.0'
      };

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('❌ Error fetching configuration:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch configuration',
        error: error.message
      });
    }
  }

  // Get historical anomaly trends
  async getAnomalyTrends(req, res) {
    try {
      const { period = '7d' } = req.query;
      
      // Simple trend analysis (in production, this would query a database)
      const allAnomalies = anomalyService.alerts;
      const now = new Date();
      
      let periodMs;
      switch(period) {
        case '24h': periodMs = 24 * 60 * 60 * 1000; break;
        case '7d': periodMs = 7 * 24 * 60 * 60 * 1000; break;
        case '30d': periodMs = 30 * 24 * 60 * 60 * 1000; break;
        default: periodMs = 7 * 24 * 60 * 60 * 1000;
      }
      
      const startTime = new Date(now.getTime() - periodMs);
      const relevantAnomalies = allAnomalies.filter(
        a => a.timestamp >= startTime
      );
      
      // Group by day
      const trendData = {};
      relevantAnomalies.forEach(anomaly => {
        const day = anomaly.timestamp.toISOString().split('T')[0];
        if (!trendData[day]) {
          trendData[day] = { date: day, total: 0, byType: {}, bySeverity: {} };
        }
        trendData[day].total++;
        trendData[day].byType[anomaly.type] = (trendData[day].byType[anomaly.type] || 0) + 1;
        trendData[day].bySeverity[anomaly.severity] = (trendData[day].bySeverity[anomaly.severity] || 0) + 1;
      });

      res.json({
        success: true,
        data: {
          trends: Object.values(trendData),
          summary: {
            totalAnomalies: relevantAnomalies.length,
            period,
            startDate: startTime,
            endDate: now
          }
        }
      });
    } catch (error) {
      console.error('❌ Error fetching anomaly trends:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch anomaly trends',
        error: error.message
      });
    }
  }
}

module.exports = AnomalyController;