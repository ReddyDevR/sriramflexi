const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Notification = require('../models/Notification');
const NotificationPreference = require('../models/NotificationPreference');

const dispatcher = require('../services/notificationDispatcher');

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing');
  }

  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      company,
      address
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 8 characters'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (
      process.env.ADMIN_EMAIL &&
      normalizedEmail === process.env.ADMIN_EMAIL.toLowerCase().trim()
    ) {
      return res.status(403).json({
        success: false,
        message: 'This email is reserved for administration'
      });
    }

    const existing = await User.findOne({
      email: normalizedEmail
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Account already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      company,
      address,
      role: 'CUSTOMER'
    });

    await NotificationPreference.create({
      userId: user._id,
      email: {
        orders: true,
        payments: true,
        offers: true,
        system: true
      },
      push: {
        orders: true,
        payments: true,
        offers: true,
        system: true
      },
      inApp: {
        orders: true,
        payments: true,
        offers: true,
        system: true
      }
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        company: user.company
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    return res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};
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
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const isAdminEmail =
      process.env.ADMIN_EMAIL &&
      normalizedEmail === process.env.ADMIN_EMAIL.toLowerCase().trim();

    let user;

    if (isAdminEmail) {
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (!adminPassword) {
        return res.status(500).json({
          success: false,
          message: 'Admin authentication is not configured'
        });
      }

      if (password !== adminPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      user = await User.findOne({
        email: normalizedEmail,
        role: 'ADMIN'
      });

      if (!user) {
        return res.status(403).json({
          success: false,
          message: 'Admin account is not initialized'
        });
      }

    } else {
      user = await User.findOne({
        email: normalizedEmail,
        role: 'CUSTOMER'
      }).select('+password');

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is disabled'
      });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        company: user.company
      }
    });

  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      message: 'Login failed'
    });
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
