// scripts/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // adjust path if needed

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('Please set MONGODB_URI in .env');
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const email = 'admin@handmadehub.com';
  const password = 'AdminPass123!'; // change to a strong password
  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = 'admin';
    existing.isVerified = true;
    existing.isApproved = true;
    await existing.save();
    console.log('Updated existing user to admin:', email);
  } else {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: 'Site Admin',
      email,
      password: hashed,
      role: 'admin',
      isVerified: true,
      isApproved: true,
    });
    console.log('Created admin user:', email, 'password:', password);
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
