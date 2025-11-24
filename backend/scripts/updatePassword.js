// backend/scripts/updatePassword.js
// Usage: node scripts/updatePassword.js user@example.com newPassword

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');  // <-- adjust path if needed

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error("❌ Usage: node scripts/updatePassword.js <email> <newPassword>");
    process.exit(1);
  }

  const emailRaw = args[0];
  const newPassword = args[1];

  const email = (emailRaw || '').trim().toLowerCase();

  const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error("❌ Please set MONGODB_URI in your backend/.env");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("🔍 Searching user:", email);

    const user = await User.findOne({ email });

    if (!user) {
      console.error("❌ User not found:", email);
      process.exit(1);
    }

    console.log("👤 User found:", user.name);

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    await user.save();

    console.log("✅ Password updated successfully!");
    console.log("👉 You can now login with:");
    console.log("   Email:", email);
    console.log("   Password:", newPassword);

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
