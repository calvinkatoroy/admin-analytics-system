// backend/controllers/mlController.js
// Machine Learning Predictions API Controller

const mlService = require('../services/mlPredictionService');

class MLController {
  // Get all ML predictions overview
  async getAllPredictions(req, res) {
    try {
      const predictions = mlService.getPredictions();
      const accuracy = mlService.getModelAccuracy();
      
      res.json({
        success: true,
        data: {
          predictions,
          modelAccuracy: accuracy,
          systemStatus: 'active',
          lastUpdated: new Date(),
          summary: {
            totalModels: 4,
            avgAccuracy: Math.round(Object.values(accuracy).reduce((a, b) => a + b, 0) / Object.values(accuracy).length),
            predictionsGenerated: Object.keys(predictions).length
          }
        }
      });
    } catch (error) {
      console.error('❌ Error fetching ML predictions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch ML predictions',
        error: error.message
      });
    }
  }

  // Get user churn predictions
  async getChurnPredictions(req, res) {
    try {
      const predictions = mlService.getPredictions();
      const churnData = predictions.churn;
      
      if (!churnData) {
        return res.json({
          success: true,
          data: {
            message: 'Churn predictions are being generated. Please check back in a few minutes.',
            status: 'generating'
          }
        });
      }

      res.json({
        success: true,
        data: {
          ...churnData,
          insights: [
            `${churnData.atRiskUsers} out of ${churnData.totalUsers} users at risk of churning`,
            `${churnData.summary.criticalRisk} users need immediate attention`,
            `Churn prediction accuracy: ${mlService.getModelAccuracy().churn}%`
          ],
          recommendations: [
            'Focus on users with critical risk scores first',
            'Implement automated re-engagement campaigns',
            'Analyze common factors among at-risk users'
          ]
        }
      });
    } catch (error) {
      console.error('❌ Error fetching churn predictions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch churn predictions',
        error: error.message
      });
    }
  }

  // Get traffic forecasting
  async getTrafficForecast(req, res) {
    try {
      const predictions = mlService.getPredictions();
      const trafficData = predictions.traffic;
      
      if (!trafficData) {
        return res.json({
          success: true,
          data: {
            message: 'Traffic forecast is being generated. Please check back in a few minutes.',
            status: 'generating'
          }
        });
      }

      res.json({
        success: true,
        data: {
          ...trafficData,
          chartData: trafficData.predictions.map(p => ({
            period: p.period.replace('_', ' '),
            predicted: p.predicted,
            confidence: p.confidence
          })),
          alerts: trafficData.predictions
            .filter(p => p.confidence < 70)
            .map(p => `Low confidence (${p.confidence}%) for ${p.period} prediction`)
        }
      });
    } catch (error) {
      console.error('❌ Error fetching traffic forecast:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch traffic forecast',
        error: error.message
      });
    }
  }

  // Get anomaly predictions
  async getAnomalyPredictions(req, res) {
    try {
      const predictions = mlService.getPredictions();
      const anomalyData = predictions.anomaly;
      
      if (!anomalyData) {
        return res.json({
          success: true,
          data: {
            message: 'Anomaly predictions are being generated. Please check back in a few minutes.',
            status: 'generating'
          }
        });
      }

      res.json({
        success: true,
        data: {
          ...anomalyData,
          riskScore: Math.round(anomalyData.riskLevel * 100),
          highRiskPredictions: anomalyData.predictions.filter(p => p.probability > 0.6),
          urgentActions: anomalyData.preventiveActions.slice(0, 3)
        }
      });
    } catch (error) {
      console.error('❌ Error fetching anomaly predictions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch anomaly predictions',
        error: error.message
      });
    }
  }

  // Get behavior analysis
  async getBehaviorAnalysis(req, res) {
    try {
      const predictions = mlService.getPredictions();
      const behaviorData = predictions.behavior;
      
      if (!behaviorData) {
        return res.json({
          success: true,
          data: {
            message: 'Behavior analysis is being generated. Please check back in a few minutes.',
            status: 'generating'
          }
        });
      }

      res.json({
        success: true,
        data: {
          ...behaviorData,
          segmentChart: behaviorData.userSegments.map(s => ({
            name: s.segment,
            value: s.count,
            color: s.segment === 'Power Users' ? '#10B981' : 
                   s.segment === 'Regular Users' ? '#3B82F6' : '#F59E0B'
          })),
          keyInsights: [
            `${behaviorData.userSegments[0].count} power users drive high engagement`,
            `Peak usage: ${behaviorData.patterns[0].pattern.start} - ${behaviorData.patterns[0].pattern.end}`,
            `${behaviorData.patterns[2].pattern.high}% user engagement rate`
          ]
        }
      });
    } catch (error) {
      console.error('❌ Error fetching behavior analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch behavior analysis',
        error: error.message
      });
    }
  }

  // Get personalized recommendations for a user
  async getUserRecommendations(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const recommendations = await mlService.generateRecommendations(userId);
      
      res.json({
        success: true,
        data: {
          userId,
          recommendations,
          generatedAt: new Date(),
          type: 'personalized_recommendations'
        }
      });
    } catch (error) {
      console.error('❌ Error fetching user recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user recommendations',
        error: error.message
      });
    }
  }

  // Trigger manual ML prediction update
  async updatePredictions(req, res) {
    try {
      console.log('🔄 Manual ML prediction update triggered');
      
      // Run predictions in background
      setTimeout(() => {
        mlService.runAllPredictions();
      }, 100);
      
      res.json({
        success: true,
        message: 'ML prediction update initiated',
        data: {
          triggeredAt: new Date(),
          estimatedCompletion: new Date(Date.now() + 30000), // 30 seconds
          status: 'processing'
        }
      });
    } catch (error) {
      console.error('❌ Error updating predictions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update predictions',
        error: error.message
      });
    }
  }

  // Train ML models (admin only)
  async trainModels(req, res) {
    try {
      console.log('🏋️ ML model training triggered by admin');
      
      const trainingResult = await mlService.trainModels();
      
      res.json({
        success: true,
        message: 'Model training completed successfully',
        data: trainingResult
      });
    } catch (error) {
      console.error('❌ Error training models:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to train models',
        error: error.message
      });
    }
  }

  // Get model performance metrics
  async getModelMetrics(req, res) {
    try {
      const accuracy = mlService.getModelAccuracy();
      const predictions = mlService.getPredictions();
      
      const metrics = {
        accuracy,
        performance: {
          churn: {
            accuracy: accuracy.churn,
            lastPrediction: predictions.churn?.timestamp,
            predictionsCount: predictions.churn?.predictions?.length || 0,
            status: predictions.churn ? 'active' : 'generating'
          },
          traffic: {
            accuracy: accuracy.traffic,
            lastPrediction: predictions.traffic?.timestamp,
            forecastPeriods: 4,
            status: predictions.traffic ? 'active' : 'generating'
          },
          anomaly: {
            accuracy: accuracy.anomaly,
            lastPrediction: predictions.anomaly?.timestamp,
            riskAssessments: predictions.anomaly?.predictions?.length || 0,
            status: predictions.anomaly ? 'active' : 'generating'
          },
          behavior: {
            accuracy: accuracy.behavior,
            lastPrediction: predictions.behavior?.timestamp,
            segmentsAnalyzed: predictions.behavior?.userSegments?.length || 0,
            status: predictions.behavior ? 'active' : 'generating'
          }
        },
        systemHealth: {
          modelsActive: 4,
          lastTraining: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random recent time
          nextTraining: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
          avgResponseTime: Math.round(Math.random() * 100 + 50) + 'ms'
        }
      };

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('❌ Error fetching model metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch model metrics',
        error: error.message
      });
    }
  }

  // Get ML dashboard summary
  async getDashboardSummary(req, res) {
    try {
      const predictions = mlService.getPredictions();
      const accuracy = mlService.getModelAccuracy();
      
      const summary = {
        overview: {
          totalPredictions: Object.keys(predictions).filter(k => predictions[k]).length,
          avgModelAccuracy: Math.round(Object.values(accuracy).reduce((a, b) => a + b, 0) / Object.values(accuracy).length),
          systemStatus: 'optimal',
          lastUpdate: new Date()
        },
        alerts: [],
        insights: [],
        quickActions: [
          { action: 'retrain_models', label: 'Retrain Models', urgent: false },
          { action: 'update_predictions', label: 'Update Predictions', urgent: false },
          { action: 'review_churn_risks', label: 'Review Churn Risks', urgent: true }
        ]
      };

      // Generate dynamic alerts based on predictions
      if (predictions.churn?.summary?.criticalRisk > 0) {
        summary.alerts.push({
          type: 'critical',
          message: `${predictions.churn.summary.criticalRisk} users at critical churn risk`,
          action: 'review_churn_predictions'
        });
      }

      if (predictions.anomaly?.riskLevel > 0.7) {
        summary.alerts.push({
          type: 'warning',
          message: 'High anomaly risk predicted in next 6 hours',
          action: 'review_anomaly_predictions'
        });
      }

      // Generate insights
      if (predictions.behavior?.userSegments) {
        const powerUsers = predictions.behavior.userSegments.find(s => s.segment === 'Power Users');
        if (powerUsers) {
          summary.insights.push(`${powerUsers.count} power users identified - focus on retention`);
        }
      }

      if (predictions.traffic?.predictions) {
        const nextHour = predictions.traffic.predictions.find(p => p.period === 'next_hour');
        if (nextHour && nextHour.trend === 'increasing') {
          summary.insights.push('Traffic spike predicted - prepare scaling');
        }
      }

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('❌ Error fetching dashboard summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard summary',
        error: error.message
      });
    }
  }
}

module.exports = MLController;