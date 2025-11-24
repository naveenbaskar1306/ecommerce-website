// backend/routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// ✅ GET /api/products  (supports ?featured=true and other filters)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.featured === 'true') filter.featured = true;
    if (req.query.category) filter.category = req.query.category;
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    res.json(products);
  } catch (err) {
    console.error('GET /api/products error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET /api/products/featured  (explicit endpoint)
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ featured: true })
      .sort({ createdAt: -1 })
      .lean();
    res.json(products);
  } catch (err) {
    console.error('GET /api/products/featured error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const p = await Product.findById(req.params.id).lean();
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (err) {
    console.error('GET /api/products/:id error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ PATCH /api/products/:id/feature
// Toggles or explicitly sets "featured" true/false
router.patch('/:id/feature', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // If featured passed explicitly in body, use that, else toggle
    let newValue;
    if (typeof req.body.featured !== 'undefined') {
      newValue =
        typeof req.body.featured === 'string'
          ? req.body.featured.toLowerCase() === 'true'
          : !!req.body.featured;
    } else {
      newValue = !product.featured;
    }

    product.featured = newValue;
    await product.save();

    res.json({
      success: true,
      message: `Product ${newValue ? 'featured' : 'unfeatured'} successfully`,
      product,
    });
  } catch (err) {
    console.error('PATCH /api/products/:id/feature error', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Optional: If product.image is a local file in /uploads, remove file as well
    try {
      if (product.image && typeof product.image === 'string' && product.image.startsWith('/uploads')) {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, '..', product.image); // __dirname = backend/routes
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (fsErr) {
      console.warn('Failed to delete product image file:', fsErr.message);
      // non-fatal; continue to delete DB record
    }

    await Product.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('DELETE /api/products/:id error', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});


module.exports = router;
