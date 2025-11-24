const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  id: String,
  slug: String,
  title: String,
  excerpt: String,
  author: String,
  date: String,
  cover: String,
  content: String
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
