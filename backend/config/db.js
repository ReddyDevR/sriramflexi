const mongoose = require('mongoose');

let isConnected = false;
let useLocalFallback = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sri_ramu_digital';
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    useLocalFallback = false;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB daemon not reachable at ${uri}.`);
    console.log(`🚀 Activating High-Performance Persistent Embedded JSON Store for Sri Ramu Digital.`);
    isConnected = false;
    useLocalFallback = true;
    return false;
  }
};

module.exports = {
  connectDB,
  isDbConnected: () => isConnected,
  isUsingFallback: () => useLocalFallback
};
