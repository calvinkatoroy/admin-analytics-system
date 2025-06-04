const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const clearData = async () => {
  try {
    await User.deleteMany({});
    await Product.deleteMany({});
    await ActivityLog.deleteMany({});
    console.log('Existing data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

const seedUsers = async () => {
  try {
    const users = [
      {
        email: 'admin@example.com',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        profile: {
          firstName: 'Admin',
          lastName: 'User'
        },
        isActive: true
      },
      {
        email: 'john.doe@example.com',
        username: 'john_doe',
        password: 'user123',
        role: 'user',
        profile: {
          firstName: 'John',
          lastName: 'Doe'
        },
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        loginCount: 15
      },
      {
        email: 'jane.smith@example.com',
        username: 'jane_smith',
        password: 'user123',
        role: 'user',
        profile: {
          firstName: 'Jane',
          lastName: 'Smith'
        },
        lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        loginCount: 8
      }
    ];

    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} users created`);
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    return [];
  }
};

const seedProducts = async () => {
  try {
    const products = [
      {
        name: 'iPhone 15 Pro',
        description: 'Latest Apple smartphone with advanced features',
        category: 'Electronics',
        price: 999.99,
        stock: 50,
        viewCount: 1250,
        purchaseCount: 45,
        rating: { average: 4.8, count: 120 },
        tags: ['smartphone', 'apple', 'premium']
      },
      {
        name: 'MacBook Pro 16"',
        description: 'Professional laptop for developers and creators',
        category: 'Electronics',
        price: 2499.99,
        stock: 25,
        viewCount: 890,
        purchaseCount: 12,
        rating: { average: 4.9, count: 85 },
        tags: ['laptop', 'apple', 'professional']
      },
      {
        name: 'Nike Air Max 270',
        description: 'Comfortable running shoes with modern design',
        category: 'Fashion',
        price: 129.99,
        stock: 100,
        viewCount: 2100,
        purchaseCount: 78,
        rating: { average: 4.5, count: 200 },
        tags: ['shoes', 'nike', 'running']
      },
      {
        name: 'Samsung 55" 4K TV',
        description: 'Ultra HD Smart TV with HDR support',
        category: 'Electronics',
        price: 699.99,
        stock: 30,
        viewCount: 756,
        purchaseCount: 23,
        rating: { average: 4.6, count: 95 },
        tags: ['tv', 'samsung', '4k']
      }
    ];

    const createdProducts = await Product.create(products);
    console.log(`${createdProducts.length} products created`);
    return createdProducts;
  } catch (error) {
    console.error('Error seeding products:', error);
    return [];
  }
};

const seedActivityLogs = async (users, products) => {
  try {
    const activities = [];
    const actions = ['login', 'view_product', 'search', 'logout'];
    
    // Generate activities for the last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    users.forEach(user => {
      // Generate 10-20 activities per user
      const activityCount = Math.floor(Math.random() * 10) + 10;
      
      for (let i = 0; i < activityCount; i++) {
        const action = actions[Math.floor(Math.random() * actions.length)];
        const timestamp = new Date(weekAgo.getTime() + Math.random() * (Date.now() - weekAgo.getTime()));
        
        let resource = null;
        let resourceType = 'system';
        
        if (action === 'view_product') {
          const product = products[Math.floor(Math.random() * products.length)];
          resource = product._id.toString();
          resourceType = 'product';
        } else if (action === 'search') {
          const searchTerms = ['iphone', 'laptop', 'shoes', 'tv'];
          resource = searchTerms[Math.floor(Math.random() * searchTerms.length)];
          resourceType = 'search';
        }
        
        activities.push({
          userId: user._id,
          action,
          resource,
          resourceType,
          sessionId: `session_${user._id}_${Math.floor(timestamp.getTime() / (60 * 60 * 1000))}`,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp,
          success: true
        });
      }
    });
    
    const createdActivities = await ActivityLog.create(activities);
    console.log(`${createdActivities.length} activity logs created`);
    return createdActivities;
  } catch (error) {
    console.error('Error seeding activity logs:', error);
    return [];
  }
};

const seedData = async () => {
  try {
    console.log('🌱 Starting data seeding...');
    
    await connectDB();
    await clearData();
    
    console.log('Creating users...');
    const users = await seedUsers();
    
    console.log('Creating products...');
    const products = await seedProducts();
    
    console.log('Creating activity logs...');
    await seedActivityLogs(users, products);
    
    console.log('✅ Data seeding completed successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('User: john.doe@example.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = { seedData };