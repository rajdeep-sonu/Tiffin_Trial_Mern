import apiClient from '../api/client';

/**
 * Development-only data seeding utility
 * Creates sample providers, menus with images, and students for testing
 */

const tiffinProviders = [
  {
    register: {
      email: 'south_tiffin@mail.com',
      password: 'provider123',
      role: 'provider'
    },
    profile: {
      providerName: 'South Indian Tiffin',
      owner: 'Rajesh Kumar',
      city: 'Bangalore',
      phone: '9876543210',
      vegetarian: true,
      specialities: 'Dosa, Idli, Sambar',
      description: 'Authentic South Indian meals delivered fresh daily'
    },
    menus: [
      {
        breakfast: 'Idli & Chutney',
        lunch: 'Sambar Rice & Rasam',
        dinner: 'Dosa & Chutney'
      },
      {
        breakfast: 'Poha',
        lunch: 'Bisi Bele Bath',
        dinner: 'Uttapam'
      }
    ]
  },
  {
    register: {
      email: 'north_tiffin@mail.com',
      password: 'provider123',
      role: 'provider'
    },
    profile: {
      providerName: 'North Indian Kitchen',
      owner: 'Priya Singh',
      city: 'Bangalore',
      phone: '9876543211',
      vegetarian: true,
      specialities: 'Roti, Dal, Sabzi',
      description: 'Traditional North Indian home-cooked meals'
    },
    menus: [
      {
        breakfast: 'Paratha & Pickle',
        lunch: 'Dal Rice & Roti',
        dinner: 'Sabzi & Bread'
      }
    ]
  },
  {
    register: {
      email: 'mixed_tiffin@mail.com',
      password: 'provider123',
      role: 'provider'
    },
    profile: {
      providerName: 'Mixed Cuisine Tiffin',
      owner: 'Vikram Patel',
      city: 'Bangalore',
      phone: '9876543212',
      vegetarian: false,
      specialities: 'All cuisines',
      description: 'Mixed vegetarian and non-vegetarian menu'
    },
    menus: [
      {
        breakfast: 'Eggs & Toast',
        lunch: 'Chicken Curry & Rice',
        dinner: 'Mutton Biryani'
      }
    ]
  }
];

const studentAccounts = [
  { email: 'student1@mail.com', password: 'student123', role: 'student', name: 'Arjun Singh' },
  { email: 'student2@mail.com', password: 'student123', role: 'student', name: 'Priya Sharma' },
  { email: 'student3@mail.com', password: 'student123', role: 'student', name: 'Rohan Gupta' },
];

// Sample food images from Unsplash (public domain food images)
const foodImageUrls = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', // Biryani
  'https://images.unsplash.com/photo-1624871286500-f3ed019ef478?w=400&q=80', // Dal
  'https://images.unsplash.com/photo-1606787620884-fca900d9df4a?w=400&q=80', // Dosa
  'https://images.unsplash.com/photo-1585238341710-4913afd16bdf?w=400&q=80', // Curry
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', // Rice
];

// Fetch image and convert to Blob
async function fetchImageAsBlob(url) {
  try {
    const response = await fetch(url);
    return await response.blob();
  } catch (err) {
    console.warn('Failed to fetch image:', url);
    return null;
  }
}

// Register user
async function registerUser(email, password, role, name = null) {
  try {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      role
    });
    console.log(`✅ Registered ${role}: ${email}`);
    return response.data.user;
  } catch (err) {
    console.error(`❌ Failed to register ${email}:`, err.response?.data?.message);
    return null;
  }
}

// Create provider profile
async function createProviderProfile(profileData) {
  try {
    const response = await apiClient.post('/provider/profile', profileData);
    console.log(`✅ Created profile for: ${profileData.providerName}`);
    return response.data;
  } catch (err) {
    console.error(`❌ Failed to create profile:`, err.response?.data?.message);
    return null;
  }
}

// Create weekly menu with images
async function createWeeklyMenu(menuData, imageUrls = []) {
  try {
    const formData = new FormData();

    // Build menu object from menuData
    const menuObject = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    days.forEach(day => {
      menuObject[day] = {
        breakfast: menuData[day]?.breakfast || '',
        lunch: menuData[day]?.lunch || '',
        dinner: menuData[day]?.dinner || ''
      };
    });

    // Calculate week dates (Monday to Sunday of current week)
    const today = new Date();
    const firstDay = today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1);
    const weekStart = new Date(today.getFullYear(), today.getMonth(), firstDay);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Add JSON fields
    formData.append('weekStart', weekStart.toISOString());
    formData.append('weekEnd', weekEnd.toISOString());
    formData.append('menu', JSON.stringify(menuObject));

    // Add images
    for (let i = 0; i < imageUrls.length; i++) {
      const blob = await fetchImageAsBlob(imageUrls[i]);
      if (blob) {
        formData.append('images', blob, `food-${i}.jpg`);
      }
    }

    const response = await apiClient.post('/provider/menu', formData);

    console.log(`✅ Created weekly menu with ${imageUrls.length} images`);
    return response.data;
  } catch (err) {
    console.error(`❌ Failed to create menu:`, err.response?.data?.message || err.message);
    return null;
  }
}

// Main seeding function
export async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Seed Providers
    console.log('📝 Creating Provider Accounts...');
    for (const provider of tiffinProviders) {
      const user = await registerUser(
        provider.register.email,
        provider.register.password,
        provider.register.role
      );

      if (user) {
        // Wait a moment for user to be created
        await new Promise(r => setTimeout(r, 500));

        // Create profile
        await createProviderProfile(provider.profile);

        // Create menus with images
        const menus = provider.menus;
        for (let i = 0; i < menus.length; i++) {
          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const menuWithDays = {};
          menuWithDays[days[i * 2]] = menus[i];
          if (i * 2 + 1 < days.length) {
            menuWithDays[days[i * 2 + 1]] = menus[i];
          }

          const imageSubset = foodImageUrls.slice(i * 2, i * 2 + 2);
          await createWeeklyMenu(menuWithDays, imageSubset);
          await new Promise(r => setTimeout(r, 500));
        }
      }
    }

    console.log('\n📝 Creating Student Accounts...');
    // Seed Students
    for (const student of studentAccounts) {
      await registerUser(
        student.email,
        student.password,
        student.role,
        student.name
      );
      await new Promise(r => setTimeout(r, 300));
    }

    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('\nProviders:');
    tiffinProviders.forEach(p => {
      console.log(`  Email: ${p.register.email}, Password: ${p.register.password}`);
    });
    console.log('\nStudents:');
    studentAccounts.forEach(s => {
      console.log(`  Email: ${s.email}, Password: ${s.password}`);
    });

    return true;
  } catch (err) {
    console.error('❌ Database seeding failed:', err);
    return false;
  }
}

// Helper function to reset data (optional - be careful!)
export async function resetData() {
  console.log('⚠️  WARNING: This would reset the database. Implementation depends on backend API.');
  console.log('For now, manually delete users and menus from MongoDB.');
}

// Auto-run if explicitly called from browser console
if (typeof window !== 'undefined') {
  window.seedTiffinData = seedDatabase;
  window.resetTiffinData = resetData;
  console.log('💡 Seeding functions available in browser console:');
  console.log('   seedTiffinData() - Create sample data');
  console.log('   resetTiffinData() - Reset database (manual for now)');
}

export default seedDatabase;
