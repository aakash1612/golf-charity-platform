/**
 * Run once to create the initial admin user:
 *   node scripts/seedAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: 'admin@golfgives.com' });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    process.exit(0);
  }

  const admin = await User.create({
    name: 'Platform Admin',
    email: 'admin@golfgives.com',
    password: 'Admin1234!',  // Change immediately after first login
    role: 'admin',
    subscription: { status: 'active', plan: 'yearly' },
  });

  console.log('✅ Admin created:');
  console.log('   Email:', admin.email);
  console.log('   Password: Admin1234!');
  console.log('   ⚠️  Change the password immediately after logging in!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });