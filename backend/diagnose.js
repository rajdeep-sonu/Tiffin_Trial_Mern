const mongoose = require('mongoose');
const Subscription = require('./models/Subscription');
const User = require('./models/User');
const ProviderProfile = require('./models/ProviderProfile');
require('dotenv').config();

async function diagnose() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tiffintrial';
    await mongoose.connect(MONGO_URI);
    
    console.log('\n🔍 DIAGNOSTIC REPORT:\n');
    
    // Find subscription for student "abhay"
    const subs = await Subscription.find({ studentName: 'abhay' });
    
    if (subs.length > 0) {
      const sub = subs[0];
      console.log('✅ SUBSCRIPTION FOUND FOR ABHAY:');
      console.log('   Subscription Provider ID:', sub.providerId.toString());
      
      const provider = await User.findById(sub.providerId);
      const profile = await ProviderProfile.findOne({ userId: sub.providerId });
      
      console.log('   That Provider Email:', provider?.email);
      console.log('   Kitchen Name:', profile?.kitchenName);
      console.log('\n');
    } else {
      console.log('❌ No subscription found for abhay\n');
    }
    
    // Find ALL providers named "kajal"
    console.log('📋 ALL KAJAL PROVIDERS:\n');
    const allUsers = await User.find({ role: 'provider' });
    
    for (let user of allUsers) {
      const profile = await ProviderProfile.findOne({ userId: user._id });
      const kitchen = profile?.kitchenName || 'No kitchen set';
      
      if (kitchen.toLowerCase().includes('kajal')) {
        console.log(`📍 ${kitchen}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   ID: ${user._id.toString()}`);
        console.log(`   Password for login: provider123\n`);
      }
    }
    
    console.log('⚠️  SOLUTION:');
    console.log('1. Find which "kajal" provider has the subscription (first section)');
    console.log('2. Login THAT email/password');
    console.log('3. Go to subscriptions and you should see abhay!');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    mongoose.connection.close();
  }
}

diagnose();
