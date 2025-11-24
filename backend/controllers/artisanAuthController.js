// backend/controllers/artisanAuthController.js
const path = require('path');
let User;
try {
  // correct relative path from controllers -> models
  User = require(path.join(__dirname, '..', 'models', 'User'));
  console.log('Loaded User model in artisanAuthController from', path.join(__dirname, '..', 'models', 'User'));
} catch (e) {
  console.error('Could not load User model in artisanAuthController:', e && e.message ? e.message : e);
  User = null;
}

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';
const JWT_EXPIRES = '7d';

// Acceptable artisan role variants (lowercased)
const ARTISAN_ROLES = new Set(['artisan', 'shopowner', 'seller', 'vendor']);

function createToken(user) {
  return jwt.sign({ id: user._id.toString(), role: (user.role || '').toString().toLowerCase() }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

exports.registerArtisan = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    if (!User) {
      console.error('registerArtisan: User model not available');
      return res.status(500).json({ message: 'Server error' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const exists = await User.findOne({ email: cleanEmail });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const artisan = await User.create({
      name: name || 'Artisan',
      email: cleanEmail,
      password: hashed,
      role: 'artisan',
      isApproved: false,
      isVerified: false,
    });

    res.status(201).json({ message: 'Artisan registered', user: { id: artisan._id, email: artisan.email } });
  } catch (err) {
    console.error('registerArtisan err:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.loginArtisan = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Enter email and password' });

    if (!User) {
      console.error('loginArtisan: User model not available');
      return res.status(500).json({ message: 'Server error' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).select('+password'); // ensure password field is fetched

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // defensive: normalize role value
    const role = (user.role || '').toString().trim().toLowerCase();

    // role-forgiving: accept several artisan-like roles
    if (!ARTISAN_ROLES.has(role)) {
      console.warn(`loginArtisan: role mismatch for user ${user._id} role='${user.role}'`);
      return res.status(403).json({ message: 'This account is not an artisan. Use the regular login.' });
    }

    // defensive: ensure password exists on user
    if (!user.password) {
      console.error('loginArtisan: user.password is missing for user', user._id);
      return res.status(500).json({ message: 'Server error' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isApproved) return res.status(403).json({ message: 'Artisan account not approved yet' });

    const token = createToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('loginArtisan err:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
