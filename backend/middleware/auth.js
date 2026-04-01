const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).populate('selectedCharity', 'name logo');
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// Admin only
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Active subscriber only — validate on every request
const subscriberOnly = (req, res, next) => {
  const sub = req.user?.subscription;
  if (!sub || sub.status !== 'active') {
    return res.status(403).json({ message: 'Active subscription required' });
  }
  // Check period not expired
  if (sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) < new Date()) {
    return res.status(403).json({ message: 'Subscription has expired' });
  }
  next();
};

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

module.exports = { protect, adminOnly, subscriberOnly, generateToken };