// backend/models/Order.js
const mongoose = require("mongoose");

const TrackingSchema = new mongoose.Schema({
  label: String,
  time: String, // or Date if you prefer
});

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true }, // e.g. ORD-1234
  email: { type: String, required: true },
  statusIndex: { type: Number, default: 0 }, // 0..4 etc
  placedAt: { type: Date, default: Date.now },
  items: [
    {
      productId: String,
      title: String,
      qty: Number,
      price: Number,
    },
  ],
  tracking: [TrackingSchema], // array of {label, time}
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
