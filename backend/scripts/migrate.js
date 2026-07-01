require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');

/**
 * Ensure database indexes are synced (migration helper).
 */
const migrate = async () => {
  try {
    await connectDB();

    console.log('Syncing database indexes...');
    await User.syncIndexes();
    console.log('Indexes synced successfully.');

    const indexes = await User.collection.getIndexes();
    console.log('Current indexes:', Object.keys(indexes).join(', '));

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
};

migrate();
