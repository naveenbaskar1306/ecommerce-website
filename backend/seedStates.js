// backend/seedStates.js
require("dotenv").config();
const mongoose = require("mongoose");
const State = require("./models/State");
const seedData = require("./seed-states.json");

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ MONGODB_URI not set in .env");
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    // clear previous states
    await State.deleteMany({});
    console.log("🧹 Cleared existing states collection");

    // insert from JSON
    await State.insertMany(seedData);
    console.log(`🌍 Inserted ${seedData.length} states successfully`);

    mongoose.connection.close();
    console.log("✅ Seeding completed & connection closed");
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB:", err);
    process.exit(1);
  });
