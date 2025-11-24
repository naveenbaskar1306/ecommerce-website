// backend/routes/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const path = require('path');

// require models/middlewares - adjust path if your structure differs
const User = require(path.join(__dirname, '..', 'models', 'User'));
const { protect } = require(path.join(__dirname, '..', 'middleware', 'auth'));

// Helper to remove sensitive fields and normalize mobile/phone
function sanitizeUserDoc(userDoc) {
  if (!userDoc) return null;
  const u = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete u.password;

  // normalize phone: allow stored field 'mobile' to be exposed as 'phone'
  if (!u.phone && u.mobile) {
    u.phone = u.mobile;
  }
  return u;
}

// GET /api/users/me
// Return current user (expects Authorization: Bearer <token>)
router.get('/me', protect, async (req, res) => {
  try {
    // protect middleware should set req.userId
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({ user: sanitizeUserDoc(user) });
  } catch (err) {
    console.error('GET /api/users/me error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/me
// Update profile fields: name, phone, address (you can extend)
// Body: { name?, phone?, address? }
router.put('/me', protect, async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phone, address } = req.body;

    const updates = {};
    if (typeof name !== 'undefined') updates.name = name;
    if (typeof phone !== 'undefined') {
      // persist as both phone and mobile optionally - depends on your User schema
      updates.phone = phone;
      updates.mobile = phone;
    }
    if (typeof address !== 'undefined') updates.address = address;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    const updated = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });

    return res.json({ message: 'Profile updated', user: sanitizeUserDoc(updated) });
  } catch (err) {
    console.error('PUT /api/users/me error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/change-password
// Body: { currentPassword | oldPassword, newPassword }
// Requires Authorization header (Bearer token)
router.post('/change-password', protect, async (req, res) => {
  try {
    const userId = req.userId;
    // accept either 'currentPassword' or 'oldPassword' from frontend
    const currentPassword = req.body.currentPassword || req.body.oldPassword || req.body.old_password;
    const newPassword = req.body.newPassword || req.body.new_password;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both currentPassword and newPassword are required' });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    user.password = hashed;
    await user.save();

    return res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('POST /api/users/change-password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
