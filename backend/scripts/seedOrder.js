// backend/scripts/seedOrder.js
const mongoose = require("mongoose");
const Order = require("../models/Order");
require("dotenv").config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  await Order.create({
    orderId: "ORD-6912F31F",
    email: "demo@example.com",
    statusIndex: 2,
    items: [
      { productId: "P1", title: "Canvas Print", qty: 1, price: 921 },
      { productId: "P2", title: "Frame Art", qty: 1, price: 1513 }
    ],
    tracking: [
      { label: "Order Placed", time: "2025-11-01 10:20" },
      { label: "Processing", time: "2025-11-02 08:30" },
      { label: "Shipped", time: "2025-11-10 14:01" }
    ]
  });

  console.log("✅ Test order inserted");
  await mongoose.disconnect();
}
seed();
