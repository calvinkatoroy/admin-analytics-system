// backend/routes/aiChat.js
// Updated routes for hybrid AI system

const express = require('express');
const router = express.Router();
const aiChatController = require('../controllers/aiChat');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticate);
router.use(requireAdmin);

// Main AI endpoints
router.post('/query', aiChatController.processQuery);
router.get('/suggestions', aiChatController.getSuggestions);

// System monitoring endpoints
router.get('/status', aiChatController.getStatus);
router.post('/offline', aiChatController.forceOffline); // For testing offline mode

module.exports = router;