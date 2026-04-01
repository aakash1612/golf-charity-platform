require('dotenv').config();
const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');
  
  try {
    await mongoose.connection.db.collection('users').dropIndex('username_1');
    console.log('✅ Dropped username index successfully');
  } catch (err) {
    console.log('Index not found or already removed:', err.message);
  }

  process.exit(0);
}

fix();