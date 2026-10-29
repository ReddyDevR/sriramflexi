const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../config/store');
const dispatcher = require('../services/notificationDispatcher');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'sri_ramu_digital_super_secret_jwt_key_2026_production';
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, company, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = store.findOne('users', { email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = store.create('users', {
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      company: company || '',
      address: address || '',
      role: 'CUSTOMER'
    });

    // Create default notification preferences
    store.create('notificationPreferences', {
      userId: user._id,
      email: { orders: true, payments: true, offers: true, system: true },
      push: { orders: true, payments: true, offers: true, system: true },
      inApp: { orders: true, payments: true, offers: true, system: true }
    });

    // Welcome Flow: Customer Registration -> In-App + Push + Brevo Email
    dispatcher.dispatch({
      type: 'WELCOME',
      priority: 'NORMAL',
      title: 'Welcome to Sri Ramu Digital!',
      message: `Welcome ${user.name}! Your printing account is ready. Browse flex, vinyl, and offset products.`,
      userId: user._id,
      customerEmail: user.email,
      customerName: user.name,
      targetRole: 'CUSTOMER',
      data: {
        actionUrl: '/products',
        actionText: 'Explore Catalog'
      },
      idempotencyKey: `welcome_${user._id}`
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = store.findOne('users', { email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = store.findById('users', req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let prefs = store.findOne('notificationPreferences', { userId: user._id });
    if (!prefs) {
      prefs = store.create('notificationPreferences', {
        userId: user._id,
        email: { orders: true, payments: true, offers: true, system: true },
        push: { orders: true, payments: true, offers: true, system: true },
        inApp: { orders: true, payments: true, offers: true, system: true }
      });
    }

    const unreadCount = store.getCollection('notifications').filter(n => {
      if (user.role === 'ADMIN') {
        return n.targetRole === 'ADMIN' && !n.read;
      }
      return n.userId === user._id && !n.read;
    }).length;

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        role: user.role
      },
      preferences: prefs,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/auth/preferences
const updatePreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { email, push, inApp } = req.body;

    let existing = store.findOne('notificationPreferences', { userId });
    let updated;

    if (existing) {
      updated = store.findByIdAndUpdate('notificationPreferences', existing._id, {
        email: { ...existing.email, ...email },
        push: { ...existing.push, ...push },
        inApp: { ...existing.inApp, ...inApp }
      });
    } else {
      updated = store.create('notificationPreferences', {
        userId,
        email: email || { orders: true, payments: true, offers: true, system: true },
        push: push || { orders: true, payments: true, offers: true, system: true },
        inApp: inApp || { orders: true, payments: true, offers: true, system: true }
      });
    }

    res.json({ success: true, preferences: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, updatePreferences };
