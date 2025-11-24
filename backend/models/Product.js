// backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },    // frontend uses name or title
  title: { type: String },                   // optional alternative
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: String },
  image: { type: String },                   // stores '/uploads/filename.jpg' or full url
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  featured: { type: Boolean, default: false }, // NEW: for slider
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
