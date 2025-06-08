// backend/server.js
// Updated server with ML Prediction routes

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./services/database');
const simpleAuth = require('./controllers/simple-auth');
const simpleAnalytics = require('./controllers/simple-analytics');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Simple routes (no complex routing)
app.post('/api/auth/login', simpleAuth.login);
app.get('/api/auth/me', simpleAuth.getMe);
app.post('/api/auth/logout', (req, res) => res.json({ message: 'Logged out' }));

app.get('/api/analytics/dashboard', simpleAnalytics.getDashboard);
app.get('/api/analytics/products', simpleAnalytics.getProducts);

// AI Chat routes
app.use('/api/ai', require('./routes/aiChat'));

// Anomaly Detection routes
app.use('/api/anomaly', require('./routes/anomaly'));

// Machine Learning routes
app.use('/api/ml', require('./routes/ml'));

app.use('/api/integrations', require('./routes/integrations'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} with REAL DATABASE!`);
  console.log(`🤖 AI Chat Assistant: ACTIVE`);
  console.log(`🚨 Anomaly Detection: MONITORING`);
  console.log(`🧠 ML Predictions Engine: ONLINE`); // <-- New log message
});