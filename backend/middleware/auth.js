// middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

exports.protect = async (req, res, next) => {
  let token;
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ message: 'Not authorized. No token.' });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;

    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    console.error('protect err:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userRole) return res.status(403).json({ message: 'Role missing. Access denied.' });
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ message: `Access denied. Role '${req.userRole}' not allowed.` });
    }
    next();
  };
};
