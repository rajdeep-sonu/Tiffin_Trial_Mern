const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tiffintryal';

async function cleanup() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = mongoose.connection.db;
    
    // Drop entire database to remove all old indexes
    console.log('🗑️  Dropping entire database...');
    await db.dropDatabase().catch(() => console.log('   Database not found (ok)'));
    
    console.log('✅ Database completely cleaned');
    console.log('✅ All old indexes removed');
    console.log('✅ Ready for fresh start!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanup();
