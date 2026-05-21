const mongoose = require('mongoose');
const Subscription = require('./models/Subscription');
const User = require('./models/User');
const ProviderProfile = require('./models/ProviderProfile');
require('dotenv').config();

async function findSubscriptions() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tiffintrial';
    await mongoose.connect(MONGO_URI);
    
    console.log('\n🔍 SEARCHING FOR SUBSCRIPTIONS...\n');
    
    // Find subscription for student "abhay"
    const subs = await Subscription.find({ studentName: 'abhay' });
    
    if (subs.length === 0) {
      console.log('❌ No subscriptions found for student "abhay"');
    } else {
      for (let sub of subs) {
        console.log('✅ Found subscription:');
        console.log('   Student:', sub.studentName, '(' + sub.studentEmail + ')');
        console.log('   Provider ID:', sub.providerId);
        
        // Find the provider info
        const provider = await User.findById(sub.providerId);
        const profile = await ProviderProfile.findOne({ userId: sub.providerId });
        
        console.log('   Provider Email:', provider?.email);
        console.log('   Kitchen Name:', profile?.kitchenName);
        console.log('   Plan:', sub.plan);
        console.log('   Price:', sub.finalPrice);
        console.log('\n');
      }
    }
    
    // Also show ALL provider accounts named "kajal"
    console.log('📋 ALL "KAJAL" PROVIDER ACCOUNTS:\n');
    const kajals = await User.find({ role: 'provider', email: /kajal/i });
    for (let kajal of kajals) {
      const profile = await ProviderProfile.findOne({ userId: kajal._id });
      console.log(`📍 ${profile?.kitchenName || 'No kitchen'}`);
      console.log(`   Email: ${kajal.email}`);
      console.log(`   ID: ${kajal._id}\n`);
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    mongoose.connection.close();
  }
}

findSubscriptions();
