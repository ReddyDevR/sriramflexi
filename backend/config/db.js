const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error('MONGODB_URI is missing in environment variables');
    }

    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    });

    isConnected = true;

    console.log(
      `MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`
    );

    return true;

  } catch (error) {
    isConnected = false;

    console.error('MongoDB connection failed:', error.message);

    throw error;
  }
};

module.exports = {
  connectDB,

  isDbConnected: () => isConnected,
};
module.exports = {
  connectDB,
  isDbConnected: () => isConnected,
  isUsingFallback: () => useLocalFallback
};
