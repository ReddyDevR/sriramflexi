const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { connectDB } = require('./config/db');
const store = require('./config/store');
const { getSeedData } = require('./data/seedData');
const { initSocket } = require('./services/socketService');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const requestRoutes = require('./routes/requestRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Socket.io
initSocket(server);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'Sri Ramu Digital — Flex & Offset Printing',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    services: {
      socket: 'ACTIVE',
      webPush: process.env.VAPID_PUBLIC_KEY ? 'CONFIGURED' : 'SIMULATION',
      brevoEmail: process.env.BREVO_API_KEY ? 'CONFIGURED' : 'SIMULATION'
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Seed Initial Data
const initializeDatabase = async () => {
  await connectDB();

  const currentProducts = store.getCollection('products');
  const currentCategories = store.getCollection('categories');

  // If store doesn't have the 30 products or categories, seed them
  if (currentProducts.length < 30 || currentCategories.length === 0) {
    const { users, categories, products, coupons } = getSeedData();
    console.log('🌱 Seeding 30 dedicated products, categories, admin accounts, and coupons...');
    
    // Set exact products & categories requested
    store.data.products = [];
    store.data.categories = [];
    
    categories.forEach(c => store.create('categories', c));
    products.forEach(p => store.create('products', p));

    if (store.getCollection('users').length === 0) {
      users.forEach(u => store.create('users', u));
      coupons.forEach(c => store.create('coupons', c));

      // Seed default admin and customer notification preferences
      users.forEach(u => {
        store.create('notificationPreferences', {
          userId: u._id,
          email: { orders: true, payments: true, offers: true, system: true },
          push: { orders: true, payments: true, offers: true, system: true },
          inApp: { orders: true, payments: true, offers: true, system: true }
        });
      });
    }

    store.save();
    console.log('✅ Initial 30 products & categories populated successfully!');
  }
};

const PORT = process.env.PORT || 5000;

const startServer = () => {
  return new Promise((resolve) => {
    initializeDatabase().then(() => {
      server.listen(PORT, '0.0.0.0', () => {
        console.log(`================================================================`);
        console.log(`🚀 SRI RAMU DIGITAL — PRINTING PLATFORM BACKEND ACTIVE`);
        console.log(`📡 Server running on: http://localhost:${PORT}`);
        console.log(`⚡ Real-Time Socket.IO: Connected & Broadcasting on /socket.io`);
        console.log(`🔔 Centralized Notification Dispatcher: READY`);
        console.log(`✉️ Brevo Transactional Email: ${process.env.BREVO_API_KEY ? 'LIVE API' : 'SIMULATED LOGS'}`);
        console.log(`📲 Web Push VAPID: READY`);
        console.log(`================================================================`);
        resolve(server);
      });
    });
  });
};

if (require.main === module) {
  startServer();
}

module.exports = { app, server, startServer };

