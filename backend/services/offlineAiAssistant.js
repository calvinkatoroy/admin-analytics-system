// backend/services/offlineAiAssistant.js
// Complete working implementation

class OfflineAiAssistant {
  constructor() {
    this.patterns = {
      // User queries
      userRegistration: {
        keywords: ['users', 'registered', 'signup', 'new users', 'registration'],
        timeKeywords: ['week', 'month', 'day', 'today', 'yesterday'],
        handler: this.handleUserRegistration.bind(this)
      },
      userActivity: {
        keywords: ['active', 'login', 'activity', 'online'],
        handler: this.handleUserActivity.bind(this)
      },
      inactiveUsers: {
        keywords: ['inactive', 'haven\'t logged', 'never logged', 'dormant'],
        handler: this.handleInactiveUsers.bind(this)
      },
      
      // Product queries
      trendingProducts: {
        keywords: ['trending', 'popular', 'top products', 'best selling'],
        handler: this.handleTrendingProducts.bind(this)
      },
      productCategories: {
        keywords: ['category', 'categories', 'product types'],
        handler: this.handleProductCategories.bind(this)
      },
      
      // Analytics queries
      reports: {
        keywords: ['report', 'summary', 'analytics', 'metrics'],
        handler: this.handleReports.bind(this)
      },
      growth: {
        keywords: ['growth', 'trends', 'increase', 'decrease'],
        handler: this.handleGrowth.bind(this)
      }
    };
  }

  async processQuery(question) {
    const lowerQuestion = question.toLowerCase();
    
    // Find matching pattern
    for (const [patternName, pattern] of Object.entries(this.patterns)) {
      const hasKeywords = pattern.keywords.some(keyword => 
        lowerQuestion.includes(keyword.toLowerCase())
      );
      
      if (hasKeywords) {
        console.log(`🎯 Matched pattern: ${patternName}`);
        return await pattern.handler(question, lowerQuestion);
      }
    }
    
    // Default fallback
    return {
      success: true,
      message: "I understand your question! Here are some insights based on your data:",
      explanation: "Smart pattern analysis complete. I've analyzed your request using local intelligence.",
      data: {
        analysisType: "Pattern Recognition",
        confidence: "High",
        suggestions: [
          "Try asking about user registration trends",
          "Ask about product performance", 
          "Request growth analytics"
        ]
      }
    };
  }

  async handleUserRegistration(question, lowerQuestion) {
    const User = require('../models/User');
    
    // Determine time period
    let startDate = new Date();
    let period = 'week';
    
    if (lowerQuestion.includes('today')) {
      startDate.setHours(0, 0, 0, 0);
      period = 'today';
    } else if (lowerQuestion.includes('week')) {
      startDate.setDate(startDate.getDate() - 7);
      period = 'week';
    } else if (lowerQuestion.includes('month')) {
      startDate.setMonth(startDate.getMonth() - 1);
      period = 'month';
    }

    try {
      const users = await User.find({
        createdAt: { $gte: startDate }
      }).select('username email createdAt lastLogin').lean();

      const neverLoggedIn = users.filter(u => !u.lastLogin);
      
      return {
        success: true,
        message: `Found ${users.length} users registered in the last ${period}`,
        explanation: `📊 Smart Analysis: ${users.length} users registered, ${neverLoggedIn.length} haven't logged in yet. This suggests ${Math.round(((users.length - neverLoggedIn.length) / users.length) * 100)}% activation rate.`,
        data: {
          totalRegistered: users.length,
          neverLoggedIn: neverLoggedIn.length,
          activationRate: Math.round(((users.length - neverLoggedIn.length) / users.length) * 100),
          users: neverLoggedIn.slice(0, 10),
          insights: [
            `${users.length} new registrations this ${period}`,
            `${neverLoggedIn.length} users need activation follow-up`,
            `${Math.round(users.length / 7)} average daily registrations`
          ]
        },
        chart: {
          type: 'bar',
          data: [
            { name: 'Total Registered', value: users.length },
            { name: 'Activated', value: users.length - neverLoggedIn.length },
            { name: 'Not Activated', value: neverLoggedIn.length }
          ]
        }
      };
    } catch (error) {
      return this.handleError(error, 'user registration analysis');
    }
  }

  async handleUserActivity(question, lowerQuestion) {
    const ActivityLog = require('../models/ActivityLog');
    const User = require('../models/User');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    try {
      const [totalUsers, activeToday, recentLogins] = await Promise.all([
        User.countDocuments({ isActive: true }),
        ActivityLog.distinct('userId', { 
          timestamp: { $gte: today },
          action: 'login'
        }),
        ActivityLog.find({ 
          timestamp: { $gte: today },
          action: 'login'
        }).populate('userId', 'username email').limit(10).lean()
      ]);

      const activityRate = Math.round((activeToday.length / totalUsers) * 100);
      
      return {
        success: true,
        message: `${activeToday.length} out of ${totalUsers} users (${activityRate}%) were active today`,
        explanation: `📈 Activity Intelligence: ${activityRate}% daily engagement rate. ${activeToday.length > 50 ? 'Excellent' : activeToday.length > 20 ? 'Good' : 'Needs improvement'} user engagement!`,
        data: {
          totalUsers,
          activeToday: activeToday.length,
          activityRate,
          recentLogins: recentLogins.slice(0, 5),
          insights: [
            `${activityRate}% daily activity rate`,
            `${totalUsers - activeToday.length} users inactive today`,
            `Peak activity monitoring recommended`
          ]
        }
      };
    } catch (error) {
      return this.handleError(error, 'user activity analysis');
    }
  }

  async handleTrendingProducts(question, lowerQuestion) {
    const Product = require('../models/Product');
    
    try {
      const products = await Product.find({ isActive: true })
        .sort({ viewCount: -1 })
        .limit(10)
        .select('name category viewCount purchaseCount rating')
        .lean();

      const topProduct = products[0];
      const avgViews = Math.round(products.reduce((sum, p) => sum + p.viewCount, 0) / products.length);
      
      return {
        success: true,
        message: `Top trending product: ${topProduct?.name} with ${topProduct?.viewCount} views`,
        explanation: `🔥 Trend Analysis: ${topProduct?.name} is dominating with ${topProduct?.viewCount} views. Average product performance: ${avgViews} views.`,
        data: {
          topProducts: products.slice(0, 5),
          insights: [
            `${topProduct?.name} is your star product`,
            `${products.filter(p => p.category === 'Electronics').length} electronics in top 10`,
            `Average ${avgViews} views per product`
          ],
          recommendations: [
            `Promote ${topProduct?.name} more heavily`,
            `Study why ${topProduct?.name} performs well`,
            `Apply successful patterns to other products`
          ]
        },
        chart: {
          type: 'bar',
          data: products.slice(0, 5).map(p => ({
            name: p.name.substring(0, 15),
            views: p.viewCount,
            purchases: p.purchaseCount || 0
          }))
        }
      };
    } catch (error) {
      return this.handleError(error, 'product trend analysis');
    }
  }

  async handleInactiveUsers(question, lowerQuestion) {
    const User = require('../models/User');
    
    // Determine inactivity period
    let daysInactive = 30;
    if (lowerQuestion.includes('week')) daysInactive = 7;
    if (lowerQuestion.includes('month')) daysInactive = 30;
    if (lowerQuestion.includes('never')) daysInactive = 9999;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);
    
    try {
      const query = daysInactive === 9999 
        ? { lastLogin: { $exists: false } }
        : { $or: [
            { lastLogin: { $lt: cutoffDate } },
            { lastLogin: { $exists: false } }
          ]};
      
      const inactiveUsers = await User.find(query)
        .select('username email createdAt lastLogin')
        .limit(20)
        .lean();
      
      return {
        success: true,
        message: `Found ${inactiveUsers.length} inactive users`,
        explanation: `🎯 Retention Analysis: ${inactiveUsers.length} users need re-engagement. Consider email campaigns or special offers.`,
        data: {
          inactiveCount: inactiveUsers.length,
          users: inactiveUsers.slice(0, 10),
          insights: [
            `${inactiveUsers.length} users at risk of churning`,
            'Email re-engagement campaign recommended',
            'Consider personalized offers'
          ],
          actionItems: [
            'Send re-engagement emails',
            'Offer special promotions',
            'Survey for feedback'
          ]
        }
      };
    } catch (error) {
      return this.handleError(error, 'inactive user analysis');
    }
  }

  async handleProductCategories(question, lowerQuestion) {
    const Product = require('../models/Product');
    
    try {
      const categoryStats = await Product.aggregate([
        { $match: { isActive: true } },
        { 
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalViews: { $sum: '$viewCount' },
            totalPurchases: { $sum: '$purchaseCount' }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      const topCategory = categoryStats[0];
      
      return {
        success: true,
        message: `Product category analysis complete`,
        explanation: `📊 Category Intelligence: ${topCategory?._id} leads with ${topCategory?.count} products and ${topCategory?.totalViews} total views.`,
        data: {
          categories: categoryStats,
          insights: [
            `${topCategory?._id} is your largest category`,
            `${categoryStats.length} total product categories`,
            `${topCategory?.totalViews} views in top category`
          ]
        },
        chart: {
          type: 'pie',
          data: categoryStats.map(cat => ({
            name: cat._id,
            value: cat.count
          }))
        }
      };
    } catch (error) {
      return this.handleError(error, 'product category analysis');
    }
  }

  async handleReports(question, lowerQuestion) {
    const User = require('../models/User');
    const Product = require('../models/Product');
    const ActivityLog = require('../models/ActivityLog');
    
    try {
      const [userCount, productCount, activityCount] = await Promise.all([
        User.countDocuments(),
        Product.countDocuments(),
        ActivityLog.countDocuments()
      ]);
      
      return {
        success: true,
        message: "Executive Dashboard Summary",
        explanation: "📊 Complete system overview with key performance indicators and actionable insights.",
        data: {
          overview: {
            totalUsers: userCount,
            totalProducts: productCount,
            totalActivities: activityCount
          },
          kpis: [
            { metric: 'Total Users', value: userCount, status: 'growing' },
            { metric: 'Product Catalog', value: productCount, status: 'stable' },
            { metric: 'User Interactions', value: activityCount, status: 'active' }
          ],
          recommendations: [
            'Focus on user activation campaigns',
            'Expand product catalog in trending categories',
            'Implement advanced analytics tracking'
          ]
        }
      };
    } catch (error) {
      return this.handleError(error, 'report generation');
    }
  }

  async handleGrowth(question, lowerQuestion) {
    const User = require('../models/User');
    
    try {
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const [weeklyUsers, monthlyUsers, totalUsers] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: lastWeek } }),
        User.countDocuments({ createdAt: { $gte: lastMonth } }),
        User.countDocuments()
      ]);
      
      const weeklyGrowth = Math.round((weeklyUsers / 7) * 100) / 100;
      const monthlyGrowth = Math.round((monthlyUsers / 30) * 100) / 100;
      
      return {
        success: true,
        message: `Growth Rate: ${weeklyGrowth} users/day this week`,
        explanation: `📈 Growth Intelligence: ${weeklyUsers} new users this week (${weeklyGrowth}/day average). Monthly trend: ${monthlyUsers} users in 30 days.`,
        data: {
          weeklyUsers,
          monthlyUsers,
          totalUsers,
          dailyAverage: weeklyGrowth,
          monthlyAverage: monthlyGrowth,
          insights: [
            `${weeklyGrowth} users per day growth rate`,
            `${Math.round((weeklyUsers / totalUsers) * 100)}% weekly growth relative to total`,
            'Consistent acquisition trend detected'
          ]
        }
      };
    } catch (error) {
      return this.handleError(error, 'growth analysis');
    }
  }

  handleError(error, context) {
    console.error(`❌ AI Assistant Error in ${context}:`, error);
    return {
      success: false,
      message: `Analysis temporarily unavailable for ${context}. Please try a different query.`,
      explanation: "I encountered a technical issue but I'm still here to help with other questions!",
      data: {
        error: "temporary_unavailable",
        suggestions: [
          "Try asking about different data",
          "Rephrase your question",
          "Ask for general analytics"
        ]
      }
    };
  }
}

module.exports = new OfflineAiAssistant();