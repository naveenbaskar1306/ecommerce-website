// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const asyncHandler = require('express-async-handler');
const path = require('path');

const app = express();

// -------------------- Middleware --------------------
app.use(express.json());
app.use(cookieParser());

// CORS: allow your frontend origin (default http://localhost:3000)
const allowedOrigins = [
  'http://localhost:3000',
  'https://nichieecommerce.netlify.app'
];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
}));
// Preflight handler
app.options('*', cors());





// Serve uploaded files (images) from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -------------------- Routes (load carefully) --------------------
// We'll attempt to load multiple possible route files. Missing files won't crash the server.
let productsRouter, blogsRouter, statesRouter, authRouter, ordersRouter, adminRoutes, artisanRoutes, artisanAuthRoutes, contactRoutes;

try {
  adminRoutes = require('./routes/admin');
  console.log('routes/admin.js required successfully');
} catch (e) {
  console.warn('routes/admin.js not found or failed to load:', e.message);
}

// then later, when mounting routes, keep a clear check and log the result
if (adminRoutes && (typeof adminRoutes === 'function' || adminRoutes.stack || adminRoutes.router)) {
  console.log('Mounting admin routes at /api/admin');
  app.use('/api/admin', adminRoutes);
} else {
  console.warn('Admin routes not mounted (adminRoutes falsy or not a router).');
}

try { productsRouter = require('./routes/products'); } catch (e) { console.warn('routes/products.js not found or failed to load:', e.message); }
try { blogsRouter = require('./routes/blogs'); } catch (e) { console.warn('routes/blogs.js not found or failed to load:', e.message); }
try { statesRouter = require('./routes/states'); } catch (e) { console.warn('routes/states.js not found or failed to load:', e.message); }
try { authRouter = require('./routes/auth'); } catch (e) { console.warn('routes/auth.js not found or failed to load:', e.message); }
try { ordersRouter = require('./routes/orders'); } catch (e) { console.warn('routes/orders.js not found or failed to load:', e.message); }
try { adminRoutes = require('./routes/admin'); } catch (e) { console.warn('routes/admin.js not found or failed to load:', e.message); }
try { artisanRoutes = require('./routes/artisan'); } catch (e) { console.warn('routes/artisan.js not found or failed to load:', e.message); }
try { artisanAuthRoutes = require('./routes/artisanAuth'); } catch (e) { console.warn('routes/artisanAuth.js not found or failed to load:', e.message); }
try { contactRoutes = require('./routes/Contact'); } catch (e) { console.warn('routes/Contact.js not found or failed to load:', e.message); }
let usersRouter;
try {
  usersRouter = require('./routes/users');
} catch (e) {
  console.warn('routes/users.js not found or failed to load:', e.message);
}



// --- Mount routes ---
// Use a simple truthy check to avoid false negatives for valid routers
if (adminRoutes) {
  console.log('Mounting admin routes at /api/admin');
  app.use('/api/admin', adminRoutes);
} else {
  console.warn('Admin routes not mounted (routes/admin.js missing or failed to export router).');
}

if (artisanAuthRoutes) {
  console.log('Mounting artisan auth routes at /api/auth/artisan');
  app.use('/api/auth/artisan', artisanAuthRoutes);
}

if (artisanRoutes) {
  console.log('Mounting artisan routes at /api/artisan');
  app.use('/api/artisan', artisanRoutes);
}

if (productsRouter) {
  console.log('Mounting products routes at /api/products');
  app.use('/api/products', productsRouter);
}
if (blogsRouter) {
  console.log('Mounting blogs routes at /api/blogs');
  app.use('/api/blogs', blogsRouter);
}
if (statesRouter) {
  console.log('Mounting states routes at /api/states');
  app.use('/api/states', statesRouter);
}
if (authRouter) {
  console.log('Mounting auth routes at /api/auth');
  app.use('/api/auth', authRouter);
}
if (ordersRouter) {
  console.log('Mounting orders routes at /api/orders');
  app.use('/api/orders', ordersRouter);
}
if (contactRoutes) {
  console.log('Mounting contact routes at /api/contact');
  app.use('/api/contact', contactRoutes);
}
if (usersRouter) {
  console.log('Mounting users routes at /api/users');
  app.use('/api/users', usersRouter);
}

// Basic health check
app.get('/', (req, res) => res.send('API is running'));

// ---------- Example checkout endpoint (optional) ----------
let Order;
try { Order = require('./models/Order'); } catch (e) { console.warn('Order model not found at ./models/Order — checkout will return 500 until created.'); }

app.post('/api/checkout', asyncHandler(async (req, res) => {
  if (!Order) {
    return res.status(500).json({ message: 'Order model not found on server. Please add backend/models/Order.js' });
  }

  const {
    orderItems,
    shippingAddress = {},
    paymentMethod = 'manual',
    itemsPrice,
    shippingPrice = 0,
    taxPrice = 0,
    totalPrice,
    userId,
  } = req.body;

  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    return res.status(400).json({ message: 'orderItems is required and should be a non-empty array.' });
  }
  if (typeof totalPrice === 'undefined') {
    return res.status(400).json({ message: 'totalPrice is required.' });
  }

  const created = await Order.create({
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice: itemsPrice ?? orderItems.reduce((s, it) => s + ((it.price || 0) * (it.qty || 1)), 0),
    shippingPrice,
    taxPrice,
    totalPrice,
    user: userId || null,
    isPaid: false,
    isDelivered: false,
  });

  res.status(201).json({ message: 'Order created', order: created });
}));


// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

// -------------------- Start Mongo + Server --------------------
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in .env — please set your connection string as MONGODB_URI');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
