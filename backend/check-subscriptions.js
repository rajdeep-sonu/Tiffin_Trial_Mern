const mongoose = require('mongoose');

const Subscription = require('./models/Subscription');
const ProviderProfile = require('./models/ProviderProfile');
const User = require('./models/User');

async function findSubscriptionProvider() {
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/tiffintrial');
    console.log('Connected to database...\n');

    // Find the most recent subscription
    const latestSubs = await Subscription.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    if (latestSubs.length === 0) {
      console.log('❌ No subscriptions found in database');
      process.exit(0);
    }

    console.log('='.repeat(70));
    console.log('📊 LATEST SUBSCRIPTIONS IN DATABASE');
    console.log('='.repeat(70) + '\n');

    for (let i = 0; i < latestSubs.length; i++) {
      const sub = latestSubs[i];
      console.log(`[${i + 1}] Subscription ID: ${sub._id}`);
      console.log(`    Student: ${sub.studentName} (${sub.studentEmail})`);
      console.log(`    Kitchen: ${sub.kitchenName}`);
      console.log(`    Plan: ${sub.plan} - ₹${sub.price}`);
      console.log(`    Provider ID: ${sub.providerId}`);
      
      // Find the provider account details
      const providerUser = await User.findById(sub.providerId).lean();
      if (providerUser) {
        console.log(`    Provider Name: ${providerUser.name}`);
        console.log(`    Provider Email: ${providerUser.email}`);
        console.log(`    Provider Role: ${providerUser.role}`);
      } else {
        console.log(`    ⚠️ Provider user not found!`);
      }
      
      console.log();
    }

    console.log('='.repeat(70));
    console.log('👤 ALL PROVIDER ACCOUNTS');
    console.log('='.repeat(70) + '\n');

    const allProviders = await User.find({ role: 'provider' }).lean();
    console.log(`Total provider accounts: ${allProviders.length}\n`);

    for (const provider of allProviders) {
      console.log(`ID: ${provider._id}`);
      console.log(`Name: ${provider.name}`);
      console.log(`Email: ${provider.email}`);
      
      // Count subscriptions for this provider
      const subCount = await Subscription.countDocuments({ providerId: provider._id });
      console.log(`Subscriptions: ${subCount}`);
      console.log();
    }

    console.log('='.repeat(70));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

findSubscriptionProvider();
