const jwt = require('jsonwebtoken');
const store = require('../config/store');

const protect = (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'sri_ramu_digital_super_secret_jwt_key_2026_production';
    const decoded = jwt.verify(token, secret);
    const user = store.findById('users', decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      company: user.company
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalid or expired', error: error.message });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
};

module.exports = { protect, requireAdmin };
