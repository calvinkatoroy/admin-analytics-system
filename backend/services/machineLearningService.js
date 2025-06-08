// backend/services/machineLearningService.js
// Enterprise ML Prediction Engine

const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Product = require('../models/Product');

class MachineLearningService {
  constructor() {
    this.models = {
      churnPrediction: new ChurnPredictor(),
      trafficForecasting: new TrafficForecaster(),
      userSegmentation: new UserSegmentationModel(),
      recommendationEngine: new RecommendationEngine(),
      anomalyPredictor: new AnomalyPredictor()
    };
    
    this.predictionCache = new Map();
    this.modelAccuracy = new Map();
    
    // Initialize models with historical data
    this.initializeModels();
    
    // Retrain models every 6 hours
    setInterval(() => {
      this.retrainModels();
    }, 6 * 60 * 60 * 1000);
    
    console.log('🤖 Machine Learning Engine: INITIALIZED');
  }

  async initializeModels() {
    try {
      console.log('🧠 Training ML models with historical data...');
      
      // Train all models with existing data
      await Promise.all([
        this.models.churnPrediction.train(),
        this.models.trafficForecasting.train(),
        this.models.userSegmentation.train(),
        this.models.recommendationEngine.train(),
        this.models.anomalyPredictor.train()
      ]);
      
      console.log('✅ All ML models trained successfully');
    } catch (error) {
      console.error('❌ ML model training failed:', error);
    }
  }

  // CHURN PREDICTION
  async predictUserChurn(userId = null) {
    try {
      const users = userId ? [await User.findById(userId)] : await User.find({ isActive: true });
      const predictions = [];
      
      for (const user of users) {
        if (!user) continue;
        
        const prediction = await this.models.churnPrediction.predict(user);
        predictions.push({
          userId: user._id,
          username: user.username,
          email: user.email,
          churnProbability: prediction.probability,
          riskLevel: prediction.riskLevel,
          keyFactors: prediction.factors,
          recommendedActions: prediction.actions,
          confidence: prediction.confidence,
          timeToChurn: prediction.estimatedDays
        });
      }
      
      return {
        success: true,
        data: predictions.sort((a, b) => b.churnProbability - a.churnProbability),
        summary: {
          totalUsers: predictions.length,
          highRisk: predictions.filter(p => p.riskLevel === 'high').length,
          mediumRisk: predictions.filter(p => p.riskLevel === 'medium').length,
          lowRisk: predictions.filter(p => p.riskLevel === 'low').length
        }
      };
    } catch (error) {
      console.error('Churn prediction error:', error);
      return { success: false, error: error.message };
    }
  }

  // TRAFFIC FORECASTING
  async forecastTraffic(days = 7) {
    try {
      const forecast = await this.models.trafficForecasting.forecast(days);
      
      return {
        success: true,
        data: {
          forecast: forecast.predictions,
          confidence: forecast.confidence,
          trends: forecast.trends,
          expectedPeaks: forecast.peaks,
          recommendedScaling: forecast.scaling
        }
      };
    } catch (error) {
      console.error('Traffic forecasting error:', error);
      return { success: false, error: error.message };
    }
  }

  // USER SEGMENTATION
  async segmentUsers() {
    try {
      const segments = await this.models.userSegmentation.segment();
      
      return {
        success: true,
        data: {
          segments: segments.clusters,
          characteristics: segments.profiles,
          recommendations: segments.strategies
        }
      };
    } catch (error) {
      console.error('User segmentation error:', error);
      return { success: false, error: error.message };
    }
  }

  // PERSONALIZED RECOMMENDATIONS
  async getRecommendations(userId, type = 'products') {
    try {
      const recommendations = await this.models.recommendationEngine.recommend(userId, type);
      
      return {
        success: true,
        data: recommendations
      };
    } catch (error) {
      console.error('Recommendation error:', error);
      return { success: false, error: error.message };
    }
  }

  // ANOMALY PREDICTION
  async predictAnomalies() {
    try {
      const predictions = await this.models.anomalyPredictor.predict();
      
      return {
        success: true,
        data: {
          likelyAnomalies: predictions.upcoming,
          preventiveActions: predictions.actions,
          riskAreas: predictions.riskAreas,
          timeframe: predictions.timeframe
        }
      };
    } catch (error) {
      console.error('Anomaly prediction error:', error);
      return { success: false, error: error.message };
    }
  }

  // MODEL PERFORMANCE
  getModelPerformance() {
    return {
      models: Object.keys(this.models).map(name => ({
        name,
        accuracy: this.modelAccuracy.get(name) || 0,
        lastTrained: this.models[name].lastTrained,
        predictions: this.models[name].predictionCount || 0
      })),
      cacheSize: this.predictionCache.size,
      systemLoad: process.memoryUsage()
    };
  }

  async retrainModels() {
    console.log('🔄 Retraining ML models with latest data...');
    await this.initializeModels();
  }
}

// CHURN PREDICTION MODEL
class ChurnPredictor {
  constructor() {
    this.lastTrained = null;
    this.predictionCount = 0;
  }

  async train() {
    // Simple feature-based churn prediction
    const users = await User.find().lean();
    const activities = await ActivityLog.find().lean();
    
    // Build training data
    this.userFeatures = new Map();
    
    for (const user of users) {
      const userActivities = activities.filter(a => a.userId?.toString() === user._id.toString());
      const features = this.extractFeatures(user, userActivities);
      this.userFeatures.set(user._id.toString(), features);
    }
    
    this.lastTrained = new Date();
    console.log(`📊 Churn model trained on ${users.length} users`);
  }

  extractFeatures(user, activities) {
    const now = new Date();
    const daysSinceRegistration = (now - new Date(user.createdAt)) / (1000 * 60 * 60 * 24);
    const daysSinceLastLogin = user.lastLogin ? (now - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24) : 999;
    
    const last30Days = activities.filter(a => 
      new Date(a.timestamp) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    );
    
    return {
      daysSinceRegistration,
      daysSinceLastLogin,
      loginCount: user.loginCount || 0,
      activityCount30d: last30Days.length,
      avgSessionLength: this.calculateAvgSessionLength(last30Days),
      featureUsage: this.calculateFeatureUsage(last30Days),
      engagementScore: this.calculateEngagementScore(user, last30Days)
    };
  }

  async predict(user) {
    this.predictionCount++;
    
    const activities = await ActivityLog.find({ userId: user._id }).lean();
    const features = this.extractFeatures(user, activities);
    
    // Simple rule-based prediction (in production, use actual ML algorithms)
    let score = 0;
    const factors = [];
    
    // Days since last login (strong predictor)
    if (features.daysSinceLastLogin > 14) {
      score += 0.4;
      factors.push('No login for 14+ days');
    } else if (features.daysSinceLastLogin > 7) {
      score += 0.2;
      factors.push('No login for 7+ days');
    }
    
    // Activity level
    if (features.activityCount30d < 5) {
      score += 0.3;
      factors.push('Low activity (< 5 actions in 30 days)');
    }
    
    // Engagement score
    if (features.engagementScore < 0.3) {
      score += 0.2;
      factors.push('Low engagement score');
    }
    
    // Login frequency decline
    if (features.loginCount < 3) {
      score += 0.1;
      factors.push('Few total logins');
    }
    
    const probability = Math.min(score, 0.95);
    const riskLevel = probability > 0.7 ? 'high' : probability > 0.4 ? 'medium' : 'low';
    const confidence = probability > 0.5 ? 0.85 : 0.65;
    const estimatedDays = probability > 0.7 ? 7 : probability > 0.4 ? 30 : 90;
    
    const actions = this.generateActions(riskLevel, factors);
    
    return {
      probability,
      riskLevel,
      factors,
      confidence,
      estimatedDays,
      actions
    };
  }

  generateActions(riskLevel, factors) {
    const actions = [];
    
    if (riskLevel === 'high') {
      actions.push('Send immediate re-engagement email');
      actions.push('Offer personalized discount');
      actions.push('Schedule customer success call');
    } else if (riskLevel === 'medium') {
      actions.push('Send feature tips email');
      actions.push('Provide usage analytics');
      actions.push('Suggest relevant content');
    } else {
      actions.push('Continue regular engagement');
      actions.push('Monitor for changes');
    }
    
    return actions;
  }

  calculateAvgSessionLength(activities) {
    // Simplified session calculation
    if (activities.length < 2) return 0;
    
    const sessions = [];
    let sessionStart = null;
    
    activities.forEach(activity => {
      if (activity.action === 'login') {
        sessionStart = new Date(activity.timestamp);
      } else if (sessionStart && activity.action === 'logout') {
        sessions.push(new Date(activity.timestamp) - sessionStart);
        sessionStart = null;
      }
    });
    
    return sessions.length > 0 ? sessions.reduce((a, b) => a + b, 0) / sessions.length / (1000 * 60) : 5; // minutes
  }

  calculateFeatureUsage(activities) {
    const features = ['view_product', 'search', 'add_to_cart', 'purchase'];
    const usage = {};
    
    features.forEach(feature => {
      usage[feature] = activities.filter(a => a.action === feature).length;
    });
    
    return usage;
  }

  calculateEngagementScore(user, activities) {
    const loginFrequency = activities.filter(a => a.action === 'login').length / 30;
    const actionDiversity = new Set(activities.map(a => a.action)).size;
    const recentActivity = activities.filter(a => 
      new Date(a.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    return Math.min((loginFrequency * 0.4 + actionDiversity * 0.1 + recentActivity * 0.02), 1);
  }
}

// TRAFFIC FORECASTING MODEL
class TrafficForecaster {
  constructor() {
    this.lastTrained = null;
    this.historicalData = [];
  }

  async train() {
    // Get historical traffic data
    const activities = await ActivityLog.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    this.historicalData = activities;
    this.lastTrained = new Date();
    console.log(`📈 Traffic model trained on ${activities.length} days of data`);
  }

  async forecast(days) {
    // Simple trend-based forecasting
    const recent = this.historicalData.slice(-14); // Last 14 days
    const avgTraffic = recent.reduce((sum, day) => sum + day.count, 0) / recent.length;
    
    // Calculate trend
    const trend = this.calculateTrend(recent);
    
    const predictions = [];
    for (let i = 1; i <= days; i++) {
      const prediction = Math.max(0, Math.round(avgTraffic + (trend * i)));
      predictions.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        predicted: prediction,
        confidence: Math.max(0.6, 0.9 - (i * 0.05)) // Decreasing confidence over time
      });
    }
    
    return {
      predictions,
      confidence: 0.8,
      trends: { direction: trend > 0 ? 'up' : 'down', strength: Math.abs(trend) },
      peaks: this.predictPeaks(predictions),
      scaling: this.recommendScaling(predictions)
    };
  }

  calculateTrend(data) {
    if (data.length < 2) return 0;
    
    const x = data.map((_, i) => i);
    const y = data.map(d => d.count);
    const n = data.length;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  predictPeaks(predictions) {
    return predictions
      .filter((pred, i) => {
        const prev = predictions[i - 1];
        const next = predictions[i + 1];
        return prev && next && pred.predicted > prev.predicted && pred.predicted > next.predicted;
      })
      .map(pred => ({ date: pred.date, predicted: pred.predicted }));
  }

  recommendScaling(predictions) {
    const maxPredicted = Math.max(...predictions.map(p => p.predicted));
    const avgCurrent = this.historicalData.slice(-7).reduce((sum, day) => sum + day.count, 0) / 7;
    
    if (maxPredicted > avgCurrent * 1.5) {
      return { action: 'scale_up', factor: Math.ceil(maxPredicted / avgCurrent), reason: 'Predicted traffic spike' };
    } else if (maxPredicted < avgCurrent * 0.7) {
      return { action: 'scale_down', factor: 0.8, reason: 'Predicted traffic decline' };
    }
    
    return { action: 'maintain', factor: 1, reason: 'Stable traffic predicted' };
  }
}

// USER SEGMENTATION MODEL
class UserSegmentationModel {
  constructor() {
    this.lastTrained = null;
    this.segments = [];
  }

  async train() {
    const users = await User.find().populate('activityLogs').lean();
    this.segments = this.performClustering(users);
    this.lastTrained = new Date();
    console.log(`👥 User segmentation model trained on ${users.length} users`);
  }

  async segment() {
    return {
      clusters: this.segments,
      profiles: this.generateProfiles(),
      strategies: this.generateStrategies()
    };
  }

  performClustering(users) {
    // Simple rule-based segmentation
    const segments = {
      powerUsers: [],
      regularUsers: [],
      newUsers: [],
      inactiveUsers: []
    };
    
    users.forEach(user => {
      const daysSinceRegistration = (Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24);
      const loginCount = user.loginCount || 0;
      const daysSinceLastLogin = user.lastLogin ? 
        (Date.now() - new Date(user.lastLogin)) / (1000 * 60 * 60 * 24) : 999;
      
      if (daysSinceLastLogin > 30) {
        segments.inactiveUsers.push(user);
      } else if (daysSinceRegistration < 7) {
        segments.newUsers.push(user);
      } else if (loginCount > 20 && daysSinceLastLogin < 7) {
        segments.powerUsers.push(user);
      } else {
        segments.regularUsers.push(user);
      }
    });
    
    return segments;
  }

  generateProfiles() {
    return {
      powerUsers: {
        description: 'Highly engaged users with frequent logins',
        avgLoginCount: 45,
        retentionRate: 0.95,
        characteristics: ['High activity', 'Feature adoption', 'Long sessions']
      },
      regularUsers: {
        description: 'Moderately active users',
        avgLoginCount: 12,
        retentionRate: 0.78,
        characteristics: ['Consistent usage', 'Basic feature usage', 'Medium sessions']
      },
      newUsers: {
        description: 'Recently registered users',
        avgLoginCount: 3,
        retentionRate: 0.65,
        characteristics: ['Learning curve', 'Need onboarding', 'High potential']
      },
      inactiveUsers: {
        description: 'Users who haven\'t logged in recently',
        avgLoginCount: 8,
        retentionRate: 0.15,
        characteristics: ['Risk of churn', 'Need re-engagement', 'Low activity']
      }
    };
  }

  generateStrategies() {
    return {
      powerUsers: ['Exclusive features', 'Beta access', 'Referral programs'],
      regularUsers: ['Feature tutorials', 'Usage tips', 'Regular updates'],
      newUsers: ['Onboarding sequence', 'Welcome campaign', 'Success milestones'],
      inactiveUsers: ['Win-back campaign', 'Special offers', 'Feedback surveys']
    };
  }
}

// RECOMMENDATION ENGINE
class RecommendationEngine {
  constructor() {
    this.lastTrained = null;
    this.userProfiles = new Map();
  }

  async train() {
    const users = await User.find().lean();
    const activities = await ActivityLog.find().lean();
    
    // Build user profiles
    users.forEach(user => {
      const userActivities = activities.filter(a => a.userId?.toString() === user._id.toString());
      this.userProfiles.set(user._id.toString(), this.buildProfile(user, userActivities));
    });
    
    this.lastTrained = new Date();
    console.log(`🎯 Recommendation engine trained on ${users.length} users`);
  }

  buildProfile(user, activities) {
    const preferences = {
      categories: {},
      actions: {},
      timePatterns: {},
      engagement: 0
    };
    
    activities.forEach(activity => {
      preferences.actions[activity.action] = (preferences.actions[activity.action] || 0) + 1;
      
      const hour = new Date(activity.timestamp).getHours();
      preferences.timePatterns[hour] = (preferences.timePatterns[hour] || 0) + 1;
    });
    
    preferences.engagement = activities.length / Math.max(1, (Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
    
    return preferences;
  }

  async recommend(userId, type) {
    const userProfile = this.userProfiles.get(userId.toString());
    if (!userProfile) return { recommendations: [], reason: 'No profile data' };
    
    if (type === 'products') {
      return await this.recommendProducts(userId, userProfile);
    } else if (type === 'actions') {
      return this.recommendActions(userProfile);
    }
    
    return { recommendations: [], reason: 'Unknown type' };
  }

  async recommendProducts(userId, profile) {
    const products = await Product.find({ isActive: true }).lean();
    
    // Simple collaborative filtering
    const recommendations = products
      .map(product => ({
        ...product,
        score: this.calculateProductScore(product, profile)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    return {
      recommendations: recommendations.map(p => ({
        id: p._id,
        name: p.name,
        score: p.score,
        reason: 'Based on your activity patterns'
      }))
    };
  }

  calculateProductScore(product, profile) {
    // Simple scoring based on category preferences and engagement
    const categoryBonus = profile.categories[product.category] || 0;
    const popularityBonus = product.viewCount / 100;
    const engagementMultiplier = profile.engagement;
    
    return (categoryBonus + popularityBonus) * engagementMultiplier;
  }

  recommendActions(profile) {
    const actions = [];
    
    if (profile.engagement < 0.1) {
      actions.push({ action: 'explore_features', reason: 'Low engagement detected' });
    }
    
    if (!profile.actions.view_product) {
      actions.push({ action: 'browse_products', reason: 'No product browsing yet' });
    }
    
    if (profile.actions.search && !profile.actions.purchase) {
      actions.push({ action: 'complete_purchase', reason: 'Shows purchase intent' });
    }
    
    return { recommendations: actions };
  }
}

// ANOMALY PREDICTOR
class AnomalyPredictor {
  constructor() {
    this.lastTrained = null;
    this.patterns = new Map();
  }

  async train() {
    // Analyze historical patterns to predict future anomalies
    const activities = await ActivityLog.find().lean();
    
    // Group by time patterns
    const hourlyPatterns = new Map();
    const dailyPatterns = new Map();
    
    activities.forEach(activity => {
      const hour = new Date(activity.timestamp).getHours();
      const day = new Date(activity.timestamp).getDay();
      
      hourlyPatterns.set(hour, (hourlyPatterns.get(hour) || 0) + 1);
      dailyPatterns.set(day, (dailyPatterns.get(day) || 0) + 1);
    });
    
    this.patterns.set('hourly', hourlyPatterns);
    this.patterns.set('daily', dailyPatterns);
    
    this.lastTrained = new Date();
    console.log('🔮 Anomaly predictor trained on historical patterns');
  }

  async predict() {
    const now = new Date();
    const predictions = [];
    
    // Predict based on current time patterns
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    
    const expectedHourlyActivity = this.patterns.get('hourly')?.get(currentHour) || 0;
    const expectedDailyActivity = this.patterns.get('daily')?.get(currentDay) || 0;
    
    // Get recent activity
    const recentActivity = await ActivityLog.countDocuments({
      timestamp: { $gte: new Date(now.getTime() - 60 * 60 * 1000) }
    });
    
    if (recentActivity < expectedHourlyActivity * 0.5) {
      predictions.push({
        type: 'traffic_drop_likely',
        probability: 0.7,
        timeframe: '1 hour',
        action: 'Monitor system health'
      });
    }
    
    if (recentActivity > expectedHourlyActivity * 2) {
      predictions.push({
        type: 'traffic_spike_likely',
        probability: 0.8,
        timeframe: '1 hour',
        action: 'Prepare for scaling'
      });
    }
    
    return {
      upcoming: predictions,
      actions: predictions.map(p => p.action),
      riskAreas: ['Traffic patterns', 'User behavior'],
      timeframe: 'Next 1-6 hours'
    };
  }
}

module.exports = new MachineLearningService();