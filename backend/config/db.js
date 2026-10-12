const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    // If the user hasn't configured a real database, use an in-memory test database!
    if (!uri || uri === 'your_mongodb_atlas_connection_string') {
      console.log('⚠️ No MongoDB URI provided. Starting an IN-MEMORY test database...');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Seed demo accounts if they don't exist
    const demoStudent = await User.findOne({ email: 'student@demo.com' });
    if (!demoStudent) {
      await User.create({ name: 'Demo Student', email: 'student@demo.com', password: 'demo123', role: 'student' });
      await User.create({ name: 'Demo Admin', email: 'admin@demo.com', password: 'admin123', role: 'admin' });
      console.log('🌱 Seeded demo accounts (student@demo.com, admin@demo.com)');
    }

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
