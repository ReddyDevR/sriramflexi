const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '.env')
});

// Database
const { connectDB } = require('./config/db');

// Socket service
const { initSocket } = require('./services/socketService');

// Admin initialization
const initializeAdmin = require('./config/initializeAdmin');

// MongoDB Models
const Product = require('./models/Product');
const Category = require('./models/Category');
const Coupon = require('./models/Coupon');

// Seed data
const { getSeedData } = require('./data/seedData');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const requestRoutes = require('./routes/requestRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Express application
const app = express();
const server = http.createServer(app);

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS origin not allowed'));
  },
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

// Initialize Socket.io
initSocket(server);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'Sri Ramu Digital — Flex & Offset Printing',
    version: '2.0.0',
    timestamp: new Date().toISOString(),

    services: {
      socket: 'ACTIVE',
      webPush: process.env.VAPID_PUBLIC_KEY
        ? 'CONFIGURED'
        : 'SIMULATION',

      brevoEmail: process.env.BREVO_API_KEY
        ? 'CONFIGURED'
        : 'SIMULATION'
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);

  res.status(500).json({
    message: err.message || 'Internal Server Error',

    error: process.env.NODE_ENV === 'development'
      ? err.stack
      : undefined
  });
});

// Initialize MongoDB and Seed Data
const initializeDatabase = async () => {
  try {
    // Connect MongoDB
    await connectDB();

    console.log('MongoDB connected successfully');

    // Initialize Admin
    await initializeAdmin();

    console.log('Admin initialization completed');

    // Get initial seed data
    const {
      categories = [],
      products = [],
      coupons = []
    } = getSeedData();

    // Seed Categories
    const categoryCount = await Category.countDocuments();

    if (categoryCount === 0 && categories.length > 0) {
      await Category.insertMany(categories);

      console.log('Initial categories inserted successfully');
    }

    // Seed Products
    const productCount = await Product.countDocuments();

    if (productCount === 0 && products.length > 0) {
      await Product.insertMany(products);

      console.log('Initial products inserted successfully');
    }

    // Seed Coupons
    const couponCount = await Coupon.countDocuments();

    if (couponCount === 0 && coupons.length > 0) {
      await Coupon.insertMany(coupons);

      console.log('Initial coupons inserted successfully');
    }

    console.log('MongoDB initialization completed successfully');

  } catch (error) {
    console.error('Database initialization failed:', error);

    throw error;
  }
};

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize database before starting server
    await initializeDatabase();

    // Start HTTP server
    await new Promise((resolve, reject) => {
      server.once('error', reject);

      server.listen(PORT, '0.0.0.0', () => {
        server.removeListener('error', reject);
        resolve();
      });
    });

    console.log('============================================================');
    console.log('SRI RAMU DIGITAL - PRINTING PLATFORM BACKEND ACTIVE');
    console.log(`Server running on port: ${PORT}`);
    console.log('Socket.IO: ACTIVE');
    console.log('Notification Dispatcher: READY');

    console.log(
      `Brevo Email: ${
        process.env.BREVO_API_KEY ? 'CONFIGURED' : 'SIMULATED'
      }`
    );

    console.log(
      `Web Push: ${
        process.env.VAPID_PUBLIC_KEY ? 'CONFIGURED' : 'NOT CONFIGURED'
      }`
    );

    console.log('============================================================');

    return server;

  } catch (error) {
    console.error('SERVER STARTUP FAILED:', error);

    process.exit(1);
  }
};

// Start only when executed directly
if (require.main === module) {
  startServer();
}

// Exports
module.exports = {
  app,
  server,
  startServer,
  initializeDatabase
};
