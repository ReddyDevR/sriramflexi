const bcrypt = require('bcryptjs');
const User = require('../models/User');

const initializeAdmin = async () => {
  const {
    ADMIN_NAME,
    ADMIN_EMAIL,
    ADMIN_PASSWORD
  } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Admin environment variables are missing');
  }

  const email = ADMIN_EMAIL.toLowerCase().trim();

  const hashedPassword = await bcrypt.hash(
    ADMIN_PASSWORD,
    12
  );

  await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name: ADMIN_NAME,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );

  console.log('Admin account initialized successfully');
};

module.exports = initializeAdmin;
