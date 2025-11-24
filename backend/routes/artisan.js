const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Product = require("../models/Product");
const Order = require("../models/Order");

// 🔹 Ensure uploads folder exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 🔹 Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, name);
  },
});

// 🔹 File filter (accept images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// ========================================
// ✅ GET Artisan Products
// ========================================
router.get("/products", async (req, res) => {
  try {
    const artisanId = req.user?.id || req.query.artisanId;
    const products = await Product.find(
      artisanId ? { artisan: artisanId } : {}
    ).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("Fetch products error:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});


router.post("/products", upload.single("image"), async (req, res) => {
  try {
    const artisanId = req.user?.id || req.body.artisan;

    const imagePath = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.image || "";

    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      image: imagePath,
      artisan: artisanId,
    });

    await newProduct.save();
    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ message: "Failed to create product" });
  }
});

// ========================================
// ✅ PUT Update Product
// ========================================
router.put("/products/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// ========================================
// ✅ DELETE Product
// ========================================
router.delete("/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

// ========================================
// ✅ GET Artisan Orders
// ========================================
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(50);
    res.json(orders);
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// ========================================
// ✅ GET Artisan Summary
// ========================================
router.get("/summary", async (req, res) => {
  try {
    const productsCount = await Product.countDocuments();
    const ordersCount = await Order.countDocuments();
    res.json({ productsCount, ordersCount });
  } catch (err) {
    console.error("Summary error:", err);
    res.status(500).json({ message: "Failed to load summary" });
  }
});

module.exports = router;
