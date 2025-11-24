// backend/routes/admin.js
const express = require('express');
const router = express.Router();

// controllers
let adminAuthController;
let artisanController;
let summaryController;

// Load controllers safely
try {
  adminAuthController = require('../controllers/adminAuthController');
  console.log('Loaded adminAuthController');
} catch (e) {
  console.warn('Failed to load adminAuthController:', e.message);
}

try {
  artisanController = require('../controllers/adminArtisanController');
  console.log('Loaded adminArtisanController');
} catch (e) {
  console.warn('Failed to load adminArtisanController:', e.message);
}

try {
  summaryController = require('../controllers/adminSummaryController');
  console.log('Loaded adminSummaryController');
} catch (e) {
  console.warn('Failed to load adminSummaryController:', e.message);
}

// Load auth middleware
let protect = null;
let authorize = null;

try {
  const auth = require('../middleware/auth');
  protect = auth.protect;
  authorize = auth.authorize;
  console.log('Loaded admin auth middleware');
} catch (e) {
  console.warn('Auth middleware missing:', e.message);
}

// ---------------------- TEST ROUTE ----------------------
router.get('/ping', (req, res) => {
  res.json({ message: 'admin router loaded' });
});

// ---------------------- ADMIN LOGIN ----------------------
router.post('/login',
  adminAuthController?.loginAdmin
    ? adminAuthController.loginAdmin
    : (req, res) => res.status(500).json({ message: "loginAdmin missing" })
);

// ---------------------- SUMMARY (protected) ----------------------
router.get('/summary',
  protect ? protect : (req, res, next) => next(),
  authorize ? authorize('admin') : (req, res, next) => next(),
  summaryController?.getSummary
    ? summaryController.getSummary
    : (req, res) => res.status(500).json({ message: "getSummary missing" })
);

// ---------------------- GET ARTISANS (protected) ----------------------
router.get('/artisans',
  protect ? protect : (req, res, next) => next(),
  authorize ? authorize('admin') : (req, res, next) => next(),
  artisanController?.getArtisans
    ? artisanController.getArtisans
    : (req, res) => res.status(500).json({ message: "getArtisans missing" })
);

// ---------------------- APPROVE ARTISAN (protected) ----------------------
router.put('/artisan/:id/approve',
  protect ? protect : (req, res, next) => next(),
  authorize ? authorize('admin') : (req, res, next) => next(),
  artisanController?.approveArtisan
    ? artisanController.approveArtisan
    : (req, res) => res.status(500).json({ message: "approveArtisan not found" })
);

// ---------------------- DELETE ARTISAN (protected) ----------------------
router.delete('/artisan/:id/delete',
  protect ? protect : (req, res, next) => next(),
  authorize ? authorize('admin') : (req, res, next) => next(),
  artisanController?.deleteArtisan
    ? artisanController.deleteArtisan
    : (req, res) => res.status(500).json({ message: "deleteArtisan not found" })
);

// alias: allow DELETE /artisan/:id (frontend compatibility)
router.delete('/artisan/:id',
  protect ? protect : (req, res, next) => next(),
  authorize ? authorize('admin') : (req, res, next) => next(),
  artisanController?.deleteArtisan
    ? artisanController.deleteArtisan
    : (req, res) => res.status(500).json({ message: "deleteArtisan not found" })
);

module.exports = router;
