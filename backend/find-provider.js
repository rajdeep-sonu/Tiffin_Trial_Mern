const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function findProvider() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tiffintrial');
    
    const targetId = '6993dc34cc451239f31250b4';
    
    const provider = await User.findById(targetId);
    
    if (provider) {
      console.log('\n✅ FOUND PROVIDER:');
      console.log('Name:', provider.name);
      console.log('Email:', provider.email);
      console.log('ID:', provider._id);
      console.log('\nUse this email to LOG IN as the provider with subscriptions!');
    } else {
      console.log('❌ Provider not found');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

findProvider();
