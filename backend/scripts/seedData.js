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

// Generate realistic user data
const generateUsers = async (count = 500) => {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Chris', 'Amanda', 'James', 'Lisa', 'Robert', 'Ashley', 'William', 'Jessica', 'Daniel', 'Michelle', 'Matthew', 'Nicole', 'Andrew', 'Stephanie', 'Joshua', 'Jennifer', 'Brian', 'Elizabeth', 'Kevin', 'Lauren', 'Mark', 'Rachel', 'Steven', 'Melissa'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'company.com', 'email.com'];
  const countries = ['US', 'CA', 'UK', 'DE', 'FR', 'JP', 'AU', 'BR', 'IN', 'MX'];
  
  const users = [];
  
  // Always include admin user
  users.push({
    email: 'admin@company.com',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    profile: {
      firstName: 'System',
      lastName: 'Administrator'
    },
    isActive: true,
    lastLogin: new Date(),
    loginCount: Math.floor(Math.random() * 200) + 50,
    metadata: {
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      country: 'US'
    }
  });

  // Generate additional admins
  for (let i = 0; i < 5; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    // Create shorter username to stay within 20 char limit
    const username = `${firstName.substring(0, 6).toLowerCase()}${i + 1}_admin`;
    
    users.push({
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
      username,
      password: 'admin123',
      role: Math.random() > 0.5 ? 'admin' : 'moderator',
      profile: { firstName, lastName },
      isActive: true,
      lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      loginCount: Math.floor(Math.random() * 150) + 25,
      metadata: {
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        country: countries[Math.floor(Math.random() * countries.length)]
      }
    });
  }

  // Generate regular users
  for (let i = 0; i < count - 6; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    // Create shorter username to stay within 20 char limit
    const randomNum = Math.floor(Math.random() * 999) + 1;
    const username = `${firstName.substring(0, 6).toLowerCase()}${randomNum}`;
    
    // Generate realistic registration date (last 2 years)
    const registrationDate = new Date(Date.now() - Math.random() * 2 * 365 * 24 * 60 * 60 * 1000);
    
    // Generate realistic last login (more recent for active users)
    const daysSinceRegistration = (Date.now() - registrationDate.getTime()) / (24 * 60 * 60 * 1000);
    const maxDaysSinceLogin = Math.min(daysSinceRegistration, Math.random() * 30);
    const lastLogin = new Date(Date.now() - maxDaysSinceLogin * 24 * 60 * 60 * 1000);
    
    users.push({
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}@${domain}`,
      username,
      password: 'user123',
      role: 'user',
      profile: {
        firstName,
        lastName,
        phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        dateOfBirth: new Date(1970 + Math.random() * 30, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
      },
      isActive: Math.random() > 0.05, // 95% active users
      lastLogin,
      loginCount: Math.floor(Math.random() * 100) + 1,
      preferences: {
        theme: Math.random() > 0.3 ? 'light' : 'dark',
        notifications: Math.random() > 0.2,
        language: Math.random() > 0.1 ? 'en' : ['es', 'fr', 'de'][Math.floor(Math.random() * 3)]
      },
      metadata: {
        ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: [
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
          'Mozilla/5.0 (Android 11; Mobile; rv:89.0) Gecko/89.0 Firefox/89.0'
        ][Math.floor(Math.random() * 4)],
        country: countries[Math.floor(Math.random() * countries.length)]
      },
      createdAt: registrationDate,
      updatedAt: lastLogin
    });
  }

  const createdUsers = await User.create(users);
  console.log(`✅ ${createdUsers.length} users created`);
  return createdUsers;
};

// Generate comprehensive product data
const generateProducts = async (count = 1000) => {
  const products = [];
  
  const categories = {
    Electronics: {
      subcategories: ['Smartphones', 'Laptops', 'Tablets', 'TVs', 'Audio', 'Gaming', 'Cameras', 'Accessories'],
      priceRange: [50, 3000],
      brands: ['Apple', 'Samsung', 'Sony', 'LG', 'Microsoft', 'Google', 'Dell', 'HP']
    },
    Fashion: {
      subcategories: ['Clothing', 'Shoes', 'Accessories', 'Jewelry', 'Bags', 'Watches'],
      priceRange: [15, 500],
      brands: ['Nike', 'Adidas', 'Zara', 'H&M', 'Gucci', 'Prada', 'Levi\'s', 'Calvin Klein']
    },
    Home: {
      subcategories: ['Furniture', 'Kitchen', 'Decor', 'Garden', 'Tools', 'Lighting'],
      priceRange: [10, 2000],
      brands: ['IKEA', 'West Elm', 'KitchenAid', 'Dyson', 'Black & Decker', 'Phillips']
    },
    Sports: {
      subcategories: ['Fitness', 'Outdoor', 'Team Sports', 'Water Sports', 'Winter Sports'],
      priceRange: [20, 1000],
      brands: ['Nike', 'Adidas', 'Under Armour', 'Reebok', 'Puma', 'New Balance']
    },
    Books: {
      subcategories: ['Fiction', 'Non-Fiction', 'Educational', 'Children', 'Comics', 'Self-Help'],
      priceRange: [5, 100],
      brands: ['Penguin', 'Random House', 'HarperCollins', 'Simon & Schuster']
    },
    Other: {
      subcategories: ['Health', 'Beauty', 'Automotive', 'Pet Supplies', 'Toys', 'Music'],
      priceRange: [10, 500],
      brands: ['Various', 'Generic', 'Brand A', 'Brand B']
    }
  };

  const productAdjectives = ['Premium', 'Professional', 'Essential', 'Ultimate', 'Advanced', 'Smart', 'Wireless', 'Portable', 'Deluxe', 'Classic'];
  const productNouns = ['Pro', 'Max', 'Plus', 'Elite', 'Series', 'Edition', 'Collection', 'Set', 'Kit', 'Bundle'];

  for (let i = 0; i < count; i++) {
    const categoryName = Object.keys(categories)[Math.floor(Math.random() * Object.keys(categories).length)];
    const category = categories[categoryName];
    const subcategory = category.subcategories[Math.floor(Math.random() * category.subcategories.length)];
    const brand = category.brands[Math.floor(Math.random() * category.brands.length)];
    const adjective = productAdjectives[Math.floor(Math.random() * productAdjectives.length)];
    const noun = productNouns[Math.floor(Math.random() * productNouns.length)];
    
    const name = `${brand} ${adjective} ${subcategory} ${noun}`;
    const basePrice = category.priceRange[0] + Math.random() * (category.priceRange[1] - category.priceRange[0]);
    const price = Math.round(basePrice * 100) / 100;
    
    // Realistic view and purchase patterns
    const popularity = Math.random();
    const viewCount = Math.floor(popularity * 5000) + Math.floor(Math.random() * 100);
    const conversionRate = 0.02 + Math.random() * 0.08; // 2-10% conversion rate
    const purchaseCount = Math.floor(viewCount * conversionRate);
    
    // Generate creation date (last 2 years)
    const createdAt = new Date(Date.now() - Math.random() * 2 * 365 * 24 * 60 * 60 * 1000);
    
    products.push({
      name,
      description: `High-quality ${subcategory.toLowerCase()} from ${brand}. Perfect for ${categoryName.toLowerCase()} enthusiasts. Features advanced technology and premium materials.`,
      category: categoryName,
      price,
      images: [
        {
          url: `https://picsum.photos/400/400?random=${i}`,
          alt: `${name} main image`
        },
        {
          url: `https://picsum.photos/400/400?random=${i + 1000}`,
          alt: `${name} detail image`
        }
      ],
      stock: Math.floor(Math.random() * 1000) + 10,
      viewCount,
      purchaseCount,
      rating: {
        average: Math.round((3.5 + Math.random() * 1.5) * 10) / 10, // 3.5-5.0 rating
        count: Math.floor(purchaseCount * (0.3 + Math.random() * 0.4)) // 30-70% of purchasers rate
      },
      tags: [
        subcategory.toLowerCase(),
        brand.toLowerCase(),
        categoryName.toLowerCase(),
        adjective.toLowerCase()
      ],
      isActive: Math.random() > 0.05, // 95% active products
      vendor: {
        name: `${brand} Official Store`,
        email: `sales@${brand.toLowerCase().replace(/\s+/g, '')}.com`
      },
      createdAt,
      updatedAt: new Date(createdAt.getTime() + Math.random() * (Date.now() - createdAt.getTime()))
    });
  }

  const createdProducts = await Product.create(products);
  console.log(`✅ ${createdProducts.length} products created`);
  return createdProducts;
};

// Generate extensive activity logs
const generateActivityLogs = async (users, products, count = 50000) => {
  const activities = [];
  const actions = [
    { name: 'login', weight: 20 },
    { name: 'logout', weight: 18 },
    { name: 'view_product', weight: 30 },
    { name: 'search', weight: 15 },
    { name: 'add_to_cart', weight: 8 },
    { name: 'purchase', weight: 3 },
    { name: 'profile_update', weight: 2 },
    { name: 'password_change', weight: 1 },
    { name: 'admin_action', weight: 3 }
  ];
  
  // Create weighted action array
  const weightedActions = [];
  actions.forEach(action => {
    for (let i = 0; i < action.weight; i++) {
      weightedActions.push(action.name);
    }
  });

  const searchTerms = ['phone', 'laptop', 'shoes', 'dress', 'watch', 'headphones', 'camera', 'furniture', 'book', 'game'];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Android 11; Mobile; rv:89.0) Gecko/89.0 Firefox/89.0'
  ];

  // Generate activities for last 90 days with realistic patterns
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const action = weightedActions[Math.floor(Math.random() * weightedActions.length)];
    
    // Generate timestamp with realistic patterns (more activity during business hours)
    const dayOffset = Math.random() * 90;
    const baseTimestamp = new Date(ninetyDaysAgo.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    
    // Add time of day bias (more activity during 9-21 hours)
    const hour = Math.floor(Math.random() * 24);
    const biasedHour = hour < 9 || hour > 21 ? 9 + Math.floor(Math.random() * 12) : hour;
    const timestamp = new Date(baseTimestamp);
    timestamp.setHours(biasedHour, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));

    let resource = null;
    let resourceType = 'system';
    let details = {};

    switch (action) {
      case 'view_product':
      case 'add_to_cart':
      case 'purchase':
        const product = products[Math.floor(Math.random() * products.length)];
        resource = product._id.toString();
        resourceType = 'product';
        details = {
          productName: product.name,
          category: product.category,
          price: product.price
        };
        break;
        
      case 'search':
        resource = searchTerms[Math.floor(Math.random() * searchTerms.length)];
        resourceType = 'search';
        details = {
          resultsCount: Math.floor(Math.random() * 100) + 1,
          searchTerm: resource
        };
        break;
        
      case 'admin_action':
        if (user.role === 'admin' || user.role === 'moderator') {
          const adminActions = ['user_management', 'product_approval', 'content_moderation', 'report_generation'];
          details = {
            adminAction: adminActions[Math.floor(Math.random() * adminActions.length)]
          };
        } else {
          continue; // Skip admin actions for regular users
        }
        break;
        
      case 'profile_update':
        details = {
          fieldsUpdated: ['profile.firstName', 'profile.lastName', 'preferences.theme'][Math.floor(Math.random() * 3)]
        };
        break;
    }

    // Generate session ID (users have multiple sessions)
    const sessionNumber = Math.floor(timestamp.getTime() / (4 * 60 * 60 * 1000)); // New session every 4 hours
    const sessionId = `session_${user._id}_${sessionNumber}`;

    activities.push({
      userId: user._id,
      action,
      resource,
      resourceType,
      details,
      sessionId,
      ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
      timestamp,
      success: Math.random() > 0.02 // 98% success rate
    });
  }

  // Sort activities by timestamp for better database performance
  activities.sort((a, b) => a.timestamp - b.timestamp);

  // Insert in batches to avoid memory issues
  const batchSize = 1000;
  let inserted = 0;
  
  for (let i = 0; i < activities.length; i += batchSize) {
    const batch = activities.slice(i, i + batchSize);
    await ActivityLog.insertMany(batch);
    inserted += batch.length;
    console.log(`📊 Inserted ${inserted}/${activities.length} activity logs`);
  }

  console.log(`✅ ${activities.length} activity logs created`);
  return activities;
};

const seedData = async () => {
  try {
    console.log('🌱 Starting comprehensive data seeding...');
    console.log('⚠️  This will take several minutes due to the large dataset');
    
    await connectDB();
    console.log('🗑️  Clearing existing data...');
    await clearData();
    
    console.log('👥 Creating users (this may take a moment)...');
    const users = await generateUsers(500);
    
    console.log('📦 Creating products (this may take a moment)...');
    const products = await generateProducts(1000);
    
    console.log('📊 Creating activity logs (this will take several minutes)...');
    await generateActivityLogs(users, products, 50000);
    
    console.log('\n✅ COMPREHENSIVE DATA SEEDING COMPLETED SUCCESSFULLY!');
    console.log('\n📊 Database Statistics:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`📦 Products: ${products.length}`);
    console.log(`📋 Activity Logs: 50,000`);
    console.log('\n🔐 Login Credentials:');
    console.log('Admin: admin@company.com / admin123');
    console.log('Test Users: Check database for generated usernames / user123');
    console.log('Examples: john1, sarah23, mike456 (all use password: user123)');
    console.log('\n🎯 Your admin dashboard now has realistic data for testing!');
    
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