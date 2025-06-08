// backend/routes/anomaly.js
// Fixed - Clean Anomaly Detection Routes

const express = require('express');
const router = express.Router();
const AnomalyController = require('../controllers/anomalyController');

// Create controller instance
const anomalyController = new AnomalyController();

// Anomaly monitoring routes
router.get('/active', anomalyController.getActiveAnomalies.bind(anomalyController));
router.get('/stats', anomalyController.getAnomalyStats.bind(anomalyController));
router.get('/trends', anomalyController.getAnomalyTrends.bind(anomalyController));
router.get('/config', anomalyController.getConfiguration.bind(anomalyController));

// Anomaly management routes
router.post('/acknowledge/:anomalyId', anomalyController.acknowledgeAnomaly.bind(anomalyController));
router.post('/resolve/:anomalyId', anomalyController.resolveAnomaly.bind(anomalyController));
router.post('/scan', anomalyController.forceScan.bind(anomalyController));
router.put('/thresholds', anomalyController.updateThresholds.bind(anomalyController));

module.exports = router;