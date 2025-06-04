const User = require('../models/User');
const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');
const redis = require('../services/redis');

exports.getDashboardStats = async (req, res) => {
  try {
    // Check cache first
    const cachedStats = await redis.getCachedDashboardStats();
    if (cachedStats) {
      return res.json(cachedStats);
    }

    const [
      totalUsers,
      activeUsers,
      totalProducts,
      recentActivities,
      onlineUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ 
        lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
      }),
      Product.countDocuments({ isActive: true }),
      ActivityLog.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .populate('userId', 'username email')
        .lean(),
      redis.getOnlineUsersCount()
    ]);

    // Get user registration trends (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const dailyRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get most active users
    const activeUserStats = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: "$userId",
          activityCount: { $sum: 1 }
        }
      },
      { $sort: { activityCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          activityCount: 1,
          username: "$user.username",
          email: "$user.email"
        }
      }
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      totalProducts,
      totalOrders: 0, // Will implement later
      totalRevenue: 0, // Will implement later
      onlineUsers,
      recentActivities,
      dailyRegistrations,
      activeUserStats,
      lastUpdated: new Date().toISOString()
    };

    // Cache the results
    await redis.cacheDashboardStats(stats);
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

exports.getProductAnalytics = async (req, res) => {
  try {
    // Get top products by view count
    const topProducts = await Product.find({ isActive: true })
      .sort({ viewCount: -1 })
      .limit(10)
      .select('name category price viewCount purchaseCount')
      .lean();

    // Get category breakdown
    const categoryStats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalViews: { $sum: "$viewCount" },
          totalPurchases: { $sum: "$purchaseCount" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      topProducts,
      categoryStats
    });
  } catch (error) {
    console.error('Error getting product analytics:', error);
    res.status(500).json({ error: 'Failed to fetch product analytics' });
  }
};