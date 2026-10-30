const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');
const NotificationPreference = require('../models/NotificationPreference');
const dispatcher = require('../services/notificationDispatcher');

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing');
  return jwt.sign({ id: String(id) }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const defaultPreferences = (userId) => ({
  userId: String(userId),
  email: { orders: true, payments: true, offers: true, system: true },
  push: { orders: true, payments: true, offers: true, system: true },
  inApp: { orders: true, payments: true, offers: true, system: true }
});

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, company, address } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    if (String(password).length < 8) return res.status(400).json({ success: false, message: 'Password must contain at least 8 characters' });
    const normalizedEmail = String(email).toLowerCase().trim();
    if (process.env.ADMIN_EMAIL && normalizedEmail === process.env.ADMIN_EMAIL.toLowerCase().trim()) {
      return res.status(403).json({ success: false, message: 'This email is reserved for administration' });
    }
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ success: false, message: 'Account already exists' });
    const user = await User.create({ name: String(name).trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12), phone: phone || '', company: company || '', address: address || '', role: 'CUSTOMER' });
    await NotificationPreference.findOneAndUpdate({ userId: String(user._id) }, { $setOnInsert: defaultPreferences(user._id) }, { upsert: true, new: true, setDefaultsOnInsert: true });
    const token = generateToken(user._id);
    // Welcome notification is dispatched after successful account creation.
    dispatcher.dispatch({ type: 'WELCOME', priority: 'NORMAL', title: 'Welcome to Sri Ramu Digital!', message: `Welcome ${user.name}! Your printing account is ready. Browse flex, vinyl, and offset products.`, userId: String(user._id), customerEmail: user.email, customerName: user.name, targetRole: 'CUSTOMER', data: { actionUrl: '/products', actionText: 'Explore Catalog' }, idempotencyKey: `welcome_${user._id}` });
    return res.status(201).json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, company: user.company } });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });
    const normalizedEmail = String(email).toLowerCase().trim();
    const isAdminEmail = Boolean(process.env.ADMIN_EMAIL && normalizedEmail === process.env.ADMIN_EMAIL.toLowerCase().trim());
    let user;
    if (isAdminEmail) {
      if (!process.env.ADMIN_PASSWORD) return res.status(500).json({ success: false, message: 'Admin authentication is not configured' });
      if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ success: false, message: 'Invalid email or password' });
      user = await User.findOne({ email: normalizedEmail, role: 'ADMIN' });
      if (!user) return res.status(403).json({ success: false, message: 'Admin account is not initialized' });
    } else {
      user = await User.findOne({ email: normalizedEmail, role: 'CUSTOMER' }).select('+password');
      if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (user.isActive === false) return res.status(403).json({ success: false, message: 'Account is disabled' });
    return res.json({ success: true, token: generateToken(user._id), user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, company: user.company } });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const prefs = await NotificationPreference.findOneAndUpdate({ userId: String(user._id) }, { $setOnInsert: defaultPreferences(user._id) }, { upsert: true, new: true, setDefaultsOnInsert: true });
    const unreadFilter = user.role === 'ADMIN' ? { targetRole: 'ADMIN', read: false } : { userId: String(user._id), read: false };
    const unreadCount = await Notification.countDocuments(unreadFilter);
    return res.json({ user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, company: user.company, role: user.role }, preferences: prefs, unreadCount });
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

// PUT /api/auth/preferences
const updatePreferences = async (req, res) => {
  try {
    const userId = String(req.user._id);
    const { email, push, inApp } = req.body;
    const existing = await NotificationPreference.findOne({ userId });
    const base = existing ? existing.toObject() : defaultPreferences(userId);
    const mergeGroup = (oldValue, newValue) => ({ ...oldValue, ...(newValue && typeof newValue === 'object' ? newValue : {}) });
    const updated = await NotificationPreference.findOneAndUpdate(
      { userId },
      { $set: { email: mergeGroup(base.email, email), push: mergeGroup(base.push, push), inApp: mergeGroup(base.inApp, inApp) }, $setOnInsert: { userId } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return res.json({ success: true, preferences: updated });
  } catch (error) { return res.status(500).json({ message: error.message }); }
};

module.exports = { register, login, getMe, updatePreferences };
