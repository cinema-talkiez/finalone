const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const User = require(path.resolve(__dirname, '../../server/models/User'));

let isConnected = false;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const { userId, tokenVerified } = JSON.parse(event.body || '{}');

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing userId' }),
      };
    }

    // Connect to MongoDB once per cold start
    if (!isConnected) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'userDB', // <- specify database name if not in URI
      });
      isConnected = true;
      console.log('✅ MongoDB connected');
    }

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { $set: { tokenVerified: !!tokenVerified } },
      { upsert: true, new: true }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User verification updated.', user: updatedUser }),
    };
  } catch (err) {
    console.error('❌ Server Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error', error: err.message }),
    };
  }
};
