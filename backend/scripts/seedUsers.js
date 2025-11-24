

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();

async function seedUsers() {
  try {
    // connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // clear existing demo users (optional)
    await User.deleteMany({
      email: { $in: ["admin@example.com", "artisan@example.com", "customer@example.com"] },
    });

    // hash passwords
    const hashedAdmin = await bcrypt.hash("admin123", 10);
    const hashedArtisan = await bcrypt.hash("artisan123", 10);
    const hashedCustomer = await bcrypt.hash("customer123", 10);

    // create users
    const users = [
      {
        name: "Admin User",
        email: "admin@example.com",
        password: hashedAdmin,
        role: "admin",
        isApproved: true,
      },
      {
        name: "Artisan Seller",
        email: "artisan@example.com",
        password: hashedArtisan,
        role: "artisan",
        isApproved: true,
      },
      {
        name: "Customer Buyer",
        email: "customer@example.com",
        password: hashedCustomer,
        role: "customer",
        isApproved: true,
      },
    ];

    await User.insertMany(users);
    console.log("✅ Users seeded successfully");

    console.log(`
🧍‍♂️ Demo Accounts:
-----------------------------------------
Admin    -> email: admin@example.com    | password: admin123
Artisan  -> email: artisan@example.com  | password: artisan123
Customer -> email: customer@example.com | password: customer123
-----------------------------------------
`);

    await mongoose.disconnect();
    console.log("🚀 MongoDB connection closed");
  } catch (err) {
    console.error("❌ Error seeding users:", err);
    process.exit(1);
  }
}

seedUsers();
