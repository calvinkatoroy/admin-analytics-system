const Redis = require('ioredis');

class RedisService {
  constructor() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    this.client.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis');
    });
  }

  // Cache dashboard stats
  async cacheDashboardStats(stats) {
    const key = 'dashboard:stats';
    await this.client.setex(key, 300, JSON.stringify(stats)); // 5 minutes cache
  }

  async getCachedDashboardStats() {
    try {
      const cached = await this.client.get('dashboard:stats');
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached stats:', error);
      return null;
    }
  }

  // Online users tracking
  async setUserOnline(userId, sessionId) {
    const key = `user:online:${userId}`;
    await this.client.setex(key, 300, sessionId); // 5 minutes timeout
    await this.client.sadd('users:online', userId);
  }

  async setUserOffline(userId) {
    await this.client.del(`user:online:${userId}`);
    await this.client.srem('users:online', userId);
  }

  async getOnlineUsersCount() {
    try {
      return await this.client.scard('users:online');
    } catch (error) {
      console.error('Error getting online users count:', error);
      return 0;
    }
  }

  // Recent activities cache
  async addRecentActivity(activity) {
    const key = 'activities:recent';
    await this.client.lpush(key, JSON.stringify(activity));
    await this.client.ltrim(key, 0, 99); // Keep last 100 activities
    await this.client.expire(key, 3600); // 1 hour expiry
  }

  async getRecentActivities(limit = 10) {
    try {
      const activities = await this.client.lrange('activities:recent', 0, limit - 1);
      return activities.map(activity => JSON.parse(activity));
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return [];
    }
  }

  async ping() {
    return await this.client.ping();
  }
}

module.exports = new RedisService();