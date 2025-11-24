require('dotenv').config();
const mongoose = require('mongoose');

const Product = require('./models/Product');
const Blog = require('./models/Blog');
const State = require('./models/State');

const products = require('./seed-products.json'); // create this file from your productdata.js
const blogs = require('./seed-blogs.json');
const states = require('./seed-states.json');

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected, seeding...');

    // Optionally: clear existing collections (be careful)
    // await Product.deleteMany({});
    // await Blog.deleteMany({});
    // await State.deleteMany({});

    if (products && products.length) {
      await Product.insertMany(products);
      console.log('Products seeded');
    }
    if (blogs && blogs.length) {
      await Blog.insertMany(blogs);
      console.log('Blogs seeded');
    }
    if (states && states.length) {
      await State.insertMany(states);
      console.log('States seeded');
    }

    mongoose.disconnect();
    console.log('Seeding complete, disconnected.');
  })
  .catch(err => {
    console.error(err);
  });
