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

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} with REAL DATABASE!`);
});