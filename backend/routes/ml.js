// backend/routes/ml.js
// Machine Learning Predictions Routes

const express = require('express');
const router = express.Router();
const MLController = require('../controllers/mlController');

// Create controller instance
const mlController = new MLController();

// ===== PREDICTION ENDPOINTS =====

// Get all ML predictions overview
router.get('/predictions', mlController.getAllPredictions.bind(mlController));

// Get ML dashboard summary
router.get('/dashboard', mlController.getDashboardSummary.bind(mlController));

// Specific prediction types
router.get('/predictions/churn', mlController.getChurnPredictions.bind(mlController));
router.get('/predictions/traffic', mlController.getTrafficForecast.bind(mlController));
router.get('/predictions/anomaly', mlController.getAnomalyPredictions.bind(mlController));
router.get('/predictions/behavior', mlController.getBehaviorAnalysis.bind(mlController));

// User-specific recommendations
router.get('/recommendations/:userId', mlController.getUserRecommendations.bind(mlController));

// ===== MANAGEMENT ENDPOINTS =====

// Trigger manual prediction updates
router.post('/predictions/update', mlController.updatePredictions.bind(mlController));

// Train models (admin action)
router.post('/models/train', mlController.trainModels.bind(mlController));

// Get model performance metrics
router.get('/models/metrics', mlController.getModelMetrics.bind(mlController));

module.exports = router;