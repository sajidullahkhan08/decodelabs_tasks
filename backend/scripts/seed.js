require('dotenv').config();
const faker = require('faker');
const { connectDB } = require('../projects/project2-database/config/db');
const User = require('../projects/project2-database/models/User');

/**
 * Project 2: Seed the database with 10-20 test users for development.
 */
const seed = async () => {
  try {
    await connectDB();

    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      console.log(`[Project 2] Database already has ${existingCount} users. Skipping seed.`);
      console.log('Run with FORCE_SEED=true to re-seed.');
      if (process.env.FORCE_SEED !== 'true') {
        process.exit(0);
      }
      await User.deleteMany({});
      console.log('[Project 2] Existing users cleared.');
    }

    const userCount = faker.datatype.number({ min: 10, max: 20 });
    const users = [];

    users.push({
      name: 'Admin User',
      email: 'admin@decodelabs.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
    });

    for (let i = 0; i < userCount; i++) {
      users.push({
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password1',
        role: 'user',
        isVerified: faker.datatype.boolean(),
      });
    }

    await User.insertMany(users);

    console.log(`[Project 2] Seeded ${users.length} users successfully.`);
    console.log('Admin credentials: admin@decodelabs.com / admin123');
    process.exit(0);
  } catch (error) {
    console.error('[Project 2] Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
