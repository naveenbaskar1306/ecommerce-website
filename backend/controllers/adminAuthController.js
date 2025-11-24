// backend/controllers/adminAuthController.js
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let User;
try {
  User = require(path.join(__dirname, '..', 'models', 'User'));
  console.log('adminAuthController: loaded User model');
} catch (e) {
  console.error('adminAuthController: failed to load User model', e && e.message ? e.message : e);
}

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_for_prod';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';
const ADMIN_ROLES = new Set(['admin','superadmin','site_admin','siteadmin']);

async function sendServerError(res, err) {
  console.error('adminAuthController error:', err);
  return res.status(500).json({ message: 'Server error' });
}

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    if (!User) return sendServerError(res, 'User model missing');

    const normalizedEmail = String(email).trim().toLowerCase();
    console.log(`adminAuthController: login attempt for ${normalizedEmail}`);

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      console.warn(`adminAuthController: user not found ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const rawRole = user.role || '';
    const role = String(rawRole).trim().toLowerCase();
    console.log(`adminAuthController: found user role='${rawRole}' normalized='${role}'`);

    if (!ADMIN_ROLES.has(role)) {
      console.warn(`adminAuthController: role mismatch for ${normalizedEmail} -> '${rawRole}'`);
      return res.status(403).json({ message: 'This account is not an admin' });
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      console.warn(`adminAuthController: invalid password for ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isApproved === false) {
      return res.status(403).json({ message: 'Admin account not approved' });
    }

    const token = jwt.sign({ id: user._id.toString(), email: user.email, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });

    return res.json({ message: 'Logged in', token, user: { id: user._id, email: user.email, role: user.role, name: user.name || null } });
  } catch (err) {
    return sendServerError(res, err);
  }
};
