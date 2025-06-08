// backend/routes/integrations.js

const express = require('express');
const router = express.Router();
const IntegrationsController = require('../controllers/integrationsController');

// Create controller instance
const integrationsController = new IntegrationsController();

// ===== STATUS & MONITORING ROUTES =====
router.get('/status', integrationsController.getStatus.bind(integrationsController));
router.get('/settings', integrationsController.getSettings.bind(integrationsController));
router.get('/history', integrationsController.getNotificationHistory.bind(integrationsController));

// ===== CONFIGURATION ROUTES =====
router.put('/email/config', integrationsController.updateEmailConfig.bind(integrationsController));
router.put('/slack/webhook', integrationsController.updateSlackWebhook.bind(integrationsController));
router.put('/webhook/endpoint', integrationsController.updateWebhookEndpoint.bind(integrationsController));

// ===== NOTIFICATION ROUTES =====
router.post('/test', integrationsController.sendTestNotification.bind(integrationsController));
router.post('/notify', integrationsController.sendManualNotification.bind(integrationsController));

module.exports = router;