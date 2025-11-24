const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

exports.getSummary = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const productsCount = await Product.countDocuments();
    const ordersCount = await Order.countDocuments();

    return res.json({
      usersCount,
      productsCount,
      ordersCount,
    });
  } catch (err) {
    console.error("Summary error:", err);
    return res.status(500).json({ message: "Failed to load summary" });
  }
};
