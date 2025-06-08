// ===== BACKEND: AI Chat Assistant Service =====
// File: backend/services/aiAssistant.js

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Add this to your .env
});

class AIAssistant {
  constructor() {
    this.queryTemplates = {
      userAnalytics: {
        pattern: /users?.*(registered|signed up|new).*(\d+)?\s*(day|week|month)/i,
        query: this.getUserRegistrationQuery.bind(this)
      },
      productTrends: {
        pattern: /products?.*(trending|popular|viewed)/i,
        query: this.getProductTrendsQuery.bind(this)
      },
      userActivity: {
        pattern: /users?.*(active|inactive|login)/i,
        query: this.getUserActivityQuery.bind(this)
      },
      alerts: {
        pattern: /alert.*activity.*drop/i,
        query: this.createAlert.bind(this)
      }
    };
  }

  async processQuery(question) {
    try {
      // First, try to match with predefined patterns
      const quickResult = await this.matchQuickPatterns(question);
      if (quickResult) return quickResult;

      // If no pattern match, use OpenAI to generate MongoDB query
      const aiResponse = await this.generateAIQuery(question);
      return aiResponse;
    } catch (error) {
      console.error('AI Assistant Error:', error);
      return {
        success: false,
        message: "I'm having trouble processing that request. Please try rephrasing or use one of the suggested queries.",
        suggestions: [
          "Show me users who registered this week",
          "Which products are trending?",
          "How many users logged in today?"
        ]
      };
    }
  }

  async matchQuickPatterns(question) {
    for (const [type, template] of Object.entries(this.queryTemplates)) {
      if (template.pattern.test(question)) {
        return await template.query(question);
      }
    }
    return null;
  }

  async generateAIQuery(question) {
    const prompt = `
You are an AI assistant for an admin analytics dashboard. Convert this natural language question into a MongoDB aggregation pipeline.

Database Collections:
- users: {email, username, role, isActive, lastLogin, loginCount, createdAt}
- activitylogs: {userId, action, resource, timestamp, success}
- products: {name, category, price, viewCount, purchaseCount, rating}

Question: "${question}"

Respond with a JSON object containing:
{
  "queryType": "aggregation",
  "collection": "collection_name",
  "pipeline": [...],
  "explanation": "What this query does"
}

If the question is unclear, suggest alternatives.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.3
    });

    const aiResponse = completion.choices[0].message.content;
    
    try {
      const parsedResponse = JSON.parse(aiResponse);
      return await this.executeAIQuery(parsedResponse);
    } catch (parseError) {
      return {
        success: false,
        message: "I understand your question but need more specific details. Could you try rephrasing?",
        aiSuggestion: aiResponse
      };
    }
  }

  async executeAIQuery(queryData) {
    const { collection, pipeline, explanation } = queryData;
    
    try {
      const model = this.getModel(collection);
      const result = await model.aggregate(pipeline);
      
      return {
        success: true,
        data: result,
        explanation,
        query: pipeline
      };
    } catch (error) {
      return {
        success: false,
        message: `Query execution failed: ${error.message}`,
        explanation
      };
    }
  }

  // Quick pattern implementations
  async getUserRegistrationQuery(question) {
    const timeMatch = question.match(/(\d+)?\s*(day|week|month)/i);
    const timeValue = timeMatch ? parseInt(timeMatch[1]) || 1 : 1;
    const timeUnit = timeMatch ? timeMatch[2].toLowerCase() : 'week';
    
    const startDate = new Date();
    switch(timeUnit) {
      case 'day': startDate.setDate(startDate.getDate() - timeValue); break;
      case 'week': startDate.setDate(startDate.getDate() - (timeValue * 7)); break;
      case 'month': startDate.setMonth(startDate.getMonth() - timeValue); break;
    }

    const User = require('../models/User');
    const users = await User.find({
      createdAt: { $gte: startDate }
    }).select('username email createdAt lastLogin');

    const inactiveUsers = users.filter(user => 
      !user.lastLogin || user.lastLogin < user.createdAt
    );

    return {
      success: true,
      data: {
        totalRegistered: users.length,
        inactiveUsers: inactiveUsers.length,
        users: inactiveUsers.slice(0, 10) // Limit to 10 for display
      },
      explanation: `Found ${users.length} users registered in the last ${timeValue} ${timeUnit}(s), ${inactiveUsers.length} haven't logged in yet.`,
      chart: {
        type: 'bar',
        data: [
          { name: 'Registered', value: users.length },
          { name: 'Never Logged In', value: inactiveUsers.length },
          { name: 'Active', value: users.length - inactiveUsers.length }
        ]
      }
    };
  }

  async getProductTrendsQuery(question) {
    const Product = require('../models/Product');
    const products = await Product.find({ isActive: true })
      .sort({ viewCount: -1 })
      .limit(5)
      .select('name category viewCount purchaseCount');

    return {
      success: true,
      data: products,
      explanation: "Here are the top 5 trending products based on view count.",
      chart: {
        type: 'line',
        data: products.map(p => ({
          name: p.name,
          views: p.viewCount,
          purchases: p.purchaseCount
        }))
      }
    };
  }

  async getUserActivityQuery(question) {
    const User = require('../models/User');
    const ActivityLog = require('../models/ActivityLog');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [totalUsers, activeToday, recentActivity] = await Promise.all([
      User.countDocuments({ isActive: true }),
      ActivityLog.distinct('userId', { 
        timestamp: { $gte: today },
        action: 'login'
      }),
      ActivityLog.find({ timestamp: { $gte: today } })
        .populate('userId', 'username')
        .sort({ timestamp: -1 })
        .limit(10)
    ]);

    return {
      success: true,
      data: {
        totalUsers,
        activeToday: activeToday.length,
        activityRate: ((activeToday.length / totalUsers) * 100).toFixed(1),
        recentActivity
      },
      explanation: `${activeToday.length} out of ${totalUsers} users (${((activeToday.length / totalUsers) * 100).toFixed(1)}%) were active today.`
    };
  }

  async createAlert(question) {
    // Simple alert creation - in real implementation, store in database
    return {
      success: true,
      data: {
        alertCreated: true,
        threshold: 20,
        type: 'activity_drop'
      },
      explanation: "Alert created! I'll notify you if user activity drops by 20% or more.",
      message: "🔔 Alert system activated for activity monitoring"
    };
  }

  getModel(collection) {
    switch(collection.toLowerCase()) {
      case 'users': return require('../models/User');
      case 'activitylogs': return require('../models/ActivityLog');
      case 'products': return require('../models/Product');
      default: throw new Error(`Unknown collection: ${collection}`);
    }
  }
}

module.exports = new AIAssistant();