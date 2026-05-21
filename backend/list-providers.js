const mongoose = require('mongoose');
const User = require('./models/User');
const ProviderProfile = require('./models/ProviderProfile');
require('dotenv').config();

async function listAllProviders() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tiffintrial';
    await mongoose.connect(MONGO_URI);
    
    console.log('\n📋 ALL PROVIDERS IN SYSTEM:\n');
    
    const providers = await User.find({ role: 'provider' }).select('_id name email');
    
    for (let provider of providers) {
      const profile = await ProviderProfile.findOne({ userId: provider._id });
      console.log(`📍 ${profile?.kitchenName || 'No kitchen name'}`);
      console.log(`   Email: ${provider.email}`);
      console.log(`   Password: provider123`);
      console.log(`   ID: ${provider._id}\n`);
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    mongoose.connection.close();
  }
}

listAllProviders();
