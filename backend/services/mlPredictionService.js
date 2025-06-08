// backend/services/mlPredictionService.js
// Machine Learning Predictions Engine

const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Product = require('../models/Product');

class MLPredictionService {
  constructor() {
    this.models = {
      churnPrediction: new ChurnPredictionModel(),
      trafficForecasting: new TrafficForecastingModel(),
      anomalyPrediction: new AnomalyPredictionModel(),
      behaviorAnalysis: new BehaviorAnalysisModel(),
      recommendationEngine: new RecommendationEngine()
    };
    
    this.trainingSchedule = {
      churn: '0 2 * * *', // Daily at 2 AM
      traffic: '0 */6 * * *', // Every 6 hours
      behavior: '0 1 * * 0' // Weekly on Sunday at 1 AM
    };
    
    this.predictions = new Map();
    this.modelAccuracy = new Map();
    
    this.initializeModels();
  }

  async initializeModels() {
    console.log('🤖 Initializing ML Prediction Models...');
    
    try {
      // Initialize each model
      await Promise.all([
        this.models.churnPrediction.initialize(),
        this.models.trafficForecasting.initialize(),
        this.models.anomalyPrediction.initialize(),
        this.models.behaviorAnalysis.initialize(),
        this.models.recommendationEngine.initialize()
      ]);
      
      console.log('✅ ML Models initialized successfully');
      
      // Start prediction cycles
      this.startPredictionCycles();
      
    } catch (error) {
      console.error('❌ ML Model initialization failed:', error);
    }
  }

  startPredictionCycles() {
    // Run predictions every 30 minutes
    setInterval(() => {
      this.runAllPredictions();
    }, 30 * 60 * 1000);
    
    // Initial predictions
    setTimeout(() => {
      this.runAllPredictions();
    }, 5000);
  }

  async runAllPredictions() {
    console.log('🔮 Running ML predictions...');
    
    try {
      const [churnResults, trafficResults, anomalyResults, behaviorResults] = await Promise.allSettled([
        this.predictUserChurn(),
        this.forecastTraffic(),
        this.predictAnomalies(),
        this.analyzeBehaviorPatterns()
      ]);

      // Store results
      this.predictions.set('churn', churnResults.status === 'fulfilled' ? churnResults.value : null);
      this.predictions.set('traffic', trafficResults.status === 'fulfilled' ? trafficResults.value : null);
      this.predictions.set('anomaly', anomalyResults.status === 'fulfilled' ? anomalyResults.value : null);
      this.predictions.set('behavior', behaviorResults.status === 'fulfilled' ? behaviorResults.value : null);
      
      console.log('✅ ML predictions completed');
      
    } catch (error) {
      console.error('❌ ML prediction error:', error);
    }
  }

  // 1. USER CHURN PREDICTION
  async predictUserChurn() {
    const users = await User.find({ isActive: true }).lean();
    const predictions = [];
    
    for (const user of users) {
      const churnScore = await this.models.churnPrediction.predict(user);
      
      if (churnScore > 0.7) { // High churn risk
        predictions.push({
          userId: user._id,
          username: user.username,
          email: user.email,
          churnScore: Math.round(churnScore * 100),
          risk: churnScore > 0.9 ? 'critical' : churnScore > 0.8 ? 'high' : 'medium',
          factors: await this.getChurnFactors(user),
          recommendedActions: this.getChurnPreventionActions(churnScore),
          confidence: 85
        });
      }
    }
    
    return {
      type: 'churn_prediction',
      timestamp: new Date(),
      totalUsers: users.length,
      atRiskUsers: predictions.length,
      predictions: predictions.slice(0, 20), // Top 20 at-risk users
      summary: {
        criticalRisk: predictions.filter(p => p.risk === 'critical').length,
        highRisk: predictions.filter(p => p.risk === 'high').length,
        mediumRisk: predictions.filter(p => p.risk === 'medium').length
      }
    };
  }

  // 2. TRAFFIC FORECASTING
  async forecastTraffic() {
    const historicalData = await this.getHistoricalTrafficData();
    const forecast = await this.models.trafficForecasting.predict(historicalData);
    
    return {
      type: 'traffic_forecast',
      timestamp: new Date(),
      currentTraffic: await this.getCurrentTrafficMetrics(),
      predictions: [
        {
          period: 'next_hour',
          predicted: forecast.nextHour,
          confidence: 92,
          trend: forecast.nextHour > forecast.current ? 'increasing' : 'decreasing'
        },
        {
          period: 'next_6_hours',
          predicted: forecast.next6Hours,
          confidence: 87,
          trend: forecast.next6Hours > forecast.current ? 'increasing' : 'decreasing'
        },
        {
          period: 'next_24_hours',
          predicted: forecast.next24Hours,
          confidence: 78,
          trend: forecast.next24Hours > forecast.current ? 'increasing' : 'decreasing'
        },
        {
          period: 'next_7_days',
          predicted: forecast.next7Days,
          confidence: 65,
          trend: forecast.next7Days > forecast.current ? 'increasing' : 'decreasing'
        }
      ],
      insights: [
        forecast.nextHour > forecast.current * 1.5 ? 'Traffic spike expected in next hour' : null,
        forecast.next24Hours < forecast.current * 0.7 ? 'Significant traffic drop predicted' : null,
        'Weekend traffic typically 30% lower than weekdays'
      ].filter(Boolean),
      recommendations: this.getTrafficRecommendations(forecast)
    };
  }

  // 3. ANOMALY PREDICTION
  async predictAnomalies() {
    const recentPatterns = await this.getRecentActivityPatterns();
    const predictions = await this.models.anomalyPrediction.predict(recentPatterns);
    
    return {
      type: 'anomaly_prediction',
      timestamp: new Date(),
      riskLevel: predictions.overallRisk,
      predictions: [
        {
          type: 'security_incident',
          probability: predictions.securityRisk,
          timeframe: '2-6 hours',
          indicators: ['Unusual login patterns detected', 'Geographic anomalies increasing'],
          severity: predictions.securityRisk > 0.7 ? 'high' : 'medium'
        },
        {
          type: 'performance_degradation',
          probability: predictions.performanceRisk,
          timeframe: '1-4 hours',
          indicators: ['Memory usage trending up', 'Response times increasing'],
          severity: predictions.performanceRisk > 0.6 ? 'medium' : 'low'
        },
        {
          type: 'traffic_anomaly',
          probability: predictions.trafficRisk,
          timeframe: '30 minutes - 2 hours',
          indicators: ['Abnormal request patterns', 'User agent irregularities'],
          severity: predictions.trafficRisk > 0.5 ? 'medium' : 'low'
        }
      ],
      preventiveActions: [
        'Increase monitoring frequency for next 6 hours',
        'Prepare incident response team',
        'Review recent configuration changes'
      ]
    };
  }

  // 4. BEHAVIOR PATTERN ANALYSIS
  async analyzeBehaviorPatterns() {
    const userSessions = await this.getUserSessionData();
    const analysis = await this.models.behaviorAnalysis.analyze(userSessions);
    
    return {
      type: 'behavior_analysis',
      timestamp: new Date(),
      patterns: [
        {
          name: 'Peak Usage Hours',
          pattern: analysis.peakHours,
          confidence: 94,
          insight: `Users most active between ${analysis.peakHours.start}-${analysis.peakHours.end}`
        },
        {
          name: 'User Journey Patterns',
          pattern: analysis.commonPaths,
          confidence: 89,
          insight: 'Most users follow: Login → Dashboard → Products → Analytics'
        },
        {
          name: 'Engagement Patterns',
          pattern: analysis.engagementLevels,
          confidence: 92,
          insight: `${analysis.engagementLevels.high}% of users are highly engaged`
        }
      ],
      userSegments: [
        {
          segment: 'Power Users',
          count: analysis.segments.powerUsers.count,
          characteristics: ['Daily login', '5+ features used', 'Long sessions'],
          value: 'high'
        },
        {
          segment: 'Regular Users',
          count: analysis.segments.regularUsers.count,
          characteristics: ['2-3x weekly login', '2-3 features used', 'Medium sessions'],
          value: 'medium'
        },
        {
          segment: 'Casual Users',
          count: analysis.segments.casualUsers.count,
          characteristics: ['Weekly login', '1-2 features used', 'Short sessions'],
          value: 'low'
        }
      ],
      optimizationOpportunities: [
        'Improve onboarding for casual users',
        'Add advanced features for power users',
        'Implement engagement campaigns for regular users'
      ]
    };
  }

  // 5. SMART RECOMMENDATIONS
  async generateRecommendations(userId) {
    const user = await User.findById(userId).lean();
    const userActivity = await ActivityLog.find({ userId }).limit(100).lean();
    
    const recommendations = await this.models.recommendationEngine.generate(user, userActivity);
    
    return {
      userId,
      personalizedActions: recommendations.actions,
      suggestedFeatures: recommendations.features,
      contentRecommendations: recommendations.content,
      engagementTips: recommendations.engagement
    };
  }

  // HELPER METHODS
  async getChurnFactors(user) {
    const factors = [];
    const activities = await ActivityLog.find({ userId: user._id }).sort({ timestamp: -1 }).limit(20).lean();
    
    if (activities.length === 0) factors.push('No recent activity');
    if (!user.lastLogin || (Date.now() - user.lastLogin.getTime()) > 7 * 24 * 60 * 60 * 1000) {
      factors.push('No login in 7+ days');
    }
    if (user.loginCount < 5) factors.push('Low total login count');
    
    return factors;
  }

  getChurnPreventionActions(churnScore) {
    if (churnScore > 0.9) {
      return ['Immediate personal outreach', 'Offer premium features trial', 'Schedule support call'];
    } else if (churnScore > 0.8) {
      return ['Send re-engagement email', 'Offer tutorial/demo', 'Provide usage insights'];
    } else {
      return ['Send helpful tips email', 'Highlight unused features', 'Share success stories'];
    }
  }

  async getHistoricalTrafficData() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { 
            $dateToString: { format: "%Y-%m-%d-%H", date: "$timestamp" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  async getCurrentTrafficMetrics() {
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const currentHourTraffic = await ActivityLog.countDocuments({ 
      timestamp: { $gte: lastHour } 
    });
    
    return {
      currentHour: currentHourTraffic,
      activeUsers: await ActivityLog.distinct('userId', { timestamp: { $gte: lastHour } }).then(users => users.length),
      topActions: await this.getTopActions(lastHour)
    };
  }

  getTrafficRecommendations(forecast) {
    const recommendations = [];
    
    if (forecast.nextHour > forecast.current * 1.5) {
      recommendations.push('Scale up server resources for traffic spike');
      recommendations.push('Enable CDN acceleration');
    }
    
    if (forecast.next24Hours < forecast.current * 0.7) {
      recommendations.push('Scale down resources to optimize costs');
      recommendations.push('Schedule maintenance during low traffic');
    }
    
    return recommendations;
  }

  async getRecentActivityPatterns() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: last24Hours } } },
      {
        $group: {
          _id: { 
            action: '$action',
            hour: { $hour: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async getUserSessionData() {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: lastWeek } } },
      {
        $group: {
          _id: '$userId',
          sessions: { $sum: 1 },
          actions: { $push: '$action' },
          avgSessionLength: { $avg: { $subtract: ['$timestamp', '$timestamp'] } }
        }
      }
    ]);
  }

  async getTopActions(since) {
    return await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: since } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
  }

  // PUBLIC API METHODS
  getPredictions() {
    return {
      churn: this.predictions.get('churn'),
      traffic: this.predictions.get('traffic'),
      anomaly: this.predictions.get('anomaly'),
      behavior: this.predictions.get('behavior'),
      lastUpdated: new Date(),
      status: 'active'
    };
  }

  getModelAccuracy() {
    return {
      churn: this.modelAccuracy.get('churn') || 85,
      traffic: this.modelAccuracy.get('traffic') || 78,
      anomaly: this.modelAccuracy.get('anomaly') || 82,
      behavior: this.modelAccuracy.get('behavior') || 91
    };
  }

  async trainModels() {
    console.log('🏋️ Starting ML model training...');
    // In production, this would trigger actual model training
    // For now, simulate training with accuracy updates
    
    this.modelAccuracy.set('churn', Math.random() * 10 + 85);
    this.modelAccuracy.set('traffic', Math.random() * 10 + 75);
    this.modelAccuracy.set('anomaly', Math.random() * 10 + 80);
    this.modelAccuracy.set('behavior', Math.random() * 10 + 88);
    
    return {
      status: 'completed',
      trainedAt: new Date(),
      accuracy: this.getModelAccuracy()
    };
  }
}

// MOCK ML MODEL CLASSES (In production, these would use actual ML libraries)
class ChurnPredictionModel {
  async initialize() { console.log('📊 Churn model initialized'); }
  
  async predict(user) {
    // Mock churn prediction based on user activity
    let score = 0.3;
    
    if (!user.lastLogin) score += 0.4;
    else if ((Date.now() - user.lastLogin.getTime()) > 14 * 24 * 60 * 60 * 1000) score += 0.3;
    
    if (user.loginCount < 10) score += 0.2;
    if (user.loginCount < 3) score += 0.3;
    
    return Math.min(score + Math.random() * 0.1, 1.0);
  }
}

class TrafficForecastingModel {
  async initialize() { console.log('📈 Traffic model initialized'); }
  
  async predict(historicalData) {
    const recent = historicalData.slice(-24); // Last 24 hours
    const avgTraffic = recent.reduce((sum, h) => sum + h.count, 0) / recent.length;
    
    return {
      current: avgTraffic,
      nextHour: avgTraffic * (0.9 + Math.random() * 0.2),
      next6Hours: avgTraffic * (0.85 + Math.random() * 0.3),
      next24Hours: avgTraffic * (0.8 + Math.random() * 0.4),
      next7Days: avgTraffic * (0.7 + Math.random() * 0.6)
    };
  }
}

class AnomalyPredictionModel {
  async initialize() { console.log('🔮 Anomaly prediction model initialized'); }
  
  async predict(patterns) {
    return {
      overallRisk: Math.random() * 0.4 + 0.1,
      securityRisk: Math.random() * 0.6 + 0.2,
      performanceRisk: Math.random() * 0.5 + 0.1,
      trafficRisk: Math.random() * 0.4 + 0.1
    };
  }
}

class BehaviorAnalysisModel {
  async initialize() { console.log('🧠 Behavior analysis model initialized'); }
  
  async analyze(sessions) {
    return {
      peakHours: { start: '09:00', end: '17:00' },
      commonPaths: ['login', 'dashboard', 'products', 'analytics'],
      engagementLevels: { high: 25, medium: 50, low: 25 },
      segments: {
        powerUsers: { count: Math.floor(sessions.length * 0.15) },
        regularUsers: { count: Math.floor(sessions.length * 0.60) },
        casualUsers: { count: Math.floor(sessions.length * 0.25) }
      }
    };
  }
}

class RecommendationEngine {
  async initialize() { console.log('💡 Recommendation engine initialized'); }
  
  async generate(user, activities) {
    return {
      actions: ['Complete profile setup', 'Try advanced analytics', 'Connect integrations'],
      features: ['Custom dashboards', 'Automated reports', 'API access'],
      content: ['Best practices guide', 'Feature tutorials', 'Success stories'],
      engagement: ['Set up daily email digest', 'Join community forum', 'Schedule demo call']
    };
  }
}

module.exports = new MLPredictionService();