// routes/artisanAuth.js
const express = require('express');
const router = express.Router();
const artisanCtrl = require('../controllers/artisanAuthController');

// POST /api/auth/artisan/register
router.post('/register', artisanCtrl.registerArtisan);

// POST /api/auth/artisan/login
router.post('/login', artisanCtrl.loginArtisan);

module.exports = router;
