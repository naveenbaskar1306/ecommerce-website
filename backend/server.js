// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

/* -------------------- Config -------------------- */
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || '';
const FRONTEND_URL = (process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || '').trim();

/* -------------------- Middleware -------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* -------------------- Safe CORS middleware (no wildcard routes) -------------------- */
const allowedOrigins = [
  'http://localhost:3000',
  'https://nichieecommerce.netlify.app'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');

  // Immediately handle preflight without relying on app.options with a wildcard
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

/* -------------------- Static files -------------------- */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* -------------------- Try to load route modules if present -------------------- */
let productsRouter, blogsRouter, statesRouter, authRouter, ordersRouter, adminRoutes, artisanRoutes, artisanAuthRoutes, contactRoutes, usersRouter;

try { adminRoutes = require('./routes/admin'); } catch (e) { /* skip if missing */ }
try { productsRouter = require('./routes/products'); } catch (e) { /* skip if missing */ }
try { blogsRouter = require('./routes/blogs'); } catch (e) { /* skip if missing */ }
try { statesRouter = require('./routes/states'); } catch (e) { /* skip if missing */ }
try { authRouter = require('./routes/auth'); } catch (e) { /* skip if missing */ }
try { ordersRouter = require('./routes/orders'); } catch (e) { /* skip if missing */ }
try { artisanRoutes = require('./routes/artisan'); } catch (e) { /* skip if missing */ }
try { artisanAuthRoutes = require('./routes/artisanAuth'); } catch (e) { /* skip if missing */ }
try { contactRoutes = require('./routes/Contact'); } catch (e) { /* skip if missing */ }
try { usersRouter = require('./routes/users'); } catch (e) { /* skip if missing */ }

/* -------------------- Mount routers if present -------------------- */
if (adminRoutes) { app.use('/api/admin', adminRoutes); console.log('Mounted /api/admin'); }
if (artisanAuthRoutes) { app.use('/api/auth/artisan', artisanAuthRoutes); console.log('Mounted /api/auth/artisan'); }
if (artisanRoutes) { app.use('/api/artisan', artisanRoutes); console.log('Mounted /api/artisan'); }
if (productsRouter) { app.use('/api/products', productsRouter); console.log('Mounted /api/products'); }
if (blogsRouter) { app.use('/api/blogs', blogsRouter); console.log('Mounted /api/blogs'); }
if (statesRouter) { app.use('/api/states', statesRouter); console.log('Mounted /api/states'); }
if (authRouter) { app.use('/api/auth', authRouter); console.log('Mounted /api/auth'); }
if (ordersRouter) { app.use('/api/orders', ordersRouter); console.log('Mounted /api/orders'); }
if (contactRoutes) { app.use('/api/contact', contactRoutes); console.log('Mounted /api/contact'); }
if (usersRouter) { app.use('/api/users', usersRouter); console.log('Mounted /api/users'); }

/* If there's an index router at ./routes/index.js try to mount it under /api */
try {
  const indexRouter = require('./routes');
  if (indexRouter) {
    app.use('/api', indexRouter);
    console.log('Mounted /api (index router)');
  }
} catch (e) {
  // fine if not present
}

/* -------------------- Health & fallback endpoints -------------------- */
app.get('/', (req, res) => res.send('API is running'));

/* -------------------- API 404 handler (avoid wildcard route strings) -------------------- */
// Instead of app.use('/api/*', ...) which can crash with some path-to-regexp versions,
// check the path prefix manually and return a JSON 404 for any unmatched /api/ request.
app.use((req, res, next) => {
  if (req.path && req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  next();
});

/* Generic 404 for other routes */
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

/* Error handler */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && (err.stack || err.message || err));
  res.status(err && err.status ? err.status : 500).json({
    message: err && err.message ? err.message : 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err && err.stack
  });
});

/* -------------------- Start server (connect DB if provided) -------------------- */
function startServer() {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log('FRONTEND_URL =', FRONTEND_URL || 'not set');
  });
}

if (!MONGODB_URI) {
  console.warn('MONGODB_URI not set — starting server without DB (useful for debugging).');
  startServer();
} else {
  mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('MongoDB connected');
      startServer();
    })
    .catch((err) => {
      console.error('MongoDB connection failed — starting server anyway:', err && err.message ? err.message : err);
      startServer();
    });
}

module.exports = app;
