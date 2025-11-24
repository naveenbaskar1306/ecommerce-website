// backend/routes/orders.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");


router.post("/", async (req, res) => {
  try {
    const {
      orderId,     // optional client-generated or server can generate
      email,
      items,       // array [{ productId, title, price, qty }]
      shipping,    // { name, phone, address, city, state, postalCode }
      paymentMethod,
      subtotal,
      shippingCost = 0,
      total
    } = req.body;

    // basic validation
    if (!email || !items || !items.length) return res.status(400).json({ message: "Missing required fields" });

    // If you want server to generate orderId:
    const genOrderId = orderId || `ORD-${Math.random().toString(36).slice(2,10).toUpperCase()}`;

    const newOrder = new Order({
      orderId: genOrderId,
      email,
      items,
      shipping,
      paymentMethod,
      subtotal,
      shippingCost,
      total,
      statusIndex: 0, // initial
      tracking: [{ label: "Order Placed", time: new Date().toISOString() }]
    });

    const saved = await newOrder.save();
    return res.status(201).json({ message: "Order created", id: saved._id, orderId: saved.orderId });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});



router.get("/lookup", async (req, res) => {
  try {
    const q = (req.query.query || "").trim();
    if (!q) return res.status(400).json({ message: "Missing query" });

    // simple heuristics: if starts with ORD- treat as orderId, else try email
    let order = null;
    if (/^ORD[-_A-Za-z0-9]+$/i.test(q)) {
      order = await Order.findOne({ orderId: new RegExp(`^${q}$`, "i") }).lean();
    }
    if (!order) {
      // try by email or orderId again (case-insensitive)
      order = await Order.findOne({ $or: [{ email: q.toLowerCase() }, { orderId: new RegExp(q, "i") }] }).lean();
    }

    if (!order) return res.status(404).json({ message: "Order not found" });

    // build response in the shape frontend expects:
    const response = {
      id: order.orderId,
      email: order.email,
      statusIndex: order.statusIndex || 0,
      placedAt: (order.placedAt || order.createdAt).toString(),
      // ensure tracking array exists; transform dates to strings if needed
      tracking: (order.tracking || []).map(t => ({
        label: t.label,
        time: (t.time && t.time.toString()) || ""
      })),
      
      items: order.items || [],
      subtotal: (order.items || []).reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0),
    };

    return res.json(response);
  } catch (err) {
    console.error("Lookup order error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
