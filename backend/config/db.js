const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || process.env.MONGODB_URI;

    // If the user hasn't configured a real database, use an in-memory database
    if (!uri || uri === 'your_mongodb_atlas_connection_string' || uri.includes('<db_username>') || uri.includes('<db_password>')) {
      console.log('⚠️ MongoDB Atlas credentials need to be configured in backend/.env. Using fallback database...');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ In-Memory Database Connected: ${conn.connection.host}`);
      const seedAdmin = require('../utils/seedAdmin');
      await seedAdmin();
      return;
    }

    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    } catch (atlasErr) {
      console.error(`⚠️ MongoDB Atlas Connection Warning: ${atlasErr.message}`);
      console.log('💡 TIP: If connecting to MongoDB Atlas, ensure your current IP address is whitelisted in Atlas (Network Access -> Add IP -> 0.0.0.0/0).');
      console.log('🔄 Starting fallback database so the server stays available...');
      const mongoServer = await MongoMemoryServer.create();
      const fallbackConn = await mongoose.connect(mongoServer.getUri());
      console.log(`✅ Fallback Database Connected: ${fallbackConn.connection.host}`);
    }

    // Automatically ensure system administrator exists from .env
    const seedAdmin = require('../utils/seedAdmin');
    await seedAdmin();
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
